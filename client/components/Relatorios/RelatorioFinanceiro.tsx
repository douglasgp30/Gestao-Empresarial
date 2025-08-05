import React from 'react';
import { useRelatorios } from '../../contexts/RelatoriosContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Percent
} from 'lucide-react';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

export default function RelatorioFinanceiro() {
  const { gerarRelatorioFinanceiro, exportarPDF, exportarExcel } = useRelatorios();
  
  const relatorio = gerarRelatorioFinanceiro();

  const handleExportarPDF = () => {
    exportarPDF('financeiro', relatorio);
  };

  const handleExportarExcel = () => {
    exportarExcel('financeiro', relatorio);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Relatório Financeiro
          </h2>
          <p className="text-muted-foreground">
            Período: {formatDate(relatorio.periodo.inicio)} - {formatDate(relatorio.periodo.fim)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportarPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportarExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(relatorio.resumo.totalReceitas)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(relatorio.resumo.totalDespesas)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Final</p>
                <p className={`text-2xl font-bold ${
                  relatorio.resumo.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(relatorio.resumo.saldoFinal)}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${
                relatorio.resumo.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comissões</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(relatorio.resumo.totalComissoes)}
                </p>
              </div>
              <Percent className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análises Detalhadas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Receitas por Forma de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Forma de Pagamento</CardTitle>
            <CardDescription>
              Distribuição das receitas por método de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {relatorio.receitasPorFormaPagamento.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma receita encontrada no período
              </p>
            ) : (
              <div className="space-y-4">
                {relatorio.receitasPorFormaPagamento.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{item.forma}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantidade} transação(ões)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(item.valor)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {((item.valor / relatorio.resumo.totalReceitas) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das despesas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {relatorio.despesasPorCategoria.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma despesa encontrada no período
              </p>
            ) : (
              <div className="space-y-4">
                {relatorio.despesasPorCategoria.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{item.categoria}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantidade} transação(ões)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {formatCurrency(item.valor)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {relatorio.resumo.totalDespesas > 0 ? 
                          ((item.valor / relatorio.resumo.totalDespesas) * 100).toFixed(1) : '0'}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Análise do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Margem de Lucro</p>
              <p className="text-xl font-bold text-green-600">
                {relatorio.resumo.totalReceitas > 0 ? 
                  ((relatorio.resumo.saldoFinal / relatorio.resumo.totalReceitas) * 100).toFixed(1) : '0'}%
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">% Comissões</p>
              <p className="text-xl font-bold text-blue-600">
                {relatorio.resumo.totalReceitas > 0 ? 
                  ((relatorio.resumo.totalComissoes / relatorio.resumo.totalReceitas) * 100).toFixed(1) : '0'}%
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-xl font-bold text-purple-600">
                {relatorio.receitasPorFormaPagamento.length > 0 ? 
                  formatCurrency(relatorio.resumo.totalReceitas / relatorio.receitasPorFormaPagamento.reduce((total, item) => total + item.quantidade, 0)) : 
                  formatCurrency(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
