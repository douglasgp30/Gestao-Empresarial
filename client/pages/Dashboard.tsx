import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import FiltrosData from '../components/Dashboard/FiltrosData';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  FileText,
  Target,
  Loader2
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
  trend 
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1 text-success" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1 text-destructive" />}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { stats, lancamentos, contas, filtros, isLoading } = useDashboard();

  // Filtrar lançamentos pelo período selecionado para exibir nas movimentações recentes
  const lancamentosRecentes = lancamentos
    .filter(lancamento => {
      const dataLancamento = new Date(lancamento.data);
      return dataLancamento >= filtros.dataInicio && dataLancamento <= filtros.dataFim;
    })
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  // Filtrar contas que precisam de atenção
  const contasAtencao = contas
    .filter(conta => conta.status === 'vence_hoje' || conta.status === 'atrasada')
    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());

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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Receitas"
          value={formatCurrency(stats.totalReceitas)}
          description={getPeriodoDescricao()}
          icon={TrendingUp}
          trend="up"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Despesas"
          value={formatCurrency(stats.totalDespesas)}
          description={getPeriodoDescricao()}
          icon={TrendingDown}
          trend="down"
          isLoading={isLoading}
        />
        <StatCard
          title="Saldo Final"
          value={formatCurrency(stats.saldoFinal)}
          description="Receitas - Despesas"
          icon={DollarSign}
          trend={stats.saldoFinal >= 0 ? "up" : "down"}
          isLoading={isLoading}
        />
        <StatCard
          title="Contas Vencendo"
          value={stats.contasVencendoHoje.toString()}
          description="Hoje"
          icon={AlertTriangle}
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Contas Atrasadas"
          value={stats.contasAtrasadas.toString()}
          description="Requer atenção"
          icon={Calendar}
          isLoading={isLoading}
        />
        <StatCard
          title="A Pagar"
          value={formatCurrency(stats.totalContasPagar)}
          description="Total pendente"
          icon={FileText}
          isLoading={isLoading}
        />
        <StatCard
          title="A Receber"
          value={formatCurrency(stats.totalContasReceber)}
          description="Total pendente"
          icon={Target}
          isLoading={isLoading}
        />
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

        {/* Accounts Due */}
        <Card>
          <CardHeader>
            <CardTitle>Contas que Precisam de Atenção</CardTitle>
            <CardDescription>
              Contas vencendo hoje e atrasadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contasAtencao.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma conta requer atenção no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contasAtencao.map((conta) => (
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
