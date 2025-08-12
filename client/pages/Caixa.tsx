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
import { InitDadosTeste } from "../components/ui/init-dados-teste";
import { AlertaDadosVazios } from "../components/ui/alerta-dados-vazios";
import { useEntidades } from "../contexts/EntidadesContext";
import { DollarSign } from "lucide-react";

function CaixaContent() {
  const { descricoes, formasPagamento, getTecnicos } = useEntidades();

  // Verificar se há dados essenciais para mostrar alerta
  const tecnicos = getTecnicos();
  const temDadosEssenciais =
    descricoes.length > 0 && formasPagamento.length > 0 && tecnicos.length > 0;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Mobile First */}
      <div className="space-y-4">
        {/* Título */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Caixa
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Controle completo de receitas e despesas da empresa
          </p>
        </div>

        {/* Botões - Empilhados no mobile */}
        <div className="space-y-3">
          {/* Botões principais - Largura total no mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ModalReceita />
            <ModalDespesa />
          </div>

          {/* Botões de configuração - Grid responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <ModalCampanhas />
            <ModalDescricoesAvancado />
            <ModalCidadeSetor />
          </div>
        </div>
      </div>

      {/* Alerta para dados vazios */}
      <AlertaDadosVazios show={!temDadosEssenciais} />

      {/* Filtros e Totais */}
      <FiltrosCaixaCompacto />

      {/* Lista de Lançamentos */}
      <ListaLancamentosSimples />

      {/* Botão para inicializar dados de teste */}
      <InitDadosTeste />
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
