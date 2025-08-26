import React, { useState } from "react";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function CheckboxForcedTest() {
  const [nativeChecked, setNativeChecked] = useState(false);
  const [radixChecked, setRadixChecked] = useState(true);
  const [switchChecked, setSwitchChecked] = useState(false);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">🔧 Checkboxes com CSS Forçado</CardTitle>
        <p className="text-sm text-gray-600">Tamanho: 16px | Borda: 1.5px | Check verde: #0f5132</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Teste lado a lado */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Comparação Visual (16px):</h4>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="native-small" 
                checked={nativeChecked}
                onChange={(e) => setNativeChecked(e.target.checked)}
              />
              <Label htmlFor="native-small" className="cursor-pointer">
                Nativo forçado
              </Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="radix-small" 
                checked={radixChecked} 
                onCheckedChange={setRadixChecked} 
              />
              <Label htmlFor="radix-small" className="cursor-pointer">
                Radix forçado
              </Label>
            </div>
            
            <div className="flex items-center">
              <Switch 
                id="switch-small" 
                checked={switchChecked} 
                onCheckedChange={setSwitchChecked} 
              />
              <Label htmlFor="switch-small" className="cursor-pointer">
                Switch
              </Label>
            </div>
          </div>
        </div>

        {/* Lista de exemplos */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium text-gray-800">Lista de Opções:</h4>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" id="opt1" defaultChecked />
              <Label htmlFor="opt1" className="cursor-pointer text-sm">
                Opção 1 - Checkbox nativo marcado
              </Label>
            </div>
            
            <div className="flex items-center">
              <input type="checkbox" id="opt2" />
              <Label htmlFor="opt2" className="cursor-pointer text-sm">
                Opção 2 - Checkbox nativo desmarcado
              </Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox id="opt3" defaultChecked />
              <Label htmlFor="opt3" className="cursor-pointer text-sm">
                Opção 3 - Checkbox Radix marcado
              </Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox id="opt4" />
              <Label htmlFor="opt4" className="cursor-pointer text-sm">
                Opção 4 - Checkbox Radix desmarcado
              </Label>
            </div>
            
            <div className="flex items-center">
              <Switch id="opt5" defaultChecked />
              <Label htmlFor="opt5" className="cursor-pointer text-sm">
                Opção 5 - Switch ativo
              </Label>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 border border-blue-200">
          <strong>🔧 CSS Forçado Aplicado:</strong><br/>
          • Tamanho: 16x16px com !important<br/>
          • Borda: 1.5px #333 com !important<br/>
          • Check: ✔ verde discreto (#0f5132)<br/>
          • Margin: 6px à direita<br/>
          • Sobrescreve qualquer framework<br/>
          • Alinhamento perfeito com texto
        </div>
        
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          Se ainda não funcionar, pode ser que o framework tenha especificidade CSS muito alta.
          Neste caso, seria necessário usar estilos inline ou styled-components.
        </div>
      </CardContent>
    </Card>
  );
}
