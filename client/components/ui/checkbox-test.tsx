import React, { useState } from "react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function CheckboxTest() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Teste dos Novos Checkboxes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="test1"
            checked={checked1}
            onCheckedChange={(checked) => setChecked1(!!checked)}
          />
          <Label htmlFor="test1" className="cursor-pointer">
            Checkbox não marcado
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="test2"
            checked={checked2}
            onCheckedChange={(checked) => setChecked2(!!checked)}
          />
          <Label htmlFor="test2" className="cursor-pointer">
            Checkbox marcado
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="test3"
            checked={checked3}
            onCheckedChange={(checked) => setChecked3(!!checked)}
          />
          <Label htmlFor="test3" className="cursor-pointer">
            Este é um texto mais longo para testar o alinhamento
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="test4" disabled />
          <Label htmlFor="test4" className="cursor-not-allowed opacity-50">
            Checkbox desabilitado
          </Label>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Input nativo (se ainda existir):</h4>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="native" />
            <label htmlFor="native" className="cursor-pointer">
              Checkbox nativo
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
