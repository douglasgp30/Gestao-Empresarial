import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Conta } from "@shared/types";
import { useAuth } from "./AuthContext";

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
  };
  adicionarConta: (conta: Omit<Conta, "id" | "funcionarioId">) => void;
  editarConta: (id: string, conta: Partial<Conta>) => void;
  excluirConta: (id: string) => void;
  marcarComoPaga: (id: string) => void;
  setFiltros: (filtros: any) => void;
  isLoading: boolean;
}

const ContasContext = createContext<ContasContextType | undefined>(undefined);

// Mock data inicial
const mockContas: Conta[] = [
  {
    id: "1",
    tipo: "pagar",
    dataVencimento: new Date(2024, 11, 5),
    fornecedorCliente: "Posto de Gasolina ABC",
    tipoPagamento: "Boleto",
    valor: 350.0,
    status: "vence_hoje",
    observacoes: "Pagamento mensal combustível",
    funcionarioId: "1",
  },
  {
    id: "2",
    tipo: "receber",
    dataVencimento: new Date(2024, 11, 4),
    fornecedorCliente: "Empresa XYZ Ltda",
    tipoPagamento: "Boleto",
    valor: 1200.0,
    status: "atrasada",
    observacoes: "Serviço de desentupimento comercial",
    funcionarioId: "1",
  },
  {
    id: "3",
    tipo: "pagar",
    dataVencimento: new Date(2024, 11, 10),
    fornecedorCliente: "Fornecedor de Materiais Silva",
    tipoPagamento: "Pix",
    valor: 580.0,
    status: "pendente",
    observacoes: "Compra de ferramentas e materiais",
    funcionarioId: "1",
  },
  {
    id: "4",
    tipo: "receber",
    dataVencimento: new Date(2024, 11, 6),
    fornecedorCliente: "Condomínio Residencial Verde",
    tipoPagamento: "Transferência",
    valor: 750.0,
    status: "pendente",
    observacoes: "Manutenção preventiva sistema de esgoto",
    funcionarioId: "1",
  },
  {
    id: "5",
    tipo: "pagar",
    dataVencimento: new Date(2024, 10, 28),
    fornecedorCliente: "Oficina do João - Manutenção",
    tipoPagamento: "Dinheiro",
    valor: 420.0,
    status: "paga",
    observacoes: "Manutenção da van",
    dataPagamento: new Date(2024, 10, 27),
    funcionarioId: "1",
  },
  {
    id: "6",
    tipo: "receber",
    dataVencimento: new Date(2024, 11, 8),
    fornecedorCliente: "Restaurante Bom Sabor",
    tipoPagamento: "Cartão",
    valor: 320.0,
    status: "pendente",
    observacoes: "Desentupimento cozinha industrial",
    funcionarioId: "1",
  },
];

function getStatusConta(dataVencimento: Date, status: string): string {
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
  const [contas, setContas] = useState<Conta[]>(
    mockContas.map((conta) => ({
      ...conta,
      status: getStatusConta(conta.dataVencimento, conta.status),
    })),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(),
    dataFim: new Date(),
    tipo: "ambos" as "pagar" | "receber" | "ambos",
  });

  const adicionarConta = (novaConta: Omit<Conta, "id" | "funcionarioId">) => {
    const id = Date.now().toString();
    const conta: Conta = {
      ...novaConta,
      id,
      funcionarioId: user?.id || "1",
      status: getStatusConta(novaConta.dataVencimento, "pendente"),
    };

    setContas((prev) => [...prev, conta]);
  };

  const editarConta = (id: string, dadosAtualizados: Partial<Conta>) => {
    setContas((prev) =>
      prev.map((conta) =>
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
      ),
    );
  };

  const excluirConta = (id: string) => {
    setContas((prev) => prev.filter((conta) => conta.id !== id));
  };

  const marcarComoPaga = (id: string) => {
    setContas((prev) =>
      prev.map((conta) =>
        conta.id === id
          ? {
              ...conta,
              status: "paga",
              dataPagamento: new Date(),
            }
          : conta,
      ),
    );
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
      const dataVencimento = new Date(conta.dataVencimento);
      const dentroDataInicio = dataVencimento >= filtros.dataInicio;
      const dentroDataFim = dataVencimento <= filtros.dataFim;
      const tipoCorreto =
        filtros.tipo === "ambos" || conta.tipo === filtros.tipo;
      const statusCorreto = !filtros.status || conta.status === filtros.status;
      const fornecedorCorreto =
        !filtros.fornecedorCliente ||
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

    return {
      totalPagar,
      totalReceber,
      totalVencendoHoje,
      totalAtrasadas,
      totalPagas,
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
