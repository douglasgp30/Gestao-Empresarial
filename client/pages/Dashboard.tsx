import React from "react";
import { useDashboard } from "../contexts/DashboardContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import FiltrosData from "../components/Dashboard/FiltrosData";
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
  Calculator,
  Banknote,
  Wallet,
  Info,
} from "lucide-react";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

function getStatusColor(status: string) {
  switch (status) {
    case "paga":
      return "bg-success text-success-foreground";
    case "atrasada":
      return "bg-destructive text-destructive-foreground";
    case "vence_hoje":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading = false,
  variant = "default",
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
  variant?: "default" | "highlight" | "danger";
}) {
  const cardClass =
    variant === "highlight"
      ? "border-primary/20 bg-primary/5"
      : variant === "danger"
        ? "border-destructive/20 bg-destructive/5"
        : "";

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
            <span className={variant === "danger" ? "text-destructive" : ""}>
              {value}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center">
          {!isLoading && trend === "up" && (
            <TrendingUp className="h-3 w-3 mr-1 text-success" />
          )}
          {!isLoading && trend === "down" && (
            <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { stats, lancamentos, contasVencendo, filtros, isLoading } =
    useDashboard();

  // Filtrar lançamentos pelo período selecionado para exibir nas movimentações recentes
  const lancamentosRecentes = lancamentos
    .filter((lancamento) => {
      const dataLancamento = new Date(lancamento.data);
      return (
        dataLancamento >= filtros.dataInicio &&
        dataLancamento <= filtros.dataFim
      );
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
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Header com Saldo Geral no canto direito */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral financeira - Período: {getPeriodoDescricao()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">
              Saldo Geral:
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span
                  className={`text-lg font-bold ${
                    stats.saldoGeralConsolidado >= 0
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {formatCurrency(stats.saldoGeralConsolidado)}
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Cálculo do Saldo Geral:</p>
                    <p className="text-xs">
                      (Receitas do Caixa + Contas Recebidas) - (Despesas do
                      Caixa + Contas Pagas)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
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

      {/* LINHA 1 - Totais do Módulo Caixa */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>📊 Totais do Módulo Caixa</span>
          <Badge variant="outline">Dinâmico com filtros</Badge>
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total de Receitas"
            value={formatCurrency(stats.totalReceitasCaixa)}
            description="Serviços lançados no caixa"
            icon={TrendingUp}
            trend="up"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Total de Despesas"
            value={formatCurrency(stats.totalDespesasCaixa)}
            description="Despesas lançadas no caixa"
            icon={TrendingDown}
            trend="down"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Saldo (Caixa)"
            value={formatCurrency(stats.saldoCaixa)}
            description="Receitas - Despesas do caixa"
            icon={DollarSign}
            trend={stats.saldoCaixa >= 0 ? "up" : "down"}
            isLoading={isLoading}
            variant="highlight"
          />
        </div>
      </div>

      {/* LINHA 2 - Totais do Módulo Contas (apenas pagas/recebidas) */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Receipt className="h-5 w-5" />
          <span>📊 Totais do Módulo Contas</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Contas Recebidas"
            value={formatCurrency(stats.totalContasRecebidas)}
            description="Contas a receber marcadas como pagas"
            icon={TrendingUp}
            trend="up"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Total Contas Pagas"
            value={formatCurrency(stats.totalContasPagas)}
            description="Contas a pagar marcadas como pagas"
            icon={TrendingDown}
            trend="down"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Saldo (Contas)"
            value={formatCurrency(stats.saldoContasPagas)}
            description="Recebidas - Pagas"
            icon={DollarSign}
            trend={stats.saldoContasPagas >= 0 ? "up" : "down"}
            isLoading={isLoading}
            variant="highlight"
          />
        </div>
      </div>

      {/* LINHA 3 - Resumo Completo do Módulo Contas */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>📊 Contas Atrasadas</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
          <StatCard
            title="Total a Receber"
            value={formatCurrency(stats.totalGeralAReceber)}
            description="Recebidas + pendentes"
            icon={Target}
            trend="up"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Total a Pagar"
            value={formatCurrency(stats.totalGeralAPagar)}
            description="Pagas + pendentes"
            icon={CreditCard}
            trend="down"
            isLoading={isLoading}
            variant="default"
          />
          <StatCard
            title="Saldo Geral Contas"
            value={formatCurrency(stats.saldoGeralContas)}
            description="A receber - a pagar"
            icon={Banknote}
            trend={stats.saldoGeralContas >= 0 ? "up" : "down"}
            isLoading={isLoading}
            variant="highlight"
          />
          <StatCard
            title="Valor A Pagar Atrasadas"
            value={formatCurrency(stats.valorContasPagarAtrasadas)}
            description="Total em atraso"
            icon={AlertTriangle}
            isLoading={isLoading}
            variant="danger"
          />
          <StatCard
            title="Qtd. A Pagar Atrasadas"
            value={stats.qtdContasPagarAtrasadas.toString()}
            description="Contas em atraso"
            icon={FileText}
            isLoading={isLoading}
            variant="danger"
          />
          <StatCard
            title="Valor A Receber Atrasadas"
            value={formatCurrency(stats.valorContasReceberAtrasadas)}
            description="Total em atraso"
            icon={AlertTriangle}
            isLoading={isLoading}
            variant="danger"
          />
          <StatCard
            title="Qtd. A Receber Atrasadas"
            value={stats.qtdContasReceberAtrasadas.toString()}
            description="Contas em atraso"
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
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.tipo === "receita"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {transaction.tipo === "receita" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.tipo === "receita"
                            ? `Serviço - ${transaction.setor || "Geral"}`
                            : transaction.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.tipo === "receita" &&
                            transaction.tecnicoResponsavel &&
                            `Técnico: ${transaction.tecnicoResponsavel}`}
                          {transaction.tipo === "despesa" &&
                            transaction.categoria &&
                            `Categoria: ${transaction.categoria}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.tipo === "receita"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {transaction.tipo === "receita" ? "+" : "-"}
                        {formatCurrency(
                          transaction.valorLiquido || transaction.valor,
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.data)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contas Vencendo */}
        <Card>
          <CardHeader>
            <CardTitle>Contas Vencendo</CardTitle>
            <CardDescription>Contas vencendo hoje e atrasadas</CardDescription>
          </CardHeader>
          <CardContent>
            {contasVencendo.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma conta requer atenção no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contasVencendo.map((conta) => (
                  <div
                    key={conta.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          conta.tipo === "receber"
                            ? "bg-primary/10 text-primary"
                            : "bg-orange-500/10 text-orange-500"
                        }`}
                      >
                        {conta.tipo === "receber" ? (
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
                      <Badge
                        className={`text-xs ${getStatusColor(conta.status)}`}
                      >
                        {conta.status === "vence_hoje"
                          ? "Vence Hoje"
                          : "Atrasada"}
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
    </TooltipProvider>
  );
}
