import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { DashboardStats, LancamentoCaixa, Conta } from "@shared/types";
import { useCaixa } from "./CaixaContext";
import { useContas } from "./ContasContext";

interface DashboardContextType {
  stats: DashboardStats;
  contas: Conta[];
  contasVencendo: Conta[];
  isLoading: boolean;
  // Funcionalidades de Meta do Mês
  metaMes: number;
  totalMetaMes: number;
  restanteParaMeta: number;
  setMetaMes: (valor: number) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

function getInicioDoMes(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

function getFimDoMes(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
}

function isMesmoMes(data1: Date, data2: Date): boolean {
  return (
    data1.getFullYear() === data2.getFullYear() &&
    data1.getMonth() === data2.getMonth()
  );
}

function getHoje(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  // Verificar se os contextos estão disponíveis antes de usar
  let caixaContext, contasContext;

  try {
    caixaContext = useCaixa();
  } catch (error) {
    console.warn("CaixaContext não disponível no DashboardProvider:", error);
    caixaContext = null;
  }

  try {
    contasContext = useContas();
  } catch (error) {
    console.warn("ContasContext não disponível no DashboardProvider:", error);
    contasContext = null;
  }

  const [isLoading, setIsLoading] = useState(false);

  // Estados para Meta do Mês
  const [metaMes, setMetaMesState] = useState<number>(() => {
    const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
    const storedMeta = localStorage.getItem(`metaMes_${mesAtual}`);
    return storedMeta ? parseFloat(storedMeta) : 10000; // Meta padrão de R$ 10.000
  });

  const setMetaMes = useCallback((valor: number) => {
    setMetaMesState(valor);
    const mesAtual = new Date().toISOString().slice(0, 7);
    localStorage.setItem(`metaMes_${mesAtual}`, valor.toString());
  }, []);

  const [totalMetaMes, setTotalMetaMes] = useState(0);
  const [restanteParaMeta, setRestanteParaMeta] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    saldoGeralConsolidado: 0,
    totalReceitasCaixa: 0,
    totalDespesasCaixa: 0,
    saldoCaixa: 0,
    totalContasRecebidas: 0,
    totalContasPagas: 0,
    saldoContasPagas: 0,
    totalContasAReceber: 0,
    totalContasAPagar: 0,
    totalGeralAReceber: 0,
    totalGeralAPagar: 0,
    saldoGeralContas: 0,
    valorContasPagarAtrasadas: 0,
    qtdContasPagarAtrasadas: 0,
    valorContasReceberAtrasadas: 0,
    qtdContasReceberAtrasadas: 0,
    contasVencendoHoje: 0,
    contasAtrasadas: 0,
  });

