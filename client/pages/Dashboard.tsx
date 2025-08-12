import React, { useState } from "react";
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
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Edit3,
  Trophy,
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

function getStatusColor(status: string) {
  switch (status) {
    case "paga":
      return "bg-green-100 text-green-800";
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
  variant?: "default" | "highlight" | "danger" | "success" | "neutral";
}) {
  const cardClass =
    variant === "highlight"
      ? "border-primary/20 bg-primary/5"
      : variant === "danger"
        ? "border-destructive/20 bg-destructive/5"
        : variant === "success"
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
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
            <span
              className={
                variant === "danger"
                  ? "text-destructive"
                  : variant === "success"
                    ? "text-green-600 dark:text-green-400"
                    : variant === "neutral"
                      ? "text-foreground"
                      : ""
              }
            >
              {value}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center">
          {!isLoading && trend === "up" && (
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
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
  const {
    stats,
    contasVencendo,
    isLoading,
    metaMes,
    totalMetaMes,
    restanteParaMeta,
    setMetaMes,
  } = useDashboard();

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [novaMetaValue, setNovaMetaValue] = useState(metaMes.toString());

  const handleSalvarMeta = () => {
    const novaMetaNum = parseFloat(
      novaMetaValue.replace(/[^\d,]/g, "").replace(",", "."),
    );
    if (!isNaN(novaMetaNum) && novaMetaNum > 0) {
      setMetaMes(novaMetaNum);
      setIsEditingMeta(false);
    }
  };

  const handleCancelarEdicao = () => {
    setNovaMetaValue(metaMes.toString());
    setIsEditingMeta(false);
  };

  const formatCurrencyInput = (value: string) => {
    const numValue = value.replace(/[^\d,]/g, "").replace(",", ".");
    return numValue;
  };

  return (
    <TooltipProvider>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Visão geral financeira
            </p>
          </div>
          
          {/* Top Row - Meta e Saldo Geral */}
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Meta do Mês, Total Alcançado e Restante */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-accent/20 px-6 py-4 rounded-lg border flex-grow">
              <div className="flex flex-col items-center space-y-2 min-w-0">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Meta do Mês
                </span>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Dialog
                      open={isEditingMeta}
                      onOpenChange={setIsEditingMeta}
                    >
                      <DialogTrigger asChild>
                        <span className="text-lg font-bold text-primary cursor-pointer hover:bg-accent/50 px-2 py-1 rounded transition-colors">
                          {formatCurrency(metaMes)}
                        </span>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Meta do Mês</DialogTitle>
                          <DialogDescription>
                            Defina sua meta de receitas para o mês atual. Este
                            valor será usado para calcular o progresso da meta.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="meta" className="text-right">
                              Valor da Meta:
                            </label>
                            <div className="col-span-3">
                              <Input
                                id="meta"
                                placeholder="Ex: 15000"
                                value={novaMetaValue}
                                onChange={(e) =>
                                  setNovaMetaValue(
                                    formatCurrencyInput(e.target.value),
                                  )
                                }
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelarEdicao}
                          >
                            Cancelar
                          </Button>
                          <Button type="button" onClick={handleSalvarMeta}>
                            Salvar Meta
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Edit3
                      className="h-3 w-3 text-muted-foreground cursor-pointer"
                      onClick={() => setIsEditingMeta(true)}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center space-y-2 min-w-0">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Total Alcançado da Meta
                </span>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(totalMetaMes)}
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium mb-1">
                          Total Alcançado da Meta:
                        </p>
                        <p className="text-xs">
                          <strong>
                            Sempre do mês atual, independente dos filtros.
                          </strong>{" "}
                          Receitas do Caixa + Contas a Receber criadas no mês
                          atual.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center space-y-2 min-w-0">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Restante para Meta
                </span>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-lg font-bold ${
                        restanteParaMeta <= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      {restanteParaMeta <= 0
                        ? "Meta Atingida!"
                        : formatCurrency(restanteParaMeta)}
                    </span>
                    {restanteParaMeta <= 0 && (
                      <Trophy className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Saldo Geral */}
            <div className="flex items-center space-x-3 bg-accent/20 px-4 py-2 rounded-lg border">
              <span className="text-sm font-medium text-muted-foreground">
                Saldo Geral:
              </span>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-lg font-bold ${
                      stats.saldoGeralConsolidado > 0
                        ? "text-green-600 dark:text-green-400"
                        : stats.saldoGeralConsolidado < 0
                          ? "text-destructive"
                          : "text-foreground"
                    }`}
                  >
                    {formatCurrency(stats.saldoGeralConsolidado)}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium mb-1">
                        Cálculo do Saldo Geral:
                      </p>
                      <p className="text-xs">
                        (Receitas do Caixa + Contas Recebidas) - (Despesas do
                        Caixa + Contas Pagas)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Atualizando dados...</span>
          </div>
        )}

        {/* SEÇÃO 1 - Totais do Caixa */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>📊 Totais do Caixa</span>
            </div>
            <Badge variant="outline" className="w-fit">
              Dinâmico com filtros
            </Badge>
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total de Receitas"
              value={formatCurrency(stats.totalReceitasCaixa)}
              description="Serviços lançados no caixa"
              icon={TrendingUp}
              trend="up"
              isLoading={isLoading}
              variant="success"
            />
            <StatCard
              title="Total de Despesas"
              value={formatCurrency(stats.totalDespesasCaixa)}
              description="Despesas lançadas no caixa"
              icon={TrendingDown}
              trend="down"
              isLoading={isLoading}
              variant="danger"
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

        {/* SEÇÃO 2 - Totais de Contas Recebidas e Pagas */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>📊 Totais de Contas Recebidas e Pagas</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total de Contas Recebidas"
              value={formatCurrency(stats.totalContasRecebidas)}
              description="Contas a receber que foram marcadas como recebidas"
              icon={TrendingUp}
              trend="up"
              isLoading={isLoading}
              variant="success"
            />
            <StatCard
              title="Total de Contas Pagas"
              value={formatCurrency(stats.totalContasPagas)}
              description="Contas a pagar que foram marcadas como pagas"
              icon={TrendingDown}
              trend="down"
              isLoading={isLoading}
              variant="danger"
            />
            <StatCard
              title="Saldo (Contas Processadas)"
              value={formatCurrency(stats.saldoContasPagas)}
              description="Recebidas - pagas (já processadas)"
              icon={DollarSign}
              trend={stats.saldoContasPagas >= 0 ? "up" : "down"}
              isLoading={isLoading}
              variant="highlight"
            />
          </div>
        </div>

        {/* SEÇÃO 3 - Totais de Contas a Receber e a Pagar */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>📊 Totais de Contas a Receber e a Pagar</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total a Receber"
              value={formatCurrency(stats.totalContasAReceber)}
              description="Contas a receber ainda não recebidas"
              icon={Calculator}
              trend="up"
              isLoading={isLoading}
              variant="success"
            />
            <StatCard
              title="Total a Pagar"
              value={formatCurrency(stats.totalContasAPagar)}
              description="Contas a pagar ainda não pagas"
              icon={CreditCard}
              trend="down"
              isLoading={isLoading}
              variant="danger"
            />
            <StatCard
              title="Saldo Geral das Contas"
              value={formatCurrency(stats.saldoGeralContas)}
              description="Total a receber - total a pagar"
              icon={Banknote}
              trend={stats.saldoGeralContas >= 0 ? "up" : "down"}
              isLoading={isLoading}
              variant={stats.saldoGeralContas >= 0 ? "success" : "danger"}
            />
          </div>
        </div>

        {/* Content Grid - Contas Vencendo */}
        <div className="grid gap-6 lg:grid-cols-1">
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
                            Vencimento: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(conta.valor)}
                        </p>
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

        {/* Footer */}
        <div className="flex flex-col items-center gap-6">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Sistema pronto para uso!</p>
                <p className="text-xs mt-1">
                  Utilize o menu para acessar as funções.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
