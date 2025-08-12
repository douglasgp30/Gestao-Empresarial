import React, { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";

export function ApiTest() {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoint = async (endpoint: string, name: string) => {
    setIsLoading(true);
    try {
      console.log(`Testando ${endpoint}...`);
      const response = await fetch(endpoint);

      const result = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: null as any,
        error: null as any,
      };

      if (response.ok) {
        try {
          result.data = await response.json();
        } catch (e) {
          result.data = await response.text();
        }
      } else {
        try {
          result.error = await response.json();
        } catch (e) {
          result.error = await response.text();
        }
      }

      setTestResults((prev) => ({
        ...prev,
        [name]: result,
      }));
    } catch (error) {
      console.error(`Erro ao testar ${endpoint}:`, error);
      setTestResults((prev) => ({
        ...prev,
        [name]: {
          status: 0,
          statusText: "Failed to fetch",
          ok: false,
          error: error.message,
          data: null,
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    await testEndpoint("/api/ping", "ping");
    await testEndpoint("/api/debug/db-status", "db-status");
    await testEndpoint("/api/campanhas", "campanhas");
    await testEndpoint("/api/caixa/lancamentos", "lancamentos");
  };

  const seedBasicData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/debug/seed-basic-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      console.log("Seed result:", result);

      // Executar testes após seed
      await runAllTests();
    } catch (error) {
      console.error("Erro ao executar seed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Teste de Conectividade da API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={isLoading} className="flex-1">
            {isLoading ? "Testando..." : "Executar Testes"}
          </Button>

          <Button
            onClick={seedBasicData}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? "Criando..." : "Criar Dados Básicos"}
          </Button>
        </div>

        <div className="space-y-2">
          {Object.entries(testResults).map(([name, result]: [string, any]) => (
            <div key={name} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-sm">{name}</strong>
                <Badge variant={result.ok ? "default" : "destructive"}>
                  {result.status} {result.statusText}
                </Badge>
              </div>

              {result.ok && result.data && (
                <div className="text-xs bg-green-50 p-2 rounded">
                  <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              )}

              {!result.ok && result.error && (
                <div className="text-xs bg-red-50 p-2 rounded text-red-700">
                  <pre>{JSON.stringify(result.error, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
