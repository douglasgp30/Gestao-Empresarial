import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FORMAS_PAGAMENTO_PADRAO } from "../../lib/dadosBasicos";
import { toast } from "../ui/use-toast";
import { RefreshCw, Users, CreditCard } from "lucide-react";

export function FixDadosSystem() {
  const verificarFuncionarios = () => {
    const funcionarios = JSON.parse(
      localStorage.getItem("funcionarios") || "[]",
    );
    console.log(
      "📊 [DEBUG] Funcionários no localStorage:",
      funcionarios.map((f) => ({
        id: f.id,
        nome: f.nome || f.nomeCompleto,
        tipoAcesso: f.tipoAcesso,
        ehTecnico: f.ehTecnico,
      })),
    );

    const tecnicos = funcionarios.filter(
      (f) =>
        f.ehTecnico ||
        (f.tipoAcesso &&
          f.tipoAcesso
            .toLowerCase()
            .normalize?.("NFD")
            ?.replace(/[\u0300-\u036f]/g, "") === "tecnico"),
    );

    toast({
      title: "Debug Funcionários",
      description: `Total: ${funcionarios.length} | Técnicos: ${tecnicos.length}`,
      variant: "default",
    });
  };

  const verificarFormasPagamento = () => {
    const formas = JSON.parse(localStorage.getItem("formas_pagamento") || "[]");
    console.log("💳 [DEBUG] Formas de pagamento:", formas);

    const temBoleto = formas.some(
      (f) =>
        f.id === "5" || (f.nome && f.nome.toLowerCase().includes("boleto")),
    );

    toast({
      title: "Debug Formas de Pagamento",
      description: `Total: ${formas.length} | Tem Boleto: ${temBoleto ? "SIM" : "NÃO"}`,
      variant: temBoleto ? "default" : "destructive",
    });
  };

  const corrigirFormasPagamento = () => {
    // Usar formas padrão centralizadas com acentos corretos
    localStorage.setItem("formas_pagamento", JSON.stringify(FORMAS_PAGAMENTO_PADRAO));

    toast({
      title: "Formas de Pagamento Corrigidas",
      description: "Dados resetados com boleto incluído. Recarregue a página.",
      variant: "default",
    });
  };

  const recarregarPagina = () => {
    window.location.reload();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Debug & Correção de Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Funcionários */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Funcionários/Técnicos
            </h3>
            <Button
              onClick={verificarFuncionarios}
              variant="outline"
              className="w-full"
            >
              Verificar Funcionários
            </Button>
          </div>

          {/* Formas de Pagamento */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Formas de Pagamento
            </h3>
            <Button
              onClick={verificarFormasPagamento}
              variant="outline"
              className="w-full"
            >
              Verificar Formas
            </Button>
            <Button
              onClick={corrigirFormasPagamento}
              variant="secondary"
              className="w-full"
            >
              Corrigir Formas
            </Button>
          </div>
        </div>

        {/* Ações Gerais */}
        <div className="border-t pt-4">
          <Button
            onClick={recarregarPagina}
            variant="default"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar Página
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Problemas resolvidos:</strong>
          </p>
          <p>
            ✅ Funcionários não apareciam no lançamento (filtro case-sensitive
            corrigido)
          </p>
          <p>
            ✅ Boleto não aparecia nas formas de pagamento (validação
            adicionada)
          </p>
          <p>
            <strong>Uso:</strong> Abra o console do navegador para ver logs
            detalhados
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
