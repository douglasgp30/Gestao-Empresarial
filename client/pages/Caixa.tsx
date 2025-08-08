import React from "react";
import { CaixaProvider, useCaixa } from "../contexts/CaixaContext";
import { EntidadesProvider } from "../contexts/EntidadesContext";
import FormularioReceita from "../components/Caixa/FormularioReceita";
import FormularioDespesa from "../components/Caixa/FormularioDespesa";
import ModalCampanhas from "../components/Caixa/ModalCampanhas";
import ModalDescricoesAvancado from "../components/Caixa/ModalDescricoesAvancado";
import ModalCidades from "../components/Caixa/ModalCidades";
import ModalSetores from "../components/Caixa/ModalSetores";
import FiltrosCaixaCompacto from "../components/Caixa/FiltrosCaixaCompacto";
import ListaLancamentosSimples from "../components/Caixa/ListaLancamentosSimples";
import { DollarSign, Bug } from "lucide-react";
import { Button } from "../components/ui/button";

function CaixaContent() {
  const { testarLancamento, lancamentos, totais } = useCaixa();

  const handleTeste = () => {
    console.log("🧪 Executando teste do sistema...");
    testarLancamento();
  };

  const verificarEstado = () => {
    console.log("🔍 Estado atual do caixa:");
    console.log("📊 Lançamentos:", lancamentos);
    console.log("💰 Totais:", totais);
    console.log("🗄️ LocalStorage:", localStorage.getItem('lancamentos'));
  };

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
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleTeste} variant="outline" size="sm">
            <Bug className="h-4 w-4 mr-2" />
            Teste Sistema
          </Button>
          <Button onClick={verificarEstado} variant="outline" size="sm">
            🔍 Debug Estado
          </Button>
          <FormularioReceita />
          <FormularioDespesa />
          <ModalCampanhas />
          <ModalDescricoesAvancado />
          <ModalCidades />
          <ModalSetores />
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
