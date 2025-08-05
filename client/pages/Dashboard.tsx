import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import FiltrosData from '../components/Dashboard/FiltrosData';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  FileText,
  Target,
  Loader2,
  Receipt,
  CreditCard,
  Filter
} from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR');
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paga':
      return 'bg-success text-success-foreground';
    case 'atrasada':
      return 'bg-destructive text-destructive-foreground';
    case 'vence_hoje':
      return 'bg-warning text-warning-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading = false,
  variant = 'default'
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
  variant?: 'default' | 'highlight' | 'danger';
}) {
  const cardClass = variant === 'highlight' 
    ? 'border-primary/20 bg-primary/5' 
    : variant === 'danger' 
    ? 'border-destructive/20 bg-destructive/5' 
    : '';

  return (
    <Card className={cardClass}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">...</span>
            </div>
          ) : (
            <span className={variant === 'danger' ? 'text-destructive' : ''}>
              {value}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center">
          {!isLoading && trend === 'up' && <TrendingUp className="h-3 w-3 mr-1 text-success" />}
          {!isLoading && trend === 'down' && <TrendingDown className="h-3 w-3 mr-1 text-destructive" />}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { stats, lancamentos, contasVencendo, filtros, isLoading, aplicarFiltrosCaixa, setAplicarFiltrosCaixa } = useDashboard();

  // Filtrar lançamentos pelo período selecionado para exibir nas movimentações recentes
  const lancamentosRecentes = lancamentos
    .filter(lancamento => {
      const dataLancamento = new Date(lancamento.data);
      return dataLancamento >= filtros.dataInicio && dataLancamento <= filtros.dataFim;
    })
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  const getPeriodoDescricao = () => {
    if (filtros.dataInicio.toDateString() === filtros.dataFim.toDateString()) {
      return formatDate(filtros.dataInicio);
    }
    return `${formatDate(filtros.dataInicio)} - ${formatDate(filtros.dataFim)}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral financeira - Período: {getPeriodoDescricao()}
        </p>
      </div>

      {/* Filtros de Data */}
      <FiltrosData />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Atualizando dados...</span>
        </div>
      )}

      {/* PRIMEIRA LINHA - Totais do Caixa (Serviços Realizados) */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Módulo Caixa - Serviços Realizados</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total de Receitas"
            value={formatCurrency(stats.totalReceitas)}
            description="Serviços realizados no período"
            icon={TrendingUp}
            trend="up"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Total de Despesas"
            value={formatCurrency(stats.totalDespesas)}
            description="Despesas lançadas no caixa"
            icon={TrendingDown}
            trend="down"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Saldo Final"
            value={formatCurrency(stats.saldoFinal)}
            description="Receitas - Despesas do caixa"
            icon={DollarSign}
            trend={stats.saldoFinal >= 0 ? "up" : "down"}
            isLoading={isLoading}
            variant="highlight"
          />
        </div>
      </div>

      {/* SEGUNDA LINHA - Receitas Recebidas e Despesas Pagas */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Totais Efetivamente Recebidos e Pagos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Receitas Recebidas"
            value={formatCurrency(stats.totalReceitasRecebidas)}
            description="Caixa + contas a receber pagas"
            icon={Receipt}
            trend="up"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Total Despesas Pagas"
            value={formatCurrency(stats.totalDespesasPagas)}
            description="Caixa + contas a pagar pagas"
            icon={CreditCard}
            trend="down"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Saldo Geral"
            value={formatCurrency(stats.saldoGeralRecebidoPago)}
            description="Recebidas - Pagas (total)"
            icon={DollarSign}
            trend={stats.saldoGeralRecebidoPago >= 0 ? "up" : "down"}
            isLoading={isLoading}
            variant="highlight"
          />
        </div>
      </div>

      {/* TERCEIRA LINHA - Módulo Contas */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Módulo Contas - Situação Geral</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <StatCard
            title="Contas Recebidas"
            value={formatCurrency(stats.totalContasRecebidasPagas)}
            description="Contas a receber pagas"
            icon={TrendingUp}
            trend="up"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Contas Pagas"
            value={formatCurrency(stats.totalContasPagasPagas)}
            description="Contas a pagar pagas"
            icon={TrendingDown}
            trend="down"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Saldo Contas"
            value={formatCurrency(stats.saldoContas)}
            description="Recebidas - Pagas"
            icon={DollarSign}
            trend={stats.saldoContas >= 0 ? "up" : "down"}
            isLoading={isLoading}
            variant="highlight"
          />
          <StatCard
            title="Valor Atrasadas"
            value={formatCurrency(stats.totalValorContasAtrasadas)}
            description="Total em atraso"
            icon={AlertTriangle}
            isLoading={isLoading}
            variant="danger"
          />
          <StatCard
            title="Qtd. A Pagar Atrasadas"
            value={stats.qtdContasPagarAtrasadas.toString()}
            description="Contas a pagar em atraso"
            icon={FileText}
            isLoading={isLoading}
            variant="danger"
          />
          <StatCard
            title="Qtd. A Receber Atrasadas"
            value={stats.qtdContasReceberAtrasadas.toString()}
            description="Contas a receber em atraso"
            icon={Target}
            isLoading={isLoading}
            variant="danger"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações no Período</CardTitle>
            <CardDescription>
              Receitas e despesas do período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lancamentosRecentes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma movimentação encontrada no período selecionado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lancamentosRecentes.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.tipo === 'receita'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {transaction.tipo === 'receita' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.tipo === 'receita'
                            ? `Serviço - ${transaction.setor || 'Geral'}`
                            : transaction.descricao
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.tipo === 'receita' && transaction.tecnicoResponsavel &&
                            `Técnico: ${transaction.tecnicoResponsavel}`}
                          {transaction.tipo === 'despesa' && transaction.categoria &&
                            `Categoria: ${transaction.categoria}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.tipo === 'receita' ? 'text-success' : 'text-destructive'
                      }`}>
                        {transaction.tipo === 'receita' ? '+' : '-'}{formatCurrency(transaction.valorLiquido || transaction.valor)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.data)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contas Vencendo - Movido para parte inferior */}
        <Card>
          <CardHeader>
            <CardTitle>Contas Vencendo</CardTitle>
            <CardDescription>
              Contas vencendo hoje e atrasadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contasVencendo.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma conta requer atenção no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contasVencendo.map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        conta.tipo === 'receber'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {conta.tipo === 'receber' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {conta.fornecedorCliente}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vencimento: {formatDate(conta.dataVencimento)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(conta.valor)}</p>
                      <Badge className={`text-xs ${getStatusColor(conta.status)}`}>
                        {conta.status === 'vence_hoje' ? 'Vence Hoje' : 'Atrasada'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
