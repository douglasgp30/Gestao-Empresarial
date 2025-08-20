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
import { loadingManager } from "../lib/loadingManager";
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
    receitasParaEmpresa?: number;
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

  // Função para carregar campanhas com fallback seguro
  const carregarCampanhasSafe = async () => {
    try {
      // Tentar carregar do servidor primeiro
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5s

      const response = await fetch("/api/campanhas", {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const campanhasServidor = await response.json();
        console.log("📊 [CaixaContext] Campanhas carregadas do servidor:", campanhasServidor.length);
        setCampanhas(campanhasServidor || []);

        // Sincronizar com localStorage para cache
        localStorage.setItem("campanhas", JSON.stringify(campanhasServidor || []));
        return;
      }
    } catch (error) {
      console.warn("Servidor indisponível, usando campanhas do localStorage:", error);
    }

    // Fallback para localStorage
    try {
      const campanhasStorage = localStorage.getItem("campanhas");
      if (campanhasStorage) {
        const campanhasParsed = JSON.parse(campanhasStorage);
        setCampanhas(campanhasParsed || []);
      } else {
        setCampanhas([]);
      }
    } catch (localError) {
      console.warn("Erro ao carregar campanhas do localStorage:", localError);
      setCampanhas([]);
    }
  };

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

      // Carregar campanhas com fallback seguro (não deve falhar)
      try {
        await carregarCampanhasSafe();
      } catch (campanhasError) {
        console.warn("Erro ao carregar campanhas, continuando:", campanhasError);
        setCampanhas([]); // Fallback para array vazio
      }

      // Carregar lançamentos do localStorage (não deve falhar)
      try {
        await carregarLancamentosLocalStorage();
      } catch (lancamentosError) {
        console.warn("Erro ao carregar lançamentos, continuando:", lancamentosError);
        setLancamentos([]); // Fallback para array vazio
      }

      console.log(
        "✅ [CaixaContext] Dados carregados com sucesso",
      );
    } catch (error) {
      console.error("Erro geral ao carregar dados:", error);
      // Não definir erro para não quebrar a UI
      // setError("Erro ao carregar dados locais");
    } finally {
      setIsLoading(false);
      setIsCarregando(false);
    }
  };

  // Função para carregar lançamentos do localStorage
  const carregarLancamentosLocalStorage = async () => {
    try {
      console.log(
        "📦 [CaixaContext] Carregando lançamentos do localStorage...",
      );

      const lancamentosStorage = localStorage.getItem("lancamentos_caixa");
      if (lancamentosStorage) {
        const lancamentosParsed = JSON.parse(lancamentosStorage);
        // Converter strings de data de volta para objetos Date
        const lancamentosFormatados = lancamentosParsed.map(
          (lancamento: any) => ({
            ...lancamento,
            data: new Date(lancamento.data),
            dataHora: new Date(lancamento.dataHora),
            dataCriacao: new Date(lancamento.dataCriacao),
          }),
        );

        setLancamentos(lancamentosFormatados);
        console.log(
          `📦 [CaixaContext] ${lancamentosFormatados.length} lançamentos carregados do localStorage`,
        );
      } else {
        setLancamentos([]);
        console.log(
          "📦 [CaixaContext] Nenhum lançamento encontrado no localStorage",
        );
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

        console.log(
          "📦 [CaixaContext] Recarregando lançamentos do localStorage...",
        );

        // Simplesmente recarregar do localStorage
        await carregarLancamentosLocalStorage();
      } catch (error) {
        console.error("Erro ao carregar lançamentos do localStorage:", error);
        setError("Erro ao carregar lançamentos locais");
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

      // Criar o lançamento com ID único
      const lancamento: LancamentoCaixa = {
        ...novoLancamento,
        id: `lancamento-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dataCriacao: new Date(),
        data: novoLancamento.data || new Date(),
        dataHora: novoLancamento.dataHora || new Date(),
      };

      console.log(
        "[CaixaContext] Adicionando lançamento ao localStorage:",
        lancamento,
      );

      // Carregar lançamentos existentes
      const lancamentosExistentes = JSON.parse(
        localStorage.getItem("lancamentos_caixa") || "[]",
      );

      // Adicionar o novo lançamento
      const novosLancamentos = [...lancamentosExistentes, lancamento];

      // Salvar no localStorage
      localStorage.setItem(
        "lancamentos_caixa",
        JSON.stringify(novosLancamentos),
      );

      // Recarregar lançamentos
      await carregarLancamentosLocalStorage();

      console.log(
        "[CaixaContext] Lançamento adicionado com sucesso:",
        lancamento.id,
      );
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

      console.log("[CaixaContext] Editando lançamento:", id, dadosAtualizados);

      // Carregar lançamentos existentes
      const lancamentosExistentes = JSON.parse(
        localStorage.getItem("lancamentos_caixa") || "[]",
      );

      // Encontrar e atualizar o lançamento
      const lancamentosAtualizados = lancamentosExistentes.map(
        (lancamento: any) => {
          if (lancamento.id === id) {
            return {
              ...lancamento,
              ...dadosAtualizados,
              // Preservar campos que não devem ser sobrescritos
              id: lancamento.id,
              dataCriacao: lancamento.dataCriacao,
            };
          }
          return lancamento;
        },
      );

      // Salvar no localStorage
      localStorage.setItem(
        "lancamentos_caixa",
        JSON.stringify(lancamentosAtualizados),
      );

      // Recarregar lançamentos
      await carregarLancamentosLocalStorage();

      console.log("[CaixaContext] Lançamento editado com sucesso:", id);
    } catch (error) {
      console.error("Erro ao editar lançamento:", error);
      setError("Erro ao editar lançamento");
      throw error;
    }
  };

  const excluirLancamento = async (id: string) => {
    try {
      setError(null);

      console.log("[CaixaContext] Excluindo lançamento:", id);

      // Carregar lançamentos existentes
      const lancamentosExistentes = JSON.parse(
        localStorage.getItem("lancamentos_caixa") || "[]",
      );

      // Filtrar para remover o lançamento
      const lancamentosFiltrados = lancamentosExistentes.filter(
        (lancamento: any) => lancamento.id !== id,
      );

      // Salvar no localStorage
      localStorage.setItem(
        "lancamentos_caixa",
        JSON.stringify(lancamentosFiltrados),
      );

      // Recarregar lançamentos
      await carregarLancamentosLocalStorage();

      console.log("[CaixaContext] Lançamento excluído com sucesso:", id);
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      setError("Erro ao excluir lançamento");
      throw error;
    }
  };

  const adicionarCampanha = async (novaCampanha: Omit<Campanha, "id">) => {
    try {
      setError(null);

      console.log("[CaixaContext] Adicionando campanha:", novaCampanha);

      // Tentar criar no servidor primeiro
      try {
        const response = await fetch("/api/campanhas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(novaCampanha),
        });

        if (response.ok) {
          const campanhaServidor = await response.json();
          console.log("✅ [CaixaContext] Campanha criada no servidor:", campanhaServidor);

          // Recarregar campanhas do servidor para sincronizar
          await carregarDados();
          return;
        } else {
          throw new Error("Erro ao salvar no servidor");
        }
      } catch (serverError) {
        console.warn("Servidor indisponível, salvando campanha localmente:", serverError);

        // Fallback: salvar apenas no localStorage
        const campanha: Campanha = {
          ...novaCampanha,
          id: `campanha-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        // Carregar campanhas existentes
        const campanhasExistentes = JSON.parse(
          localStorage.getItem("campanhas") || "[]",
        );

        // Adicionar a nova campanha
        const novasCampanhas = [...campanhasExistentes, campanha];

        // Salvar no localStorage
        localStorage.setItem("campanhas", JSON.stringify(novasCampanhas));

        // Atualizar estado
        setCampanhas(novasCampanhas);

        console.log("[CaixaContext] Campanha salva localmente:", campanha.id);
      }
    } catch (error) {
      console.error("Erro ao adicionar campanha:", error);
      throw error;
    }
  };

  // Calcular totais baseados nos lançamentos carregados
  const totais = React.useMemo(() => {
    const receitasCompletas = lancamentos.filter((l) => l.tipo === "receita");

    // Separar boletos (que não têm valorParaEmpresa ainda)
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

    // Receitas líquidas (para compatibilidade com versão anterior)
    const receitaLiquida = receitasNaoBoleto.reduce(
      (total, l) => total + (l.valorLiquido || l.valor),
      0,
    );

    // Receitas efetivamente para a empresa (principal mudança)
    const receitasParaEmpresa = receitasNaoBoleto.reduce(
      (total, l) => total + (l.valorParaEmpresa || l.valorLiquido || l.valor),
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
      receitas: receitasParaEmpresa, // Agora usa valor para empresa
      receitaBruta,
      receitaLiquida,
      receitasParaEmpresa, // Novo campo
      boletos,
      despesas,
      saldo: receitasParaEmpresa - despesas, // Saldo baseado no valor para empresa
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
