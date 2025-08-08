import React from "react";
import { CaixaProvider } from "../contexts/CaixaContext";
import { EntidadesProvider } from "../contexts/EntidadesContext";
import { ModalReceita } from "../components/Caixa/ModalReceita";
import { ModalDespesa } from "../components/Caixa/ModalDespesa";
import ModalCampanhas from "../components/Caixa/ModalCampanhas";
import ModalDescricoesAvancado from "../components/Caixa/ModalDescricoesAvancado";
import ModalCidades from "../components/Caixa/ModalCidades";
import ModalSetores from "../components/Caixa/ModalSetores";
import { FiltrosCaixaCompacto } from "../components/Caixa/FiltrosCaixaCompacto";
import { ListaLancamentosSimples } from "../components/Caixa/ListaLancamentosSimples";
import { SeedButton } from "../components/ui/seed-button";
import { DollarSign } from "lucide-react";

function CaixaContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Caixa
          </h1>
          <p className="text-muted-foreground">
            Controle completo de receitas e despesas da empresa
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {/* Botões principais */}
          <div className="flex gap-2">
            <ModalReceita />
            <ModalDespesa />
          </div>
          {/* Botões de configuração */}
          <div className="flex flex-wrap gap-2 justify-end">
            <SeedButton />
            <ModalCampanhas />
            <ModalDescricoesAvancado />
            <ModalCidades />
            <ModalSetores />
          </div>
        </div>
      </div>

      {/* Filtros e Totais */}
      <FiltrosCaixaCompacto />

      {/* Lista de Lançamentos */}
      <ListaLancamentosSimples />
    </div>
  );
}

export default function Caixa() {
  return (
    <EntidadesProvider>
      <CaixaProvider>
        <CaixaContent />
      </CaixaProvider>
    </EntidadesProvider>
  );
}
