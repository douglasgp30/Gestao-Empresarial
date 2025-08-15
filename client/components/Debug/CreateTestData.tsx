import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "../ui/use-toast";

export function CreateTestData() {
  const [isCreating, setIsCreating] = useState(false);
  const [data, setData] = useState<any>(null);

  const createTestData = async () => {
    setIsCreating(true);

    try {
      console.log("🚀 Criando dados de teste...");

      // 1. Criar dados via API seed
      const seedResponse = await fetch("/api/seed/unified-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const seedResult = await seedResponse.json();
      console.log("📝 Seed result:", seedResult);

      // 2. Verificar dados criados
      const verifyResponse = await fetch("/api/descricoes-e-categorias");
      const verifyResult = await verifyResponse.json();
      console.log("🔍 Dados verificados:", verifyResult);

      setData(verifyResult);

      toast({
        title: "Sucesso!",
        description: `Dados criados: ${verifyResult.data?.length || 0} itens`,
        variant: "default",
      });
    } catch (error) {
      console.error("❌ Erro:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar dados de teste",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const checkExistingData = async () => {
    try {
      const response = await fetch("/api/descricoes-e-categorias");
      const result = await response.json();
      console.log("📊 Dados existentes:", result);
      setData(result);

      toast({
        title: "Dados verificados",
        description: `Encontrados ${result.data?.length || 0} itens`,
        variant: "default",
      });
    } catch (error) {
      console.error("❌ Erro ao verificar:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🧪 Debug - Criar Dados de Teste</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={createTestData}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? "Criando..." : "🚀 Criar Dados de Teste"}
          </Button>

          <Button onClick={checkExistingData} variant="outline">
            🔍 Verificar Dados Existentes
          </Button>
        </div>

        {data && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">📊 Resultado:</h3>
            <div className="space-y-2">
              <p>
                <strong>Total de itens:</strong> {data.data?.length || 0}
              </p>

              {data.data && data.data.length > 0 && (
                <>
                  <div>
                    <strong>📂 Categorias:</strong>
                    <ul className="ml-4 list-disc">
                      {data.data
                        .filter((item: any) => item.tipoItem === "categoria")
                        .map((cat: any) => (
                          <li key={cat.id}>
                            {cat.nome} (ID: {cat.id})
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <strong>📝 Descrições:</strong>
                    <ul className="ml-4 list-disc">
                      {data.data
                        .filter((item: any) => item.tipoItem === "descricao")
                        .map((desc: any) => (
                          <li key={desc.id}>
                            {desc.nome} ({desc.categoria}) - ID: {desc.id}
                          </li>
                        ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">
                🔍 Dados completos (JSON)
              </summary>
              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
