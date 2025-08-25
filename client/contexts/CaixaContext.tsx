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

  // Função para criar dados básicos se não existirem
  const criarDadosBasicos = useCallback(() => {
    console.log("🔧 [CaixaContext] Criando dados básicos...");
    
    // Campanhas padrão
    const campanhasPadrao: Campanha[] = [
      { id: "1", nome: "Campanha Principal", descricao: "Campanha principal da empresa" },
      { id: "2", nome: "Sem Campanha", descricao: "Lançamentos sem campanha específica" },
      { id: "3", nome: "Promoções", descricao: "Campanhas promocionais" }
    ];

    // Verificar se campanhas existem
    const campanhasExistentes = localStorage.getItem("campanhas");
    if (!campanhasExistentes) {
      localStorage.setItem("campanhas", JSON.stringify(campanhasPadrao));
      console.log("✅ [CaixaContext] Campanhas padrão criadas");
    }

    // Lançamentos de exemplo
    const lancamentosPadrao: LancamentoCaixa[] = [
      {
        id: "1",
        tipo: "receita",
        valor: 500.00,
        valorLiquido: 450.00,
        comissao: 50.00,
        descricao: { nome: "Serviço de manutenção" },
        categoria: "Serviços",
        formaPagamento: { id: "1", nome: "Dinheiro" },
        tecnicoResponsavel: { id: "1", nome: "Técnico Padrão" },
        cliente: { id: "1", nome: "Cliente Exemplo" },
        campanha: { id: "1", nome: "Campanha Principal" },
        data: new Date(),
        dataHora: new Date(),
        dataCriacao: new Date(),
        funcionarioId: "1"
      }
    ];

    // Verificar se lançamentos existem
    const lancamentosExistentes = localStorage.getItem("lancamentos_caixa");
    if (!lancamentosExistentes) {
      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosPadrao));
      console.log("✅ [CaixaContext] Lançamentos padrão criados");
    }

    // Carregar dados criados
    setCampanhas(campanhasPadrao);
    setLancamentos(lancamentosPadrao);
  }, []);

  // Carregar campanhas do localStorage ou criar padrão
  const carregarCampanhasLocalStorage = useCallback(() => {
    try {
      console.log("📊 [CaixaContext] Carregando campanhas do localStorage");
      const campanhasStorage = localStorage.getItem("campanhas");
      
      if (campanhasStorage) {
        const campanhas = JSON.parse(campanhasStorage);
        setCampanhas(campanhas || []);
        console.log(`📊 [CaixaContext] ${campanhas.length} campanhas carregadas do localStorage`);
      } else {
        // Se não existir, criar dados básicos
        console.log("📊 [CaixaContext] Campanhas não encontradas, criando dados básicos");
        const campanhasPadrao: Campanha[] = [
          { id: "1", nome: "Campanha Principal", descricao: "Campanha principal da empresa" },
          { id: "2", nome: "Sem Campanha", descricao: "Lançamentos sem campanha específica" },
          { id: "3", nome: "Promoções", descricao: "Campanhas promocionais" }
        ];
        setCampanhas(campanhasPadrao);
        localStorage.setItem("campanhas", JSON.stringify(campanhasPadrao));
        console.log("✅ [CaixaContext] Campanhas padrão criadas e salvas");
      }
    } catch (error) {
      console.error("Erro ao carregar campanhas do localStorage:", error);
      setCampanhas([]);
    }
  }, []);

  const carregarLancamentosLocalStorage = useCallback(() => {
    try {
      console.log("📦 [CaixaContext] Carregando lançamentos do localStorage");
      const lancamentosStorage = localStorage.getItem("lancamentos_caixa");

      if (lancamentosStorage) {
        // Parse assíncrono para não bloquear UI em arrays grandes
        setTimeout(() => {
          try {
            const lancamentosParsed = JSON.parse(lancamentosStorage);
            const lancamentosFormatados = lancamentosParsed.map((lancamento: any) => ({
              ...lancamento,
              data: new Date(lancamento.data),
              dataHora: new Date(lancamento.dataHora),
              dataCriacao: new Date(lancamento.dataCriacao),
            }));
            setLancamentos(lancamentosFormatados);
            console.log(`📦 [CaixaContext] ${lancamentosFormatados.length} lançamentos carregados do localStorage`);
          } catch (error) {
            console.error("Erro ao processar lançamentos do localStorage:", error);
            setLancamentos([]);
          }
        }, 0);
      } else {
        console.log("📦 [CaixaContext] Nenhum lançamento encontrado no localStorage");
        setLancamentos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar lançamentos do localStorage:", error);
      setLancamentos([]);
    }
  }, []);

  // CARREGAMENTO INICIAL IMEDIATO E ÚNICO
  const inicializado = useRef(false);
  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    console.log("🚀 [CaixaContext] INICIALIZAÇÃO IMEDIATA");

    try {
      // Executar migração automática se necessário
      try {
        if (typeof window !== 'undefined' && window.migracaoCaixa) {
          if (window.migracaoCaixa.verificar && window.migracaoCaixa.verificar()) {
            console.log("[CaixaContext] Executando migração automática de dados legados...");
            window.migracaoCaixa.backup && window.migracaoCaixa.backup();
            window.migracaoCaixa.executar && window.migracaoCaixa.executar();
            console.log("[CaixaContext] Migração automática concluída.");
          }
        }
      } catch (e) {
        console.warn("[CaixaContext] Erro ao executar migração automática:", e);
      }

      // FORÇAR carregamento IMEDIATO dos dados
      carregarCampanhasLocalStorage();
      carregarLancamentosLocalStorage();
      console.log("✅ [CaixaContext] Dados carregados imediatamente");
    } catch (error) {
      console.error("Erro na inicialização:", error);
      // Se falhar, criar dados básicos
      criarDadosBasicos();
    }
  }, []); // Remover dependencies para evitar loops

  // Função manual para recarregar dados
  const carregarDados = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔄 [CaixaContext] Recarregamento manual solicitado");
      carregarLancamentosLocalStorage();
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      setError("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar filtros SEM recarregamento automático
  const atualizarFiltros = (novosFiltros: any) => {
    setFiltros(novosFiltros);
    console.log("📅 [CaixaContext] Filtros atualizados");
  };

  // Adicionar lançamento
  const adicionarLancamento = async (novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">) => {
    try {
      setError(null);
      console.log("➕ [CaixaContext] Adicionando lançamento:", novoLancamento);

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

      console.log("✅ [CaixaContext] Lançamento adicionado com sucesso:", novoId);
    } catch (error) {
      console.error("Erro ao adicionar lançamento:", error);
      throw error;
    }
  };

  const editarLancamento = async (id: string, dadosAtualizados: Partial<LancamentoCaixa>) => {
    try {
      setError(null);
      console.log("✏️ [CaixaContext] Editando lançamento:", id);

      const lancamentosExistentes = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const lancamentosAtualizados = lancamentosExistentes.map((lancamento: any) => {
        if (lancamento.id?.toString() === id?.toString()) {
          return { ...lancamento, ...dadosAtualizados, id: lancamento.id, dataCriacao: lancamento.dataCriacao };
        }
        return lancamento;
      });

      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosAtualizados));
      carregarLancamentosLocalStorage();
      console.log("✅ [CaixaContext] Lançamento editado com sucesso:", id);
    } catch (error) {
      console.error("Erro ao editar lançamento:", error);
      setError("Erro ao editar lançamento");
      throw error;
    }
  };

  const excluirLancamento = useCallback(async (id: string) => {
    if (isExcluindo) {
      throw new Error("Operação de exclusão já em andamento");
    }

    try {
      setIsExcluindo(true);
      setError(null);
      console.log("🗑️ [CaixaContext] Excluindo lançamento:", id);

      // Atualizar estado em memória e persistir baseado no estado atual (evita JSON.parse pesado)
      setLancamentos((prev) => {
        const lancamentosAtualizados = prev.filter((l) => l.id?.toString() !== id?.toString());

        // Persistir de forma assíncrona sem bloquear UI
        setTimeout(() => {
          try {
            localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosAtualizados));
          } catch (e) {
            console.error("Erro ao persistir lançamentos:", e);
          }
        }, 0);

        return lancamentosAtualizados;
      });

      console.log("✅ [CaixaContext] Lançamento excluído com sucesso");
    } catch (error: any) {
      console.error("❌ Erro ao excluir:", error);
      setError("Erro ao excluir lançamento");
      throw error;
    } finally {
      setIsExcluindo(false);
    }
  }, [isExcluindo]);

  // Adicionar campanha
  const adicionarCampanha = async (novaCampanha: Omit<Campanha, "id">) => {
    try {
      setError(null);
      console.log("➕ [CaixaContext] Adicionando campanha:", novaCampanha);

      const novoId = `campanha-${Date.now()}`;
      const campanha: Campanha = { ...novaCampanha, id: novoId };

      // Carregar campanhas existentes
      const campanhasExistentes = JSON.parse(localStorage.getItem("campanhas") || "[]");
      const novasCampanhas = [...campanhasExistentes, campanha];
      
      // Salvar no localStorage
      localStorage.setItem("campanhas", JSON.stringify(novasCampanhas));
      setCampanhas(novasCampanhas);

      console.log("✅ [CaixaContext] Campanha adicionada com sucesso:", novoId);
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
    excluirLancamento,
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
