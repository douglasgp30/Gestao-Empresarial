import React, { createContext, useContext, useState, ReactNode } from "react";
import { LancamentoCaixa, Conta, RelatorioFiltros } from "@shared/types";

interface RelatoriosContextType {
  filtros: RelatorioFiltros;
  setFiltros: (filtros: RelatorioFiltros) => void;
  gerarRelatorioFinanceiro: () => RelatorioFinanceiro;
  gerarRelatorioContas: () => RelatorioContas;
  gerarRelatorioTecnicos: () => RelatorioTecnicos;
  // Relatórios pré-calculados que reagem a mudanças nos filtros
  relatorioFinanceiro: RelatorioFinanceiro | null;
  relatorioContas: RelatorioContas | null;
  relatorioTecnicos: RelatorioTecnicos | null;
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

const RelatoriosContext = createContext<RelatoriosContextType | undefined>(
  undefined,
);

// Dados devem vir dos contextos existentes - sem dados fictícios

export function RelatoriosProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [filtros, setFiltros] = useState<RelatorioFiltros>(() => {
    // Forçar data atual real (14/08/2025)
    const inicioHoje = new Date(2025, 7, 14, 0, 0, 0, 0);
    const fimHoje = new Date(2025, 7, 14, 23, 59, 59, 999);

    return {
      periodo: {
        dataInicio: inicioHoje,
        dataFim: fimHoje,
      },
    };
  });

  // Estados para armazenar os relatórios calculados
  const [relatorioFinanceiro, setRelatorioFinanceiro] =
    useState<RelatorioFinanceiro | null>(null);
  const [relatorioContas, setRelatorioContas] =
    useState<RelatorioContas | null>(null);
  const [relatorioTecnicos, setRelatorioTecnicos] =
    useState<RelatorioTecnicos | null>(null);

  // Recalcular relatórios quando filtros mudam
  React.useEffect(() => {
    console.log("RelatoriosContext: Recalculando relatórios para filtros:", {
      dataInicio: filtros.periodo.dataInicio.toISOString().split("T")[0],
      dataFim: filtros.periodo.dataFim.toISOString().split("T")[0],
      timestamp: filtros.periodo.__timestamp,
    });

    const novoRelatorioFinanceiro = gerarRelatorioFinanceiro();
    const novoRelatorioContas = gerarRelatorioContas();
    const novoRelatorioTecnicos = gerarRelatorioTecnicos();

    console.log("Relatório financeiro calculado:", {
      totalReceitas: novoRelatorioFinanceiro.resumo.totalReceitas,
      totalDespesas: novoRelatorioFinanceiro.resumo.totalDespesas,
      saldoFinal: novoRelatorioFinanceiro.resumo.saldoFinal,
    });

    setRelatorioFinanceiro(novoRelatorioFinanceiro);
    setRelatorioContas(novoRelatorioContas);
    setRelatorioTecnicos(novoRelatorioTecnicos);
  }, [filtros]);

  const gerarRelatorioFinanceiro = (): RelatorioFinanceiro => {
    // Usar dados do CaixaContext quando disponível - por enquanto vazio sem dados fictícios
    const lancamentosFiltrados: LancamentoCaixa[] = [];

    const receitas = lancamentosFiltrados.filter((l) => l.tipo === "receita");
    const despesas = lancamentosFiltrados.filter((l) => l.tipo === "despesa");

    const totalReceitas = receitas.reduce(
      (total, r) => total + (r.valorLiquido || r.valor),
      0,
    );
    const totalDespesas = despesas.reduce((total, d) => total + d.valor, 0);
    const totalComissoes = receitas.reduce(
      (total, r) => total + (r.comissao || 0),
      0,
    );

    // Receitas por forma de pagamento
    const receitasPorFormaPagamento = receitas.reduce(
      (acc, r) => {
        const forma = r.formaPagamento;
        const existing = acc.find((item) => item.forma === forma);
        if (existing) {
          existing.valor += r.valorLiquido || r.valor;
          existing.quantidade += 1;
        } else {
          acc.push({
            forma,
            valor: r.valorLiquido || r.valor,
            quantidade: 1,
          });
        }
        return acc;
      },
      [] as Array<{ forma: string; valor: number; quantidade: number }>,
    );

    // Despesas por categoria
    const despesasPorCategoria = despesas.reduce(
      (acc, d) => {
        const categoria = d.categoria || "Outros";
        const existing = acc.find((item) => item.categoria === categoria);
        if (existing) {
          existing.valor += d.valor;
          existing.quantidade += 1;
        } else {
          acc.push({
            categoria,
            valor: d.valor,
            quantidade: 1,
          });
        }
        return acc;
      },
      [] as Array<{ categoria: string; valor: number; quantidade: number }>,
    );

    return {
      periodo: {
        inicio: filtros.periodo.dataInicio,
        fim: filtros.periodo.dataFim,
      },
      resumo: {
        totalReceitas,
        totalDespesas,
        saldoFinal: totalReceitas - totalDespesas,
        totalComissoes,
      },
      receitasPorFormaPagamento,
      despesasPorCategoria,
      movimentacoesPorDia: [], // Implementar se necessário
    };
  };

