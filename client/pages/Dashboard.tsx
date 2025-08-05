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
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de gestão empresarial
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Receitas"
          value={formatCurrency(mockStats.totalReceitas)}
          description="Este mês"
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Total Despesas"
          value={formatCurrency(mockStats.totalDespesas)}
          description="Este mês"
          icon={TrendingDown}
          trend="down"
        />
        <StatCard
          title="Saldo Final"
          value={formatCurrency(mockStats.saldoFinal)}
          description="Receitas - Despesas"
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Contas Vencendo"
          value={mockStats.contasVencendoHoje.toString()}
          description="Hoje"
          icon={AlertTriangle}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Contas Atrasadas"
          value={mockStats.contasAtrasadas.toString()}
          description="Requer atenção"
          icon={Calendar}
        />
        <StatCard
          title="A Pagar"
          value={formatCurrency(mockStats.totalContasPagar)}
          description="Total pendente"
          icon={FileText}
        />
        <StatCard
          title="A Receber"
          value={formatCurrency(mockStats.totalContasReceber)}
          description="Total pendente"
          icon={Target}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
            <CardDescription>
              Receitas e despesas recentes do caixa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
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
                      <p className="font-medium text-sm">{transaction.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.tipo === 'receita' && transaction.tecnico && `Técnico: ${transaction.tecnico}`}
                        {transaction.tipo === 'despesa' && transaction.categoria && `Categoria: ${transaction.categoria}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.tipo === 'receita' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.tipo === 'receita' ? '+' : '-'}{formatCurrency(transaction.valor)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.data)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accounts Due */}
        <Card>
          <CardHeader>
            <CardTitle>Contas a Vencer e Atrasadas</CardTitle>
            <CardDescription>
              Contas que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contasVencimento.map((conta) => (
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
                        {conta.tipo === 'receber' ? conta.cliente : conta.fornecedor}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vencimento: {formatDate(conta.vencimento)}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
