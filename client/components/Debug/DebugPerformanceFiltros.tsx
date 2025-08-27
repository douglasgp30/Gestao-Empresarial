import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function DebugPerformanceFiltros() {
  const [renderCount, setRenderCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [performanceData, setPerformanceData] = useState<{
    componentRenders: number;
    lastRenderTime: number;
    averageRenderTime: number;
  }>({
    componentRenders: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  // Incrementar contador de renders
  useEffect(() => {
    const renderStart = performance.now();
    setRenderCount((prev) => prev + 1);

    const renderTime = performance.now() - renderStart;
    setPerformanceData((prev) => ({
      componentRenders: prev.componentRenders + 1,
      lastRenderTime: renderTime,
      averageRenderTime:
        prev.averageRenderTime === 0
          ? renderTime
          : (prev.averageRenderTime + renderTime) / 2,
    }));
  });

  const addLog = (message: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 14),
    ]);
  };

  const testFilterPerformance = () => {
    const start = performance.now();

    // Simular operações que podem causar travamento
    const simulateFilterChange = () => {
      // Simular múltiplas atualizações de estado
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          addLog(`Simulação ${i + 1}/10 de mudança de filtro`);
        }, i * 10);
      }
    };

    simulateFilterChange();

    const end = performance.now();
    addLog(`Teste de performance concluído em ${(end - start).toFixed(2)}ms`);
  };

  const monitorMouseEvents = () => {
    let mouseEventCount = 0;
    const startTime = performance.now();

    const handleMouseMove = () => {
      mouseEventCount++;
    };

    addLog("Iniciando monitoramento de eventos de mouse por 5 segundos...");
    document.addEventListener("mousemove", handleMouseMove);

    setTimeout(() => {
      document.removeEventListener("mousemove", handleMouseMove);
      const endTime = performance.now();
      const duration = endTime - startTime;
      addLog(
        `Eventos de mouse: ${mouseEventCount} em ${duration.toFixed(0)}ms`,
      );
      addLog(
        `Taxa: ${(mouseEventCount / (duration / 1000)).toFixed(1)} eventos/seg`,
      );
    }, 5000);
  };

  const checkMemoryUsage = () => {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      addLog(
        `Memória JS usada: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      );
      addLog(
        `Memória JS total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      );
      addLog(
        `Limite de memória: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      );
    } else {
      addLog("Informações de memória não disponíveis neste navegador");
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Debug - Performance dos Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métricas de Performance */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {renderCount}
            </div>
            <div className="text-xs text-blue-600">
              Renders deste componente
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">
              {performanceData.lastRenderTime.toFixed(2)}ms
            </div>
            <div className="text-xs text-green-600">Último render</div>
          </div>
          <div className="p-3 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {performanceData.averageRenderTime.toFixed(2)}ms
            </div>
            <div className="text-xs text-purple-600">Média de render</div>
          </div>
        </div>

        {/* Controles de Teste */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testFilterPerformance} variant="outline" size="sm">
            Testar Filtros
          </Button>
          <Button onClick={monitorMouseEvents} variant="outline" size="sm">
            Monitor Mouse (5s)
          </Button>
          <Button onClick={checkMemoryUsage} variant="outline" size="sm">
            Verificar Memória
          </Button>
          <Button onClick={() => setLogs([])} variant="outline" size="sm">
            Limpar Logs
          </Button>
        </div>

        {/* Logs de Performance */}
        <div>
          <h3 className="font-medium mb-2">Logs de Performance:</h3>
          <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum log ainda</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="text-xs font-mono text-gray-700 mb-1"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instruções de Teste */}
        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
          <h4 className="font-medium text-yellow-800">Como Testar:</h4>
          <ol className="text-sm text-yellow-700 mt-1 space-y-1">
            <li>1. Abra os filtros avançados no Caixa</li>
            <li>2. Mova o mouse entre os campos de filtro</li>
            <li>3. Execute "Monitor Mouse (5s)" e mova o mouse rapidamente</li>
            <li>4. Verifique se há travamentos ou lentidão</li>
            <li>5. Compare os números antes e depois das otimizações</li>
          </ol>
        </div>

        {/* Melhorias Implementadas */}
        <div className="p-3 bg-green-50 rounded border border-green-200">
          <h4 className="font-medium text-green-800">Otimizações Aplicadas:</h4>
          <ul className="text-sm text-green-700 mt-1 space-y-1">
            <li>✅ Handlers memoizados para todos os campos de filtro</li>
            <li>✅ Event listeners otimizados com passive: true</li>
            <li>✅ Remoção de useMemo desnecessário</li>
            <li>✅ Handlers específicos para botões de período</li>
            <li>✅ Redução de funções inline que causavam re-renders</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
