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

  // Função para carregar todos os dados
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

      // Carregar campanhas com cache
      const campanhasResponse = await apiCache.executeWithCache(
        "caixa-campanhas",
        () => campanhasApi.listar(),
      );
      if (campanhasResponse.error) {
        console.error("Erro ao carregar campanhas:", campanhasResponse.error);
      } else {
        setCampanhas(campanhasResponse.data || []);
      }

      // Carregar lançamentos com filtros atuais
      await carregarLancamentos();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);

      // Verificar se é erro de rede durante hot reload
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        console.log(
          "📡 [CaixaContext] Erro de rede detectado durante hot reload, ignorando...",
        );
        // Durante hot reload, não mostrar erro persistente ao usuário
        setError(null);
        // Não tentar reconectar automaticamente para evitar loops
      } else {
        setError("Erro ao carregar dados do servidor");
      }
    } finally {
      setIsLoading(false);
      setIsCarregando(false);
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

  // Função para carregar lançamentos com base nos filtros
  const carregarLancamentos = useCallback(
    async (forceLoad = false) => {
      try {
        // Evitar múltiplas chamadas simultâneas, exceto quando forçado
        if (
          (isContextLoading("CaixaContext-lancamentos") || isCarregando) &&
          !forceLoad
        ) {
          console.log(
            "[CaixaContext] Carregamento de lançamentos já em andamento, ignorando...",
          );
          return;
        }

        setContextLoading("CaixaContext-lancamentos", true);

        const filtrosApi: any = {
          dataInicio: formatarDataParaServidor(filtros.dataInicio),
          dataFim: formatarDataParaServidor(filtros.dataFim),
          ...(filtros.tipo !== "todos" && { tipo: filtros.tipo }),
          ...(filtros.cidade !== "todas" && { cidade: filtros.cidade }),
          ...(filtros.numeroNota &&
            filtros.numeroNota.trim() !== "" && {
              numeroNota: filtros.numeroNota,
            }),
        };

        // Adicionar filtros numéricos apenas se válidos
        const funcionarioId = parseIntSafe(filtros.tecnico);
        const setorId = parseIntSafe(filtros.setor);
        const campanhaId = parseIntSafe(filtros.campanha);
        const formaPagamentoId = parseIntSafe(filtros.formaPagamento);
        const descricaoId = parseIntSafe(filtros.descricao);
        const clienteId = parseIntSafe(filtros.cliente);

        if (funcionarioId) filtrosApi.funcionarioId = funcionarioId;
        if (setorId) filtrosApi.setorId = setorId;
        if (campanhaId) filtrosApi.campanhaId = campanhaId;
        if (formaPagamentoId) filtrosApi.formaPagamentoId = formaPagamentoId;
        if (descricaoId) filtrosApi.descricaoId = descricaoId;
        if (clienteId) filtrosApi.clienteId = clienteId;

        // Filtro por categoria (nome/string)
        if (filtros.categoria && filtros.categoria !== "todas") {
          filtrosApi.categoria = filtros.categoria;
        }

        // Criar chave de cache baseada nos filtros
        const cacheKey = `caixa-lancamentos-${JSON.stringify(filtrosApi)}`;
        const response = await apiCache.executeWithCache(
          cacheKey,
          () => caixaApi.listarLancamentos(filtrosApi),
          forceLoad
        );
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
              formaPagamento: lancamento.formaPagamento || {
                nome: "Não informado",
              },
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

        // Se é erro de rede durante hot reload, não mostrar erro ao usuário
        if (
          error instanceof Error &&
          error.message.includes("Failed to fetch")
        ) {
          console.log(
            "📡 [CaixaContext] Erro de rede ao carregar lançamentos, ignorando...",
          );
          // Não definir erro para o usuário durante hot reload
          return;
        }

        setError("Erro ao carregar lançamentos");
      } finally {
        setContextLoading("CaixaContext-lancamentos", false);
      }
    },
    [filtros, isCarregando],
  );

  // Carregar dados na inicialização com controle global
  useEffect(() => {
    if (shouldSkipLoading("CaixaContext")) return;

    const delay = getLoadingDelay(4000);
    const timeout = setTimeout(() => {
      if (!shouldSkipLoading("CaixaContext")) {
        console.log(
          "[CaixaContext] Iniciando carregamento após delay de",
          delay,
          "ms",
        );
        carregarDados();
      }
    }, delay);

    return () => clearTimeout(timeout);
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
    const timeoutId = setTimeout(() => {
      carregarLancamentos(true);
    }, 500); // Debounce aumentado para reduzir piscar

    return () => clearTimeout(timeoutId);
  }, [filtrosDependencias, carregarLancamentos]);

  const adicionarLancamento = async (
    novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => {
    try {
      setError(null);

      console.log("[CaixaContext] Recebido para adicionar:", novoLancamento);

      // Preparar dados para a API usando sistema unificado
      const dadosApi = {
        data: novoLancamento.data
          ? novoLancamento.data.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        tipo: novoLancamento.tipo,
        valor: novoLancamento.valor,
        valorRecebido: novoLancamento.valorQueEntrou || novoLancamento.valor,
        valorLiquido: novoLancamento.valorLiquido,
        comissao: novoLancamento.comissao,
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
