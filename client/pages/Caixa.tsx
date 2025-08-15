import React from "react";
import { CaixaProvider } from "../contexts/CaixaContext";
import { EntidadesProvider } from "../contexts/EntidadesContext";
import { ModalReceita } from "../components/Caixa/ModalReceita";
import { ModalDespesa } from "../components/Caixa/ModalDespesa";
import ModalCampanhas from "../components/Caixa/ModalCampanhas";
import ModalDescricoesAvancado from "../components/Caixa/ModalDescricoesAvancado";
import ModalCidadeSetor from "../components/Caixa/ModalCidadeSetor";
import { FiltrosCaixaCompacto } from "../components/Caixa/FiltrosCaixaCompacto";
import { ListaLancamentosSimples } from "../components/Caixa/ListaLancamentosSimples";
import { TotaisCaixa } from "../components/Caixa/TotaisCaixa";
import { DollarSign } from "lucide-react";

function CaixaContent() {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header com botões no topo direito */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Título */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Caixa
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Controle completo de receitas e despesas da empresa
          </p>
        </div>

        {/* Botões principais - Compactos no canto direito */}
        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
          <ModalReceita />
          <ModalDespesa />
        </div>
      </div>

      {/* Botões de configuração e Totais */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Botões de configuração */}
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
          <ModalCampanhas />
          <ModalDescricoesAvancado />
          <ModalCidadeSetor />
        </div>

        {/* Totais alinhados à direita */}
        <TotaisCaixa />
      </div>

      {/* Filtros */}
      <FiltrosCaixaCompacto />

      {/* Lista de Lançamentos */}
      <ListaLancamentosSimples />

      {/* DEBUG: Componente de teste temporário */}
      <div className="mt-8">
        <TesteCarregamentoDados />
      </div>
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
