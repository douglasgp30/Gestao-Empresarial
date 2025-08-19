import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { pontoApi } from '../lib/pontoApi';
import { pontoLocalStorage } from '../lib/pontoLocalStorage';
import { toast } from '../hooks/use-toast';
import type {
  Ponto,
  PontoDoFuncionario,
  FiltrosPonto,
  RelatorioPonto,
  Funcionario
} from '../../shared/types';

interface PontoContextData {
  // Estado atual do usuário
  pontoHoje?: PontoDoFuncionario;
  proximaBatida: string;
  podeRegistrar: boolean;
  
  // Estados de carregamento
  isLoading: boolean;
  isRegistrandoPonto: boolean;
  
  // Histórico de pontos
  historicoPontos: Ponto[];
  paginacaoHistorico: any;
  
  // Pontos de todos os funcionários (admin)
  todosPontos: Ponto[];
  funcionariosComPonto: Funcionario[];
  
  // Filtros
  filtros: FiltrosPonto;
  
  // Funções principais
  carregarPontoHoje: () => Promise<void>;
  registrarPonto: (observacao?: string, vendeuAlmoco?: boolean) => Promise<void>;
  carregarHistorico: (funcionarioId?: string, pagina?: number) => Promise<void>;
  
  // Funções administrativas
  carregarTodosPontos: () => Promise<void>;
  carregarFuncionariosComPonto: () => Promise<void>;
  editarPonto: (pontoId: string, dados: any) => Promise<void>;
  registrarPontoAdmin: (dados: any) => Promise<void>;
  gerarRelatorio: (funcionarioId: string, dataInicio: string, dataFim: string) => Promise<RelatorioPonto>;
  
  // Filtros e configurações
  atualizarFiltros: (novosFiltros: Partial<FiltrosPonto>) => void;
  limparDados: () => void;
}

const PontoContext = createContext<PontoContextData>({} as PontoContextData);

export function usePonto() {
  const context = useContext(PontoContext);
  if (!context) {
    throw new Error('usePonto deve ser usado dentro do PontoProvider');
  }
  return context;
}

interface PontoProviderProps {
  children: React.ReactNode;
}

