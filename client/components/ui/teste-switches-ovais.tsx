import React, { useState } from "react";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function TesteSwitchesOvais() {
  const [checked1, setChecked1] = useState(true);
  const [checked2, setChecked2] = useState(false);
  const [checked3, setChecked3] = useState(true);
  const [checked4, setChecked4] = useState(false);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">⭕ Switches Ovais (Não Redondos)</CardTitle>
        <p className="text-sm text-gray-600">
          Altura: 8px - Visual oval, não circular
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 text-sm">Switches com altura bem reduzida (8px):</h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="oval1" 
                checked={checked1}
                onChange={(e) => setChecked1(e.target.checked)}
              />
              <Label htmlFor="oval1" className="cursor-pointer text-sm">
                Switch nativo LIGADO - altura 8px
              </Label>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="oval2" 
                checked={checked2}
                onChange={(e) => setChecked2(e.target.checked)}
              />
              <Label htmlFor="oval2" className="cursor-pointer text-sm">
                Switch nativo DESLIGADO - altura 8px
              </Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="oval3" 
                checked={checked3} 
                onCheckedChange={setChecked3}
              />
              <Label htmlFor="oval3" className="cursor-pointer text-sm">
                Checkbox Radix LIGADO - altura 8px
              </Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="oval4" 
                checked={checked4} 
                onCheckedChange={setChecked4}
              />
              <Label htmlFor="oval4" className="cursor-pointer text-sm">
                Checkbox Radix DESLIGADO - altura 8px
              </Label>
            </div>
            
            <div className="flex items-center">
              <Switch 
                id="oval5" 
                checked={checked1} 
                onCheckedChange={setChecked1}
              />
              <Label htmlFor="oval5" className="cursor-pointer text-sm">
                Switch puro - altura 8px
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 text-sm">Comparação visual:</h4>
          <div className="space-y-2">
            <div className="flex items-center text-xs">
              <div className="w-7 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span>8px altura (atual) - Formato oval</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-7 h-3 bg-gray-400 rounded-full mr-3"></div>
              <span>12px altura (anterior) - Ainda meio redondo</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-7 h-4 bg-gray-300 rounded-full mr-3"></div>
              <span>16px altura (original) - Muito redondo</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-3 rounded text-xs text-orange-800 border border-orange-200">
          <strong>⚡ Ajuste Drástico Aplicado:</strong><br/>
          • <strong>Altura:</strong> 12px → 8px (bem mais achatado)<br/>
          • <strong>Largura:</strong> 28px (mantida)<br/>
          • <strong>Bolinha:</strong> 10px → 6px (menor)<br/>
          • <strong>Visual:</strong> Formato oval, não circular<br/>
          • <strong>Border-radius:</strong> 8px (proporcional)
        </div>

        <div className="text-xs text-gray-500 text-center">
          Com altura de apenas 8px, os switches agora têm<br/>
          um visual claramente <strong>oval e não circular</strong>.
        </div>
      </CardContent>
    </Card>
  );
}
