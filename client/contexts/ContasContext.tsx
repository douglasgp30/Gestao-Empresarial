import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiService } from "@/lib/apiService";
import {
  ContaLancamento,
  Cliente,
  Fornecedor,
  FormaPagamento,
  Categoria,
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

  const carregarContas = useCallback(async (filtrosAtivos: FiltrosContas) => {
    try {
      setCarregando(true);
      setErro(null);

      const params = new URLSearchParams();
      params.append(
        "dataInicio",
        filtrosAtivos.dataInicio.toISOString().split("T")[0],
      );
      params.append("dataFim", filtrosAtivos.dataFim.toISOString().split("T")[0]);

      if (filtrosAtivos.tipo !== "ambos") {
        params.append("tipo", filtrosAtivos.tipo);
      }

      if (filtrosAtivos.pago !== "todos") {
        params.append("pago", filtrosAtivos.pago);
      }

      if (filtrosAtivos.categoria !== "todos") {
        params.append("categoria", filtrosAtivos.categoria);
      }

      console.log("🔍 [CONTAS] Carregando contas com filtros:", {
        dataInicio: filtrosAtivos.dataInicio.toISOString().split("T")[0],
        dataFim: filtrosAtivos.dataFim.toISOString().split("T")[0],
        tipo: filtrosAtivos.tipo,
        pago: filtrosAtivos.pago,
        categoria: filtrosAtivos.categoria,
      });

      const response = await apiService.get(`/contas?${params.toString()}`);

      console.log("🔍 [CONTAS] Resposta completa da API:", response);

      if (response.data && response.data.data) {
        const contasFormatadas = response.data.data.map((conta: any) => ({
          ...conta,
          dataLancamento: new Date(conta.dataLancamento),
          dataVencimento: new Date(conta.dataVencimento),
          dataPagamento: conta.dataPagamento
            ? new Date(conta.dataPagamento)
            : undefined,
        }));

        console.log("🔍 [CONTAS] Dados recebidos da API:", {
          total: response.data.data.length,
          contasFormatadas: contasFormatadas.length,
        });

        console.log(
          "🔍 [CONTAS] Contas formatadas:",
          contasFormatadas.slice(0, 3),
        );

        setContas(contasFormatadas);

        // Salvar no localStorage como backup
        localStorage.setItem("contas-backup", JSON.stringify(contasFormatadas));
        localStorage.setItem("contas-backup-timestamp", Date.now().toString());
      } else {
        console.warn("🔍 [CONTAS] API retornou dados vazios");
        setContas([]);
      }
    } catch (error) {
      console.error("❌ [CONTAS] Erro ao carregar contas:", error);
      setErro("Erro ao carregar contas");

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
    try {
      // Carregar clientes
      const clientesResponse = await apiService.get("/contas/clientes");
      if (clientesResponse.data && clientesResponse.data.data) {
        setClientes(clientesResponse.data.data);
      }

      // Carregar fornecedores
      const fornecedoresResponse = await apiService.get("/contas/fornecedores");
      if (fornecedoresResponse.data && fornecedoresResponse.data.data) {
        setFornecedores(fornecedoresResponse.data.data);
      }

      // Carregar formas de pagamento
      const formasResponse = await apiService.get("/formas-pagamento");
      if (formasResponse.data && formasResponse.data.data) {
        setFormasPagamento(formasResponse.data.data);
      }

      // Carregar categorias da tabela unificada
      const categoriasResponse = await apiService.get(
        "/descricoes-e-categorias/categorias",
      );
      if (categoriasResponse.data && categoriasResponse.data.data) {
        // Convert unified format to the expected format
        const categoriasFormatadas = categoriasResponse.data.data.map(
          (item: any) => ({
            id: item.id,
            nome: item.nome,
            tipo: item.tipo,
            dataCriacao: new Date(item.dataCriacao),
          }),
        );
        setCategorias(categoriasFormatadas);
      }
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
        console.log("🔍 [CONTAS] Adicionando nova conta:", novaConta);

        const response = await apiService.post("/contas", novaConta);

        if (response.data && response.data.data) {
          const contaFormatada = {
            ...response.data.data,
            dataLancamento: new Date(response.data.data.dataLancamento),
            dataVencimento: new Date(response.data.data.dataVencimento),
            dataPagamento: response.data.data.dataPagamento
              ? new Date(response.data.data.dataPagamento)
              : undefined,
          };

          console.log(
            "✅ [CONTAS] Conta adicionada com sucesso:",
            contaFormatada,
          );

          // Forçar recarregamento das contas
          await carregarContas();

          return contaFormatada;
        } else {
          throw new Error("Resposta inválida da API");
        }
      } catch (error) {
        console.error("❌ [CONTAS] Erro ao adicionar conta:", error);
        throw error;
      }
    },
    [carregarContas],
  );

  const atualizarConta = useCallback(
    async (id: number, contaAtualizada: Partial<ContaLancamento>) => {
      try {
        const response = await apiService.put(`/contas/${id}`, contaAtualizada);

        if (response.data && response.data.data) {
          const contaFormatada = {
            ...response.data.data,
            dataLancamento: new Date(response.data.data.dataLancamento),
            dataVencimento: new Date(response.data.data.dataVencimento),
            dataPagamento: response.data.data.dataPagamento
              ? new Date(response.data.data.dataPagamento)
              : undefined,
          };

          // Atualizar a lista local
          setContas((contas) =>
            contas.map((conta) =>
              conta.codLancamentoContas === id ? contaFormatada : conta,
            ),
          );

          return contaFormatada;
        } else {
          throw new Error("Resposta inválida da API");
        }
      } catch (error) {
        console.error("❌ [CONTAS] Erro ao atualizar conta:", error);
        throw error;
      }
    },
    [],
  );

  const excluirConta = useCallback(async (id: number) => {
    try {
      await apiService.delete(`/contas/${id}`);

      // Remover da lista local
      setContas((contas) =>
        contas.filter((conta) => conta.codLancamentoContas !== id),
      );
    } catch (error) {
      console.error("❌ [CONTAS] Erro ao excluir conta:", error);
      throw error;
    }
  }, []);

  const marcarComoPago = useCallback(
    async (id: number, formaPagamentoId: number) => {
      try {
        const response = await apiService.patch(`/contas/${id}/pagar`, {
          formaPg: formaPagamentoId,
        });

        if (response.data && response.data.data) {
          const contaFormatada = {
            ...response.data.data,
            dataLancamento: new Date(response.data.data.dataLancamento),
            dataVencimento: new Date(response.data.data.dataVencimento),
            dataPagamento: response.data.data.dataPagamento
              ? new Date(response.data.data.dataPagamento)
              : undefined,
          };

          // Atualizar a lista local
          setContas((contas) =>
            contas.map((conta) =>
              conta.codLancamentoContas === id ? contaFormatada : conta,
            ),
          );

          return contaFormatada;
        } else {
          throw new Error("Resposta inválida da API");
        }
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
        console.log("🔍 [CONTAS] Adicionando novo fornecedor:", novoFornecedor);

        const response = await apiService.post(
          "/contas/fornecedores",
          novoFornecedor,
        );

        if (response.data && response.data.data) {
          const fornecedorAdicionado = response.data.data;

          console.log(
            "✅ [CONTAS] Fornecedor adicionado com sucesso:",
            fornecedorAdicionado,
          );

          // Atualizar a lista de fornecedores
          setFornecedores((prev) => [...prev, fornecedorAdicionado]);

          return fornecedorAdicionado;
        } else {
          throw new Error("Resposta inválida da API");
        }
      } catch (error) {
        console.error("❌ [CONTAS] Erro ao adicionar fornecedor:", error);
        throw error;
      }
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
    console.log(
      "🔍 [CONTAS] useEffect carregarContas disparado. Timestamp:",
      filtros.__timestamp,
    );
    carregarContas(filtros);
  }, [carregarContas, filtros]);

  // Carregar dados auxiliares na inicialização
  useEffect(() => {
    carregarDadosAuxiliares();
  }, [carregarDadosAuxiliares]);

  const value: ContasContextType = {
    contas,
    filtros,
    setFiltros,
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
