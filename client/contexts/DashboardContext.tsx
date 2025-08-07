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
  return data1.getFullYear() === data2.getFullYear() && data1.getMonth() === data2.getMonth();
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
  const caixaContext = useCaixa();
  const contasContext = useContas();

  const [filtros, setFiltros] = useState<FiltrosPeriodo>({
    dataInicio: getHoje(),
    dataFim: getHoje(),
  });

  console.log('DashboardContext: Estado inicial dos filtros:', {
    dataInicio: getHoje().toISOString().split('T')[0],
    dataFim: getHoje().toISOString().split('T')[0]
  });
  const [aplicarFiltrosCaixa, setAplicarFiltrosCaixa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para Meta do Mês
  const [metaMes, setMetaMes] = useState<number>(() => {
    const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
    const storedMeta = localStorage.getItem(`metaMes_${mesAtual}`);
    return storedMeta ? parseFloat(storedMeta) : 10000; // Meta padrão de R$ 10.000
  });
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
        novoFiltro = { dataInicio: getInicioDoMes(), dataFim: getFimDoMes() };
        break;
      default:
        novoFiltro = filtros;
    }

    setFiltros(novoFiltro);
  };

  // Calcular estatísticas baseadas no período selecionado e dados dos contextos
  useEffect(() => {
    console.log('Dashboard useEffect - Filtros:', filtros.dataInicio.toISOString().split('T')[0], 'até', filtros.dataFim.toISOString().split('T')[0]);

    if (!caixaContext || !contasContext) {
      console.log('Contextos não disponíveis ainda');
      return;
    }

    if (!caixaContext.lancamentos || caixaContext.lancamentos.length === 0) {
      console.log('Nenhum lançamento disponível ainda');
      return;
    }

    console.log('Processando', caixaContext.lancamentos.length, 'lançamentos disponíveis');

    setIsLoading(true);

    // Processar imediatamente (removendo timeout para debug)
    // Filtrar lançamentos do caixa - usar filtros do dashboard ou do caixa
    let lancamentosFiltrados;

      console.log('aplicarFiltrosCaixa:', aplicarFiltrosCaixa);
      console.log('caixaContext.filtros:', caixaContext.filtros);

      if (aplicarFiltrosCaixa && caixaContext.filtros) {
        console.log('Usando filtros do CAIXA');
        // Usar filtros específicos do Caixa para cálculos dinâmicos
        lancamentosFiltrados = caixaContext.lancamentos.filter((lancamento) => {
          const dataLancamento = new Date(lancamento.data);
          // Normalizar datas para comparação (apenas ano, mês, dia)
          const dataInicio = new Date(caixaContext.filtros.dataInicio.getFullYear(), caixaContext.filtros.dataInicio.getMonth(), caixaContext.filtros.dataInicio.getDate());
          const dataFim = new Date(caixaContext.filtros.dataFim.getFullYear(), caixaContext.filtros.dataFim.getMonth(), caixaContext.filtros.dataFim.getDate());
          const dataLancNorm = new Date(dataLancamento.getFullYear(), dataLancamento.getMonth(), dataLancamento.getDate());

          const dentroDataInicio = dataLancNorm >= dataInicio;
          const dentroDataFim = dataLancNorm <= dataFim;
          const tipoCorreto =
            !caixaContext.filtros.tipo ||
            caixaContext.filtros.tipo === "todos" ||
            lancamento.tipo === caixaContext.filtros.tipo;
          const formaPagamentoCorreta =
            !caixaContext.filtros.formaPagamento ||
            caixaContext.filtros.formaPagamento === "todas" ||
            lancamento.formaPagamento === caixaContext.filtros.formaPagamento;
          const tecnicoCorreto =
            !caixaContext.filtros.tecnico ||
            caixaContext.filtros.tecnico === "todos" ||
            lancamento.tecnicoResponsavel === caixaContext.filtros.tecnico;
          const campanhaCorreta =
            !caixaContext.filtros.campanha ||
            caixaContext.filtros.campanha === "todas" ||
            lancamento.campanha === caixaContext.filtros.campanha;
          const setorCorreto =
            !caixaContext.filtros.setor ||
            caixaContext.filtros.setor === "todos" ||
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
        console.log('Usando filtros do DASHBOARD');
        // Usar filtros do dashboard (período básico)
        console.log('Aplicando filtros do dashboard...');

        lancamentosFiltrados = caixaContext.lancamentos.filter((lancamento) => {
          const dataLancamento = new Date(lancamento.data);
          // Normalizar datas para comparação (apenas ano, mês, dia)
          const dataInicio = new Date(filtros.dataInicio.getFullYear(), filtros.dataInicio.getMonth(), filtros.dataInicio.getDate());
          const dataFim = new Date(filtros.dataFim.getFullYear(), filtros.dataFim.getMonth(), filtros.dataFim.getDate());
          const dataLancNorm = new Date(dataLancamento.getFullYear(), dataLancamento.getMonth(), dataLancamento.getDate());

          const incluido = (dataLancNorm >= dataInicio && dataLancNorm <= dataFim);

          console.log(`Lançamento ${lancamento.id}:`, {
            data: dataLancamento.toISOString().split('T')[0],
            tipo: lancamento.tipo,
            valor: lancamento.valor,
            dataInicio: dataInicio.toISOString().split('T')[0],
            dataFim: dataFim.toISOString().split('T')[0],
            dataOriginal: lancamento.data,
            dataInicioOriginal: filtros.dataInicio,
            dataFimOriginal: filtros.dataFim,
            incluido
          });

          return incluido;
        });
      }

      // LINHA 1 - Totais do Módulo Caixa (dinâmicos com filtros)
      // Usar sempre valor líquido para receitas (valor real recebido pela empresa)
      const totalReceitasCaixa = lancamentosFiltrados
        .filter((l) => l.tipo === "receita")
        .reduce((total, l) => {
          // Para receitas, sempre usar valorLiquido se disponível
          // valorLiquido já considera descontos de cartão, nota fiscal, etc.
          return total + (l.valorLiquido || l.valor);
        }, 0);

      const totalDespesasCaixa = lancamentosFiltrados
        .filter((l) => l.tipo === "despesa")
        .reduce((total, l) => total + l.valor, 0);

      const saldoCaixa = totalReceitasCaixa - totalDespesasCaixa;

      console.log('=== RESULTADO DA FILTRAGEM ===');
      console.log('Lançamentos filtrados:', lancamentosFiltrados.length);
      console.log('Total receitas calculado:', totalReceitasCaixa);
      console.log('Total despesas calculado:', totalDespesasCaixa);
      console.log('Saldo calculado:', saldoCaixa);
      console.log('Lançamentos incluídos:', lancamentosFiltrados.map(l => ({
        id: l.id,
        data: l.data.toISOString().split('T')[0],
        tipo: l.tipo,
        valor: l.tipo === 'receita' ? (l.valorLiquido || l.valor) : l.valor
      })));
      console.log('================================');

      // LINHA 2 - Totais de Contas Recebidas e Pagas (filtradas por data)
      const totalContasRecebidas = contasContext.contas
        .filter((c) => {
          if (c.tipo !== "receber" || c.status !== "paga") return false;
          // Usar dataPagamento se disponível, senão dataVencimento
          const dataReferencia = c.dataPagamento ? new Date(c.dataPagamento) : new Date(c.dataVencimento);
          // Normalizar datas para comparação (apenas ano, mês, dia)
          const dataInicio = new Date(filtros.dataInicio.getFullYear(), filtros.dataInicio.getMonth(), filtros.dataInicio.getDate());
          const dataFim = new Date(filtros.dataFim.getFullYear(), filtros.dataFim.getMonth(), filtros.dataFim.getDate());
          const dataRefNorm = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth(), dataReferencia.getDate());
          return dataRefNorm >= dataInicio && dataRefNorm <= dataFim;
        })
        .reduce((total, c) => total + c.valor, 0);

      const totalContasPagas = contasContext.contas
        .filter((c) => {
          if (c.tipo !== "pagar" || c.status !== "paga") return false;
          // Usar dataPagamento se disponível, senão dataVencimento
          const dataReferencia = c.dataPagamento ? new Date(c.dataPagamento) : new Date(c.dataVencimento);
          // Normalizar datas para comparação (apenas ano, mês, dia)
          const dataInicio = new Date(filtros.dataInicio.getFullYear(), filtros.dataInicio.getMonth(), filtros.dataInicio.getDate());
          const dataFim = new Date(filtros.dataFim.getFullYear(), filtros.dataFim.getMonth(), filtros.dataFim.getDate());
          const dataRefNorm = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth(), dataReferencia.getDate());
          return dataRefNorm >= dataInicio && dataRefNorm <= dataFim;
        })
        .reduce((total, c) => total + c.valor, 0);

      const saldoContasPagas = totalContasRecebidas - totalContasPagas;

      // LINHA 3 - Totais de Contas a Receber e a Pagar (não processadas, filtradas por data)
      const totalContasAReceber = contasContext.contas
        .filter((c) => {
          if (c.tipo !== "receber" || c.status === "paga") return false;
          const dataVencimento = new Date(c.dataVencimento);
          // Normalizar datas para comparação (apenas ano, mês, dia)
          const dataInicio = new Date(filtros.dataInicio.getFullYear(), filtros.dataInicio.getMonth(), filtros.dataInicio.getDate());
          const dataFim = new Date(filtros.dataFim.getFullYear(), filtros.dataFim.getMonth(), filtros.dataFim.getDate());
          const dataVencNorm = new Date(dataVencimento.getFullYear(), dataVencimento.getMonth(), dataVencimento.getDate());
          return dataVencNorm >= dataInicio && dataVencNorm <= dataFim;
        })
        .reduce((total, c) => total + c.valor, 0);

      const totalContasAPagar = contasContext.contas
        .filter((c) => {
          if (c.tipo !== "pagar" || c.status === "paga") return false;
          const dataVencimento = new Date(c.dataVencimento);
          // Normalizar datas para comparação (apenas ano, mês, dia)
          const dataInicio = new Date(filtros.dataInicio.getFullYear(), filtros.dataInicio.getMonth(), filtros.dataInicio.getDate());
          const dataFim = new Date(filtros.dataFim.getFullYear(), filtros.dataFim.getMonth(), filtros.dataFim.getDate());
          const dataVencNorm = new Date(dataVencimento.getFullYear(), dataVencimento.getMonth(), dataVencimento.getDate());
          return dataVencNorm >= dataInicio && dataVencNorm <= dataFim;
        })
        .reduce((total, c) => total + c.valor, 0);

      const saldoGeralContas = totalContasAReceber - totalContasAPagar;

      console.log('Dashboard: ContasRecebidas=', totalContasRecebidas, 'ContasPagas=', totalContasPagas);

      // Totais gerais para compatibilidade
      const totalGeralAReceber = contasContext.contas
        .filter((c) => c.tipo === "receber")
        .reduce((total, c) => total + c.valor, 0);

      const totalGeralAPagar = contasContext.contas
        .filter((c) => c.tipo === "pagar")
        .reduce((total, c) => total + c.valor, 0);

      // Contas Atrasadas (em vermelho)
      const valorContasPagarAtrasadas = contasContext.contas
        .filter((c) => c.tipo === "pagar" && c.status === "atrasada")
        .reduce((total, c) => total + c.valor, 0);

      const qtdContasPagarAtrasadas = contasContext.contas.filter(
        (c) => c.tipo === "pagar" && c.status === "atrasada",
      ).length;

      const valorContasReceberAtrasadas = contasContext.contas
        .filter((c) => c.tipo === "receber" && c.status === "atrasada")
        .reduce((total, c) => total + c.valor, 0);

      const qtdContasReceberAtrasadas = contasContext.contas.filter(
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
      // Baseado apenas em receitas do mês atual + contas a receber criadas no mês atual
      const hoje = new Date();
      const inicioMesAtual = getInicioDoMes();
      const fimMesAtual = getFimDoMes();


      // 1. Receitas do caixa do mês atual (independente dos filtros)
      const receitasCaixaMesAtual = caixaContext.lancamentos
        .filter((l) => {
          if (l.tipo !== "receita") return false;
          const dataLancamento = new Date(l.data);
          // Normalizar datas para comparação do mês atual
          const dataLancNorm = new Date(dataLancamento.getFullYear(), dataLancamento.getMonth(), dataLancamento.getDate());
          const inicioMesNorm = new Date(inicioMesAtual.getFullYear(), inicioMesAtual.getMonth(), inicioMesAtual.getDate());
          const fimMesNorm = new Date(fimMesAtual.getFullYear(), fimMesAtual.getMonth(), fimMesAtual.getDate());
          return dataLancNorm >= inicioMesNorm && dataLancNorm <= fimMesNorm;
        })
        .reduce((total, l) => total + (l.valorLiquido || l.valor), 0);

      // 2. Contas a receber que foram CRIADAS no mês atual
      // Como não temos dataCadastro, vamos usar dataVencimento como proxy
      // Em uma implementação real, seria melhor ter um campo dataCriacao
      const contasAReceberCriadasMesAtual = contasContext.contas
        .filter((c) => {
          if (c.tipo !== "receber") return false;
          // Simular data de criação usando dataVencimento
          // Na prática, você deveria ter um campo dataCriacao ou dataCadastro
          const dataVencimento = new Date(c.dataVencimento);
          return isMesmoMes(dataVencimento, hoje);
        })
        .reduce((total, c) => total + c.valor, 0);

      // Total alcançado da meta = apenas receitas + contas a receber criadas no mês
      // NÃO inclui contas recebidas de meses anteriores
      const novoTotalMetaMes = receitasCaixaMesAtual + contasAReceberCriadasMesAtual;
      setTotalMetaMes(novoTotalMetaMes);

      // Restante para bater a meta
      const novoRestanteParaMeta = metaMes - novoTotalMetaMes;
      setRestanteParaMeta(novoRestanteParaMeta);

      console.log('Dashboard: Meta alcançada:', novoTotalMetaMes, 'de', metaMes);

      // Estatísticas gerais para compatibilidade
      const contasVencendoHoje = contasContext.contas.filter((c) => {
        const dataVenc = new Date(c.dataVencimento);
        return dataVenc.toDateString() === hoje.toDateString();
      }).length;

      const contasAtrasadas = contasContext.contas.filter(
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
        _lastUpdate: Date.now() // Força re-render
      };

      console.log('=== ATUALIZANDO STATS ===');
      console.log('Novos stats:', newStats);
      setStats(newStats);

    setIsLoading(false);
  }, [
    filtros,
    filtros.__timestamp, // Força re-render quando timestamp muda
    filtros.dataInicio?.getTime(), // Força re-render quando data início muda
    filtros.dataFim?.getTime(), // Força re-render quando data fim muda
    metaMes, // Recalcula restante da meta quando meta muda
    aplicarFiltrosCaixa,
    caixaContext?.lancamentos,
    caixaContext?.filtros,
    contasContext?.contas,
  ]);

  // Filtrar contas que precisam de atenção (vencendo hoje e atrasadas)
  const contasVencendo =
    contasContext?.contas
      ?.filter((conta) => {
        const hoje = new Date();
        const hojeNorm = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const dataVencimento = new Date(conta.dataVencimento);
        const dataVencNorm = new Date(dataVencimento.getFullYear(), dataVencimento.getMonth(), dataVencimento.getDate());

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
