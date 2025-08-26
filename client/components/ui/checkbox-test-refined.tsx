import React, { useState } from "react";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function CheckboxTestRefined() {
  const [nativeChecked, setNativeChecked] = useState(false);
  const [radixChecked, setRadixChecked] = useState(true);
  const [switchChecked, setSwitchChecked] = useState(false);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">✅ Checkboxes Refinados - Teste</CardTitle>
        <p className="text-sm text-gray-600">Tamanho: 18px | Borda: 2px | Arredondamento: 3px</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Checkbox Nativo */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Checkbox HTML Nativo:</h4>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="native-test" 
              checked={nativeChecked}
              onChange={(e) => setNativeChecked(e.target.checked)}
            />
            <Label htmlFor="native-test" className="cursor-pointer text-sm">
              Checkbox nativo com CSS refinado
            </Label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="native-disabled" disabled />
            <Label htmlFor="native-disabled" className="cursor-not-allowed opacity-50 text-sm">
              Checkbox nativo desabilitado
            </Label>
          </div>
        </div>

        {/* Checkbox Radix */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium text-gray-800">Checkbox Radix UI:</h4>
          <div className="flex items-center">
            <Checkbox 
              id="radix-test" 
              checked={radixChecked} 
              onCheckedChange={setRadixChecked} 
            />
            <Label htmlFor="radix-test" className="cursor-pointer text-sm">
              Checkbox Radix com estilo refinado
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox id="radix-disabled" disabled />
            <Label htmlFor="radix-disabled" className="cursor-not-allowed opacity-50 text-sm">
              Checkbox Radix desabilitado
            </Label>
          </div>
        </div>

        {/* Switch */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium text-gray-800">Switch:</h4>
          <div className="flex items-center">
            <Switch 
              id="switch-test" 
              checked={switchChecked} 
              onCheckedChange={setSwitchChecked} 
            />
            <Label htmlFor="switch-test" className="cursor-pointer text-sm">
              Switch proporcional aos checkboxes
            </Label>
          </div>
        </div>

        {/* Comparação visual */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-3">Comparação Visual:</h4>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <input type="checkbox" checked readOnly />
              <span>Nativo ✔</span>
            </div>
            <div className="flex items-center">
              <Checkbox checked disabled />
              <span>Radix ✔</span>
            </div>
            <div className="flex items-center">
              <Switch checked disabled />
              <span>Switch</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded text-xs text-green-800 border border-green-200">
          <strong>✅ Especificações Aplicadas:</strong><br/>
          • Tamanho: 18x18px<br/>
          • Borda: 2px sólida #333<br/>
          • Arredondamento: 3px<br/>
          • Check: ✔ simples e centralizado<br/>
          • Margin-right: 8px do texto<br/>
          • Suporte completo a tema escuro
        </div>
      </CardContent>
    </Card>
  );
}
