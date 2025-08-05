import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LancamentoCaixa, Conta, RelatorioFiltros } from '@shared/types';

interface RelatoriosContextType {
  filtros: RelatorioFiltros;
  setFiltros: (filtros: RelatorioFiltros) => void;
  gerarRelatorioFinanceiro: () => RelatorioFinanceiro;
  gerarRelatorioContas: () => RelatorioContas;
  gerarRelatorioTecnicos: () => RelatorioTecnicos;
  exportarPDF: (tipo: string, dados: any) => void;
  exportarExcel: (tipo: string, dados: any) => void;
  isLoading: boolean;
}

interface RelatorioFinanceiro {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  resumo: {
    totalReceitas: number;
    totalDespesas: number;
    saldoFinal: number;
    totalComissoes: number;
  };
  receitasPorFormaPagamento: Array<{
    forma: string;
    valor: number;
    quantidade: number;
  }>;
  despesasPorCategoria: Array<{
    categoria: string;
    valor: number;
    quantidade: number;
  }>;
  movimentacoesPorDia: Array<{
    data: Date;
    receitas: number;
    despesas: number;
    saldo: number;
  }>;
}

interface RelatorioContas {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  resumo: {
    totalAPagar: number;
    totalAReceber: number;
    totalVencidas: number;
    totalPagas: number;
  };
  contasPorStatus: Array<{
    status: string;
    quantidade: number;
    valor: number;
  }>;
  vencimentosPorPeriodo: Array<{
    periodo: string;
    aPagar: number;
    aReceber: number;
  }>;
}

interface RelatorioTecnicos {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  resumo: {
    totalServicos: number;
    totalComissoes: number;
    ticketMedio: number;
  };
  performanceTecnicos: Array<{
    nome: string;
    totalServicos: number;
    valorTotal: number;
    comissaoTotal: number;
    ticketMedio: number;
  }>;
  servicosPorSetor: Array<{
    setor: string;
    quantidade: number;
    valor: number;
  }>;
}

const RelatoriosContext = createContext<RelatoriosContextType | undefined>(undefined);

// Mock data - em um app real viria de APIs/contexts existentes
const mockLancamentos: LancamentoCaixa[] = [
  {
    id: '1',
    data: new Date(2024, 11, 1),
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
    data: new Date(2024, 11, 2),
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
    data: new Date(2024, 11, 3),
    tipo: 'despesa',
    valor: 120.50,
    formaPagamento: 'Cartão',
    categoria: 'Combustível',
    descricao: 'Abastecimento van',
    funcionarioId: '1'
  }
];

const mockContas: Conta[] = [
  {
    id: '1',
    tipo: 'pagar',
    dataVencimento: new Date(2024, 11, 5),
    fornecedorCliente: 'Posto de Gasolina ABC',
    tipoPagamento: 'Boleto',
    valor: 350.00,
    status: 'vence_hoje',
    funcionarioId: '1'
  },
  {
    id: '2',
    tipo: 'receber',
    dataVencimento: new Date(2024, 11, 4),
    fornecedorCliente: 'Empresa XYZ Ltda',
    tipoPagamento: 'Boleto',
    valor: 1200.00,
    status: 'atrasada',
    funcionarioId: '1'
  }
];

