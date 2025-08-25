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

export function CaixaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExcluindo, setIsExcluindo] = useState(false);
  const [filtros, setFiltros] = useState(() => {
    const agora = new Date();
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    const fimHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999);

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

  // 🚨 SOLUÇÃO DRÁSTICA: APENAS LOCALSTORAGE - ZERO APIS
  const carregarCampanhasLocalStorage = useCallback(() => {
    try {
      console.log("🚨 [CaixaContext] Carregando campanhas APENAS do localStorage");
      const campanhasStorage = localStorage.getItem("campanhas");
      if (campanhasStorage) {
        const campanhas = JSON.parse(campanhasStorage);
        setCampanhas(campanhas || []);
        console.log(`🚨 [CaixaContext] ${campanhas.length} campanhas carregadas do localStorage`);
      } else {
        // Criar campanhas padrão se não existir
        const campanhasPadrao: Campanha[] = [
          { id: "1", nome: "Campanha Padrão", descricao: "Campanha padrão do sistema" },
          { id: "2", nome: "Sem Campanha", descricao: "Lançamentos sem campanha específica" }
        ];
        setCampanhas(campanhasPadrao);
        localStorage.setItem("campanhas", JSON.stringify(campanhasPadrao));
        console.log(`🚨 [CaixaContext] Campanhas padrão criadas no localStorage`);
      }
    } catch (error) {
      console.error("Erro ao carregar campanhas do localStorage:", error);
      setCampanhas([]);
    }
  }, []);

  const carregarLancamentosLocalStorage = useCallback(() => {
    try {
      console.log("🚨 [CaixaContext] Carregando lançamentos APENAS do localStorage");
      const lancamentosStorage = localStorage.getItem("lancamentos_caixa");
      if (lancamentosStorage) {
        const lancamentosParsed = JSON.parse(lancamentosStorage);
        const lancamentosFormatados = lancamentosParsed.map((lancamento: any) => ({
          ...lancamento,
          data: new Date(lancamento.data),
          dataHora: new Date(lancamento.dataHora),
          dataCriacao: new Date(lancamento.dataCriacao),
        }));
        setLancamentos(lancamentosFormatados);
        console.log(`🚨 [CaixaContext] ${lancamentosFormatados.length} lançamentos carregados do localStorage`);
      } else {
        setLancamentos([]);
        console.log("🚨 [CaixaContext] Nenhum lançamento encontrado no localStorage");
      }
    } catch (error) {
      console.error("Erro ao carregar lançamentos do localStorage:", error);
      setLancamentos([]);
    }
  }, []);

  // 🚨 CARREGAMENTO INICIAL ÚNICO - APENAS LOCALSTORAGE
  const inicializado = useRef(false);
  useEffect(() => {
    if (inicializado.current || typeof window === "undefined") return;
    inicializado.current = true;
    
    console.log("🚨 [CaixaContext] INICIALIZAÇÃO ÚNICA - APENAS LOCALSTORAGE");
    
    const carregarApenasLocalStorage = () => {
      try {
        setIsLoading(true);
        carregarCampanhasLocalStorage();
        carregarLancamentosLocalStorage();
        console.log("🚨 [CaixaContext] Carregamento inicial concluído - SEM APIS");
      } catch (error) {
        console.error("Erro no carregamento inicial:", error);
        setError("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    // Executar imediatamente sem delay
    carregarApenasLocalStorage();
  }, [carregarCampanhasLocalStorage, carregarLancamentosLocalStorage]);

  // 🚨 FUNÇÃO MANUAL - APENAS LOCALSTORAGE
  const carregarDados = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🚨 [CaixaContext] Carregamento MANUAL - APENAS LOCALSTORAGE");
      carregarLancamentosLocalStorage();
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      setError("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }, [carregarLancamentosLocalStorage]);

  // Função para atualizar filtros SEM recarregamento automático
  const atualizarFiltros = useCallback((novosFiltros: any) => {
    setFiltros(novosFiltros);
    console.log("🚨 [CaixaContext] Filtros atualizados SEM recarregamento automático");
  }, []);

  // 🚨 ADICIONAR LANÇAMENTO - APENAS LOCALSTORAGE
  const adicionarLancamento = async (novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">) => {
    try {
      setError(null);
      console.log("🚨 [CaixaContext] Adicionando lançamento APENAS no localStorage:", novoLancamento);

      // Gerar ID único
      const novoId = Date.now().toString();
      
      // Criar lançamento completo
      const lancamentoCompleto: LancamentoCaixa = {
        ...novoLancamento,
        id: novoId,
        funcionarioId: user?.id || "1",
        data: novoLancamento.data || new Date(),
        dataHora: novoLancamento.dataHora || new Date(),
        dataCriacao: new Date(),
      };

      // Carregar lançamentos existentes
      const lancamentosExistentes = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      
      // Adicionar novo lançamento
      const novosLancamentos = [...lancamentosExistentes, lancamentoCompleto];
      
      // Salvar no localStorage
      localStorage.setItem("lancamentos_caixa", JSON.stringify(novosLancamentos));
      
      // Atualizar estado
      setLancamentos((prev) => [...prev, lancamentoCompleto]);

      console.log("🚨 [CaixaContext] Lançamento adicionado com sucesso no localStorage:", novoId);
    } catch (error) {
      console.error("Erro ao adicionar lançamento:", error);
      throw error;
    }
  };

  const editarLancamento = async (id: string, dadosAtualizados: Partial<LancamentoCaixa>) => {
    try {
      setError(null);
      console.log("🚨 [CaixaContext] Editando lançamento no localStorage:", id, dadosAtualizados);

      const lancamentosExistentes = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const lancamentosAtualizados = lancamentosExistentes.map((lancamento: any) => {
        if (lancamento.id?.toString() === id?.toString()) {
          return { ...lancamento, ...dadosAtualizados, id: lancamento.id, dataCriacao: lancamento.dataCriacao };
        }
        return lancamento;
      });

      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosAtualizados));
      
      // Recarregar do localStorage
      carregarLancamentosLocalStorage();
      
      console.log("🚨 [CaixaContext] Lançamento editado com sucesso no localStorage:", id);
    } catch (error) {
      console.error("Erro ao editar lançamento:", error);
      setError("Erro ao editar lançamento");
      throw error;
    }
  };

  const excluirLancamento = async (id: string) => {
    if (isExcluindo) {
      console.log("🚨 [CaixaContext] Exclusão já em andamento, ignorando...");
      return Promise.resolve();
    }

    try {
      setIsExcluindo(true);
      setError(null);
      console.log("🚨 [CaixaContext] Excluindo lançamento do localStorage:", id);

      // Remover do localStorage
      const lancamentosExistentes = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const lancamentosAtualizados = lancamentosExistentes.filter((l: any) => l.id?.toString() !== id?.toString());
      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosAtualizados));

      // Atualizar estado
      setLancamentos((prev) => prev.filter((l) => l.id?.toString() !== id?.toString()));
      
      console.log("🚨 [CaixaContext] Lançamento excluído com sucesso do localStorage");
      return Promise.resolve();
    } catch (error: any) {
      console.error("❌ Erro ao excluir:", error);
      setError("Erro ao excluir lançamento");
      throw error;
    } finally {
      setIsExcluindo(false);
    }
  };

  // 🚨 ADICIONAR CAMPANHA - APENAS LOCALSTORAGE
  const adicionarCampanha = async (novaCampanha: Omit<Campanha, "id">) => {
    try {
      setError(null);
      console.log("🚨 [CaixaContext] Adicionando campanha APENAS no localStorage:", novaCampanha);

      // Gerar ID único
      const novoId = `campanha-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const campanha: Campanha = {
        ...novaCampanha,
        id: novoId,
      };

      // Carregar campanhas existentes
      const campanhasExistentes = JSON.parse(localStorage.getItem("campanhas") || "[]");
      
      // Adicionar nova campanha
      const novasCampanhas = [...campanhasExistentes, campanha];
      
      // Salvar no localStorage
      localStorage.setItem("campanhas", JSON.stringify(novasCampanhas));
      
      // Atualizar estado
      setCampanhas(novasCampanhas);

      console.log("🚨 [CaixaContext] Campanha adicionada com sucesso no localStorage:", novoId);
    } catch (error) {
      console.error("Erro ao adicionar campanha:", error);
      throw error;
    }
  };

  // Helper para verificar se é boleto
  const isBoleto = (lancamento: any) => {
    if (typeof lancamento.formaPagamento === "object" && lancamento.formaPagamento?.nome) {
      const nome = lancamento.formaPagamento.nome.toLowerCase();
      return nome.includes("boleto") || nome.includes("bancario");
    }
    if (typeof lancamento.formaPagamento === "string") {
      const nome = lancamento.formaPagamento.toLowerCase();
      return nome.includes("boleto") || nome.includes("bancario");
    }
    return false;
  };

  // Calcular totais
  const totais = useMemo(() => {
    const receitasCompletas = lancamentos.filter((l) => l.tipo === "receita");
    const receitasBoleto = receitasCompletas.filter(isBoleto);
    const receitasNaoBoleto = receitasCompletas.filter((l) => !isBoleto(l));

    const receitaBruta = receitasCompletas.reduce((total, l) => {
      if (l.valorParaEmpresa !== undefined) {
        return total + l.valorParaEmpresa;
      }
      const valorLiquido = l.valorLiquido || l.valor;
      const comissao = l.comissao || 0;
      const valorParaEmpresaCalculado = valorLiquido - comissao;
      return total + valorParaEmpresaCalculado;
    }, 0);

    const receitaLiquida = receitasNaoBoleto.reduce((total, l) => total + (l.valorLiquido || l.valor), 0);

    const receitasParaEmpresa = receitasNaoBoleto.reduce((total, l) => {
      if (l.valorParaEmpresa !== undefined) {
        return total + l.valorParaEmpresa;
      }
      const valorLiquido = l.valorLiquido || l.valor;
      const comissao = l.comissao || 0;
      const valorParaEmpresaCalculado = valorLiquido - comissao;
      return total + valorParaEmpresaCalculado;
    }, 0);

    const boletos = receitasBoleto.reduce((total, l) => total + l.valor, 0);
    const despesas = lancamentos.filter((l) => l.tipo === "despesa").reduce((total, l) => total + l.valor, 0);
    const comissoes = receitasNaoBoleto.filter((l) => l.comissao).reduce((total, l) => total + (l.comissao || 0), 0);

    return {
      receitas: receitasParaEmpresa,
      receitaBruta,
      receitaLiquida,
      receitasParaEmpresa,
      boletos,
      despesas,
      saldo: receitasParaEmpresa - despesas,
      comissoes,
    };
  }, [lancamentos]);

  const value = useMemo(() => ({
    lancamentos,
    campanhas,
    filtros,
    totais,
    adicionarLancamento,
    editarLancamento,
    excluirLancamento,
    adicionarCampanha,
    setFiltros: atualizarFiltros,
    carregarDados,
    isLoading,
    isExcluindo,
    error,
  }), [
    lancamentos,
    campanhas,
    filtros,
    totais,
    atualizarFiltros,
    carregarDados,
    isLoading,
    isExcluindo,
    error,
  ]);

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
