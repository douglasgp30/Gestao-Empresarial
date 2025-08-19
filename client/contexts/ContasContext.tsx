import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
// import { apiService } from "@/lib/apiService"; // Removido para usar localStorage
import {
  ContaLancamento,
  Cliente,
  Fornecedor,
  FormaPagamento,
  Categoria,
  DescricaoECategoria,
} from "@shared/types";

interface FiltrosContas {
  dataInicio: Date;
  dataFim: Date;
  tipo: "receber" | "pagar" | "ambos";
  pago: "true" | "false" | "todos";
  categoria: string;
  status?: string;
  fornecedorCliente?: string;
  __timestamp?: number;
}

interface ContasContextType {
  contas: ContaLancamento[];
  filtros: FiltrosContas;
  setFiltros: (filtros: FiltrosContas) => void;
  atualizarFiltros: (novosFiltros: Partial<FiltrosContas>) => void;
  carregando: boolean;
  isLoading: boolean;
  erro: string | null;
  adicionarConta: (
    conta: Omit<ContaLancamento, "codLancamentoContas" | "dataLancamento">,
  ) => Promise<ContaLancamento>;
  atualizarConta: (
    id: number,
    conta: Partial<ContaLancamento>,
  ) => Promise<ContaLancamento>;
  excluirConta: (id: number) => Promise<void>;
  marcarComoPago: (
    id: number,
    formaPagamentoId: number,
  ) => Promise<ContaLancamento>;
  forcarRecarregamento: () => void;

  // Listas auxiliares
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  formasPagamento: FormaPagamento[];
  categorias: Categoria[];
  descricoes: DescricaoECategoria[];
  getCategorias: (tipo?: string) => DescricaoECategoria[];
  getDescricoes: (tipo?: string, categoria?: string) => DescricaoECategoria[];

  // Funções para adicionar entidades
  adicionarFornecedor: (
    fornecedor: Omit<Fornecedor, "id">,
  ) => Promise<Fornecedor>;
}

const ContasContext = createContext<ContasContextType | undefined>(undefined);

const getDefaultFiltros = (): FiltrosContas => {
  const hoje = new Date();
  const dataFim = new Date(hoje);
  const dataInicio = new Date(hoje);

  // Últimos 30 dias por padrão
  dataInicio.setDate(hoje.getDate() - 30);

  return {
    dataInicio,
    dataFim,
    tipo: "ambos",
    pago: "todos",
    categoria: "todos",
    __timestamp: Date.now(),
  };
};

