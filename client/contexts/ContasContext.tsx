import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Conta } from "@shared/types";
import { useAuth } from "./AuthContext";
import { contasApi } from "../lib/apiService";

interface ContasContextType {
  contas: Conta[];
  filtros: {
    dataInicio: Date;
    dataFim: Date;
    tipo?: "pagar" | "receber" | "ambos";
    status?: string;
    fornecedorCliente?: string;
  };
  totais: {
    totalPagar: number;
    totalReceber: number;
    totalVencendoHoje: number;
    totalAtrasadas: number;
    totalPagas: number;
    totalContasRecebidas: number;
    totalContasPagas: number;
  };
  adicionarConta: (conta: Omit<Conta, "id" | "funcionarioId">) => Promise<void>;
  editarConta: (id: string, conta: Partial<Conta>) => void;
  excluirConta: (id: string) => void;
  marcarComoPaga: (id: string) => void;
  setFiltros: (filtros: any) => void;
  isLoading: boolean;
}

const ContasContext = createContext<ContasContextType | undefined>(undefined);

// Função para carregar contas reais do localStorage
function carregarContasReais(): Conta[] {
  try {
    const contas = localStorage.getItem("contas");
    if (contas) {
      const parsedContas = JSON.parse(contas);
      // Converter strings de data de volta para objetos Date
      return parsedContas.map((c: any) => ({
        ...c,
        dataVencimento: new Date(c.dataVencimento),
        dataPagamento: c.dataPagamento ? new Date(c.dataPagamento) : undefined,
      }));
    }
    return [];
  } catch (error) {
    console.warn("Erro ao carregar contas do localStorage:", error);
    return [];
  }
}

function getStatusConta(
  dataVencimento: Date,
  status: string,
): "paga" | "atrasada" | "vence_hoje" | "pendente" {
  if (status === "paga") return "paga";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);

  if (vencimento < hoje) return "atrasada";
  if (vencimento.getTime() === hoje.getTime()) return "vence_hoje";
  return "pendente";
}

