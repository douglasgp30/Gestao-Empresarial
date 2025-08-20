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
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, "");

    // Se vazio, retorna formato inicial
    if (!numericValue) return "R$ 0,00";

    // Converte para número (dividindo por 100 para considerar centavos)
    const number = parseInt(numericValue) / 100;

    // Formatar como moeda brasileira
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
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
            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-6 bg-accent/20 px-6 py-4 rounded-lg border flex-grow">
              <div className="flex flex-col items-center justify-between py-2 min-w-0 flex-1">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Meta do Mês
                </span>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center space-x-2 h-6">
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

              <div className="flex flex-col items-center justify-between py-2 min-w-0 flex-1">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Total Alcançado da Meta
                </span>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center space-x-2 h-6">
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

              <div className="flex flex-col items-center justify-between py-2 min-w-0 flex-1">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Restante para Meta
                </span>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center space-x-2 h-6">
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
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Wallet className="h-4 w-4" />
              </div>
              <span>Totais do Caixa</span>
            </div>
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Receitas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">...</span>
                    </div>
                  ) : (
                    formatCurrency(stats.totalReceitasCaixa)
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Serviços lançados no caixa
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Despesas
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">...</span>
                    </div>
                  ) : (
                    formatCurrency(stats.totalDespesasCaixa)
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Despesas lançadas no caixa
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo (Caixa)
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">...</span>
                    </div>
                  ) : (
                    formatCurrency(stats.saldoCaixa)
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Receitas - Despesas do caixa
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SEÇÃO 2 - Totais de Contas Recebidas e Pagas */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Receipt className="h-4 w-4" />
              </div>
              <span>Totais de Contas Recebidas e Pagas</span>
            </div>
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Contas Recebidas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">...</span>
                    </div>
                  ) : (
                    formatCurrency(stats.totalContasRecebidas)
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Contas a receber que foram marcadas como recebidas
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Contas Pagas
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">...</span>
                    </div>
                  ) : (
                    formatCurrency(stats.totalContasPagas)
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Contas a pagar que foram marcadas como pagas
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo (Contas Processadas)
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">...</span>
                    </div>
                  ) : (
                    formatCurrency(stats.saldoContasPagas)
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Recebidas - pagas (já processadas)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SEÇÃO 3 - Totais de Contas a Receber e a Pagar */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 p-2 rounded-lg">
                <CreditCard className="h-4 w-4" />
              </div>
              <span>Totais de Contas a Receber e a Pagar</span>
            </div>
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total a Receber
                </CardTitle>
                <Calculator className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">...</span>
                    </div>
                  ) : (
                    formatCurrency(stats.totalContasAReceber)
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Contas a receber ainda não recebidas
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total a Pagar
                </CardTitle>
                <CreditCard className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">...</span>
                    </div>
                  ) : (
                    formatCurrency(stats.totalContasAPagar)
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Contas a pagar ainda não pagas
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo Geral das Contas
                </CardTitle>
                <Banknote className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">...</span>
                    </div>
                  ) : (
                    formatCurrency(stats.saldoGeralContas)
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Total a receber - total a pagar
                </p>
              </CardContent>
            </Card>
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
                  {contasVencendo.map((conta, index) => (
                    <div
                      key={`conta-${conta.id}-${index}`}
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
                            Vencimento:{" "}
                            {new Date(conta.dataVencimento).toLocaleDateString(
                              "pt-BR",
                            )}
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
