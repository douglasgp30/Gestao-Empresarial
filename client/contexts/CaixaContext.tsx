import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { LancamentoCaixa, Campanha } from "@shared/types";
import { useAuth } from "./AuthContext";
import { caixaApi, campanhasApi } from "../lib/apiService";
import { loadingManager } from "../lib/loadingManager";
import { apiCache } from "../lib/apiCache";
import { contextThrottle } from "../lib/contextThrottle";
import {
  shouldSkipLoading,
  getLoadingDelay,
  isContextLoading,
  setContextLoading,
} from "../lib/globalLoadingControl";

interface CaixaContextType {
  lancamentos: LancamentoCaixa[];
  campanhas: Campanha[];
  filtros: {
    dataInicio: Date;
    dataFim: Date;
    tipo?: "receita" | "despesa" | "todos";
    formaPagamento?: string;
    tecnico?: string;
    campanha?: string;
    setor?: string;
    categoria?: string;
    descricao?: string;
    cliente?: string;
    cidade?: string;
    numeroNota?: string;
  };
  totais: {
    receitas: number;
    receitaBruta?: number;
    receitaLiquida?: number;
    boletos?: number;
    despesas: number;
    saldo: number;
    comissoes: number;
  };
  adicionarLancamento: (
    lancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => Promise<void>;
  editarLancamento: (
    id: string,
    lancamento: Partial<LancamentoCaixa>,
  ) => Promise<void>;
  excluirLancamento: (id: string) => Promise<void>;
  adicionarCampanha: (campanha: Omit<Campanha, "id">) => Promise<void>;
  setFiltros: (filtros: any) => void;
  carregarDados: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const CaixaContext = createContext<CaixaContextType | undefined>(undefined);

export function CaixaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCarregando, setIsCarregando] = useState(false);
  const [filtros, setFiltros] = useState(() => {
    // Usar data atual do sistema mas normalizando para o dia correto
    const agora = new Date();
    const inicioHoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
      0,
      0,
      0,
      0,
    );
    const fimHoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
      23,
      59,
      59,
      999,
    );

