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

interface FiltrosPeriodo {
  dataInicio: Date;
  dataFim: Date;
  __timestamp?: number; // Para forçar re-render
}

interface DashboardContextType {
  filtros: FiltrosPeriodo;
  stats: DashboardStats;
  lancamentos: LancamentoCaixa[];
  contas: Conta[];
  contasVencendo: Conta[];
  setFiltros: (filtros: FiltrosPeriodo) => void;
  setFiltroRapido: (
    tipo: "ultimos7dias" | "estaemana" | "ultimos30dias" | "mesAtual",
  ) => void;
  aplicarFiltrosCaixa: boolean;
  setAplicarFiltrosCaixa: (aplicar: boolean) => void;
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

function getFimDoMes(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
}

function getUltimos7Dias(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 6);
}

function getInicioSemana(): Date {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diasAtras = diaSemana === 0 ? 6 : diaSemana - 1; // Segunda-feira como início
  return new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate() - diasAtras,
  );
}

function getUltimos30Dias(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 29);
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

  // CORRIGIDO: Estado inicial do Dashboard é "Este Mês" (dia 1 até hoje)
  const [filtros, setFiltros] = useState<FiltrosPeriodo>({
    dataInicio: getInicioDoMes(),
    dataFim: getHoje(),
  });

  console.log("DashboardContext: Estado inicial dos filtros:", {
    dataInicio: getHoje().toISOString().split("T")[0],
    dataFim: getHoje().toISOString().split("T")[0],
  });
  const [aplicarFiltrosCaixa, setAplicarFiltrosCaixa] = useState(false);
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

  const setFiltroRapido = useCallback(
    (tipo: "ultimos7dias" | "estaemana" | "ultimos30dias" | "mesAtual") => {
      let novoFiltro: FiltrosPeriodo;

      switch (tipo) {
        case "ultimos7dias":
          novoFiltro = { dataInicio: getUltimos7Dias(), dataFim: getHoje() };
          break;
        case "estaemana":
          novoFiltro = { dataInicio: getInicioSemana(), dataFim: getHoje() };
          break;
        case "ultimos30dias":
          novoFiltro = { dataInicio: getUltimos30Dias(), dataFim: getHoje() };
          break;
        case "mesAtual":
          // CORRIGIDO: "Este Mês" é do dia 1 até hoje (não até fim do mês)
          novoFiltro = { dataInicio: getInicioDoMes(), dataFim: getHoje() };
          break;
        default:
          return; // Não fazer nada se tipo inválido
      }

      setFiltros(novoFiltro);
    },
    [],
  );

  // Memoize filtered data to avoid recalculations
  const lancamentosFiltrados = useMemo(() => {
    if (!caixaContext?.lancamentos) return [];

    let filtro = filtros;
    if (aplicarFiltrosCaixa && caixaContext?.filtros) {
      filtro = {
        dataInicio: caixaContext.filtros.dataInicio || filtros.dataInicio,
        dataFim: caixaContext.filtros.dataFim || filtros.dataFim,
      };
    }

    return caixaContext.lancamentos.filter((lancamento) => {
      const dataLancamento = new Date(lancamento.data);
      const dataInicio = new Date(
        filtro.dataInicio.getFullYear(),
        filtro.dataInicio.getMonth(),
        filtro.dataInicio.getDate(),
      );
      const dataFim = new Date(
        filtro.dataFim.getFullYear(),
        filtro.dataFim.getMonth(),
        filtro.dataFim.getDate(),
      );
      const dataLancNorm = new Date(
        dataLancamento.getFullYear(),
        dataLancamento.getMonth(),
        dataLancamento.getDate(),
      );

      return dataLancNorm >= dataInicio && dataLancNorm <= dataFim;
    });
  }, [
    caixaContext?.lancamentos,
    filtros,
    aplicarFiltrosCaixa,
    caixaContext?.filtros?.dataInicio,
    caixaContext?.filtros?.dataFim,
  ]);

  const contasFiltradas = useMemo(() => {
    if (!contasContext?.contas) return [];

    return contasContext.contas.filter((conta) => {
      const dataReferencia = conta.dataPagamento || conta.dataVencimento;
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

      return dataRefNorm >= dataInicio && dataRefNorm <= dataFim;
    });
  }, [contasContext?.contas, filtros]);

  // Calcular estatísticas baseadas no período selecionado e dados dos contextos
  useEffect(() => {
    if (!caixaContext || !contasContext) {
      console.log("Dashboard: Aguardando contextos...", {
        caixa: !!caixaContext,
        contas: !!contasContext,
      });
      return;
    }

    console.log("Dashboard: Recalculando stats", {
      lancamentos: caixaContext.lancamentos?.length || 0,
      totaisCaixa: caixaContext.totais,
      filtros: filtros,
    });

    setIsLoading(true);

    // Use memoized filtered data instead of recalculating

    // LINHA 1 - Totais do Módulo Caixa (usar dados calculados pelo CaixaContext)
    const totalReceitasCaixa = caixaContext?.totais?.receitas || 0;
    const totalDespesasCaixa = caixaContext?.totais?.despesas || 0;
    const saldoCaixa = caixaContext?.totais?.saldo || 0;

    // Debug essencial apenas
    console.log(
      "Dashboard: Usando totais do CaixaContext. Receitas:",
      totalReceitasCaixa,
      "Despesas:",
      totalDespesasCaixa,
    );

    // LINHA 2 - Totais de Contas (usar dados calculados pelo ContasContext)
    const totalContasRecebidas =
      contasContext?.totais?.totalContasRecebidas || 0; // Contas recebidas (pagas)
    const totalContasPagas = contasContext?.totais?.totalContasPagas || 0; // Contas pagas (despesas)
    const saldoContasPagas = totalContasRecebidas - totalContasPagas;

    // LINHA 3 - Totais de Contas a Receber e a Pagar (não processadas, filtradas por data)
    const totalContasAReceber = (contasContext?.contas || [])
      .filter((c) => {
        if (c.tipo !== "receber" || c.status === "paga") return false;
        const dataVencimento = new Date(c.dataVencimento);
        // Normalizar datas para comparação (apenas ano, mês, dia)
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
        const dataVencNorm = new Date(
          dataVencimento.getFullYear(),
          dataVencimento.getMonth(),
          dataVencimento.getDate(),
        );
        return dataVencNorm >= dataInicio && dataVencNorm <= dataFim;
      })
      .reduce((total, c) => total + c.valor, 0);

    const totalContasAPagar = (contasContext?.contas || [])
      .filter((c) => {
        if (c.tipo !== "pagar" || c.status === "paga") return false;
        const dataVencimento = new Date(c.dataVencimento);
        // Normalizar datas para comparação (apenas ano, mês, dia)
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
        const dataVencNorm = new Date(
          dataVencimento.getFullYear(),
          dataVencimento.getMonth(),
          dataVencimento.getDate(),
        );
        return dataVencNorm >= dataInicio && dataVencNorm <= dataFim;
      })
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
    // Total receitas caixa + contas recebidas - total despesas caixa - contas pagas
    const saldoGeralConsolidado =
      totalReceitasCaixa +
      totalContasRecebidas -
      totalDespesasCaixa -
      totalContasPagas;

    // CÁLCULO TOTAL ALCANÇADO DA META
    // IMPORTANTE: Meta é SEMPRE do mês atual, independente dos filtros de data selecionados
    // Baseado apenas em receitas do caixa no mês atual
    const hoje = new Date();
    const inicioMesAtual = getInicioDoMes();
    const fimMesAtual = getFimDoMes();

    // Receitas do caixa do mês atual (independente dos filtros)
    // Meta do mês atual - baseada em receitas do caixa

    const receitasCaixaMesAtual = (caixaContext?.lancamentos || [])
      .filter((l) => {
        if (l.tipo !== "receita") return false;

        // Converter dataHora para Date
        let dataLancamento: Date;

        if (l.dataHora) {
          if (typeof l.dataHora === "string") {
            // Se for string, pode ser formato brasileiro DD-MM-AAAA HH:MM:SS ou ISO
            if (
              l.dataHora.includes("-") &&
              l.dataHora.split("-")[0].length === 2
            ) {
              // Formato brasileiro DD-MM-AAAA HH:MM:SS
              const [datePart] = l.dataHora.split(" ");
              const [dia, mes, ano] = datePart.split("-");
              dataLancamento = new Date(
                parseInt(ano),
                parseInt(mes) - 1,
                parseInt(dia),
              );
            } else {
              // Formato ISO ou outro
              dataLancamento = new Date(l.dataHora);
            }
          } else {
            // Se já for Date
            dataLancamento = new Date(l.dataHora);
          }
        } else if (l.data) {
          // Fallback para campo data se existir
          dataLancamento = new Date(l.data);
        } else {
          console.warn("[Dashboard] Lançamento sem data válida:", l);
          return false;
        }

        return isMesmoMes(dataLancamento, hoje);
      })
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
    lancamentosFiltrados,
    contasFiltradas,
    metaMes,
    caixaContext?.totais,
    contasContext?.totais,
  ]);

  // Sincronizar filtros com outros contextos quando não estiver aplicando filtros específicos do caixa
  useEffect(() => {
    if (!aplicarFiltrosCaixa && caixaContext && contasContext) {
      console.log("Dashboard: Sincronizando filtros com contextos", filtros);

      // Sincronizar filtros do Dashboard com outros contextos
      const novosFiltrosCaixa = {
        ...caixaContext?.filtros,
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      };

      const novosFiltrosContas = {
        ...contasContext?.filtros,
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      };

      caixaContext?.setFiltros?.(novosFiltrosCaixa);
      contasContext?.setFiltros?.(novosFiltrosContas);
    }
  }, [filtros.dataInicio, filtros.dataFim, aplicarFiltrosCaixa]);

  // Carregar dados iniciais na primeira renderização
  useEffect(() => {
    if (caixaContext && contasContext) {
      console.log("Dashboard: Carregamento inicial detectado");
      // Força um recálculo das estatísticas
      setFiltros((prev) => ({ ...prev, __timestamp: Date.now() }));
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
    filtros,
    stats,
    lancamentos: caixaContext?.lancamentos || [],
    contas: contasContext?.contas || [],
    contasVencendo,
    setFiltros,
    setFiltroRapido,
    aplicarFiltrosCaixa,
    setAplicarFiltrosCaixa,
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