export function ContasProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [contas, setContas] = useState<Conta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [carregandoTimeout, setCarregandoTimeout] = useState<NodeJS.Timeout | null>(null);
  const [filtros, setFiltros] = useState(() => {
    // Usar data atual do sistema
    const agora = new Date();
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    const fimHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999);

    return {
      dataInicio: inicioHoje,
      dataFim: fimHoje,
      tipo: "ambos" as "pagar" | "receber" | "ambos",
    };
  });

  // Função para carregar contas da API com debounce
  const carregarContasDebounced = React.useCallback(() => {
    // Cancelar timeout anterior se existir
    if (carregandoTimeout) {
      clearTimeout(carregandoTimeout);
    }

    // Criar novo timeout com debounce de 300ms
    const novoTimeout = setTimeout(async () => {
      try {
        console.log('🔄 [CONTAS CONTEXT] Iniciando carregamento de contas...');
        setIsLoading(true);

        // Preparar filtros para a API
        const filtrosApi = {
          dataInicio: filtros.dataInicio.toISOString().split('T')[0],
          dataFim: filtros.dataFim.toISOString().split('T')[0],
          tipo: filtros.tipo !== 'ambos' ? filtros.tipo : undefined,
          status: filtros.status !== 'todos' ? filtros.status : undefined,
        };

        console.log('🔄 [CONTAS CONTEXT] Filtros enviados para API:', filtrosApi);

        const response = await contasApi.listar(filtrosApi);
        if (response.error) {
          console.error("Erro ao carregar contas:", response.error);
          setContas([]);
          return;
        }

        // Verificar se response.data é um array
        const contasData = Array.isArray(response.data) ? response.data : [];

        console.log('🔄 [CONTAS CONTEXT] Contas recebidas da API:', contasData.length);

        // Converter dados da API para o formato do contexto
        const contasFormatadas = contasData.map((c: any) => ({
          id: c.id.toString(),
          tipo: c.tipo,
          descricao: c.descricao || "Sem descrição",
          valor: c.valor || 0,
          dataVencimento: new Date(c.dataVencimento),
          dataPagamento: c.dataPagamento ? new Date(c.dataPagamento) : undefined,
          // Mapear status do servidor para o cliente
          status: c.status === "pago" ? "paga" :
                  c.status === "atrasado" ? "atrasada" :
                  c.status || "pendente",
          observacoes: c.observacoes || "",
          categoria: c.categoria || "",
          dataCriacao: new Date(c.dataCriacao || new Date()),
          // Campos de compatibilidade
          fornecedorCliente: c.descricao || "Sem descrição", // Usar descrição como nome do fornecedor/cliente
          tipoPagamento: c.categoria || "",
          funcionarioId: user?.id || "1",
          clienteId: c.clienteId || undefined,
        }));

        setContas(contasFormatadas);
        console.log('🔄 [CONTAS CONTEXT] Contas carregadas com sucesso:', contasFormatadas.length);
      } catch (error) {
        console.error("Erro ao carregar contas:", error);
        // Em caso de erro, manter contas vazias
        setContas([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce de 300ms

    setCarregandoTimeout(novoTimeout);
  }, [filtros, carregandoTimeout, user?.id]);

  // Carregar contas na inicialização
  useEffect(() => {
    carregarContas();
  }, []);

  // Adicionar logs para setFiltros
  const setFiltrosComLog = (novosFiltros: any) => {
    console.log('🔄 [CONTAS CONTEXT] setFiltros chamado com:', novosFiltros);
    console.log('🔄 [CONTAS CONTEXT] Filtros anteriores:', filtros);
    setFiltros(novosFiltros);
    console.log('🔄 [CONTAS CONTEXT] setFiltros executado');
  };

  // Recarregar quando filtros importantes mudarem
  useEffect(() => {
    console.log('🔄 [CONTAS CONTEXT] useEffect de filtros disparado');
    console.log('🔄 [CONTAS CONTEXT] Filtros atuais:', filtros);
    if (filtros.dataInicio && filtros.dataFim) {
      console.log('🔄 [CONTAS CONTEXT] Carregando contas...');
      carregarContas();
    }
  }, [filtros.dataInicio, filtros.dataFim, filtros.tipo, filtros.status]);

  const adicionarConta = async (novaConta: Omit<Conta, "id" | "funcionarioId">) => {
    try {
      setIsLoading(true);

      // Preparar dados para a API
      const dadosApi = {
        tipo: novaConta.tipo,
        descricao: novaConta.descricao || `Conta ${novaConta.tipo === "receber" ? "a receber" : "a pagar"}`,
        valor: novaConta.valor,
        dataVencimento: novaConta.dataVencimento.toISOString().split("T")[0],
        status: "pendente",
        observacoes: novaConta.observacoes,
        categoria: novaConta.tipoPagamento || novaConta.categoria,
      };


      const response = await contasApi.criar(dadosApi);
      if (response.error) {
        throw new Error(response.error);
      }

      // Recarregar contas
      await carregarContas();
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const editarConta = (id: string, dadosAtualizados: Partial<Conta>) => {
    setContas((prev) => {
      const contasAtualizadas = prev.map((conta) =>
        conta.id === id
          ? {
              ...conta,
              ...dadosAtualizados,
              status: dadosAtualizados.dataVencimento
                ? getStatusConta(
                    dadosAtualizados.dataVencimento,
                    dadosAtualizados.status || conta.status,
                  )
                : conta.status,
            }
          : conta,
      );

      // Salvar no localStorage
      try {
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas));
      } catch (error) {
        console.warn("Erro ao salvar contas no localStorage:", error);
      }
      return contasAtualizadas;
    });
  };

  const excluirConta = (id: string) => {
    setContas((prev) => {
      const contasAtualizadas = prev.filter((conta) => conta.id !== id);

      // Salvar no localStorage
      try {
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas));
      } catch (error) {
        console.warn("Erro ao salvar contas no localStorage:", error);
      }
      return contasAtualizadas;
    });
  };

  const marcarComoPaga = (id: string) => {
    setContas((prev) => {
      const contasAtualizadas = prev.map((conta) =>
        conta.id === id
          ? {
              ...conta,
              status: "paga",
              dataPagamento: new Date(),
            }
          : conta,
      );

      // Salvar no localStorage
      try {
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas));
      } catch (error) {
        console.warn("Erro ao salvar contas no localStorage:", error);
      }
      return contasAtualizadas;
    });
  };

  // Atualizar status das contas automaticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setContas((prev) =>
        prev.map((conta) => ({
          ...conta,
          status:
            conta.status === "paga"
              ? "paga"
              : getStatusConta(conta.dataVencimento, conta.status),
        })),
      );
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, []);

  // Calcular totais baseados nas contas já filtradas pela API
  const totais = React.useMemo(() => {
    // Aplicar filtros adicionais apenas no frontend (fornecedor/cliente)
    const contasFiltradas = contas.filter((conta) => {
      const fornecedorCorreto =
        !filtros.fornecedorCliente ||
        filtros.fornecedorCliente === "todos" ||
        conta.fornecedorCliente
          .toLowerCase()
          .includes(filtros.fornecedorCliente.toLowerCase());

      return fornecedorCorreto;
    });

    const totalPagar = contasFiltradas
      .filter((c) => c.tipo === "pagar" && c.status !== "paga")
      .reduce((total, c) => total + c.valor, 0);

    const totalReceber = contasFiltradas
      .filter((c) => c.tipo === "receber" && c.status !== "paga")
      .reduce((total, c) => total + c.valor, 0);

    const totalVencendoHoje = contasFiltradas
      .filter((c) => c.status === "vence_hoje")
      .reduce((total, c) => total + c.valor, 0);

    const totalAtrasadas = contasFiltradas
      .filter((c) => c.status === "atrasada")
      .reduce((total, c) => total + c.valor, 0);

    const totalPagas = contasFiltradas
      .filter((c) => c.status === "paga")
      .reduce((total, c) => total + c.valor, 0);

    // Totais específicos para contas recebidas e pagas separadamente
    const totalContasRecebidas = contasFiltradas
      .filter((c) => c.tipo === "receber" && c.status === "paga")
      .reduce((total, c) => total + c.valor, 0);

    const totalContasPagas = contasFiltradas
      .filter((c) => c.tipo === "pagar" && c.status === "paga")
      .reduce((total, c) => total + c.valor, 0);

    return {
      totalPagar,
      totalReceber,
      totalVencendoHoje,
      totalAtrasadas,
      totalPagas,
      totalContasRecebidas,
      totalContasPagas,
    };
  }, [contas, filtros]);

  const value = {
    contas,
    filtros,
    totais,
    adicionarConta,
    editarConta,
    excluirConta,
    marcarComoPaga,
    setFiltros: setFiltrosComLog,
    isLoading,
  };

  return (
    <ContasContext.Provider value={value}>{children}</ContasContext.Provider>
  );
}

export function useContas() {
  const context = useContext(ContasContext);
  if (context === undefined) {
    throw new Error("useContas must be used within a ContasProvider");
  }
  return context;
}
