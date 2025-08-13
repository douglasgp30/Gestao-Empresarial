import React from "react";
import { ContasProvider, useContas } from "@/contexts/ContasContext";
import { EntidadesProvider } from "@/contexts/EntidadesProvider";
import { ClientesProvider } from "@/contexts/ClientesContext";
import { FiltroDataContasSimples } from "@/components/Contas/FiltroDataContasSimples";
import { ModalContasReceber } from "@/components/Contas/ModalContasReceber";
import { ModalContasPagar } from "@/components/Contas/ModalContasPagar";
import { ListaContas } from "@/components/Contas/ListaContas";
import { TotaisContas } from "@/components/Contas/TotaisContas";
import ModalDescricoesAvancado from "@/components/Caixa/ModalDescricoesAvancado";
import { FileText } from "lucide-react";

function ContasContent() {
  const { forcarRecarregamento } = useContas();


  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header com botões no topo direito */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Título */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Contas
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestão completa de contas a pagar e receber
          </p>
        </div>

        {/* Botões principais - Compactos no canto direito */}
        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
          <ModalContasReceber />
          <ModalContasPagar />
        </div>
      </div>

      {/* Filtros e Totais */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Filtros e botões de configuração */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex justify-center lg:justify-start">
            <FiltroDataContasSimples />
          </div>
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <ModalDescricoesAvancado />
          </div>
        </div>

        {/* Totais alinhados à direita */}
        <TotaisContas />
      </div>

      {/* Lista de Contas */}
      <ListaContas />
    </div>
  );
}

export default function Contas() {
  return (
    <EntidadesProvider>
      <ClientesProvider>
        <ContasProvider>
          <ContasContent />
        </ContasProvider>
      </ClientesProvider>
    </EntidadesProvider>
  );
}
