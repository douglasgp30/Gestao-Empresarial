import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { LancamentoCaixa, Campanha } from "@shared/types";
import { useAuth } from "./AuthContext";
import { caixaApi, campanhasApi } from "../lib/apiService";

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
  };
  totais: {
    receitas: number;
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
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    dataFim: new Date(),
    tipo: "todos" as "receita" | "despesa" | "todos",
    formaPagamento: "todas",
    tecnico: "todos",
    campanha: "todas",
    setor: "todos",
    cidade: "todas",
    conta: "todas",
  });

  // Função para carregar todos os dados
  const carregarDados = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carregar campanhas
      const campanhasResponse = await campanhasApi.listar();
      if (campanhasResponse.error) {
        console.error("Erro ao carregar campanhas:", campanhasResponse.error);
      } else {
        setCampanhas(campanhasResponse.data || []);
      }

      // Carregar lançamentos com filtros atuais
      await carregarLancamentos();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados do servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Função utilitária para conversão segura de string para número
  const parseIntSafe = (value: string): number | undefined => {
    if (!value || value === "todos" || value === "todas") return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  };

  // Função para formatar data para o servidor (DD-MM-AAAA)
  const formatarDataParaServidor = (data: Date): string => {
    const dia = data.getDate().toString().padStart(2, "0");
    const mes = (data.getMonth() + 1).toString().padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}-${mes}-${ano}`;
  };

  // Função para carregar lançamentos com base nos filtros
  const carregarLancamentos = React.useCallback(async () => {
    try {
      const filtrosApi: any = {
        dataInicio: formatarDataParaServidor(filtros.dataInicio),
        dataFim: formatarDataParaServidor(filtros.dataFim),
        ...(filtros.tipo !== "todos" && { tipo: filtros.tipo }),
        ...(filtros.conta !== "todas" && { conta: filtros.conta }),
        ...(filtros.cidade !== "todas" && { cidade: filtros.cidade }),
      };

      // Adicionar filtros numéricos apenas se válidos
      const funcionarioId = parseIntSafe(filtros.tecnico);
      const setorId = parseIntSafe(filtros.setor);
      const campanhaId = parseIntSafe(filtros.campanha);
      const formaPagamentoId = parseIntSafe(filtros.formaPagamento);

      if (funcionarioId) filtrosApi.funcionarioId = funcionarioId;
      if (setorId) filtrosApi.setorId = setorId;
      if (campanhaId) filtrosApi.campanhaId = campanhaId;
      if (formaPagamentoId) filtrosApi.formaPagamentoId = formaPagamentoId;

      const response = await caixaApi.listarLancamentos(filtrosApi);
      if (response.error) {
        setError(response.error);
      } else {
        // Converter datas de string para Date e manter relacionamentos
        const lancamentosFormatados = (response.data || []).map(
          (lancamento: any) => ({
            ...lancamento,
            // Converter dataHora do banco para Date para compatibilidade
            data: new Date(lancamento.dataHora), // Criar campo data a partir de dataHora
            dataHora: lancamento.dataHora, // Manter como string no formato brasileiro
            dataCriacao: new Date(lancamento.dataCriacao),
            // Garantir que os relacionamentos estejam presentes corretamente
            descricao: lancamento.descricao || { nome: "Sem descrição" },
            formaPagamento: lancamento.formaPagamento || { nome: "Não informado" },
            funcionario: lancamento.funcionario || null,
            setor: lancamento.setor || null,
            campanha: lancamento.campanha || null,
            // Campos de compatibilidade para código que espera strings
            tecnicoResponsavel: lancamento.funcionario?.nome || null,
          }),
        );
        setLancamentos(lancamentosFormatados);
      }
    } catch (error) {
      console.error("Erro ao carregar lançamentos:", error);
      setError("Erro ao carregar lançamentos");
    }
  }, [filtros]);

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDados();
  }, []);

  // Recarregar lançamentos quando os filtros mudarem
  useEffect(() => {
    if (!isLoading) {
      carregarLancamentos();
    }
  }, [filtros, carregarLancamentos, isLoading]);

  const adicionarLancamento = async (
    novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => {
    try {
      setError(null);

      // Preparar dados para a API
      const dadosApi = {
        data: novoLancamento.data
          ? novoLancamento.data.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0], // Enviar data do formulário ou data atual
        tipo: novoLancamento.tipo,
        valor: novoLancamento.valor,
        valorRecebido: novoLancamento.valorQueEntrou || novoLancamento.valor, // Usar valor padrão se não tiver valorQueEntrou
        valorLiquido: novoLancamento.valorLiquido,
        comissao: novoLancamento.comissao,
        imposto: novoLancamento.imposto,
        observacoes: novoLancamento.observacoes,
        numeroNota: novoLancamento.numeroNota,
        arquivoNota: novoLancamento.arquivoNota,
        conta: novoLancamento.conta || "empresa", // Usar conta do formulário ou padrão
        descricaoId: parseInt(novoLancamento.descricao),
        formaPagamentoId: parseInt(novoLancamento.formaPagamento),
        funcionarioId: novoLancamento.tecnicoResponsavel
          ? parseInt(novoLancamento.tecnicoResponsavel)
          : undefined,
        setorId: novoLancamento.setor
          ? parseInt(novoLancamento.setor)
          : undefined,
        campanhaId: novoLancamento.campanha
          ? parseInt(novoLancamento.campanha)
          : undefined,
      };

      const response = await caixaApi.criarLancamento(dadosApi);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar lançamentos
      await carregarLancamentos();
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

      const response = await caixaApi.atualizarLancamento(
        parseInt(id),
        dadosApi,
      );
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar lançamentos
      await carregarLancamentos();
    } catch (error) {
      console.error("Erro ao editar lançamento:", error);
      throw error;
    }
  };

  const excluirLancamento = async (id: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await caixaApi.excluirLancamento(parseInt(id));
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar lançamentos
      await carregarLancamentos();
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      throw error;
    } finally {
      setIsLoading(false);
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
    const receitas = lancamentos
      .filter((l) => l.tipo === "receita")
      .reduce((total, l) => total + (l.valorLiquido || l.valor), 0);

    const despesas = lancamentos
      .filter((l) => l.tipo === "despesa")
      .reduce((total, l) => total + l.valor, 0);

    const comissoes = lancamentos
      .filter((l) => l.tipo === "receita" && l.comissao)
      .reduce((total, l) => total + (l.comissao || 0), 0);

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
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