  const gerarRelatorioContas = (): RelatorioContas => {
    // Usar dados do ContasContext quando disponível - por enquanto vazio sem dados fictícios
    const contasFiltradas: Conta[] = [];

    const totalAPagar = contasFiltradas
      .filter((c) => c.tipo === "pagar" && c.status !== "paga")
      .reduce((total, c) => total + c.valor, 0);
    const totalAReceber = contasFiltradas
      .filter((c) => c.tipo === "receber" && c.status !== "paga")
      .reduce((total, c) => total + c.valor, 0);
    const totalVencidas = contasFiltradas
      .filter((c) => c.status === "atrasada")
      .reduce((total, c) => total + c.valor, 0);
    const totalPagas = contasFiltradas
      .filter((c) => c.status === "paga")
      .reduce((total, c) => total + c.valor, 0);

    return {
      periodo: {
        inicio: filtros.periodo.dataInicio,
        fim: filtros.periodo.dataFim,
      },
      resumo: {
        totalAPagar,
        totalAReceber,
        totalVencidas,
        totalPagas,
      },
      contasPorStatus: [],
      vencimentosPorPeriodo: [],
    };
  };

  const gerarRelatorioTecnicos = (): RelatorioTecnicos => {
    // Usar dados do CaixaContext quando disponível - por enquanto vazio sem dados fictícios
    const receitas: LancamentoCaixa[] = [];

    const performanceTecnicos = receitas.reduce(
      (acc, r) => {
        const nome = r.tecnicoResponsavel!;
        const existing = acc.find((item) => item.nome === nome);
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
            ticketMedio: r.valorLiquido || r.valor,
          });
        }
        return acc;
      },
      [] as Array<{
        nome: string;
        totalServicos: number;
        valorTotal: number;
        comissaoTotal: number;
        ticketMedio: number;
      }>,
    );

    return {
      periodo: {
        inicio: filtros.periodo.dataInicio,
        fim: filtros.periodo.dataFim,
      },
      resumo: {
        totalServicos: receitas.length,
        totalComissoes: receitas.reduce(
          (total, r) => total + (r.comissao || 0),
          0,
        ),
        ticketMedio:
          receitas.length > 0
            ? receitas.reduce(
                (total, r) => total + (r.valorLiquido || r.valor),
                0,
              ) / receitas.length
            : 0,
      },
      performanceTecnicos,
      servicosPorSetor: [],
    };
  };

  const exportarPDF = (tipo: string, dados: any) => {
    // Simulação de exportação PDF
    console.log("Exportando PDF:", tipo, dados);
    const blob = new Blob(["Dados do relatório simulado"], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${tipo}-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportarExcel = (tipo: string, dados: any) => {
    // Simulação de exportação Excel
    console.log("Exportando Excel:", tipo, dados);
    const blob = new Blob(["Dados do relatório simulado"], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${tipo}-${new Date().toISOString().split("T")[0]}.xlsx`;
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
    // Relatórios pré-calculados reativos
    relatorioFinanceiro,
    relatorioContas,
    relatorioTecnicos,
    exportarPDF,
    exportarExcel,
    isLoading,
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
    throw new Error("useRelatorios must be used within a RelatoriosProvider");
  }
  return context;
}