  // Calcular estatísticas baseadas sempre no mês atual
  useEffect(() => {
    if (!caixaContext || !contasContext) {
      console.log("Dashboard: Aguardando contextos...", {
        caixa: !!caixaContext,
        contas: !!contasContext,
      });
      return;
    }

    console.log("Dashboard: Recalculando stats do mês atual");

    setIsLoading(true);

    const hoje = new Date();
    const inicioMesAtual = getInicioDoMes();
    const fimMesAtual = getFimDoMes();

    // LINHA 1 - Totais do Módulo Caixa do mês atual
    const lancamentosMesAtual = (caixaContext?.lancamentos || []).filter(
      (lancamento) => {
        const dataLancamento = new Date(lancamento.data);
        return isMesmoMes(dataLancamento, hoje);
      },
    );

    const totalReceitasCaixa = lancamentosMesAtual
      .filter((l) => l.tipo === "receita")
      .reduce((total, l) => total + (l.valorLiquido || l.valor), 0);

    const totalDespesasCaixa = lancamentosMesAtual
      .filter((l) => l.tipo === "despesa")
      .reduce((total, l) => total + l.valor, 0);

    const saldoCaixa = totalReceitasCaixa - totalDespesasCaixa;

    // LINHA 2 - Totais de Contas Recebidas e Pagas do mês atual
    const contasMesAtual = (contasContext?.contas || []).filter((conta) => {
      const dataReferencia = conta.dataPagamento || conta.dataVencimento;
      return isMesmoMes(new Date(dataReferencia), hoje);
    });

    const totalContasRecebidas = contasMesAtual
      .filter((c) => c.tipo === "receber" && c.status === "paga")
      .reduce((total, c) => total + c.valor, 0);

    const totalContasPagas = contasMesAtual
      .filter((c) => c.tipo === "pagar" && c.status === "paga")
      .reduce((total, c) => total + c.valor, 0);

    const saldoContasPagas = totalContasRecebidas - totalContasPagas;

    // LINHA 3 - Totais de Contas a Receber e a Pagar do mês atual (não processadas)
    const totalContasAReceber = contasMesAtual
      .filter((c) => c.tipo === "receber" && c.status !== "paga")
      .reduce((total, c) => total + c.valor, 0);

    const totalContasAPagar = contasMesAtual
      .filter((c) => c.tipo === "pagar" && c.status !== "paga")
      .reduce((total, c) => total + c.valor, 0);

    const saldoGeralContas = totalContasAReceber - totalContasAPagar;

    // Totais gerais para compatibilidade
    const totalGeralAReceber = (contasContext?.contas || [])
      .filter((c) => c.tipo === "receber")
      .reduce((total, c) => total + c.valor, 0);

    const totalGeralAPagar = (contasContext?.contas || [])
      .filter((c) => c.tipo === "pagar")
      .reduce((total, c) => total + c.valor, 0);

    // Contas Atrasadas (em vermelho)
    const valorContasPagarAtrasadas = (contasContext?.contas || [])
      .filter((c) => c.tipo === "pagar" && c.status === "atrasada")
      .reduce((total, c) => total + c.valor, 0);

    const qtdContasPagarAtrasadas = (contasContext?.contas || []).filter(
      (c) => c.tipo === "pagar" && c.status === "atrasada",
    ).length;

    const valorContasReceberAtrasadas = (contasContext?.contas || [])
      .filter((c) => c.tipo === "receber" && c.status === "atrasada")
      .reduce((total, c) => total + c.valor, 0);

    const qtdContasReceberAtrasadas = (contasContext?.contas || []).filter(
      (c) => c.tipo === "receber" && c.status === "atrasada",
    ).length;

    // SALDO GERAL CONSOLIDADO
    const saldoGeralConsolidado =
      totalReceitasCaixa +
      totalContasRecebidas -
      totalDespesasCaixa -
      totalContasPagas;

    // CÁLCULO TOTAL ALCANÇADO DA META
    // Meta é sempre do mês atual, baseado em receitas do caixa
    const receitasCaixaMesAtual = lancamentosMesAtual
      .filter((l) => l.tipo === "receita")
      .reduce((total, l) => total + (l.valorLiquido || l.valor), 0);

    console.log(
      "[Dashboard] Meta mês atual: R$",
      receitasCaixaMesAtual.toFixed(2),
    );

    // Total alcançado da meta = apenas receitas do mês atual
    const novoTotalMetaMes = receitasCaixaMesAtual;
    setTotalMetaMes(novoTotalMetaMes);

    // Restante para bater a meta (Meta Restante = Meta do Mês - Total Alcançado)
    const novoRestanteParaMeta = Math.max(0, metaMes - novoTotalMetaMes);
    setRestanteParaMeta(novoRestanteParaMeta);

    // Estatísticas gerais para compatibilidade
    const contasVencendoHoje = (contasContext?.contas || []).filter((c) => {
      const dataVenc = new Date(c.dataVencimento);
      return dataVenc.toDateString() === hoje.toDateString();
    }).length;

    const contasAtrasadas = (contasContext?.contas || []).filter(
      (c) => c.status === "atrasada",
    ).length;

    // Criar novo objeto stats sempre para forçar re-render
    const newStats = {
      saldoGeralConsolidado,
      totalReceitasCaixa,
      totalDespesasCaixa,
      saldoCaixa,
      totalContasRecebidas,
      totalContasPagas,
      saldoContasPagas,
      totalContasAReceber,
      totalContasAPagar,
      totalGeralAReceber,
      totalGeralAPagar,
      saldoGeralContas,
      valorContasPagarAtrasadas,
      qtdContasPagarAtrasadas,
      valorContasReceberAtrasadas,
      qtdContasReceberAtrasadas,
      contasVencendoHoje,
      contasAtrasadas,
      _lastUpdate: Date.now(), // Força re-render
    };

    setStats(newStats);
    setIsLoading(false);
  }, [
    caixaContext?.lancamentos,
    contasContext?.contas,
    metaMes,
    caixaContext?.totais,
    contasContext?.totais,
  ]);

  // Carregar dados iniciais na primeira renderização
  useEffect(() => {
    if (caixaContext && contasContext) {
      console.log("Dashboard: Carregamento inicial detectado");
    }
  }, [!!caixaContext, !!contasContext]);

  // Filtrar contas que precisam de atenção (vencendo hoje e atrasadas)
  const contasVencendo =
    contasContext?.contas
      ?.filter((conta) => {
        const hoje = new Date();
        const hojeNorm = new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          hoje.getDate(),
        );
        const dataVencimento = new Date(conta.dataVencimento);
        const dataVencNorm = new Date(
          dataVencimento.getFullYear(),
          dataVencimento.getMonth(),
          dataVencimento.getDate(),
        );

        // Contas que vencem hoje ou estão atrasadas
        return dataVencNorm <= hojeNorm && conta.status !== "paga";
      })
      .sort(
        (a, b) =>
          new Date(a.dataVencimento).getTime() -
          new Date(b.dataVencimento).getTime(),
      ) || [];

  // Função para atualizar meta do mês com persistência
  const handleSetMetaMes = (valor: number) => {
    setMetaMes(valor);
    const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
    localStorage.setItem(`metaMes_${mesAtual}`, valor.toString());
  };

  const value = {
    stats,
    contas: contasContext?.contas || [],
    contasVencendo,
    isLoading,
    // Meta do Mês
    metaMes,
    totalMetaMes,
    restanteParaMeta,
    setMetaMes: handleSetMetaMes,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
