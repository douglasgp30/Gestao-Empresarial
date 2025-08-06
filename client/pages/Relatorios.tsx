import React, { useState } from "react";
import { RelatoriosProvider } from "../contexts/RelatoriosContext";
import FiltrosRelatoriosCompacto from "../components/Relatorios/FiltrosRelatoriosCompacto";
import RelatorioFinanceiro from "../components/Relatorios/RelatorioFinanceiro";
import RelatorioTecnicos from "../components/Relatorios/RelatorioTecnicos";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { BarChart3, DollarSign, Users, FileText } from "lucide-react";

function RelatoriosContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Relatórios
        </h1>
        <p className="text-muted-foreground">
          Análises detalhadas e exportação de dados do sistema
        </p>
      </div>

      {/* Filtros Globais */}
      <FiltrosRelatorios />

      {/* Relatórios por Abas */}
      <Tabs defaultValue="financeiro" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financeiro" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Relatório Financeiro
          </TabsTrigger>
          <TabsTrigger value="tecnicos" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Relatório de Técnicos
          </TabsTrigger>
          <TabsTrigger value="contas" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatório de Contas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro">
          <RelatorioFinanceiro />
        </TabsContent>

        <TabsContent value="tecnicos">
          <RelatorioTecnicos />
        </TabsContent>

        <TabsContent value="contas">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              Relatório de Contas
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Relatório detalhado de contas a pagar e receber com análises de
              vencimento e status.
              <br />
              <span className="text-sm italic">Em desenvolvimento...</span>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Relatorios() {
  return (
    <RelatoriosProvider>
      <RelatoriosContent />
    </RelatoriosProvider>
  );
}