export function ContasProvider({ children }: { children: React.ReactNode }) {
  const [contas, setContas] = useState<ContaLancamento[]>([]);
  const [filtros, setFiltros] = useState<FiltrosContas>(getDefaultFiltros);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Listas auxiliares
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [descricoes, setDescricoes] = useState<DescricaoECategoria[]>([]);

  const carregarContas = useCallback(async (filtrosAtivos: FiltrosContas) => {
    try {
      setCarregando(true);
      setErro(null);

      console.log("📦 [CONTAS] Carregando contas do localStorage com filtros:", {
        dataInicio: filtrosAtivos.dataInicio.toISOString().split("T")[0],
        dataFim: filtrosAtivos.dataFim.toISOString().split("T")[0],
        tipo: filtrosAtivos.tipo,
        pago: filtrosAtivos.pago,
        categoria: filtrosAtivos.categoria,
      });

      // Carregar contas do localStorage
      const contasStorage = localStorage.getItem("contas_pagar");
      const contasReceber = localStorage.getItem("contas_receber");

      let todasContas: ContaLancamento[] = [];

      // Carregar contas a pagar
      if (contasStorage) {
        try {
          const contasPagar = JSON.parse(contasStorage).map((conta: any) => ({
            ...conta,
            tipo: "pagar" as const,
            dataLancamento: new Date(conta.dataCriacao || conta.dataLancamento || new Date()),
            dataVencimento: new Date(conta.dataVencimento),
            dataPagamento: conta.dataPagamento ? new Date(conta.dataPagamento) : undefined,
          }));
          todasContas.push(...contasPagar);
        } catch (error) {
          console.warn("Erro ao parsear contas a pagar:", error);
        }
      }

      // Carregar contas a receber
      if (contasReceber) {
        try {
          const contasAReceber = JSON.parse(contasReceber).map((conta: any) => ({
            ...conta,
            tipo: "receber" as const,
            dataLancamento: new Date(conta.dataCriacao || conta.dataLancamento || new Date()),
            dataVencimento: new Date(conta.dataVencimento),
            dataPagamento: conta.dataPagamento ? new Date(conta.dataPagamento) : undefined,
          }));
          todasContas.push(...contasAReceber);
        } catch (error) {
          console.warn("Erro ao parsear contas a receber:", error);
        }
      }

      console.log("📦 [CONTAS] Total de contas carregadas do localStorage:", todasContas.length);
      setContas(todasContas);
    } catch (error) {
      console.error("❌ [CONTAS] Erro ao carregar contas do localStorage:", error);
      setErro("Erro ao carregar contas locais");
      setContas([]);

      // Tentar carregar do localStorage como fallback
      try {
        const backup = localStorage.getItem("contas-backup");
        if (backup) {
          const contasBackup = JSON.parse(backup).map((conta: any) => ({
            ...conta,
            dataLancamento: new Date(conta.dataLancamento),
            dataVencimento: new Date(conta.dataVencimento),
            dataPagamento: conta.dataPagamento
              ? new Date(conta.dataPagamento)
              : undefined,
          }));
          console.log(
            "📦 [CONTAS] Carregando do backup localStorage:",
            contasBackup.length,
          );
          setContas(contasBackup);
        }
      } catch (backupError) {
        console.error("❌ [CONTAS] Erro ao carregar backup:", backupError);
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarDadosAuxiliares = useCallback(async () => {
    // Durante hot reload, não carregar dados auxiliares
    if (
      typeof window !== "undefined" &&
      (window.location.href.includes("reload=") ||
        window.location.href.includes("?t="))
    ) {
      console.log(
        "[ContasContext] Hot reload detectado, pulando carregamento de dados auxiliares",
      );
      return;
    }

    try {
      console.log("📦 [CONTAS] Carregando dados auxiliares do localStorage...");

      // Carregar clientes do localStorage
      try {
        const clientesStorage = localStorage.getItem("clientes");
        if (clientesStorage) {
          const clientesParsed = JSON.parse(clientesStorage);
          setClientes(clientesParsed || []);
        } else {
          setClientes([]);
        }
      } catch (error) {
        console.warn("Erro ao carregar clientes:", error);
        setClientes([]);
      }

      // Carregar fornecedores (assumindo que podem estar em um localStorage separado)
      try {
        const fornecedoresStorage = localStorage.getItem("fornecedores");
        if (fornecedoresStorage) {
          const fornecedoresParsed = JSON.parse(fornecedoresStorage);
          setFornecedores(fornecedoresParsed || []);
        } else {
          setFornecedores([]);
        }
      } catch (error) {
        console.warn("Erro ao carregar fornecedores:", error);
        setFornecedores([]);
      }

      // Carregar formas de pagamento
      try {
        const formasStorage = localStorage.getItem("formas_pagamento");
        if (formasStorage) {
          const formasParsed = JSON.parse(formasStorage);
          setFormasPagamento(formasParsed || []);
        } else {
          // Dados padrão se não houver no localStorage
          setFormasPagamento([
            { id: 1, nome: "Dinheiro", descricao: "Pagamento em dinheiro" },
            { id: 2, nome: "PIX", descricao: "Pagamento via PIX" },
            { id: 3, nome: "Cartão de Débito", descricao: "Pagamento com cartão de débito" },
            { id: 4, nome: "Cartão de Crédito", descricao: "Pagamento com cartão de crédito" },
          ] as FormaPagamento[]);
        }
      } catch (error) {
        console.warn("Erro ao carregar formas de pagamento:", error);
        setFormasPagamento([]);
      }

      // Carregar categorias
      try {
        const categoriasStorage = localStorage.getItem("categorias_receita") || localStorage.getItem("categorias_despesa");
        if (categoriasStorage) {
          const categoriasParsed = JSON.parse(categoriasStorage);
          setCategorias(categoriasParsed || []);
        } else {
          setCategorias([]);
        }
      } catch (error) {
        console.warn("Erro ao carregar categorias:", error);
        setCategorias([]);
      }

      // Carregar descrições
      try {
        const descricoesStorage = localStorage.getItem("descricoes_e_categorias");
        if (descricoesStorage) {
          const descricoesParsed = JSON.parse(descricoesStorage);
          setDescricoes(descricoesParsed || []);
        } else {
          setDescricoes([]);
        }
      } catch (error) {
        console.warn("Erro ao carregar descrições:", error);
        setDescricoes([]);
      }

      console.log("✅ [CONTAS] Dados auxiliares carregados do localStorage");
    } catch (error) {
      console.error("❌ [CONTAS] Erro ao carregar dados auxiliares:", error);
    }
  }, []);

  const adicionarConta = useCallback(
    async (
      novaConta: Omit<
        ContaLancamento,
        "codLancamentoContas" | "dataLancamento"
      >,
    ) => {
      try {
        console.log("📦 [CONTAS] Adicionando nova conta ao localStorage:", novaConta);

        // Criar a conta com ID único
        const conta: ContaLancamento = {
          ...novaConta,
          codLancamentoContas: Date.now(), // ID único baseado em timestamp
          dataLancamento: new Date(),
        };

        // Determinar em qual localStorage salvar baseado no tipo
        const storageKey = conta.tipo === "pagar" ? "contas_pagar" : "contas_receber";

        // Carregar contas existentes
        const contasExistentes = JSON.parse(localStorage.getItem(storageKey) || "[]");

        // Adicionar a nova conta
        const novasContas = [...contasExistentes, conta];

        // Salvar no localStorage
        localStorage.setItem(storageKey, JSON.stringify(novasContas));

        console.log("✅ [CONTAS] Conta adicionada com sucesso:", conta);

        // Forçar recarregamento das contas
        await carregarContas(filtros);

        return conta;
      } catch (error) {
        console.error("❌ [CONTAS] Erro ao adicionar conta:", error);
        throw error;
      }
    },
    [carregarContas, filtros],
  );

  const atualizarConta = useCallback(
    async (id: number, contaAtualizada: Partial<ContaLancamento>) => {
      try {
        console.log("📦 [CONTAS] Atualizando conta no localStorage:", id, contaAtualizada);

        // Encontrar a conta atual para determinar o tipo
        const contaAtual = contas.find(c => c.codLancamentoContas === id);
        if (!contaAtual) {
          throw new Error("Conta não encontrada");
        }

        const storageKey = contaAtual.tipo === "pagar" ? "contas_pagar" : "contas_receber";
        const contasExistentes = JSON.parse(localStorage.getItem(storageKey) || "[]");

        // Atualizar a conta
        const contasAtualizadas = contasExistentes.map((conta: any) =>
          conta.codLancamentoContas === id
            ? { ...conta, ...contaAtualizada }
            : conta
        );

        localStorage.setItem(storageKey, JSON.stringify(contasAtualizadas));

        const contaFormatada = { ...contaAtual, ...contaAtualizada };

        // Atualizar a lista local
        setContas((contas) =>
          contas.map((conta) =>
            conta.codLancamentoContas === id ? contaFormatada : conta,
          ),
        );

        return contaFormatada;
      } catch (error) {
        console.error("❌ [CONTAS] Erro ao atualizar conta:", error);
        throw error;
      }
    },
    [contas],
  );

  const excluirConta = useCallback(async (id: number) => {
    try {
      console.log("📦 [CONTAS] Excluindo conta do localStorage:", id);

      // Encontrar a conta para determinar o tipo
      const contaAtual = contas.find(c => c.codLancamentoContas === id);
      if (contaAtual) {
        const storageKey = contaAtual.tipo === "pagar" ? "contas_pagar" : "contas_receber";
        const contasExistentes = JSON.parse(localStorage.getItem(storageKey) || "[]");

        // Filtrar para remover a conta
        const contasAtualizadas = contasExistentes.filter((conta: any) =>
          conta.codLancamentoContas !== id
        );

        localStorage.setItem(storageKey, JSON.stringify(contasAtualizadas));
      }

      // Remover da lista local
      setContas((contas) =>
        contas.filter((conta) => conta.codLancamentoContas !== id),
      );
    } catch (error) {
      console.error("❌ [CONTAS] Erro ao excluir conta:", error);
      throw error;
    }
  }, [contas]);

  const marcarComoPago = useCallback(
    async (id: number, formaPagamentoId: number) => {
      try {
        console.log("📦 [CONTAS] Marcando conta como paga no localStorage:", id);

        const dadosAtualizacao = {
          dataPagamento: new Date(),
          formaPg: formaPagamentoId,
          pago: true,
        };

        // Usar a função atualizarConta que já funciona com localStorage
        return await atualizarConta(id, dadosAtualizacao);
      } catch (error) {
        console.error("❌ [CONTAS] Erro ao marcar conta como paga:", error);
        throw error;
      }
    },
    [],
  );

  const adicionarFornecedor = useCallback(
    async (novoFornecedor: Omit<Fornecedor, "id">) => {
      try {
        console.log("📦 [CONTAS] Adicionando novo fornecedor ao localStorage:", novoFornecedor);

        // Criar fornecedor com ID único
        const fornecedor: Fornecedor = {
          ...novoFornecedor,
          id: Date.now(), // ID único baseado em timestamp
        };

        // Carregar fornecedores existentes
        const fornecedoresExistentes = JSON.parse(localStorage.getItem("fornecedores") || "[]");

        // Adicionar o novo fornecedor
        const novosFornecedores = [...fornecedoresExistentes, fornecedor];

        // Salvar no localStorage
        localStorage.setItem("fornecedores", JSON.stringify(novosFornecedores));

        console.log("✅ [CONTAS] Fornecedor adicionado com sucesso:", fornecedor);

        // Atualizar a lista de fornecedores
        setFornecedores((prev) => [...prev, fornecedor]);

        return fornecedor;
      } catch (error) {
        console.error("❌ [CONTAS] Erro ao adicionar fornecedor:", error);
        throw error;
      }
    },
    [],
  );

  const atualizarFiltros = useCallback(
    (novosFiltros: Partial<FiltrosContas>) => {
      console.log("🔄 [CONTAS] Atualizando filtros:", novosFiltros);
      setFiltros((prev) => ({
        ...prev,
        ...novosFiltros,
        __timestamp: Date.now(),
      }));
    },
    [],
  );

  const forcarRecarregamento = useCallback(() => {
    console.log("🔄 [CONTAS] Forçando recarregamento manual");
    setFiltros((prev) => ({
      ...prev,
      __timestamp: Date.now(),
    }));
  }, []);

  // Carregar contas quando os filtros mudarem (apenas no timestamp para evitar loops)
  useEffect(() => {
    // Durante hot reload, não carregar automaticamente
    if (
      typeof window !== "undefined" &&
      (window.location.href.includes("reload=") ||
        window.location.href.includes("?t="))
    ) {
      console.log(
        "[ContasContext] Hot reload detectado, pulando carregamento de contas por filtros",
      );
      return;
    }

    console.log(
      "🔍 [CONTAS] useEffect carregarContas disparado. Timestamp:",
      filtros.__timestamp,
    );
    carregarContas(filtros);
  }, [carregarContas, filtros]);

  // Carregar dados auxiliares na inicialização com proteção para hot reload
  useEffect(() => {
    // Durante hot reload, não carregar automaticamente
    if (
      typeof window !== "undefined" &&
      (window.location.href.includes("reload=") ||
        window.location.href.includes("?t="))
    ) {
      console.log(
        "[ContasContext] Hot reload detectado, pulando carregamento automático",
      );
      return;
    }

    const delay = Math.random() * 2000 + 5000; // Delay aleatório entre 5-7s
    const timeout = setTimeout(() => {
      console.log(
        "[ContasContext] Iniciando carregamento após delay de",
        delay,
        "ms",
      );
      carregarDadosAuxiliares();
    }, delay);

    return () => clearTimeout(timeout);
  }, [carregarDadosAuxiliares]);

  // Funções para acessar dados unificados
  const getCategorias = useCallback(
    (tipo?: string) => {
      return descricoes.filter(
        (item) =>
          item.tipoItem === "categoria" &&
          item.ativo &&
          (!tipo || item.tipo === tipo),
      );
    },
    [descricoes],
  );

  const getDescricoes = useCallback(
    (tipo?: string, categoria?: string) => {
      return descricoes.filter(
        (item) =>
          item.tipoItem === "descricao" &&
          item.ativo &&
          (!tipo || item.tipo === tipo) &&
          (!categoria || item.categoria === categoria),
      );
    },
    [descricoes],
  );

  const value: ContasContextType = {
    contas,
    filtros,
    setFiltros,
    atualizarFiltros,
    carregando,
    isLoading: carregando,
    erro,
    adicionarConta,
    atualizarConta,
    excluirConta,
    marcarComoPago,
    forcarRecarregamento,
    clientes,
    fornecedores,
    formasPagamento,
    categorias,
    descricoes,
    getCategorias,
    getDescricoes,
    adicionarFornecedor,
  };

  return (
    <ContasContext.Provider value={value}>{children}</ContasContext.Provider>
  );
}

export function useContas() {
  const context = useContext(ContasContext);
  if (context === undefined) {
    throw new Error("useContas deve ser usado dentro de um ContasProvider");
  }
  return context;
}
