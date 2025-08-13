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
    dataVencimentoInicio?: Date;
    dataVencimentoFim?: Date;
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
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    dataFim: new Date(),
    tipo: "ambos" as "pagar" | "receber" | "ambos",
  });

  // Função para carregar contas da API
  const carregarContas = async () => {
    try {
      setIsLoading(true);
      const response = await contasApi.listar();
      if (response.error) {
        console.error("Erro ao carregar contas:", response.error);
        return;
      }

      // Verificar se response.data é um array
      const contasData = Array.isArray(response.data) ? response.data : [];

      // Converter dados da API para o formato do contexto
      const contasFormatadas = contasData.map((c: any) => ({
        id: c.id.toString(),
        tipo: c.tipo,
        descricao: c.descricao,
        valor: c.valor,
        dataVencimento: new Date(c.dataVencimento),
        dataPagamento: c.dataPagamento ? new Date(c.dataPagamento) : undefined,
        // Mapear status do servidor para o cliente
        status: c.status === "pago" ? "paga" : c.status,
        observacoes: c.observacoes,
        categoria: c.categoria,
        dataCriacao: new Date(c.dataCriacao),
        // Campos de compatibilidade
        fornecedorCliente: c.descricao, // Usar descrição como nome do fornecedor/cliente
        tipoPagamento: c.categoria,
        funcionarioId: user?.id || "1",
        clienteId: c.clienteId,
      }));

      setContas(contasFormatadas);
      console.log("[ContasContext] ✅ Contas carregadas no contexto:", contasFormatadas.length);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
      // Em caso de erro, manter contas vazias
      setContas([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar contas na inicialização
  useEffect(() => {
    carregarContas();
  }, []);

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


      console.log("[ContasContext] Enviando dados para API:", dadosApi);
      const response = await contasApi.criar(dadosApi);
      if (response.error) {
        throw new Error(response.error);
      }
      console.log("[ContasContext] Conta criada com sucesso:", response);

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

  // Calcular totais baseados nos filtros
  const totais = React.useMemo(() => {
    const contasFiltradas = contas.filter((conta) => {
      // Para contas pagas, usar dataPagamento. Para pendentes, usar dataVencimento
      const dataReferencia = conta.dataPagamento
        ? new Date(conta.dataPagamento)
        : new Date(conta.dataVencimento);
      // Normalizar datas para comparaç��o (apenas ano, mês, dia)
      const dataInicio = new Date(
        filtros.dataInicio.getFullYear(),
        filtros.dataInicio.getMonth(),
        filtros.dataInicio.getDate(),
      );
      const dataFim = new Date(
        filtros.dataFim.getFullYear(),
        filtros.dataFim.getMonth(),
        filtros.dataFim.getDate(),
      );
      const dataRefNorm = new Date(
        dataReferencia.getFullYear(),
        dataReferencia.getMonth(),
        dataReferencia.getDate(),
      );

      const dentroDataInicio = dataRefNorm >= dataInicio;
      const dentroDataFim = dataRefNorm <= dataFim;
      const tipoCorreto =
        filtros.tipo === "ambos" || conta.tipo === filtros.tipo;
      const statusCorreto =
        !filtros.status ||
        filtros.status === "todos" ||
        conta.status === filtros.status;
      const fornecedorCorreto =
        !filtros.fornecedorCliente ||
        filtros.fornecedorCliente === "todos" ||
        conta.fornecedorCliente
          .toLowerCase()
          .includes(filtros.fornecedorCliente.toLowerCase());

      return (
        dentroDataInicio &&
        dentroDataFim &&
        tipoCorreto &&
        statusCorreto &&
        fornecedorCorreto
      );
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
    setFiltros,
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
