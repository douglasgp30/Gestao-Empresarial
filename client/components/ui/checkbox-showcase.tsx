import React, { useState } from "react";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function CheckboxShowcase() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Novo Padrão de Checkboxes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Checkboxes Radix */}
        <div className="space-y-3">
          <h4 className="font-medium">Checkboxes (Radix UI):</h4>
          
          <div className="checkbox-label-container">
            <Checkbox 
              id="cb1" 
              checked={checked1} 
              onCheckedChange={setChecked1} 
            />
            <Label htmlFor="cb1" className="cursor-pointer">
              Checkbox desmarcado
            </Label>
          </div>

          <div className="checkbox-label-container">
            <Checkbox 
              id="cb2" 
              checked={checked2} 
              onCheckedChange={setChecked2} 
            />
            <Label htmlFor="cb2" className="cursor-pointer">
              Checkbox marcado
            </Label>
          </div>

          <div className="checkbox-label-container">
            <Checkbox id="cb3" disabled />
            <Label htmlFor="cb3" className="cursor-not-allowed opacity-50">
              Checkbox desabilitado
            </Label>
          </div>
        </div>

        {/* Switch */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium">Switch:</h4>
          
          <div className="checkbox-label-container">
            <Switch 
              id="sw1" 
              checked={switchValue} 
              onCheckedChange={setSwitchValue} 
            />
            <Label htmlFor="sw1" className="cursor-pointer">
              Toggle Switch
            </Label>
          </div>
        </div>

        {/* Checkbox nativo */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium">Checkbox nativo:</h4>
          
          <div className="checkbox-label-container">
            <input 
              type="checkbox" 
              id="native1" 
              checked={checked3}
              onChange={(e) => setChecked3(e.target.checked)}
            />
            <Label htmlFor="native1" className="cursor-pointer">
              Checkbox HTML nativo
            </Label>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 rounded dark:bg-gray-800">
          ✅ Design baseado na imagem de referência<br/>
          ✅ Funciona em tema claro e escuro<br/>
          ✅ Tamanho padronizado (16px)<br/>
          ✅ Alinhamento correto com textos
        </div>
      </CardContent>
    </Card>
  );
}
