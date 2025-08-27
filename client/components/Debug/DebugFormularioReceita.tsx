import React, { useState } from "react";
import { useCurrencyInput } from "../../hooks/use-currency-input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function DebugFormularioReceita() {
  const valorInput = useCurrencyInput();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 9)]);
  };

  const testValidation = () => {
    addLog(`Testando validação do valor: ${valorInput.numericValue}`);
    
    // Simular validação similar ao formulário
    const camposObrigatorios = {
      valor: valorInput.numericValue,
      categoria: "Teste",
      descricao: "Teste",
    };

    const camposFaltando = Object.entries(camposObrigatorios)
      .filter(([key, value]) => {
        if (key === 'valor') {
          const invalid = !value || value <= 0;
          addLog(`Valor ${value} é inválido: ${invalid}`);
          return invalid;
        }
        const invalid = !value || (typeof value === 'string' && value.trim() === "");
        addLog(`Campo ${key} com valor "${value}" é inválido: ${invalid}`);
        return invalid;
      })
      .map(([key]) => key);

    addLog(`Campos faltando: ${camposFaltando.join(", ") || "nenhum"}`);
  };

  const testInput = () => {
    addLog("Testando input de moeda:");
    addLog(`Display Value: "${valorInput.displayValue}"`);
    addLog(`Numeric Value: ${valorInput.numericValue}`);
    addLog(`Type of Numeric Value: ${typeof valorInput.numericValue}`);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Debug - Formulário de Receita</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="valor-debug">Teste do Campo Valor</Label>
          <Input
            id="valor-debug"
            {...valorInput.inputProps}
            className="mt-1"
          />
          <div className="text-sm text-gray-600 mt-1">
            Display: "{valorInput.displayValue}" | Numeric: {valorInput.numericValue} | Type: {typeof valorInput.numericValue}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={testInput} variant="outline" size="sm">
            Testar Input
          </Button>
          <Button onClick={testValidation} variant="outline" size="sm">
            Testar Validação
          </Button>
          <Button onClick={() => setLogs([])} variant="outline" size="sm">
            Limpar Logs
          </Button>
        </div>

        <div>
          <h3 className="font-medium mb-2">Logs de Debug:</h3>
          <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum log ainda</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-700 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
          <h4 className="font-medium text-yellow-800">Instruções de Teste:</h4>
          <ol className="text-sm text-yellow-700 mt-1 space-y-1">
            <li>1. Digite um valor no campo acima (ex: "1000")</li>
            <li>2. Clique em "Testar Input" para ver os valores internos</li>
            <li>3. Clique em "Testar Validação" para simular a validação do formulário</li>
            <li>4. Verifique se há discrepâncias nos logs</li>
          </ol>
        </div>

        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-medium text-blue-800">Problemas Resolvidos:</h4>
          <ul className="text-sm text-blue-700 mt-1 space-y-1">
            <li>✅ Removido pattern conflitante do input de moeda</li>
            <li>✅ Otimizado hook useEnterAsTab para melhor performance</li>
            <li>✅ Memoização de técnico selecionado para reduzir re-renders</li>
            <li>✅ Validação de valor numérico mais específica</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
