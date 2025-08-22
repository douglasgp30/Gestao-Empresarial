import React from "react";
import { useCurrencyInput } from "../../hooks/use-currency-input";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";

export function TesteCurrencyInput() {
  const valorInput = useCurrencyInput();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Teste - Hook Moeda (Padrão Meta)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="teste-valor">Digite apenas números (ex: 12345)</Label>
          <Input
            id="teste-valor"
            {...valorInput.inputProps}
            className="text-lg font-medium"
          />
        </div>
        
        <div className="p-3 bg-gray-50 rounded text-sm space-y-1">
          <div><strong>Display:</strong> {valorInput.displayValue}</div>
          <div><strong>Valor numérico:</strong> {valorInput.numericValue}</div>
          <div><strong>Exemplo esperado:</strong></div>
          <div className="text-xs text-gray-600">
            • Digite "12345" → deve mostrar "R$ 123,45"<br/>
            • Digite "100" → deve mostrar "R$ 1,00"<br/>
            • Digite "50000" → deve mostrar "R$ 500,00"
          </div>
        </div>

        <div className="text-xs text-blue-600">
          ✅ Este é o mesmo padrão usado na Meta do Dashboard
        </div>
      </CardContent>
    </Card>
  );
}
