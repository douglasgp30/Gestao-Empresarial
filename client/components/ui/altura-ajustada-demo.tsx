import React, { useState } from "react";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function AlturaAjustadaDemo() {
  const [checked1, setChecked1] = useState(true);
  const [checked2, setChecked2] = useState(false);
  const [checked3, setChecked3] = useState(true);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">📏 Altura Ajustada dos Switches</CardTitle>
        <p className="text-sm text-gray-600">
          Altura reduzida de 16px para 12px - mais proporcional à bolinha
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Switches com altura ajustada:</h4>
          
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="native-adj" 
                checked={checked1}
                onChange={(e) => setChecked1(e.target.checked)}
              />
              <Label htmlFor="native-adj" className="cursor-pointer text-sm">
                Switch nativo - altura 12px
              </Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="radix-adj" 
                checked={checked2} 
                onCheckedChange={setChecked2}
              />
              <Label htmlFor="radix-adj" className="cursor-pointer text-sm">
                Switch Radix - altura 12px
              </Label>
            </div>
            
            <div className="flex items-center">
              <Switch 
                id="switch-adj" 
                checked={checked3} 
                onCheckedChange={setChecked3}
              />
              <Label htmlFor="switch-adj" className="cursor-pointer text-sm">
                Switch puro - altura 12px
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Comparação de tamanhos:</h4>
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-7 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>12px altura (atual)</span>
            </div>
            <div className="flex items-center">
              <div className="w-7 h-4 bg-gray-300 rounded-full mr-2"></div>
              <span>16px altura (antes)</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded text-xs text-green-800 border border-green-200">
          <strong>✅ Ajuste Realizado:</strong><br/>
          • <strong>Altura:</strong> 16px → 12px<br/>
          • <strong>Largura:</strong> 28px (mantida)<br/>
          • <strong>Bolinha:</strong> 12px → 10px<br/>
          • <strong>Visual:</strong> Menos "circular", mais proporcional<br/>
          • <strong>Border-radius:</strong> 16px → 12px (proporcional)
        </div>

        <div className="text-xs text-gray-500 text-center">
          Agora os switches têm altura igual ao tamanho da bolinha,<br/>
          criando um visual mais equilibrado e menos "redondo".
        </div>
      </CardContent>
    </Card>
  );
}
