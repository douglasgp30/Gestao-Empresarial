import React from "react";
import { ContasProvider } from "../contexts/ContasContext";
import FormularioConta from "../components/Contas/FormularioConta";
import FiltrosContas from "../components/Contas/FiltrosContas";
import ListaContas from "../components/Contas/ListaContas";
import { FileText } from "lucide-react";

function ContasContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Contas
          </h1>
          <p className="text-muted-foreground">
            Gestão completa de contas a pagar e receber
          </p>
        </div>
        <div className="flex space-x-2">
          <FormularioConta />
        </div>
      </div>

      {/* Filtros e Totais */}
      <FiltrosContas />

      {/* Lista de Contas */}
      <ListaContas />
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
