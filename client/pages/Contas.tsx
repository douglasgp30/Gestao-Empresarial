import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { ContasProvider, useContas } from "@/contexts/ContasContext";
import { FiltroDataContasSimples } from "@/components/Contas/FiltroDataContasSimples";
import { ModalConta } from "@/components/Contas/ModalConta";
import { ListaContas } from "@/components/Contas/ListaContas";
import { ContaLancamento } from "@shared/types";

function ContasContent() {
  const { contas, carregando, forcarRecarregamento } = useContas();

  // Calcular totais
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const totais = React.useMemo(() => {
    return {
      totalReceber: contas
        .filter((c) => c.tipo === "receber" && !c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      totalPagar: contas
        .filter((c) => c.tipo === "pagar" && !c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      vencendoHoje: contas.filter((c) => {
        const vencimento = new Date(c.dataVencimento);
        vencimento.setHours(23, 59, 59, 999);
        return hoje.toDateString() === vencimento.toDateString() && !c.pago;
      }).length,
      atrasadas: contas.filter((c) => {
        const vencimento = new Date(c.dataVencimento);
        vencimento.setHours(23, 59, 59, 999);
        return vencimento < hoje && !c.pago;
      }).length,
      pagas: contas.filter((c) => c.pago).length,
    };
  }, [contas, hoje]);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Contas a Pagar e Receber
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas contas com vencimento por data de vencimento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={forcarRecarregamento} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Recarregar
          </Button>
          <ModalConta />
        </div>
      </div>

      {/* Filtros de Data */}
      <FiltroDataContasSimples />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatarMoeda(totais.totalReceber)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendentes de recebimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatarMoeda(totais.totalPagar)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendentes de pagamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo Hoje</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {totais.vencendoHoje}
            </div>
            <p className="text-xs text-muted-foreground">
              Contas com vencimento hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totais.atrasadas}
            </div>
            <p className="text-xs text-muted-foreground">Contas em atraso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totais.pagas}
            </div>
            <p className="text-xs text-muted-foreground">Contas quitadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas */}
      <ListaContas />

      {/* Status de carregamento */}
      {carregando && (
        <div className="fixed bottom-4 right-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Carregando contas...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function Contas() {
  return (
    <ContasProvider>
      <ContasContent />
    </ContasProvider>
  );
}
