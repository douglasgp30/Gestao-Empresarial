import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { DashboardStats, LancamentoCaixa, Conta } from "@shared/types";
import { useCaixa } from "./CaixaContext";
import { useContas } from "./ContasContext";

interface FiltrosPeriodo {
  dataInicio: Date;
  dataFim: Date;
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
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

function getInicioDoMes(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

function getHoje(): Date {
  return new Date();
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
  const caixaContext = useCaixa();
  const contasContext = useContas();

  const [filtros, setFiltros] = useState<FiltrosPeriodo>({
    dataInicio: getInicioDoMes(),
    dataFim: getHoje(),
  });
  const [aplicarFiltrosCaixa, setAplicarFiltrosCaixa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldoFinal: 0,
    totalReceitasRecebidas: 0,
    totalDespesasPagas: 0,
    saldoGeralRecebidoPago: 0,
    totalContasRecebidasPagas: 0,
    totalContasPagasPagas: 0,
    saldoContas: 0,
    totalValorContasAtrasadas: 0,
    qtdContasPagarAtrasadas: 0,
    qtdContasReceberAtrasadas: 0,
    contasVencendoHoje: 0,
    contasAtrasadas: 0,
    totalContasPagar: 0,
    totalContasReceber: 0,
  });

  const setFiltroRapido = (
    tipo: "ultimos7dias" | "estaemana" | "ultimos30dias" | "mesAtual",
  ) => {
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
        novoFiltro = { dataInicio: getInicioDoMes(), dataFim: getHoje() };
        break;
      default:
        novoFiltro = filtros;
    }

    setFiltros(novoFiltro);
  };

