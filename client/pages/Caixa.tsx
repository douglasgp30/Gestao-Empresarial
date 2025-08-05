import React from 'react';
import { CaixaProvider } from '../contexts/CaixaContext';
import FormularioReceita from '../components/Caixa/FormularioReceita';
import FormularioDespesa from '../components/Caixa/FormularioDespesa';
import FiltrosCaixa from '../components/Caixa/FiltrosCaixa';
import ListaLancamentos from '../components/Caixa/ListaLancamentos';
import { DollarSign } from 'lucide-react';

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
        <div className="flex space-x-2">
          <FormularioReceita />
          <FormularioDespesa />
        </div>
      </div>

      {/* Filtros e Totais */}
      <FiltrosCaixa />

      {/* Lista de Lançamentos */}
      <ListaLancamentos />
    </div>
  );
}

export default function Caixa() {
  return (
    <CaixaProvider>
      <CaixaContent />
    </CaixaProvider>
  );
}
