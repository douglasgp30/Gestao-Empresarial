import React, { useState } from "react";
import { Button } from "../ui/button";

export default function TestApiEndpoints() {
  const [results, setResults] = useState<Record<string, any>>({});

  const testEndpoint = async (name: string, url: string) => {
    try {
      console.log(`[TestAPI] Testando ${name}:`, url);
      const response = await fetch(url);
      const data = await response.json();

      setResults((prev) => ({
        ...prev,
        [name]: {
          status: response.status,
          data: data,
          count: Array.isArray(data.data) ? data.data.length : "N/A",
        },
      }));

      console.log(`[TestAPI] ${name} resultado:`, data);
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: {
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      }));
    }
  };

  const endpoints = [
    {
      name: "Todas descrições/categorias",
      url: "/api/descricoes-e-categorias",
    },
    {
      name: "Categorias receita",
      url: "/api/descricoes-e-categorias/categorias?tipo=receita",
    },
    {
      name: "Categorias despesa",
      url: "/api/descricoes-e-categorias/categorias?tipo=despesa",
    },
    {
      name: "Descrições receita",
      url: "/api/descricoes-e-categorias/descricoes?tipo=receita",
    },
    {
      name: "Descrições despesa",
      url: "/api/descricoes-e-categorias/descricoes?tipo=despesa",
    },
  ];

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="font-semibold mb-4">Debug: Testar Endpoints da API</h3>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {endpoints.map((endpoint) => (
          <Button
            key={endpoint.name}
            variant="outline"
            size="sm"
            onClick={() => testEndpoint(endpoint.name, endpoint.url)}
          >
            {endpoint.name}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => {
          endpoints.forEach((endpoint) =>
            testEndpoint(endpoint.name, endpoint.url),
          );
        }}
        className="w-full mb-4"
      >
        Testar Todos
      </Button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Resultados:</h4>
          {Object.entries(results).map(([name, result]) => (
            <div key={name} className="text-sm p-2 bg-white border rounded">
              <div className="font-medium">{name}</div>
              {result.error ? (
                <div className="text-red-600">❌ {result.error}</div>
              ) : (
                <div>
                  <div className="text-green-600">
                    ✅ Status: {result.status}
                  </div>
                  <div>📊 Count: {result.count}</div>
                  <details className="mt-1">
                    <summary className="cursor-pointer text-gray-600">
                      Ver dados
                    </summary>
                    <pre className="text-xs mt-1 bg-gray-50 p-1 rounded overflow-auto max-h-20">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
