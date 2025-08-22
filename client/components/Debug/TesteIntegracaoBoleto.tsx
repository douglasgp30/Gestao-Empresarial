import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "../ui/use-toast";
import { TestTube, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface TesteIntegracaoResult {
  contasBoleto: any[];
  lancamentosBoleto: any[];
  estatisticas: {
    totalContasBoleto: number;
    totalLancamentosBoleto: number;
    contasBoletoPagas: number;
    contasBoletoAguardando: number;
  };
}

export default function TesteIntegracaoBoleto() {
  const [resultado, setResultado] = useState<TesteIntegracaoResult | null>(
    null,
  );
  const [testando, setTestando] = useState(false);

  const executarTeste = async () => {
    setTestando(true);
    try {
      const response = await fetch("/api/contas/teste-integracao");
      if (response.ok) {
        const data = await response.json();
        setResultado(data.data);
        toast({
          title: "Teste executado com sucesso",
          description: "Veja os resultados abaixo",
          variant: "default",
        });
      } else {
        throw new Error("Erro na API");
      }
    } catch (error) {
      console.error("Erro no teste:", error);
      toast({
        title: "Erro no teste",
        description: "Verifique o console para mais detalhes",
        variant: "destructive",
      });
    } finally {
      setTestando(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-500" />
          Teste da Integração Caixa + Contas a Receber (Boletos)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={executarTeste}
            disabled={testando}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {testando ? "Testando..." : "Executar Teste"}
          </Button>
        </div>

        {resultado && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {resultado.estatisticas.totalContasBoleto}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Contas Boleto
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {resultado.estatisticas.contasBoletoPagas}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Boletos Pagos
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {resultado.estatisticas.contasBoletoAguardando}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Aguardando Pagto
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {resultado.estatisticas.totalLancamentosBoleto}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lançamentos Caixa
                  </div>
                </CardContent>
              </Card>
            </div>

            {resultado.contasBoleto.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Contas a Receber (Boletos)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resultado.contasBoleto.slice(0, 5).map((conta, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <div className="font-medium">
                            #{conta.id} - {conta.cliente}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            R$ {conta.valor.toFixed(2)} - Venc:{" "}
                            {new Date(conta.vencimento).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {conta.pago ? (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Pago
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {resultado.lancamentosBoleto.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Lançamentos no Caixa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resultado.lancamentosBoleto
                      .slice(0, 5)
                      .map((lancamento, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <div className="font-medium">
                              #{lancamento.id} - {lancamento.categoria}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              R$ {lancamento.valor.toFixed(2)} -{" "}
                              {lancamento.cliente} - {lancamento.formaPagamento}
                            </div>
                            {lancamento.observacoes && (
                              <div className="text-xs text-gray-500 mt-1">
                                {lancamento.observacoes}...
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">
                    Integração Funcionando!
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    A integração entre Caixa e Contas a Receber está
                    operacional.
                    {resultado.estatisticas.totalContasBoleto > 0
                      ? ` Foram encontrados ${resultado.estatisticas.totalContasBoleto} boletos no sistema.`
                      : " Nenhum boleto encontrado ainda - teste criando um lançamento com forma de pagamento 'Boleto'."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
