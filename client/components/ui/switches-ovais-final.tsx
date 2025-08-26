import React, { useState } from "react";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useOvalSwitches } from "./force-oval-switches";

export function SwitchesOvaisFinais() {
  useOvalSwitches(); // Garante que os switches ficam ovais
  
  const [native1, setNative1] = useState(true);
  const [native2, setNative2] = useState(false);
  const [radix1, setRadix1] = useState(true);
  const [radix2, setRadix2] = useState(false);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">🥚 Switches Ovais - Versão Final</CardTitle>
        <p className="text-sm text-gray-600">
          Altura: 8px (bem achatada) - Visual oval, definitivamente não circular
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Demonstração clara */}
        <div className="bg-white border-2 border-blue-200 p-6 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-4">Switches em ação (altura 8px):</h4>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-blue-600">Estados LIGADOS:</h5>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="on1" 
                    checked={native1}
                    onChange={(e) => setNative1(e.target.checked)}
                  />
                  <Label htmlFor="on1" className="cursor-pointer text-sm">
                    Switch nativo AZUL
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <Checkbox 
                    id="on2" 
                    checked={radix1} 
                    onCheckedChange={setRadix1}
                  />
                  <Label htmlFor="on2" className="cursor-pointer text-sm">
                    Switch Radix AZUL
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-600">Estados DESLIGADOS:</h5>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="off1" 
                    checked={native2}
                    onChange={(e) => setNative2(e.target.checked)}
                  />
                  <Label htmlFor="off1" className="cursor-pointer text-sm">
                    Switch nativo CINZA
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <Checkbox 
                    id="off2" 
                    checked={radix2} 
                    onCheckedChange={setRadix2}
                  />
                  <Label htmlFor="off2" className="cursor-pointer text-sm">
                    Switch Radix CINZA
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparação visual clara */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Comparação de formatos:</h4>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-7 h-2 bg-blue-500 rounded-full mr-4 border-2 border-blue-600"></div>
              <span className="font-medium text-green-700">✅ 8px altura - OVAL (atual)</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-7 h-3 bg-blue-400 rounded-full mr-4"></div>
              <span className="text-orange-600">🔶 12px altura - ainda redondo</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-7 h-4 bg-blue-300 rounded-full mr-4"></div>
              <span className="text-red-600">❌ 16px altura - muito redondo</span>
            </div>
          </div>
        </div>

        {/* Lista de exemplos reais */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Exemplos de uso real:</h4>
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">Ativar notificações</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Modo escuro</span>
              <input type="checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Salvamento automático</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Aceitar cookies</span>
              <input type="checkbox" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800 border border-green-200">
          <strong>🎯 SWITCHES OVAIS IMPLEMENTADOS:</strong><br/>
          • <strong>Altura:</strong> 8px (bem achatada)<br/>
          • <strong>Largura:</strong> 28px<br/>
          • <strong>Formato:</strong> Oval, não circular<br/>
          • <strong>Bolinha:</strong> 6px de diâmetro<br/>
          • <strong>CSS forçado:</strong> Múltiplas camadas de especificidade<br/>
          • <strong>Resultado:</strong> Visual moderno e não redondo
        </div>

        <div className="text-center text-xs text-gray-500">
          Se ainda aparecer redondo, use o botão abaixo para forçar via JavaScript:
        </div>
        
        <button 
          onClick={() => {
            // Força via JavaScript como último recurso
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((cb) => {
              const checkbox = cb as HTMLElement;
              checkbox.style.cssText = `
                width: 28px !important;
                height: 8px !important;
                border-radius: 8px !important;
                background-color: ${(cb as HTMLInputElement).checked ? '#007bff' : '#ddd'} !important;
                border: none !important;
                appearance: none !important;
                position: relative !important;
                margin-right: 8px !important;
                cursor: pointer !important;
              `;
            });
            alert('Switches forçados para formato oval via JavaScript!');
          }}
          className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-red-800 text-sm font-medium"
        >
          🚨 FORÇAR SWITCHES OVAIS VIA JAVASCRIPT
        </button>
      </CardContent>
    </Card>
  );
}
