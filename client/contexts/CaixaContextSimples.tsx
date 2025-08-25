import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { LancamentoCaixa, Campanha } from "@shared/types";
import { useAuth } from "./AuthContext";

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
    codigoServico?: string;
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
  isExcluindo: boolean;
  error: string | null;
}

const CaixaContext = createContext<CaixaContextType | undefined>(undefined);

export function CaixaProviderSimples({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Estados básicos - SEM loading inicial
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExcluindo, setIsExcluindo] = useState(false);
  
  // Filtros com data padrão de hoje
  const [filtros, setFiltrosState] = useState(() => {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0);
    const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);

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

  // Controle de inicialização única
  const inicializado = useRef(false);

  // Carregamento SÍNCRONO dos dados do localStorage
  const carregarDadosLocalStorage = useCallback(() => {
    try {
      console.log("📂 [CaixaSimples] Carregando dados do localStorage...");
      
      // Carregar campanhas
      const campanhasStorage = localStorage.getItem("campanhas");
      if (campanhasStorage) {
        const campanhasParsed = JSON.parse(campanhasStorage);
        setCampanhas(campanhasParsed);
        console.log(`✅ [CaixaSimples] ${campanhasParsed.length} campanhas carregadas`);
      }

      // Carregar lançamentos
      const lancamentosStorage = localStorage.getItem("lancamentos_caixa");
      if (lancamentosStorage) {
        const lancamentosParsed = JSON.parse(lancamentosStorage);
        const lancamentosFormatados = lancamentosParsed.map((l: any) => ({
          ...l,
          data: new Date(l.data),
          dataHora: new Date(l.dataHora),
          dataCriacao: new Date(l.dataCriacao),
        }));
        setLancamentos(lancamentosFormatados);
        console.log(`✅ [CaixaSimples] ${lancamentosFormatados.length} lançamentos carregados`);
      }
    } catch (error) {
      console.error("❌ [CaixaSimples] Erro ao carregar dados:", error);
      setError("Erro ao carregar dados do localStorage");
    }
  }, []);

  // Inicialização única e imediata
  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    console.log("🚀 [CaixaSimples] Inicialização única");
    carregarDadosLocalStorage();
  }, [carregarDadosLocalStorage]);

  // Função para atualizar filtros sem recarregar
  const setFiltros = useCallback((novosFiltros: any) => {
    console.log("📅 [CaixaSimples] Atualizando filtros");
    setFiltrosState(novosFiltros);
  }, []);

  // Função manual para recarregar dados
  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    try {
      carregarDadosLocalStorage();
    } catch (error) {
      console.error("❌ Erro ao recarregar:", error);
      setError("Erro ao recarregar dados");
    } finally {
      setIsLoading(false);
    }
  }, [carregarDadosLocalStorage]);

  // Adicionar lançamento
  const adicionarLancamento = useCallback(async (novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">) => {
    try {
      console.log("➕ [CaixaSimples] Adicionando lançamento");
      
      const novoId = Date.now().toString();
      const lancamentoCompleto: LancamentoCaixa = {
        ...novoLancamento,
        id: novoId,
        funcionarioId: user?.id || "1",
        data: novoLancamento.data || new Date(),
        dataHora: novoLancamento.dataHora || new Date(),
        dataCriacao: new Date(),
      };

      // Atualizar localStorage
      const lancamentosExistentes = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const novosLancamentos = [...lancamentosExistentes, lancamentoCompleto];
      localStorage.setItem("lancamentos_caixa", JSON.stringify(novosLancamentos));
      
      // Atualizar estado
      setLancamentos(prev => [...prev, lancamentoCompleto]);
      
      console.log("✅ [CaixaSimples] Lançamento adicionado:", novoId);
    } catch (error) {
      console.error("❌ Erro ao adicionar lançamento:", error);
      throw error;
    }
  }, [user?.id]);

  // Editar lançamento
  const editarLancamento = useCallback(async (id: string, dadosAtualizados: Partial<LancamentoCaixa>) => {
    try {
      console.log("✏️ [CaixaSimples] Editando lançamento:", id);

      const lancamentosExistentes = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const lancamentosAtualizados = lancamentosExistentes.map((l: any) => 
        l.id?.toString() === id?.toString() 
          ? { ...l, ...dadosAtualizados, id: l.id, dataCriacao: l.dataCriacao }
          : l
      );

      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosAtualizados));
      carregarDadosLocalStorage();
      
      console.log("✅ [CaixaSimples] Lançamento editado:", id);
    } catch (error) {
      console.error("❌ Erro ao editar lançamento:", error);
      throw error;
    }
  }, [carregarDadosLocalStorage]);

  // Excluir lançamento
  const excluirLancamento = useCallback(async (id: string) => {
    if (isExcluindo) return;

    try {
      setIsExcluindo(true);
      console.log("🗑️ [CaixaSimples] Excluindo lançamento:", id);

      const lancamentosExistentes = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const lancamentosAtualizados = lancamentosExistentes.filter((l: any) => l.id?.toString() !== id?.toString());
      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosAtualizados));

      setLancamentos(prev => prev.filter(l => l.id?.toString() !== id?.toString()));
      
      console.log("✅ [CaixaSimples] Lançamento excluído");
    } catch (error) {
      console.error("❌ Erro ao excluir:", error);
      throw error;
    } finally {
      setIsExcluindo(false);
    }
  }, [isExcluindo]);

  // Adicionar campanha
  const adicionarCampanha = useCallback(async (novaCampanha: Omit<Campanha, "id">) => {
    try {
      console.log("➕ [CaixaSimples] Adicionando campanha");
      
      const novoId = `campanha-${Date.now()}`;
      const campanha: Campanha = { ...novaCampanha, id: novoId };

      const campanhasExistentes = JSON.parse(localStorage.getItem("campanhas") || "[]");
      const novasCampanhas = [...campanhasExistentes, campanha];
      localStorage.setItem("campanhas", JSON.stringify(novasCampanhas));
      
      setCampanhas(novasCampanhas);
      
      console.log("✅ [CaixaSimples] Campanha adicionada:", novoId);
    } catch (error) {
      console.error("❌ Erro ao adicionar campanha:", error);
      throw error;
    }
  }, []);

  // Calcular totais (memoizado)
  const totais = useMemo(() => {
    const receitasCompletas = lancamentos.filter(l => l.tipo === "receita");
    const despesasCompletas = lancamentos.filter(l => l.tipo === "despesa");

    const receitas = receitasCompletas.reduce((total, l) => total + (l.valorLiquido || l.valor), 0);
    const despesas = despesasCompletas.reduce((total, l) => total + l.valor, 0);

    return {
      receitas,
      receitaBruta: receitas,
      receitaLiquida: receitas,
      receitasParaEmpresa: receitas,
      boletos: 0,
      despesas,
      saldo: receitas - despesas,
      comissoes: 0,
    };
  }, [lancamentos]);

  // Value do contexto (memoizado)
  const value = useMemo(() => ({
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
    isExcluindo,
    error,
  }), [
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
    isExcluindo,
    error,
  ]);

  return (
    <CaixaContext.Provider value={value}>
      {children}
    </CaixaContext.Provider>
  );
}

export function useCaixaSimples() {
  const context = useContext(CaixaContext);
  if (context === undefined) {
    throw new Error("useCaixaSimples must be used within a CaixaProviderSimples");
  }
  return context;
}
