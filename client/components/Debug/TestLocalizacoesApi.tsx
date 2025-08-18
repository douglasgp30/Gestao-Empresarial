import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { localizacoesGeograficasApi } from "../../lib/apiService";
import { toast } from "sonner";
import ModalLocalizacoesSimples from "../Caixa/ModalLocalizacoesSimples";

export default function TestLocalizacoesApi() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const testApi = async (operation: string) => {
    setLoading(true);
    try {
      let result;

      switch (operation) {
        case "listar":
          result = await localizacoesGeograficasApi.listar();
          break;
        case "listarCidades":
          result = await localizacoesGeograficasApi.listarCidades();
          break;
        case "listarSetores":
          result = await localizacoesGeograficasApi.listarSetores();
          break;
        case "criarCidade":
          result = await localizacoesGeograficasApi.criar({
            nome: `Cidade Teste ${Date.now()}`,
            tipoItem: "cidade",
            ativo: true,
          });
          break;
        case "criarSetor":
          // Primeiro verificar se existe alguma cidade
          const cidadesResponse =
            await localizacoesGeograficasApi.listarCidades();
          if (cidadesResponse.data && cidadesResponse.data.length > 0) {
            result = await localizacoesGeograficasApi.criar({
              nome: `Setor Teste ${Date.now()}`,
              tipoItem: "setor",
              cidade: cidadesResponse.data[0].nome,
              ativo: true,
            });
          } else {
            throw new Error("Nenhuma cidade encontrada para criar setor");
          }
          break;
        default:
          throw new Error("Operação não implementada");
      }

      setResults((prev) => [
        { operation, result: result.data || result, timestamp: new Date() },
        ...prev.slice(0, 9), // Manter apenas os últimos 10 resultados
      ]);

      toast.success(`${operation} executado com sucesso!`);
    } catch (error: any) {
      console.error(`Erro em ${operation}:`, error);
      const errorMessage =
        error.response?.data?.error || error.message || "Erro desconhecido";
      toast.error(`Erro em ${operation}: ${errorMessage}`);

      setResults((prev) => [
        { operation, error: errorMessage, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de API - Localizações Geográficas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Button onClick={() => testApi("listar")} disabled={loading}>
            Listar Todas
          </Button>
          <Button onClick={() => testApi("listarCidades")} disabled={loading}>
            Listar Cidades
          </Button>
          <Button onClick={() => testApi("listarSetores")} disabled={loading}>
            Listar Setores
          </Button>
          <Button onClick={() => testApi("criarCidade")} disabled={loading}>
            Criar Cidade
          </Button>
          <Button onClick={() => testApi("criarSetor")} disabled={loading}>
            Criar Setor
          </Button>
          <Button onClick={() => setModalOpen(true)} disabled={loading}>
            Abrir Modal
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Resultados dos Testes:</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-blue-600">
                      {result.operation}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  {result.error ? (
                    <div className="text-red-600 text-sm">{result.error}</div>
                  ) : (
                    <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <ModalLocalizacoesSimples
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </CardContent>
    </Card>
  );
}
