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
import FiltrosDataCompacto from "../components/Dashboard/FiltrosDataCompacto";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  FileText,
  Target,
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
  const {
    stats,
    lancamentos,
    contasVencendo,
    filtros,
    isLoading,
    metaMes,
    totalMetaMes,
    restanteParaMeta,
    setMetaMes
  } = useDashboard();

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [novaMetaValue, setNovaMetaValue] = useState(metaMes.toString());

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

  const handleSalvarMeta = () => {
    const novaMetaNum = parseFloat(novaMetaValue.replace(/[^\d,]/g, '').replace(',', '.'));
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
    const numValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    return numValue;
  };

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Header com Saldo Geral e Meta do Mês */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral financeira - Período: {getPeriodoDescricao()}
            </p>
          </div>
          <div className="flex items-center justify-between w-full">
            {/* Lado Esquerdo: Meta do Mês, Total Alcançado e Restante */}
            <div className="flex items-center space-x-8">
              {/* Meta do Mês */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Meta do Mês:
                </span>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Dialog open={isEditingMeta} onOpenChange={setIsEditingMeta}>
                      <DialogTrigger asChild>
                        <button className="flex items-center space-x-1 hover:bg-accent/50 px-2 py-1 rounded transition-colors">
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(metaMes)}
                          </span>
                          <Edit3 className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Meta do Mês</DialogTitle>
                          <DialogDescription>
                            Defina sua meta de receitas para o mês atual. Este valor será usado para calcular o progresso da meta.
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
                                onChange={(e) => setNovaMetaValue(formatCurrencyInput(e.target.value))}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={handleCancelarEdicao}>
                            Cancelar
                          </Button>
                          <Button type="button" onClick={handleSalvarMeta}>
                            Salvar Meta
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>

              {/* Total Alcançado da Meta */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Alcançado da Meta:
                </span>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(totalMetaMes)}
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium mb-1">Total Alcançado da Meta:</p>
                        <p className="text-xs">
                          Receitas do Caixa + Contas a Receber criadas no mês atual (baseado na data de criação, não vencimento)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>

              {/* Restante para Meta */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Restante p/ Meta:
                </span>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-lg font-bold ${
                        restanteParaMeta <= 0
                          ? "text-success"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      {restanteParaMeta <= 0 ? "Meta Atingida!" : formatCurrency(restanteParaMeta)}
                    </span>
                    {restanteParaMeta <= 0 && (
                      <Trophy className="h-4 w-4 text-success" />
                    )}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors ml-1" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium mb-1">Restante para Meta:</p>
                        <p className="text-xs">
                          {restanteParaMeta <= 0
                            ? "Parabéns! Você atingiu ou superou a meta do mês!"
                            : "Valor que ainda falta para atingir a meta estabelecida."
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            {/* Lado Direito: Saldo Geral */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">
                Saldo Geral:
              </span>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-lg font-bold ${
                      stats.saldoGeralConsolidado > 0
                        ? "text-success"
                        : stats.saldoGeralConsolidado < 0
                          ? "text-destructive"
                          : "text-foreground"
                    }`}
                  >
                    {formatCurrency(stats.saldoGeralConsolidado)}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors ml-1" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium mb-1">Cálculo do Saldo Geral:</p>
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

        {/* Filtros de Data */}
        <FiltrosDataCompacto />

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
            <span>📊 Totais do Caixa</span>
            <Badge variant="outline">Dinâmico com filtros</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total de Receitas"
              value={formatCurrency(stats.totalReceitasCaixa)}
              description="Servi��os lançados no caixa"
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

        {/* LINHA 2 - Totais de Contas Recebidas e Pagas */}
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

        {/* LINHA 3 - Totais de Contas a Receber e a Pagar */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>📊 Totais de Contas a Receber e a Pagar</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total a Receber"
              value={formatCurrency(stats.totalContasAReceber)}
              description="Contas a receber ainda não recebidas"
              icon={Target}
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
                            Vencimento: {formatDate(conta.dataVencimento)}
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
      </div>
    </TooltipProvider>
  );
}
