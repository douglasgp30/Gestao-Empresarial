import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DashboardStats, LancamentoCaixa, Conta } from '@shared/types';
import { useCaixa } from './CaixaContext';
import { useContas } from './ContasContext';

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
  setFiltroRapido: (tipo: 'ultimos7dias' | 'estaemana' | 'ultimos30dias' | 'mesAtual') => void;
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Mock data - em um app real viria de uma API
const mockLancamentos: LancamentoCaixa[] = [
  {
    id: '1',
    data: new Date(2024, 11, 1), // Dezembro 1
    tipo: 'receita',
    valor: 450.00,
    valorLiquido: 450.00,
    formaPagamento: 'Pix',
    tecnicoResponsavel: 'João Silva',
    comissao: 67.50,
    notaFiscal: false,
    setor: 'Residencial',
    campanha: 'Desconto Dezembro',
    funcionarioId: '2'
  },
  {
    id: '2',
    data: new Date(2024, 11, 2), // Dezembro 2
    tipo: 'receita',
    valor: 280.00,
    valorLiquido: 280.00,
    formaPagamento: 'Dinheiro',
    tecnicoResponsavel: 'Carlos Santos',
    comissao: 42.00,
    notaFiscal: false,
    setor: 'Comercial',
    funcionarioId: '3'
  },
  {
    id: '3',
    data: new Date(2024, 11, 3), // Dezembro 3
    tipo: 'despesa',
    valor: 120.50,
    formaPagamento: 'Cartão',
    categoria: 'Combustível',
    descricao: 'Abastecimento van',
    funcionarioId: '1'
  },
  {
    id: '4',
    data: new Date(2024, 11, 4), // Dezembro 4
    tipo: 'receita',
    valor: 380.00,
    valorLiquido: 357.20,
    formaPagamento: 'Cartão',
    tecnicoResponsavel: 'João Silva',
    comissao: 57.00,
    notaFiscal: true,
    descontoImposto: 22.80,
    setor: 'Residencial',
    funcionarioId: '2'
  },
  {
    id: '5',
    data: new Date(2024, 11, 5), // Dezembro 5 (hoje)
    tipo: 'despesa',
    valor: 85.00,
    formaPagamento: 'Pix',
    categoria: 'Material',
    descricao: 'Ferramentas de desentupimento',
    funcionarioId: '1'
  }
];

