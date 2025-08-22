import React from "react";
import { useCurrencyInput } from "../../hooks/use-currency-input";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

export function TesteCamposValor() {
  const valorReceita = useCurrencyInput();
  const valorDespesa = useCurrencyInput();
  const valorMeta = useCurrencyInput();

  // Simular a função formatCurrencyInput do Dashboard
  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "R$ 0,00";
    const number = parseInt(numericValue) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
  };

  const [metaDashboard, setMetaDashboard] = React.useState("R$ 0,00");

  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetaDashboard(formatCurrencyInput(e.target.value));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Teste - Campos de Valor Monetário</CardTitle>
        <p className="text-sm text-gray-600">
          Todos os campos devem ter o mesmo comportamento: digite apenas números
          (ex: 12345) para ver R$ 123,45
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Teste Receita */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-green-600">
            💰 Campo Valor - Lançamento Receita
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor-receita">Digite o valor:</Label>
              <Input
                id="valor-receita"
                {...valorReceita.inputProps}
                className="text-lg font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label>Resultado:</Label>
              <div className="p-3 bg-green-50 rounded text-sm space-y-1">
                <div>
                  <strong>Display:</strong> {valorReceita.displayValue}
                </div>
                <div>
                  <strong>Valor numérico:</strong> {valorReceita.numericValue}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Teste Despesa */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-red-600">
            💸 Campo Valor - Lançamento Despesa
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor-despesa">Digite o valor:</Label>
              <Input
                id="valor-despesa"
                {...valorDespesa.inputProps}
                className="text-lg font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label>Resultado:</Label>
              <div className="p-3 bg-red-50 rounded text-sm space-y-1">
                <div>
                  <strong>Display:</strong> {valorDespesa.displayValue}
                </div>
                <div>
                  <strong>Valor numérico:</strong> {valorDespesa.numericValue}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Teste Meta Hook */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-blue-600">
            🎯 Campo Valor - Hook useCurrencyInput (igual receita/despesa)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor-meta-hook">Digite o valor:</Label>
              <Input
                id="valor-meta-hook"
                {...valorMeta.inputProps}
                className="text-lg font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label>Resultado:</Label>
              <div className="p-3 bg-blue-50 rounded text-sm space-y-1">
                <div>
                  <strong>Display:</strong> {valorMeta.displayValue}
                </div>
                <div>
                  <strong>Valor numérico:</strong> {valorMeta.numericValue}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Teste Meta Dashboard (função original) */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-purple-600">
            📊 Campo Meta Dashboard (função formatCurrencyInput original)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor-meta-dashboard">Digite o valor:</Label>
              <Input
                id="valor-meta-dashboard"
                value={metaDashboard}
                onChange={handleMetaChange}
                className="text-lg font-medium"
                placeholder="R$ 0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Resultado:</Label>
              <div className="p-3 bg-purple-50 rounded text-sm space-y-1">
                <div>
                  <strong>Display:</strong> {metaDashboard}
                </div>
                <div>
                  <strong>Valor numérico:</strong>{" "}
                  {parseInt(metaDashboard.replace(/\D/g, "") || "0") / 100}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold mb-2">📝 Instruções de Teste:</h4>
          <ul className="text-sm space-y-1 text-yellow-800">
            <li>
              • Digite <strong>12345</strong> → deve mostrar{" "}
              <strong>R$ 123,45</strong>
            </li>
            <li>
              • Digite <strong>100</strong> → deve mostrar{" "}
              <strong>R$ 1,00</strong>
            </li>
            <li>
              • Digite <strong>50000</strong> → deve mostrar{" "}
              <strong>R$ 500,00</strong>
            </li>
            <li>• Teclas permitidas: números, backspace, delete, setas</li>
            <li>• Todos os campos devem se comportar EXATAMENTE igual</li>
          </ul>
        </div>

        {/* Status */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold mb-2 text-green-800">
            ✅ Status dos Campos:
          </h4>
          <ul className="text-sm space-y-1 text-green-700">
            <li>
              ✅ Hook useCurrencyInput corrigido para usar Intl.NumberFormat
            </li>
            <li>✅ FormularioReceita usando {...valorInput.inputProps}</li>
            <li>✅ FormularioDespesa usando {...valorInput.inputProps}</li>
            <li>
              ✅ Resumo financeiro corrigido para usar valorInput.numericValue
            </li>
            <li>✅ Comportamento idêntico ao campo Meta do Dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