    return {
      dataInicio: inicioHoje,
      dataFim: fimHoje,
      tipo: "todos" as "receita" | "despesa" | "todos",
      formaPagamento: "todas",
      tecnico: "todos",
      campanha: "todas",
      setor: "todos",
      cidade: "todas",
      categoria: "todas",
      descricao: "todas",
      cliente: "todos",
      numeroNota: "",
    };
  });

  // Função para carregar todos os dados do localStorage
  const carregarDados = async () => {
    // Evitar múltiplos carregamentos simultâneos
    if (isCarregando) {
      console.log("CaixaContext: Carregamento já em andamento, ignorando...");
      return;
    }

    try {
      setIsCarregando(true);
      setIsLoading(true);
      setError(null);

      console.log("📦 [CaixaContext] Carregando dados do localStorage...");

      // Carregar campanhas do localStorage
      try {
        const campanhasStorage = localStorage.getItem("campanhas");
        if (campanhasStorage) {
          const campanhasParsed = JSON.parse(campanhasStorage);
          setCampanhas(campanhasParsed || []);
        } else {
          setCampanhas([]);
        }
      } catch (error) {
        console.warn("Erro ao carregar campanhas do localStorage:", error);
        setCampanhas([]);
      }

      // Carregar lançamentos do localStorage
      await carregarLancamentosLocalStorage();

      console.log("✅ [CaixaContext] Dados carregados do localStorage com sucesso");
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
      setError("Erro ao carregar dados locais");
    } finally {
      setIsLoading(false);
      setIsCarregando(false);
    }
  };

  // Função para carregar lançamentos do localStorage
  const carregarLancamentosLocalStorage = async () => {
    try {
      console.log("📦 [CaixaContext] Carregando lançamentos do localStorage...");

      const lancamentosStorage = localStorage.getItem("lancamentos_caixa");
      if (lancamentosStorage) {
        const lancamentosParsed = JSON.parse(lancamentosStorage);
        // Converter strings de data de volta para objetos Date
        const lancamentosFormatados = lancamentosParsed.map((lancamento: any) => ({
          ...lancamento,
          data: new Date(lancamento.data),
          dataHora: new Date(lancamento.dataHora),
          dataCriacao: new Date(lancamento.dataCriacao),
        }));

        setLancamentos(lancamentosFormatados);
        console.log(`📦 [CaixaContext] ${lancamentosFormatados.length} lançamentos carregados do localStorage`);
      } else {
        setLancamentos([]);
        console.log("📦 [CaixaContext] Nenhum lançamento encontrado no localStorage");
      }
    } catch (error) {
      console.error("Erro ao carregar lançamentos do localStorage:", error);
      setLancamentos([]);
    }
  };

  // Função utilitária para conversão segura de string para número
  const parseIntSafe = (value: string): number | undefined => {
    if (!value || value === "todos" || value === "todas") return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  };

  // Função para formatar data para o servidor (YYYY-MM-DD)
  const formatarDataParaServidor = (data: Date): string => {
    return data.toISOString().split("T")[0];
  };

  // Função para carregar lançamentos com base nos filtros (localStorage)
  const carregarLancamentos = useCallback(
    async (forceLoad = false) => {
      try {
        // Evitar múltiplas chamadas simultâneas, exceto quando forçado
        if (isCarregando && !forceLoad) {
          console.log(
            "[CaixaContext] Carregamento de lançamentos já em andamento, ignorando...",
          );
          return;
        }

        console.log("📦 [CaixaContext] Recarregando lançamentos do localStorage...");

        // Simplesmente recarregar do localStorage
        await carregarLancamentosLocalStorage();
      } catch (error) {
        console.error("Erro ao carregar lançamentos:", error);

        // Tratar erros de conectividade durante desenvolvimento
        if (error instanceof Error) {
          const isNetworkError =
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError") ||
            error.message.includes("conectividade");

          if (isNetworkError) {
            console.log("📡 [CaixaContext] Erro de conectividade durante desenvolvimento, ignorando...");
            // Durante desenvolvimento, ignorar erros de rede temporários
            return;
          }
        }

        // Para outros tipos de erro, mostrar ao usuário
        console.error("❌ [CaixaContext] Erro persistente ao carregar lançamentos:", error);
        setError("Erro ao carregar lançamentos");
      } finally {
        setContextLoading("CaixaContext-lancamentos", false);
      }
    },
    [filtros, isCarregando],
  );

  // Carregar dados na inicialização com controle global e throttling
  useEffect(() => {
    // Carregamento inicial forçado sem throttling
    console.log("[CaixaContext] FORÇANDO carregamento inicial...");
    carregarDados();
  }, []);

  // Memoizar string das dependências para evitar loops
  const filtrosDependencias = useMemo(() => {
    return JSON.stringify({
      dataInicio: filtros.dataInicio.toISOString().split("T")[0],
      dataFim: filtros.dataFim.toISOString().split("T")[0],
      tipo: filtros.tipo,
      formaPagamento: filtros.formaPagamento,
      tecnico: filtros.tecnico,
      campanha: filtros.campanha,
      setor: filtros.setor,
      categoria: filtros.categoria,
      descricao: filtros.descricao,
      cliente: filtros.cliente,
      cidade: filtros.cidade,
      numeroNota: filtros.numeroNota,
    });
  }, [
    filtros.dataInicio,
    filtros.dataFim,
    filtros.tipo,
    filtros.formaPagamento,
    filtros.tecnico,
    filtros.campanha,
    filtros.setor,
    filtros.categoria,
    filtros.descricao,
    filtros.cliente,
    filtros.cidade,
    filtros.numeroNota,
  ]);

  // Recarregar lançamentos quando os filtros mudarem
  useEffect(() => {
    // Usar throttling para evitar múltiplas chamadas
    if (contextThrottle.isThrottled("CaixaContext-filtros", 2000)) {
      console.log("[CaixaContext] Filtros throttled, ignorando...");
      return;
    }

    const timeoutId = setTimeout(() => {
      contextThrottle.execute(
        "CaixaContext-filtros",
        () => carregarLancamentos(true),
        2000, // 2 segundos de throttle
      );
    }, 800); // Debounce ainda maior

    return () => clearTimeout(timeoutId);
  }, [filtrosDependencias]); // Remover carregarLancamentos das dependências

  const adicionarLancamento = async (
    novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => {
    try {
      setError(null);


      // Preparar dados para a API usando sistema unificado
      const dadosApi = {
        data: novoLancamento.data
          ? novoLancamento.data.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        tipo: novoLancamento.tipo,
        valor: novoLancamento.valor,
        valorRecebido: novoLancamento.valorQueEntrou || novoLancamento.valor,
        valorLiquido: novoLancamento.valorLiquido,
        // comissao será calculada pelo servidor automaticamente
        imposto: novoLancamento.imposto,
        observacoes: novoLancamento.observacoes,
        numeroNota: novoLancamento.numeroNota,
        arquivoNota: novoLancamento.arquivoNota,
        clienteId: novoLancamento.clienteId
          ? (() => {
              const parsed = parseInt(novoLancamento.clienteId);
              return isNaN(parsed) ? undefined : parsed;
            })()
          : undefined,

        // Sistema unificado - enviar categoria e descrição diretamente
        categoria: novoLancamento.categoria,
        descricao: novoLancamento.descricao,

        // Campos de entidades - enviar como string para a API resolver
        formaPagamento: novoLancamento.formaPagamento,
        tecnicoResponsavel: novoLancamento.tecnicoResponsavel,
        setor: novoLancamento.setor,
        campanha: novoLancamento.campanha,
      };

      console.log("[CaixaContext] Enviando para API:", dadosApi);

      const response = await caixaApi.criarLancamento(dadosApi);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      console.log(
        "[CaixaContext] Lançamento criado com sucesso:",
        response.data?.id,
      );

      // Recarregar lançamentos
      await carregarLancamentos(true);
    } catch (error) {
      console.error("Erro ao adicionar lançamento:", error);
      throw error;
    }
  };

  const editarLancamento = async (
    id: string,
    dadosAtualizados: Partial<LancamentoCaixa>,
  ) => {
    try {
      setError(null);

      const dadosApi: any = { ...dadosAtualizados };

      // DataHora não pode ser editada - é gerada automaticamente no backend
      if (dadosAtualizados.descricao) {
        dadosApi.descricaoId = parseInt(dadosAtualizados.descricao);
        delete dadosApi.descricao;
      }
      if (dadosAtualizados.formaPagamento) {
        dadosApi.formaPagamentoId = parseInt(dadosAtualizados.formaPagamento);
        delete dadosApi.formaPagamento;
      }
      if (dadosAtualizados.tecnicoResponsavel) {
        dadosApi.funcionarioId = parseInt(dadosAtualizados.tecnicoResponsavel);
        delete dadosApi.tecnicoResponsavel;
      }
      if (dadosAtualizados.setor) {
        dadosApi.setorId = parseInt(dadosAtualizados.setor);
        delete dadosApi.setor;
      }
      if (dadosAtualizados.campanha) {
        dadosApi.campanhaId = parseInt(dadosAtualizados.campanha);
        delete dadosApi.campanha;
      }
      if (dadosAtualizados.clienteId) {
        const parsedClienteId = parseInt(dadosAtualizados.clienteId);
        if (!isNaN(parsedClienteId)) {
          dadosApi.clienteId = parsedClienteId;
        }
      }

      // Limpar campos undefined para evitar problemas na API
      Object.keys(dadosApi).forEach((key) => {
        if (dadosApi[key] === undefined || dadosApi[key] === "") {
          delete dadosApi[key];
        }
      });

      console.log("Dados para API de edição:", dadosApi);

      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        throw new Error("ID inválido para atualização");
      }

      const response = await caixaApi.atualizarLancamento(parsedId, dadosApi);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar lançamentos
      await carregarLancamentos(true);
    } catch (error) {
      console.error("Erro ao editar lançamento:", error);
      setError("Erro ao editar lançamento");
      throw error;
    }
  };

  const excluirLancamento = async (id: string) => {
    try {
      setError(null);

      console.log("Excluindo lançamento:", id);
      const response = await caixaApi.excluirLancamento(parseInt(id));

      if (response.error) {
        console.error("Erro da API ao excluir:", response.error);
        setError(response.error);
        throw new Error(response.error);
      }

      console.log("Lançamento excluído com sucesso, recarregando lista...");
      // Recarregar lançamentos forçando a atualização
      await carregarLancamentos(true);
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      setError("Erro ao excluir lançamento");
      throw error;
    }
  };

  const adicionarCampanha = async (novaCampanha: Omit<Campanha, "id">) => {
    try {
      setError(null);

      const dadosApi = {
        nome: novaCampanha.nome,
        dataInicio: novaCampanha.dataInicio?.toISOString().split("T")[0],
        dataFim: novaCampanha.dataFim?.toISOString().split("T")[0],
      };

      const response = await campanhasApi.criar(dadosApi);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar campanhas
      const campanhasResponse = await campanhasApi.listar();
      if (campanhasResponse.data) {
        setCampanhas(campanhasResponse.data);
      }
    } catch (error) {
      console.error("Erro ao adicionar campanha:", error);
      throw error;
    }
  };

  // Calcular totais baseados nos lançamentos carregados
  const totais = React.useMemo(() => {
    const receitasCompletas = lancamentos.filter((l) => l.tipo === "receita");

    // Separar boletos
    const receitasBoleto = receitasCompletas.filter(
      (l) =>
        l.formaPagamento?.nome?.toLowerCase().includes("boleto") ||
        l.formaPagamento?.nome?.toLowerCase().includes("bancário"),
    );

    const receitasNaoBoleto = receitasCompletas.filter(
      (l) =>
        !l.formaPagamento?.nome?.toLowerCase().includes("boleto") &&
        !l.formaPagamento?.nome?.toLowerCase().includes("bancário"),
    );

    // Calcular totais
    const receitaBruta = receitasCompletas.reduce(
      (total, l) => total + l.valor,
      0,
    );
    const receitaLiquida = receitasNaoBoleto.reduce(
      (total, l) => total + (l.valorLiquido || l.valor),
      0,
    );
    const boletos = receitasBoleto.reduce((total, l) => total + l.valor, 0);

    const despesas = lancamentos
      .filter((l) => l.tipo === "despesa")
      .reduce((total, l) => total + l.valor, 0);

    const comissoes = receitasNaoBoleto
      .filter((l) => l.comissao)
      .reduce((total, l) => total + (l.comissao || 0), 0);

    return {
      receitas: receitaLiquida, // Para compatibilidade
      receitaBruta,
      receitaLiquida,
      boletos,
      despesas,
      saldo: receitaLiquida - despesas, // Saldo só com receitas líquidas (sem boletos)
      comissoes,
    };
  }, [lancamentos]);

  const value = {
    lancamentos,
    campanhas,
    filtros,
    totais,
    adicionarLancamento,
    editarLancamento,
    excluirLancamento,
    adicionarCampanha,
    setFiltros,
    carregarDados,
    isLoading,
    error,
  };

  return (
    <CaixaContext.Provider value={value}>{children}</CaixaContext.Provider>
  );
}

export function useCaixa() {
  const context = useContext(CaixaContext);
  if (context === undefined) {
    throw new Error("useCaixa must be used within a CaixaProvider");
  }
  return context;
}