const mockContas: Conta[] = [
  {
    id: '1',
    tipo: 'pagar',
    dataVencimento: new Date(2024, 11, 5), // Hoje
    fornecedorCliente: 'Posto de Gasolina ABC',
    tipoPagamento: 'Boleto',
    valor: 350.00,
    status: 'vence_hoje',
    funcionarioId: '1'
  },
  {
    id: '2',
    tipo: 'receber',
    dataVencimento: new Date(2024, 11, 4), // Ontem (atrasada)
    fornecedorCliente: 'Empresa XYZ Ltda',
    tipoPagamento: 'Boleto',
    valor: 1200.00,
    status: 'atrasada',
    funcionarioId: '1'
  },
  {
    id: '3',
    tipo: 'pagar',
    dataVencimento: new Date(2024, 11, 10),
    fornecedorCliente: 'Fornecedor de Materiais',
    tipoPagamento: 'Pix',
    valor: 580.00,
    status: 'pendente',
    funcionarioId: '1'
  }
];

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
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - diasAtras);
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
    dataFim: getHoje()
  });
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
    totalContasReceber: 0
  });

  const setFiltroRapido = (tipo: 'ultimos7dias' | 'estaemana' | 'ultimos30dias' | 'mesAtual') => {
    let novoFiltro: FiltrosPeriodo;
    
    switch (tipo) {
      case 'ultimos7dias':
        novoFiltro = { dataInicio: getUltimos7Dias(), dataFim: getHoje() };
        break;
      case 'estaemana':
        novoFiltro = { dataInicio: getInicioSemana(), dataFim: getHoje() };
        break;
      case 'ultimos30dias':
        novoFiltro = { dataInicio: getUltimos30Dias(), dataFim: getHoje() };
        break;
      case 'mesAtual':
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
      // Filtrar lançamentos do caixa pelo período
      const lancamentosFiltrados = caixaContext.lancamentos.filter(lancamento => {
        const dataLancamento = new Date(lancamento.data);
        return dataLancamento >= filtros.dataInicio && dataLancamento <= filtros.dataFim;
      });

      // PRIMEIRA LINHA - Totais do Caixa (serviços realizados)
      const totalReceitas = lancamentosFiltrados
        .filter(l => l.tipo === 'receita')
        .reduce((total, l) => total + (l.valorLiquido || l.valor), 0);

      const totalDespesas = lancamentosFiltrados
        .filter(l => l.tipo === 'despesa')
        .reduce((total, l) => total + l.valor, 0);

      const saldoFinal = totalReceitas - totalDespesas;

      // SEGUNDA LINHA - Receitas recebidas e despesas pagas (incluindo contas)
      // Receitas do caixa + contas a receber já pagas
      const contasRecebidasPagas = contasContext.contas
        .filter(c => c.tipo === 'receber' && c.status === 'paga')
        .reduce((total, c) => total + c.valor, 0);

      const totalReceitasRecebidas = totalReceitas + contasRecebidasPagas;

      // Despesas do caixa + contas a pagar já pagas
      const contasPagasPagas = contasContext.contas
        .filter(c => c.tipo === 'pagar' && c.status === 'paga')
        .reduce((total, c) => total + c.valor, 0);

      const totalDespesasPagas = totalDespesas + contasPagasPagas;

      const saldoGeralRecebidoPago = totalReceitasRecebidas - totalDespesasPagas;

      // TERCEIRA LINHA - Totais específicos do módulo Contas
      const totalContasRecebidasPagas = contasRecebidasPagas;
      const totalContasPagasPagas = contasPagasPagas;
      const saldoContas = totalContasRecebidasPagas - totalContasPagasPagas;

      // Valor total de contas atrasadas
      const totalValorContasAtrasadas = contasContext.contas
        .filter(c => c.status === 'atrasada')
        .reduce((total, c) => total + c.valor, 0);

      // Quantidade de contas atrasadas por tipo
      const qtdContasPagarAtrasadas = contasContext.contas
        .filter(c => c.tipo === 'pagar' && c.status === 'atrasada').length;

      const qtdContasReceberAtrasadas = contasContext.contas
        .filter(c => c.tipo === 'receber' && c.status === 'atrasada').length;

      // Estatísticas gerais para compatibilidade
      const hoje = new Date();
      const contasVencendoHoje = contasContext.contas.filter(c => {
        const dataVenc = new Date(c.dataVencimento);
        return dataVenc.toDateString() === hoje.toDateString();
      }).length;

      const contasAtrasadas = contasContext.contas.filter(c => c.status === 'atrasada').length;

      const totalContasPagar = contasContext.contas
        .filter(c => c.tipo === 'pagar' && c.status !== 'paga')
        .reduce((total, c) => total + c.valor, 0);

      const totalContasReceber = contasContext.contas
        .filter(c => c.tipo === 'receber' && c.status !== 'paga')
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
        totalContasReceber
      });

      setIsLoading(false);
    }, 300);
  }, [filtros, caixaContext?.lancamentos, contasContext?.contas]);

  // Filtrar contas que precisam de atenção (vencendo hoje e atrasadas)
  const contasVencendo = contasContext?.contas?.filter(conta =>
    conta.status === 'vence_hoje' || conta.status === 'atrasada'
  ).sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()) || [];

  const value = {
    filtros,
    stats,
    lancamentos: caixaContext?.lancamentos || [],
    contas: contasContext?.contas || [],
    contasVencendo,
    setFiltros,
    setFiltroRapido,
    isLoading
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
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
