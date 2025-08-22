import { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function DiagnosticoLoop() {
  const renderCount = useRef(0);
  const mountCount = useRef(0);

  useEffect(() => {
    mountCount.current += 1;
    console.log(
      `🔄 [DIAGNÓSTICO] DiagnosticoLoop montado ${mountCount.current} vezes`,
    );

    return () => {
      console.log(`🔄 [DIAGNÓSTICO] DiagnosticoLoop desmontado`);
    };
  }, []);

  renderCount.current += 1;
  console.log(
    `🔄 [DIAGNÓSTICO] DiagnosticoLoop renderizado ${renderCount.current} vezes`,
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔄 Diagnóstico de Loop Infinito</CardTitle>
        <CardDescription>
          Componente para detectar re-renders e re-mounts excessivos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h4 className="font-medium mb-2">Status:</h4>
          <p>
            <strong>Renders:</strong> {renderCount.current}
          </p>
          <p>
            <strong>Mounts:</strong> {mountCount.current}
          </p>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            <strong>O que observar:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Se "Renders" aumenta constantemente = re-render infinito</li>
            <li>
              Se "Mounts" aumenta constantemente = componente sendo remontado
            </li>
            <li>Verifique os logs do console para padrões</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <p className="text-sm">
            <strong>Ação:</strong> Mantenha este componente aberto e observe os
            números. Se aumentarem rapidamente, há loop infinito.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
