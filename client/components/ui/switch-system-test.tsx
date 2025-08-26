import React, { useState } from "react";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function SwitchSystemTest() {
  const [nativeState1, setNativeState1] = useState(false);
  const [nativeState2, setNativeState2] = useState(true);
  const [radixState1, setRadixState1] = useState(false);
  const [radixState2, setRadixState2] = useState(true);
  const [switchState1, setSwitchState1] = useState(false);
  const [switchState2, setSwitchState2] = useState(true);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">🔄 Sistema de Switches Modernos</CardTitle>
        <p className="text-sm text-gray-600">
          Switches modernos com altura reduzida para visual mais proporcional
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Comparação visual */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Comparação Visual:</h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-600">Switches Desligados:</h5>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="off-native" 
                  checked={nativeState1}
                  onChange={(e) => setNativeState1(e.target.checked)}
                />
                <Label htmlFor="off-native" className="cursor-pointer text-sm">
                  Checkbox nativo
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="off-radix" 
                  checked={radixState1} 
                  onCheckedChange={setRadixState1}
                />
                <Label htmlFor="off-radix" className="cursor-pointer text-sm">
                  Checkbox Radix
                </Label>
              </div>
              <div className="flex items-center">
                <Switch 
                  id="off-switch" 
                  checked={switchState1} 
                  onCheckedChange={setSwitchState1}
                />
                <Label htmlFor="off-switch" className="cursor-pointer text-sm">
                  Switch puro
                </Label>
              </div>
            </div>
            
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-600">Switches Ligados:</h5>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="on-native" 
                  checked={nativeState2}
                  onChange={(e) => setNativeState2(e.target.checked)}
                />
                <Label htmlFor="on-native" className="cursor-pointer text-sm">
                  Checkbox nativo ✓
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="on-radix" 
                  checked={radixState2} 
                  onCheckedChange={setRadixState2}
                />
                <Label htmlFor="on-radix" className="cursor-pointer text-sm">
                  Checkbox Radix ✓
                </Label>
              </div>
              <div className="flex items-center">
                <Switch 
                  id="on-switch" 
                  checked={switchState2} 
                  onCheckedChange={setSwitchState2}
                />
                <Label htmlFor="on-switch" className="cursor-pointer text-sm">
                  Switch puro ✓
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Exemplo de formulário */}
        <div className="space-y-4 border-t pt-6">
          <h4 className="font-medium text-gray-800">Exemplo de Formulário:</h4>
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <input type="checkbox" id="form1" defaultChecked />
              <Label htmlFor="form1" className="cursor-pointer text-sm">
                Receber notificações por email
              </Label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="form2" />
              <Label htmlFor="form2" className="cursor-pointer text-sm">
                Aceitar termos e condições
              </Label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="form3" defaultChecked />
              <Label htmlFor="form3" className="cursor-pointer text-sm">
                Manter login ativo
              </Label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="form4" />
              <Label htmlFor="form4" className="cursor-pointer text-sm">
                Participar de pesquisas de satisfação
              </Label>
            </div>
          </div>
        </div>

        {/* Lista de configurações */}
        <div className="space-y-4 border-t pt-6">
          <h4 className="font-medium text-gray-800">Configurações do Sistema:</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div>
                <div className="font-medium text-sm">Modo escuro</div>
                <div className="text-xs text-gray-500">Alterar tema da interface</div>
              </div>
              <Checkbox defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div>
                <div className="font-medium text-sm">Notificações push</div>
                <div className="text-xs text-gray-500">Receber alertas no navegador</div>
              </div>
              <Checkbox />
            </div>
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div>
                <div className="font-medium text-sm">Salvamento automático</div>
                <div className="text-xs text-gray-500">Salvar alterações automaticamente</div>
              </div>
              <Checkbox defaultChecked />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-200">
          <strong>✅ Especificações Implementadas:</strong><br/>
          • <strong>Tamanho:</strong> 28x16px (pequeno e proporcional)<br/>
          • <strong>Design:</strong> Totalmente arredondado<br/>
          • <strong>Desligado:</strong> Fundo cinza (#ddd) + bolinha escura (#666)<br/>
          • <strong>Ligado:</strong> Fundo azul (#007bff) + bolinha branca<br/>
          • <strong>Transição:</strong> Suave de 0.2s<br/>
          • <strong>Funcionalidade:</strong> Mantida 100% (salva no banco igual antes)<br/>
          • <strong>Compatibilidade:</strong> Funciona em todo o sistema
        </div>
      </CardContent>
    </Card>
  );
}