export function RelatoriosProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [filtros, setFiltros] = useState<RelatorioFiltros>({
    periodo: {
      dataInicio: new Date(2024, 11, 1),
      dataFim: new Date()
    }
  });

  const gerarRelatorioFinanceiro = (): RelatorioFinanceiro => {
    const lancamentosFiltrados = mockLancamentos.filter(l => {
      const data = new Date(l.data);
      return data >= filtros.periodo.dataInicio && data <= filtros.periodo.dataFim;
    });

    const receitas = lancamentosFiltrados.filter(l => l.tipo === 'receita');
    const despesas = lancamentosFiltrados.filter(l => l.tipo === 'despesa');

    const totalReceitas = receitas.reduce((total, r) => total + (r.valorLiquido || r.valor), 0);
    const totalDespesas = despesas.reduce((total, d) => total + d.valor, 0);
    const totalComissoes = receitas.reduce((total, r) => total + (r.comissao || 0), 0);

    // Receitas por forma de pagamento
    const receitasPorFormaPagamento = receitas.reduce((acc, r) => {
      const forma = r.formaPagamento;
      const existing = acc.find(item => item.forma === forma);
      if (existing) {
        existing.valor += r.valorLiquido || r.valor;
        existing.quantidade += 1;
      } else {
        acc.push({
          forma,
          valor: r.valorLiquido || r.valor,
          quantidade: 1
        });
      }
      return acc;
    }, [] as Array<{ forma: string; valor: number; quantidade: number }>);

    // Despesas por categoria
    const despesasPorCategoria = despesas.reduce((acc, d) => {
      const categoria = d.categoria || 'Outros';
      const existing = acc.find(item => item.categoria === categoria);
      if (existing) {
        existing.valor += d.valor;
        existing.quantidade += 1;
      } else {
        acc.push({
          categoria,
          valor: d.valor,
          quantidade: 1
        });
      }
      return acc;
    }, [] as Array<{ categoria: string; valor: number; quantidade: number }>);

    return {
      periodo: {
        inicio: filtros.periodo.dataInicio,
        fim: filtros.periodo.dataFim
      },
      resumo: {
        totalReceitas,
        totalDespesas,
        saldoFinal: totalReceitas - totalDespesas,
        totalComissoes
      },
      receitasPorFormaPagamento,
      despesasPorCategoria,
      movimentacoesPorDia: [] // Implementar se necessário
    };
  };

  const gerarRelatorioContas = (): RelatorioContas => {
    const contasFiltradas = mockContas.filter(c => {
      const data = new Date(c.dataVencimento);
      return data >= filtros.periodo.dataInicio && data <= filtros.periodo.dataFim;
    });

    const totalAPagar = contasFiltradas.filter(c => c.tipo === 'pagar' && c.status !== 'paga').reduce((total, c) => total + c.valor, 0);
    const totalAReceber = contasFiltradas.filter(c => c.tipo === 'receber' && c.status !== 'paga').reduce((total, c) => total + c.valor, 0);
    const totalVencidas = contasFiltradas.filter(c => c.status === 'atrasada').reduce((total, c) => total + c.valor, 0);
    const totalPagas = contasFiltradas.filter(c => c.status === 'paga').reduce((total, c) => total + c.valor, 0);

    return {
      periodo: {
        inicio: filtros.periodo.dataInicio,
        fim: filtros.periodo.dataFim
      },
      resumo: {
        totalAPagar,
        totalAReceber,
        totalVencidas,
        totalPagas
      },
      contasPorStatus: [],
      vencimentosPorPeriodo: []
    };
  };

  const gerarRelatorioTecnicos = (): RelatorioTecnicos => {
    const receitas = mockLancamentos.filter(l => 
      l.tipo === 'receita' && 
      l.tecnicoResponsavel &&
      new Date(l.data) >= filtros.periodo.dataInicio && 
      new Date(l.data) <= filtros.periodo.dataFim
    );

    const performanceTecnicos = receitas.reduce((acc, r) => {
      const nome = r.tecnicoResponsavel!;
      const existing = acc.find(item => item.nome === nome);
      if (existing) {
        existing.totalServicos += 1;
        existing.valorTotal += r.valorLiquido || r.valor;
        existing.comissaoTotal += r.comissao || 0;
        existing.ticketMedio = existing.valorTotal / existing.totalServicos;
      } else {
        acc.push({
          nome,
          totalServicos: 1,
          valorTotal: r.valorLiquido || r.valor,
          comissaoTotal: r.comissao || 0,
          ticketMedio: r.valorLiquido || r.valor
        });
      }
      return acc;
    }, [] as Array<{ nome: string; totalServicos: number; valorTotal: number; comissaoTotal: number; ticketMedio: number }>);

    return {
      periodo: {
        inicio: filtros.periodo.dataInicio,
        fim: filtros.periodo.dataFim
      },
      resumo: {
        totalServicos: receitas.length,
        totalComissoes: receitas.reduce((total, r) => total + (r.comissao || 0), 0),
        ticketMedio: receitas.length > 0 ? receitas.reduce((total, r) => total + (r.valorLiquido || r.valor), 0) / receitas.length : 0
      },
      performanceTecnicos,
      servicosPorSetor: []
    };
  };

  const exportarPDF = (tipo: string, dados: any) => {
    // Simulação de exportação PDF
    console.log('Exportando PDF:', tipo, dados);
    const blob = new Blob(['Dados do relatório simulado'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${tipo}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportarExcel = (tipo: string, dados: any) => {
    // Simulação de exportação Excel
    console.log('Exportando Excel:', tipo, dados);
    const blob = new Blob(['Dados do relatório simulado'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${tipo}-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const value = {
    filtros,
    setFiltros,
    gerarRelatorioFinanceiro,
    gerarRelatorioContas,
    gerarRelatorioTecnicos,
    exportarPDF,
    exportarExcel,
    isLoading
  };

  return (
    <RelatoriosContext.Provider value={value}>
      {children}
    </RelatoriosContext.Provider>
  );
}

export function useRelatorios() {
  const context = useContext(RelatoriosContext);
  if (context === undefined) {
    throw new Error('useRelatorios must be used within a RelatoriosProvider');
  }
  return context;
}
