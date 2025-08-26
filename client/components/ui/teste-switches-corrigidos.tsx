import React, { useState } from "react";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function TesteSwitchesCorrigidos() {
  const [native1, setNative1] = useState(true);
  const [native2, setNative2] = useState(false);
  const [radix1, setRadix1] = useState(true);
  const [radix2, setRadix2] = useState(false);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">✅ Switches Corrigidos</CardTitle>
        <p className="text-sm text-gray-600">
          Círculo externo menos redondo (altura: 10px) + bolinha branca mantida
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-3">
            Switches em funcionamento:
          </h4>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="test1"
                checked={native1}
                onChange={(e) => setNative1(e.target.checked)}
              />
              <Label htmlFor="test1" className="cursor-pointer text-sm">
                Switch nativo -{" "}
                {native1 ? "LIGADO (azul)" : "DESLIGADO (cinza)"}
              </Label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="test2"
                checked={native2}
                onChange={(e) => setNative2(e.target.checked)}
              />
              <Label htmlFor="test2" className="cursor-pointer text-sm">
                Switch nativo -{" "}
                {native2 ? "LIGADO (azul)" : "DESLIGADO (cinza)"}
              </Label>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="test3"
                checked={radix1}
                onCheckedChange={setRadix1}
              />
              <Label htmlFor="test3" className="cursor-pointer text-sm">
                Switch Radix - {radix1 ? "LIGADO (azul)" : "DESLIGADO (cinza)"}
              </Label>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="test4"
                checked={radix2}
                onCheckedChange={setRadix2}
              />
              <Label htmlFor="test4" className="cursor-pointer text-sm">
                Switch Radix - {radix2 ? "LIGADO (azul)" : "DESLIGADO (cinza)"}
              </Label>
            </div>

            <div className="flex items-center">
              <Switch
                id="test5"
                checked={native1}
                onCheckedChange={setNative1}
              />
              <Label htmlFor="test5" className="cursor-pointer text-sm">
                Switch puro - {native1 ? "LIGADO (azul)" : "DESLIGADO (cinza)"}
              </Label>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded text-sm text-green-800 border border-green-200">
          <strong>✅ Correção Aplicada:</strong>
          <br />• <strong>Círculo externo:</strong> Altura reduzida para 10px
          (menos redondo)
          <br />• <strong>Bolinha interna:</strong> Mantida em 8px
          (proporcional)
          <br />• <strong>Visual:</strong> Formato oval em vez de circular
          <br />• <strong>Funcionalidade:</strong> 100% preservada
        </div>

        <div className="text-xs text-gray-500 text-center">
          O círculo externo (fundo) agora está menos redondo,
          <br />
          enquanto a bolinha branca interna mantém o tamanho adequado.
        </div>
      </CardContent>
    </Card>
  );
}