export function PontoProvider({ children }: PontoProviderProps) {
  const { user } = useAuth();
  
  // Estados principais
  const [pontoHoje, setPontoHoje] = useState<PontoDoFuncionario>();
  const [proximaBatida, setProximaBatida] = useState<string>("entrada");
  const [podeRegistrar, setPodeRegistrar] = useState<boolean>(false);
  
  // Estados de carregamento
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistrandoPonto, setIsRegistrandoPonto] = useState(false);
  
  // Histórico e dados
  const [historicoPontos, setHistoricoPontos] = useState<Ponto[]>([]);
  const [paginacaoHistorico, setPaginacaoHistorico] = useState<any>(null);
  const [todosPontos, setTodosPontos] = useState<Ponto[]>([]);
  const [funcionariosComPonto, setFuncionariosComPonto] = useState<Funcionario[]>([]);
  
  // Filtros
  const [filtros, setFiltros] = useState<FiltrosPonto>({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    dataFim: new Date(),
    __timestamp: Date.now()
  });

  // Função para carregar ponto de hoje
  const carregarPontoHoje = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Determinar se é um ID numérico (banco) ou string (localStorage)
      const isNumericId = !isNaN(parseInt(user.id));

      let resultado: PontoDoFuncionario;

      if (isNumericId) {
        // Usar API para funcionários do banco
        resultado = await pontoApi.buscarPontoHoje(user.id);
      } else {
        // Usar localStorage para funcionários locais
        resultado = await pontoLocalStorage.buscarPontoHoje(user.id);
      }

      if (resultado && typeof resultado === 'object') {
        setPontoHoje(resultado);
        setProximaBatida(resultado.proximaBatida || "entrada");
        setPodeRegistrar(resultado.podeRegistrar || false);
      } else {
        // Handle caso onde resultado é undefined ou não é objeto
        console.warn('Resultado da API de ponto é inválido:', resultado);
        setPontoHoje(undefined);
        setProximaBatida("entrada");
        setPodeRegistrar(false);
      }

    } catch (error) {
      console.error('Erro ao carregar ponto de hoje:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o ponto de hoje.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Função para registrar ponto
  const registrarPonto = useCallback(async (observacao?: string) => {
    if (!user?.id) return;

    try {
      setIsRegistrandoPonto(true);

      // Determinar se é um ID numérico (banco) ou string (localStorage)
      const isNumericId = !isNaN(parseInt(user.id));

      let resultado: PontoDoFuncionario;

      if (isNumericId) {
        // Usar API para funcionários do banco
        resultado = await pontoApi.registrarPonto({
          funcionarioId: user.id,
          observacao
        });
      } else {
        // Usar localStorage para funcionários locais
        resultado = await pontoLocalStorage.registrarPonto(user.id, observacao);
      }

      setPontoHoje(resultado);
      setProximaBatida(resultado.proximaBatida || "entrada");
      setPodeRegistrar(resultado.podeRegistrar || false);

      // Mostrar mensagem de sucesso
      const textoBatida = isNumericId
        ? pontoApi.obterTextoBatida(resultado.batidaRegistrada || "")
        : pontoLocalStorage.obterTextoBatida(resultado.batidaRegistrada || "");

      toast({
        title: "Ponto Registrado",
        description: `${textoBatida} registrado com sucesso!`,
        variant: "default",
      });

    } catch (error: any) {
      console.error('Erro ao registrar ponto:', error);
      toast({
        title: "Erro ao Registrar Ponto",
        description: error.message || error.response?.data?.error || "Não foi possível registrar o ponto.",
        variant: "destructive",
      });
    } finally {
      setIsRegistrandoPonto(false);
    }
  }, [user?.id]);

  // Função para carregar histórico
  const carregarHistorico = useCallback(async (funcionarioId?: string, pagina: number = 1) => {
    const idFuncionario = funcionarioId || user?.id;
    if (!idFuncionario) return;

    try {
      setIsLoading(true);

      // Determinar se é um ID numérico (banco) ou string (localStorage)
      const isNumericId = !isNaN(parseInt(idFuncionario));

      if (isNumericId) {
        // Usar API para funcionários do banco
        const resultado = await pontoApi.buscarHistoricoPonto(idFuncionario, {
          dataInicio: filtros.dataInicio.toISOString().split('T')[0],
          dataFim: filtros.dataFim.toISOString().split('T')[0],
          page: pagina,
          limit: 50
        });

        setHistoricoPontos(resultado.pontos || []);
        setPaginacaoHistorico(resultado.pagination);
      } else {
        // Usar localStorage para funcionários locais
        const pontos = await pontoLocalStorage.buscarHistoricoPonto(
          idFuncionario,
          filtros.dataInicio,
          filtros.dataFim
        );

        setHistoricoPontos(pontos);
        setPaginacaoHistorico({
          page: 1,
          limit: pontos.length,
          total: pontos.length,
          pages: 1
        });
      }

    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de pontos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, filtros]);

  // Função para carregar todos os pontos (admin)
  const carregarTodosPontos = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const resultado = await pontoApi.buscarTodosPontos({
        dataInicio: filtros.dataInicio.toISOString().split('T')[0],
        dataFim: filtros.dataFim.toISOString().split('T')[0],
        funcionarioId: filtros.funcionarioId,
        status: filtros.status
      });
      
      setTodosPontos(resultado);
      
    } catch (error) {
      console.error('Erro ao carregar todos os pontos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pontos dos funcionários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  // Função para carregar funcionários com ponto
  const carregarFuncionariosComPonto = useCallback(async () => {
    try {
      // Sempre carregar funcionários do localStorage primeiro
      const funcionariosLocalStorage = await pontoLocalStorage.buscarFuncionariosComPonto();

      // Tentar carregar funcionários do banco também
      let funcionariosBanco: Funcionario[] = [];
      try {
        funcionariosBanco = await pontoApi.buscarFuncionariosComPonto();
      } catch (error) {
        console.log('Banco de funcionários não disponível, usando apenas localStorage');
      }

      // Combinar ambas as fontes
      const todosFuncionarios = [...funcionariosLocalStorage, ...funcionariosBanco];
      setFuncionariosComPonto(todosFuncionarios);
    } catch (error) {
      console.error('Erro ao carregar funcionários com ponto:', error);
    }
  }, []);

  // Função para editar ponto (admin)
  const editarPonto = useCallback(async (pontoId: string, dados: any) => {
    try {
      await pontoApi.editarPonto(pontoId, {
        ...dados,
        usuarioEdicao: user?.nomeCompleto || user?.login || 'Administrador'
      });
      
      toast({
        title: "Ponto Editado",
        description: "Ponto editado com sucesso!",
        variant: "default",
      });
      
      // Recarregar dados
      await carregarTodosPontos();
      
    } catch (error: any) {
      console.error('Erro ao editar ponto:', error);
      toast({
        title: "Erro ao Editar Ponto",
        description: error.response?.data?.error || "Não foi possível editar o ponto.",
        variant: "destructive",
      });
    }
  }, [user, carregarTodosPontos]);

  // Função para registrar ponto de outro funcionário (admin)
  const registrarPontoAdmin = useCallback(async (dados: any) => {
    try {
      await pontoApi.registrarPontoAdmin({
        ...dados,
        usuarioEdicao: user?.nomeCompleto || user?.login || 'Administrador'
      });
      
      toast({
        title: "Ponto Registrado",
        description: "Ponto registrado com sucesso!",
        variant: "default",
      });
      
      // Recarregar dados
      await carregarTodosPontos();
      
    } catch (error: any) {
      console.error('Erro ao registrar ponto administrativo:', error);
      toast({
        title: "Erro ao Registrar Ponto",
        description: error.response?.data?.error || "Não foi possível registrar o ponto.",
        variant: "destructive",
      });
    }
  }, [user, carregarTodosPontos]);

  // Função para gerar relatório
  const gerarRelatorio = useCallback(async (funcionarioId: string, dataInicio: string, dataFim: string): Promise<RelatorioPonto> => {
    try {
      const relatorio = await pontoApi.gerarRelatorio(funcionarioId, dataInicio, dataFim);
      
      toast({
        title: "Relatório Gerado",
        description: "Relatório de ponto gerado com sucesso!",
        variant: "default",
      });
      
      return relatorio;
      
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao Gerar Relatório",
        description: error.response?.data?.error || "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  // Função para atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros: Partial<FiltrosPonto>) => {
    setFiltros(prev => ({
      ...prev,
      ...novosFiltros,
      __timestamp: Date.now()
    }));
  }, []);

  // Função para limpar dados
  const limparDados = useCallback(() => {
    setPontoHoje(undefined);
    setProximaBatida("entrada");
    setPodeRegistrar(false);
    setHistoricoPontos([]);
    setPaginacaoHistorico(null);
    setTodosPontos([]);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.id) {
      carregarPontoHoje();
      carregarFuncionariosComPonto();
    }
  }, [user?.id, carregarPontoHoje, carregarFuncionariosComPonto]);

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    if (user?.tipoAcesso === "Administrador") {
      carregarTodosPontos();
    } else if (user?.id) {
      carregarHistorico();
    }
  }, [filtros, user, carregarTodosPontos, carregarHistorico]);

  const value: PontoContextData = {
    // Estado atual
    pontoHoje,
    proximaBatida,
    podeRegistrar,
    
    // Estados de carregamento
    isLoading,
    isRegistrandoPonto,
    
    // Dados
    historicoPontos,
    paginacaoHistorico,
    todosPontos,
    funcionariosComPonto,
    
    // Filtros
    filtros,
    
    // Funções
    carregarPontoHoje,
    registrarPonto,
    carregarHistorico,
    carregarTodosPontos,
    carregarFuncionariosComPonto,
    editarPonto,
    registrarPontoAdmin,
    gerarRelatorio,
    atualizarFiltros,
    limparDados
  };

  return (
    <PontoContext.Provider value={value}>
      {children}
    </PontoContext.Provider>
  );
}
