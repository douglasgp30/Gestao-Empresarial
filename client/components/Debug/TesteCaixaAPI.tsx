import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface TesteResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export function TesteCaixaAPI() {
  const [resultados, setResultados] = useState<{ [key: string]: TesteResult }>({});
  const [testando, setTestando] = useState<{ [key: string]: boolean }>({});

  const executarTeste = async (nome: string, url: string, options?: RequestInit) => {
    setTestando(prev => ({ ...prev, [nome]: true }));
    
    try {
      console.log(`🧪 [Teste] ${nome} - ${url}`);
      const response = await fetch(url, options);
      
      console.log(`🧪 [Teste] ${nome} - Status:`, response.status);
      console.log(`🧪 [Teste] ${nome} - Headers:`, [...response.headers.entries()]);
      
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      setResultados(prev => ({
        ...prev,
        [nome]: {
          success: response.ok,
          message: response.ok ? "Sucesso" : `Erro ${response.status}`,
          data: responseData
        }
      }));
      
    } catch (error) {
      console.error(`🧪 [Teste] ${nome} - Erro:`, error);
      setResultados(prev => ({
        ...prev,
        [nome]: {
          success: false,
          message: `Erro: ${error.message}`,
          error: error
        }
      }));
    } finally {
      setTestando(prev => ({ ...prev, [nome]: false }));
    }
  };

  const testes = [
    {
      nome: "Health Check",
      url: "/api/health",
      descricao: "Teste básico de conectividade"
    },
    {
      nome: "Teste Caixa",
      url: "/api/caixa/test",
      descricao: "Teste específico da rota do caixa"
    },
    {
      nome: "Listar Lançamentos",
      url: "/api/caixa",
      descricao: "Buscar lançamentos (rota principal)"
    },
    {
      nome: "Listar Lançamentos (alternativa)",
      url: "/api/caixa/lancamentos",
      descricao: "Buscar lançamentos (rota alternativa)"
    },
    {
      nome: "Totais do Caixa",
      url: "/api/caixa/totais",
      descricao: "Buscar totais do caixa"
    }
  ];

  const executarTodosTestes = async () => {
    for (const teste of testes) {
      await executarTeste(teste.nome, teste.url);
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Teste da API do Caixa
        </CardTitle>
        <CardDescription>
          Debug das rotas da API para identificar problemas de conectividade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={executarTodosTestes} variant="outline">
            Executar Todos os Testes
          </Button>
          <Button 
            onClick={() => setResultados({})} 
            variant="ghost"
            size="sm"
          >
            Limpar Resultados
          </Button>
        </div>

        <div className="grid gap-4">
          {testes.map((teste) => (
            <div key={teste.nome} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">{teste.nome}</h4>
                  <p className="text-sm text-muted-foreground">{teste.descricao}</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{teste.url}</code>
                </div>
                <div className="flex items-center gap-2">
                  {resultados[teste.nome] && (
                    <Badge variant={resultados[teste.nome].success ? "default" : "destructive"}>
                      {resultados[teste.nome].success ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {resultados[teste.nome].message}
                    </Badge>
                  )}
                  <Button
                    onClick={() => executarTeste(teste.nome, teste.url)}
                    disabled={testando[teste.nome]}
                    size="sm"
                  >
                    {testando[teste.nome] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Testar"
                    )}
                  </Button>
                </div>
              </div>

              {resultados[teste.nome] && (
                <div className="mt-3 p-3 bg-muted rounded">
                  <h5 className="font-medium mb-2">Resultado:</h5>
                  <pre className="text-xs overflow-auto max-h-32">
                    {JSON.stringify(resultados[teste.nome], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">💡 Como interpretar os resultados:</h4>
          <ul className="text-sm space-y-1">
            <li><strong>Health Check:</strong> Deve retornar status "ok" - testa conectividade básica</li>
            <li><strong>Teste Caixa:</strong> Deve retornar contagem de lançamentos - testa conexão com banco</li>
            <li><strong>Listar Lançamentos:</strong> Deve retornar array JSON - testa rota principal</li>
            <li><strong>Erro "Unexpected token '&lt;'":</strong> Servidor retornando HTML ao invés de JSON</li>
            <li><strong>Erro 404:</strong> Rota não encontrada no servidor</li>
            <li><strong>Erro 500:</strong> Erro interno no servidor (ver logs do console)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