  // Calcular estatísticas baseadas no período selecionado e dados dos contextos
  useEffect(() => {
    if (!caixaContext || !contasContext) return;

    setIsLoading(true);

    // Simular delay de API
    setTimeout(() => {
      // Filtrar lançamentos do caixa - usar filtros do dashboard ou do caixa
      let lancamentosFiltrados;

      if (aplicarFiltrosCaixa && caixaContext.filtros) {
        // Usar filtros específicos do Caixa para cálculos dinâmicos
        lancamentosFiltrados = caixaContext.lancamentos.filter((lancamento) => {
          const dataLancamento = new Date(lancamento.data);
          const dentroDataInicio =
            dataLancamento >= caixaContext.filtros.dataInicio;
          const dentroDataFim = dataLancamento <= caixaContext.filtros.dataFim;
          const tipoCorreto =
            !caixaContext.filtros.tipo ||
            caixaContext.filtros.tipo === "todos" ||
            lancamento.tipo === caixaContext.filtros.tipo;
          const formaPagamentoCorreta =
            !caixaContext.filtros.formaPagamento ||
            lancamento.formaPagamento === caixaContext.filtros.formaPagamento;
          const tecnicoCorreto =
            !caixaContext.filtros.tecnico ||
            lancamento.tecnicoResponsavel === caixaContext.filtros.tecnico;
          const campanhaCorreta =
            !caixaContext.filtros.campanha ||
            lancamento.campanha === caixaContext.filtros.campanha;
          const setorCorreto =
            !caixaContext.filtros.setor ||
            lancamento.setor === caixaContext.filtros.setor;

          return (
            dentroDataInicio &&
            dentroDataFim &&
            tipoCorreto &&
            formaPagamentoCorreta &&
            tecnicoCorreto &&
            campanhaCorreta &&
            setorCorreto
          );
        });
      } else {
        // Usar filtros do dashboard (período básico)
        lancamentosFiltrados = caixaContext.lancamentos.filter((lancamento) => {
          const dataLancamento = new Date(lancamento.data);
          return (
            dataLancamento >= filtros.dataInicio &&
            dataLancamento <= filtros.dataFim
          );
        });
      }

      // PRIMEIRA LINHA - Totais do Caixa (serviços realizados)
      const totalReceitas = lancamentosFiltrados
        .filter((l) => l.tipo === "receita")
        .reduce((total, l) => total + (l.valorLiquido || l.valor), 0);

      const totalDespesas = lancamentosFiltrados
        .filter((l) => l.tipo === "despesa")
        .reduce((total, l) => total + l.valor, 0);

      const saldoFinal = totalReceitas - totalDespesas;

      // SEGUNDA LINHA - Receitas recebidas e despesas pagas (incluindo contas)
      // Receitas do caixa + contas a receber já pagas
      const contasRecebidasPagas = contasContext.contas
        .filter((c) => c.tipo === "receber" && c.status === "paga")
        .reduce((total, c) => total + c.valor, 0);

      const totalReceitasRecebidas = totalReceitas + contasRecebidasPagas;

      // Despesas do caixa + contas a pagar já pagas
      const contasPagasPagas = contasContext.contas
        .filter((c) => c.tipo === "pagar" && c.status === "paga")
        .reduce((total, c) => total + c.valor, 0);

      const totalDespesasPagas = totalDespesas + contasPagasPagas;

      const saldoGeralRecebidoPago =
        totalReceitasRecebidas - totalDespesasPagas;

      // TERCEIRA LINHA - Totais específicos do módulo Contas
      const totalContasRecebidasPagas = contasRecebidasPagas;
      const totalContasPagasPagas = contasPagasPagas;
      const saldoContas = totalContasRecebidasPagas - totalContasPagasPagas;

      // Valor total de contas atrasadas
      const totalValorContasAtrasadas = contasContext.contas
        .filter((c) => c.status === "atrasada")
        .reduce((total, c) => total + c.valor, 0);

      // Quantidade de contas atrasadas por tipo
      const qtdContasPagarAtrasadas = contasContext.contas.filter(
        (c) => c.tipo === "pagar" && c.status === "atrasada",
      ).length;

      const qtdContasReceberAtrasadas = contasContext.contas.filter(
        (c) => c.tipo === "receber" && c.status === "atrasada",
      ).length;

      // Estatísticas gerais para compatibilidade
      const hoje = new Date();
      const contasVencendoHoje = contasContext.contas.filter((c) => {
        const dataVenc = new Date(c.dataVencimento);
        return dataVenc.toDateString() === hoje.toDateString();
      }).length;

      const contasAtrasadas = contasContext.contas.filter(
        (c) => c.status === "atrasada",
      ).length;

      const totalContasPagar = contasContext.contas
        .filter((c) => c.tipo === "pagar" && c.status !== "paga")
        .reduce((total, c) => total + c.valor, 0);

      const totalContasReceber = contasContext.contas
        .filter((c) => c.tipo === "receber" && c.status !== "paga")
        .reduce((total, c) => total + c.valor, 0);

      setStats({
        // Primeira linha
        totalReceitas,
        totalDespesas,
        saldoFinal,

        // Segunda linha
        totalReceitasRecebidas,
        totalDespesasPagas,
        saldoGeralRecebidoPago,

        // Terceira linha
        totalContasRecebidasPagas,
        totalContasPagasPagas,
        saldoContas,
        totalValorContasAtrasadas,
        qtdContasPagarAtrasadas,
        qtdContasReceberAtrasadas,

        // Compatibilidade
        contasVencendoHoje,
        contasAtrasadas,
        totalContasPagar,
        totalContasReceber,
      });

      setIsLoading(false);
    }, 300);
  }, [
    filtros,
    aplicarFiltrosCaixa,
    caixaContext?.lancamentos,
    caixaContext?.filtros,
    contasContext?.contas,
  ]);

  // Filtrar contas que precisam de atenção (vencendo hoje e atrasadas)
  const contasVencendo =
    contasContext?.contas
      ?.filter(
        (conta) => conta.status === "vence_hoje" || conta.status === "atrasada",
      )
      .sort(
        (a, b) =>
          new Date(a.dataVencimento).getTime() -
          new Date(b.dataVencimento).getTime(),
      ) || [];

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
