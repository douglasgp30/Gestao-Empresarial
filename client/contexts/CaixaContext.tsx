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
import { loadingController, LoadTypes } from "../lib/loadingControl";
import { migrarDadosAntigos } from "../lib/migrarDadosAntigos";

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

  // Função para carregar campanhas
  const carregarCampanhas = useCallback(async () => {
    if (!loadingController.startLoad(LoadTypes.CAIXA_CAMPANHAS)) {
      return;
    }

    try {
      console.log("📊 [CaixaContext] Carregando campanhas...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/campanhas", {
        signal: controller.signal,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const campanhasServidor = await response.json();
        setCampanhas(campanhasServidor || []);
        localStorage.setItem("campanhas", JSON.stringify(campanhasServidor || []));
        console.log(`📊 [CaixaContext] ${campanhasServidor.length} campanhas carregadas`);
      } else {
        throw new Error(`Erro ${response.status}`);
      }
    } catch (error) {
      console.warn("📊 [CaixaContext] Erro ao carregar campanhas, usando localStorage", error);
      try {
        const campanhasStorage = localStorage.getItem("campanhas");
        setCampanhas(campanhasStorage ? JSON.parse(campanhasStorage) : []);
      } catch {
        setCampanhas([]);
      }
    } finally {
      loadingController.finishLoad(LoadTypes.CAIXA_CAMPANHAS);
    }
  }, []);

  // Função para carregar lançamentos
  const carregarLancamentos = useCallback(async () => {
    if (!loadingController.startLoad(LoadTypes.CAIXA_LANCAMENTOS)) {
      return;
    }

    try {
      console.log("📦 [CaixaContext] Carregando lançamentos...");
      
      const params = new URLSearchParams();
      if (filtros.dataInicio) {
        params.append("dataInicio", filtros.dataInicio.toISOString().split("T")[0]);
      }
      if (filtros.dataFim) {
        params.append("dataFim", filtros.dataFim.toISOString().split("T")[0]);
      }
      if (filtros.tipo && filtros.tipo !== "todos") {
        params.append("tipo", filtros.tipo);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`/api/caixa?${params.toString()}`, {
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta não é JSON");
      }

      const lancamentosDoBanco = await response.json();

      const lancamentosFormatados = lancamentosDoBanco.map((lancamento: any) => ({
        ...lancamento,
        data: new Date(lancamento.dataHora),
        dataHora: new Date(lancamento.dataHora),
        dataCriacao: new Date(lancamento.dataHora),
        id: lancamento.id.toString(),
        funcionario: lancamento.funcionario ? {
          id: lancamento.funcionario.id?.toString(),
          nome: lancamento.funcionario.nome,
          percentualComissao: lancamento.funcionario.percentualComissao || lancamento.funcionario.percentualServico,
        } : undefined,
        tecnicoResponsavel: lancamento.funcionario ? {
          id: lancamento.funcionario.id,
          nome: lancamento.funcionario.nome,
        } : undefined,
        formaPagamento: lancamento.formaPagamento ? {
          id: lancamento.formaPagamento.id,
          nome: lancamento.formaPagamento.nome,
        } : undefined,
        cliente: lancamento.cliente ? {
          id: lancamento.cliente.id,
          nome: lancamento.cliente.nome,
        } : undefined,
        campanha: lancamento.campanha ? {
          id: lancamento.campanha.id,
          nome: lancamento.campanha.nome,
        } : undefined,
        localizacao: lancamento.localizacao ? {
          id: lancamento.localizacao.id?.toString(),
          nome: lancamento.localizacao.nome,
          cidade: lancamento.localizacao.cidade,
        } : undefined,
        setor: lancamento.localizacao ? {
          id: lancamento.localizacao.id?.toString(),
          nome: lancamento.localizacao.nome,
          cidade: lancamento.localizacao.cidade,
        } : undefined,
        categoria: lancamento.descricaoECategoria?.categoria || lancamento.descricao?.categoria || "Serviços",
        descricao: {
          nome: (() => {
            if (lancamento.descricaoECategoria?.nome && typeof lancamento.descricaoECategoria.nome === "string" && lancamento.descricaoECategoria.nome.trim() !== "") {
              return lancamento.descricaoECategoria.nome;
            }
            if (lancamento.descricao?.nome && typeof lancamento.descricao.nome === "string" && lancamento.descricao.nome.trim() !== "") {
              return lancamento.descricao.nome;
            }
            return "Serviço";
          })(),
        },
      }));

      setLancamentos(lancamentosFormatados);
      console.log(`📦 [CaixaContext] ${lancamentosFormatados.length} lançamentos carregados`);
    } catch (error) {
      console.warn("📦 [CaixaContext] Erro ao carregar do banco, usando localStorage", error);
      carregarLancamentosLocalStorage();
    } finally {
      loadingController.finishLoad(LoadTypes.CAIXA_LANCAMENTOS);
    }
  }, [filtros.dataInicio, filtros.dataFim, filtros.tipo]);

  // Função para carregar do localStorage como fallback
  const carregarLancamentosLocalStorage = useCallback(() => {
    try {
      console.log("📦 [CaixaContext] Carregando do localStorage...");
      migrarDadosAntigos();
      
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
        console.log(`📦 [CaixaContext] ${lancamentosFormatados.length} lançamentos do localStorage`);
      } else {
        setLancamentos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar do localStorage:", error);
      setLancamentos([]);
    }
  }, []);

  // Carregamento inicial ÚNICO - sem useEffect automático
  const inicializado = useRef(false);
  useEffect(() => {
    if (inicializado.current || typeof window === "undefined") return;
    inicializado.current = true;
    
    console.log("📦 [CaixaContext] Carregamento inicial ÚNICO");
    
    const carregarDadosIniciais = async () => {
      if (!loadingController.startLoad(LoadTypes.CAIXA_INICIAL)) {
        return;
      }

      try {
        setIsLoading(true);
        await Promise.all([carregarCampanhas(), carregarLancamentos()]);
      } catch (error) {
        console.error("Erro no carregamento inicial:", error);
        setError("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
        loadingController.finishLoad(LoadTypes.CAIXA_INICIAL);
      }
    };

    // Delay mínimo para evitar conflitos
    setTimeout(carregarDadosIniciais, 100);
  }, []);

  // Função manual para recarregar dados (chamada pelos filtros)
  const carregarDados = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await carregarLancamentos();
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      setError("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }, [carregarLancamentos]);

  // Função para atualizar filtros (sem recarregamento automático)
  const atualizarFiltros = useCallback((novosFiltros: any) => {
    setFiltros(novosFiltros);
    
    // Recarregar apenas se as datas mudaram significativamente  
    const datasMudaram = 
      novosFiltros.dataInicio?.getTime() !== filtros.dataInicio?.getTime() ||
      novosFiltros.dataFim?.getTime() !== filtros.dataFim?.getTime();

    if (datasMudaram) {
      console.log("📅 [CaixaContext] Datas mudaram, agendando recarregamento...");
      // Debounce para evitar múltiplos recarregamentos
      setTimeout(() => carregarDados(), 300);
    }
  }, [filtros.dataInicio, filtros.dataFim, carregarDados]);

  const adicionarLancamento = async (novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">) => {
    try {
      setError(null);
      console.log("[CaixaContext] Adicionando lançamento via API:", novoLancamento);

      const dadosParaAPI = {
        valor: novoLancamento.valor || 0,
        valorRecebido: novoLancamento.valorQueEntrou || novoLancamento.valorLiquido || novoLancamento.valor,
        valorLiquido: novoLancamento.valorLiquido || novoLancamento.valor,
        comissao: novoLancamento.comissao || 0,
        imposto: novoLancamento.imposto || 0,
        observacoes: novoLancamento.observacoes || "",
        numeroNota: novoLancamento.numeroNota || "",
        tipo: novoLancamento.tipo || "receita",
        data: novoLancamento.data ? new Date(novoLancamento.data).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        categoria: novoLancamento.categoria || "Serviços",
        descricao: typeof novoLancamento.descricao === "object" && novoLancamento.descricao?.nome
          ? novoLancamento.descricao.nome
          : typeof novoLancamento.descricao === "string" ? novoLancamento.descricao : "Serviço",
        formaPagamentoId: extrairIdParaAPI(novoLancamento.formaPagamento, novoLancamento.formaPagamentoId),
        funcionarioId: extrairIdParaAPI(novoLancamento.tecnicoResponsavel, novoLancamento.tecnicoResponsavelId),
        setorId: extrairIdParaAPI(novoLancamento.setor, novoLancamento.setorId),
        campanhaId: extrairIdParaAPI(novoLancamento.campanha, novoLancamento.campanhaId),
        clienteId: extrairIdParaAPI(novoLancamento.cliente, novoLancamento.clienteId),
        codigoServico: novoLancamento.codigoServico,
        sistemaOrigem: novoLancamento.sistemaOrigem,
        codigoExterno: novoLancamento.codigoExterno,
        formaPagamentoSnapshot: novoLancamento.formaPagamento,
        clienteSnapshot: novoLancamento.cliente,
        tecnicoResponsavelSnapshot: novoLancamento.tecnicoResponsavel,
        setorSnapshot: novoLancamento.setor,
        campanhaSnapshot: novoLancamento.campanha,
      };

      const response = await fetch("/api/caixa/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaAPI),
      });

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch {}
        }
        throw new Error(`Erro na API: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log("[CaixaContext] Lançamento criado com sucesso:", responseData.id);

      // Recarregar dados após criação
      await carregarDados();
    } catch (error) {
      console.error("Erro ao adicionar lançamento:", error);
      throw error;
    }
  };

  const extrairIdParaAPI = (objeto: any, idFallback: any) => {
    if (!objeto && !idFallback) return undefined;

    if (typeof objeto === "object" && objeto?.id) {
      const idNumerico = parseInt(objeto.id);
      if (!isNaN(idNumerico)) {
        return idNumerico;
      }
      return objeto.id;
    }

    if (objeto) {
      const id = parseInt(objeto);
      if (!isNaN(id)) {
        return id;
      }
      return objeto;
    }

    if (idFallback) {
      const id = parseInt(idFallback);
      if (!isNaN(id)) {
        return id;
      }
      return idFallback;
    }

    return undefined;
  };

  const editarLancamento = async (id: string, dadosAtualizados: Partial<LancamentoCaixa>) => {
    try {
      setError(null);
      console.log("[CaixaContext] Editando lançamento:", id, dadosAtualizados);

      const lancamentosExistentes = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const lancamentosAtualizados = lancamentosExistentes.map((lancamento: any) => {
        if (lancamento.id?.toString() === id?.toString()) {
          return { ...lancamento, ...dadosAtualizados, id: lancamento.id, dataCriacao: lancamento.dataCriacao };
        }
        return lancamento;
      });

      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosAtualizados));
      carregarLancamentosLocalStorage();
      console.log("[CaixaContext] Lançamento editado com sucesso:", id);
    } catch (error) {
      console.error("Erro ao editar lançamento:", error);
      setError("Erro ao editar lançamento");
      throw error;
    }
  };

  const excluirLancamento = async (id: string) => {
    if (isExcluindo) {
      console.log("[CaixaContext] Exclusão já em andamento, ignorando...");
      return Promise.resolve();
    }

    try {
      setIsExcluindo(true);
      setError(null);
      console.log("[CaixaContext] Excluindo lançamento:", id);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`/api/caixa/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `Erro ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {}
          throw new Error(errorMessage);
        }

        console.log("✅ Lançamento excluído com sucesso da API");
        setLancamentos((prev) => prev.filter((l) => l.id?.toString() !== id?.toString()));
        console.log("✅ Exclusão concluída");
        return Promise.resolve();
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          console.warn("⏰ Timeout na API, removendo localmente como fallback");
          setLancamentos((prev) => prev.filter((l) => l.id?.toString() !== id?.toString()));
          return Promise.resolve();
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error("❌ Erro ao excluir:", error);

      if (error.message?.includes("fetch") || error.message?.includes("Failed")) {
        console.warn("🔄 Erro de rede, removendo localmente como fallback");
        setLancamentos((prev) => prev.filter((l) => l.id?.toString() !== id?.toString()));
        return Promise.resolve();
      }

      setError("Erro ao excluir lançamento");
      throw error;
    } finally {
      setIsExcluindo(false);
    }
  };

  const adicionarCampanha = async (novaCampanha: Omit<Campanha, "id">) => {
    try {
      setError(null);
      console.log("[CaixaContext] Adicionando campanha:", novaCampanha);

      try {
        const response = await fetch("/api/campanhas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novaCampanha),
        });

        if (response.ok) {
          const campanhaServidor = await response.json();
          console.log("✅ [CaixaContext] Campanha criada no servidor:", campanhaServidor);
          await carregarCampanhas();
          return;
        } else {
          throw new Error("Erro ao salvar no servidor");
        }
      } catch (serverError) {
        console.warn("Servidor indisponível, salvando campanha localmente:", serverError);

        const campanha: Campanha = {
          ...novaCampanha,
          id: `campanha-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        const campanhasExistentes = JSON.parse(localStorage.getItem("campanhas") || "[]");
        const novasCampanhas = [...campanhasExistentes, campanha];

        localStorage.setItem("campanhas", JSON.stringify(novasCampanhas));
        setCampanhas(novasCampanhas);
        console.log("[CaixaContext] Campanha salva localmente:", campanha.id);
      }
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
