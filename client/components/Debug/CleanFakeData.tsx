import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "../ui/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";

export function CleanFakeData() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResults, setLastResults] = useState<any>(null);

  const cleanFakeData = async () => {
    // Evitar chamadas duplicadas
    if (isLoading) {
      console.log("Limpeza já em andamento, ignorando nova chamada");
      return;
    }

    setIsLoading(true);
    try {
      // Criar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

      const response = await fetch("/api/clean-fake-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response error:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        setLastResults(data.data);

        const totalRemovidos = data.data?.removidos
          ? Object.values(data.data.removidos).reduce((a: any, b: any) => a + b, 0)
          : 0;

        toast({
          title: "✅ Limpeza Concluída!",
          description: `${totalRemovidos} registros fictícios removidos. Sistema agora contém apenas dados reais.`,
          variant: "default",
        });
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao limpar dados fictícios:", error);

      let errorMessage = "Erro desconhecido ao limpar dados fictícios";

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Operação cancelada por timeout (30s). Tente novamente.";
        } else if (error.message.includes('body stream already read')) {
          errorMessage = "Erro de comunicação. Aguarde um momento e tente novamente.";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Trash2 className="h-5 w-5" />
          Limpeza Completa de Dados Fictícios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium">Esta ação irá remover TODOS os dados fictícios:</p>
            <ul className="mt-1 list-disc list-inside text-xs space-y-1">
              <li>Funcionários, clientes e fornecedores de teste</li>
              <li>Lançamentos de caixa com valores redondos suspeitos</li>
              <li>Contas a pagar/receber fictícias</li>
              <li>Agendamentos com dados de teste</li>
              <li>Descrições, campanhas e setores de exemplo</li>
            </ul>
            <p className="mt-2 font-medium">Apenas dados reais lançados por você permanecerão no sistema.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={async () => {
              try {
                const response = await fetch("/api/ping");
                const data = await response.json();
                toast({
                  title: "✅ Conectividade OK",
                  description: `Servidor respondeu: ${data.message}`,
                  variant: "default",
                });
              } catch (error) {
                toast({
                  title: "❌ Erro de Conectividade",
                  description: "Não foi possível conectar com o servidor",
                  variant: "destructive",
                });
              }
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            🔍 Testar Conectividade
          </Button>

          <Button
            onClick={cleanFakeData}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            {isLoading ? "Limpando Dados..." : "🗑️ Executar Limpeza Completa"}
          </Button>
        </div>

        {lastResults && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Última Limpeza:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-red-600">Removidos:</span>
                <ul className="mt-1 space-y-1">
                  {Object.entries(lastResults.removidos).map(([tipo, count]) => (
                    <li key={tipo}>{tipo}: {count as number}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-medium text-green-600">Restantes:</span>
                <ul className="mt-1 space-y-1">
                  {Object.entries(lastResults.restantes).map(([tipo, count]) => (
                    <li key={tipo}>{tipo}: {count as number}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
