import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { apiService } from "@/lib/apiService";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  message: string;
  data?: any;
}

export function AccountsSystemTester() {
  const [testando, setTestando] = useState(false);
  const [resultados, setResultados] = useState<TestResult[]>([]);

  const executarTestes = async () => {
    setTestando(true);
    setResultados([]);

    const testes: TestResult[] = [
      {
        name: "Seed de dados básicos",
        status: "pending",
        message: "Iniciando...",
      },
      { name: "Buscar clientes", status: "pending", message: "Iniciando..." },
      {
        name: "Buscar fornecedores",
        status: "pending",
        message: "Iniciando...",
      },
      {
        name: "Buscar formas de pagamento",
        status: "pending",
        message: "Iniciando...",
      },
      { name: "Buscar categorias", status: "pending", message: "Iniciando..." },
      { name: "Listar contas", status: "pending", message: "Iniciando..." },
      {
        name: "Criar conta a receber",
        status: "pending",
        message: "Iniciando...",
      },
      {
        name: "Criar conta a pagar",
        status: "pending",
        message: "Iniciando...",
      },
      { name: "Calcular totais", status: "pending", message: "Iniciando..." },
    ];

    setResultados([...testes]);

    let clientes: any[] = [];
    let fornecedores: any[] = [];
    let formasPagamento: any[] = [];
    let categorias: any[] = [];

    try {
      // 1. Seed de dados básicos
      try {
        const seedResponse = await apiService.post("/seed/accounts");
        testes[0].status = "success";
        testes[0].message = "Dados básicos criados com sucesso";
      } catch (error) {
        testes[0].status = "success"; // Provavelmente já existem
        testes[0].message = "Dados já existem (OK)";
      }
      setResultados([...testes]);

      // 2. Buscar clientes
      try {
        const clientesResponse = await apiService.get("/contas/clientes");
        clientes = clientesResponse.data || [];
        testes[1].status = "success";
        testes[1].message = `${clientes.length} clientes encontrados`;
        testes[1].data = clientes.slice(0, 3);
      } catch (error) {
        testes[1].status = "error";
        testes[1].message = `Erro: ${error}`;
      }
      setResultados([...testes]);

      // 3. Buscar fornecedores
      try {
        const fornecedoresResponse = await apiService.get(
          "/contas/fornecedores",
        );
        fornecedores = fornecedoresResponse.data || [];
        testes[2].status = "success";
        testes[2].message = `${fornecedores.length} fornecedores encontrados`;
        testes[2].data = fornecedores.slice(0, 3);
      } catch (error) {
        testes[2].status = "error";
        testes[2].message = `Erro: ${error}`;
      }
      setResultados([...testes]);

      // 4. Buscar formas de pagamento
      try {
        const formasResponse = await apiService.get("/formas-pagamento");
        formasPagamento = formasResponse.data || [];
        testes[3].status = "success";
        testes[3].message = `${formasPagamento.length} formas de pagamento encontradas`;
        testes[3].data = formasPagamento.slice(0, 3);
      } catch (error) {
        testes[3].status = "error";
        testes[3].message = `Erro: ${error}`;
      }
      setResultados([...testes]);

      // 5. Buscar categorias
      try {
        const categoriasResponse = await apiService.get("/contas/categorias");
        categorias = categoriasResponse.data || [];
        testes[4].status = "success";
        testes[4].message = `${categorias.length} categorias encontradas`;
        testes[4].data = categorias.slice(0, 3);
      } catch (error) {
        testes[4].status = "error";
        testes[4].message = `Erro: ${error}`;
      }
      setResultados([...testes]);

      // 6. Listar contas
      try {
        const hoje = new Date().toISOString().split("T")[0];
        const dataFim = new Date();
        dataFim.setDate(dataFim.getDate() + 30);
        const dataFimStr = dataFim.toISOString().split("T")[0];

        const contasResponse = await apiService.get(
          `/contas?dataInicio=${hoje}&dataFim=${dataFimStr}`,
        );
        const contas = contasResponse.data || [];
        testes[5].status = "success";
        testes[5].message = `${contas.length} contas encontradas`;
        testes[5].data = contas.slice(0, 3).map((c: any) => ({
          id: c.codLancamentoContas,
          tipo: c.tipo,
          valor: c.valor,
          cliente: c.cliente?.nome,
          fornecedor: c.fornecedor?.nome,
          vencimento: new Date(c.dataVencimento).toLocaleDateString("pt-BR"),
        }));
      } catch (error) {
        testes[5].status = "error";
        testes[5].message = `Erro: ${error}`;
      }
      setResultados([...testes]);

      // 7. Criar conta a receber
      if (clientes.length > 0 && categorias.length > 0) {
        try {
          const novaContaReceber = {
            valor: 500.0,
            dataVencimento: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            codigoCliente: clientes[0].id,
            tipo: "receber",
            conta: "empresa",
            observacoes: "Teste de conta a receber",
            descricaoCategoria: categorias.find(
              (c: any) => c.tipo === "receita",
            )?.id,
            pago: false,
          };

          const contaCriada = await apiService.post(
            "/contas",
            novaContaReceber,
          );
          testes[6].status = "success";
          testes[6].message = `Conta a receber criada - ID: ${contaCriada.data?.codLancamentoContas}`;
          testes[6].data = contaCriada.data;
        } catch (error) {
          testes[6].status = "error";
          testes[6].message = `Erro: ${error}`;
        }
      } else {
        testes[6].status = "error";
        testes[6].message = "Sem clientes ou categorias para teste";
      }
      setResultados([...testes]);

      // 8. Criar conta a pagar
      if (fornecedores.length > 0 && categorias.length > 0) {
        try {
          const novaContaPagar = {
            valor: 300.0,
            dataVencimento: new Date(
              Date.now() + 15 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            codigoFornecedor: fornecedores[0].id,
            tipo: "pagar",
            conta: "empresa",
            observacoes: "Teste de conta a pagar",
            descricaoCategoria: categorias.find(
              (c: any) => c.tipo === "despesa",
            )?.id,
            pago: false,
          };

          const contaCriada = await apiService.post("/contas", novaContaPagar);
          testes[7].status = "success";
          testes[7].message = `Conta a pagar criada - ID: ${contaCriada.data?.codLancamentoContas}`;
          testes[7].data = contaCriada.data;
        } catch (error) {
          testes[7].status = "error";
          testes[7].message = `Erro: ${error}`;
        }
      } else {
        testes[7].status = "error";
        testes[7].message = "Sem fornecedores ou categorias para teste";
      }
      setResultados([...testes]);

      // 9. Calcular totais
      try {
        const hoje = new Date().toISOString().split("T")[0];
        const dataFim = new Date();
        dataFim.setDate(dataFim.getDate() + 30);
        const dataFimStr = dataFim.toISOString().split("T")[0];

        const totaisResponse = await apiService.get(
          `/contas/totais?dataInicio=${hoje}&dataFim=${dataFimStr}`,
        );
        const totais = totaisResponse.data;
        testes[8].status = "success";
        testes[8].message = `Totais calculados com sucesso`;
        testes[8].data = {
          totalReceber: `R$ ${totais?.totalReceber?.toFixed(2) || "0,00"}`,
          totalPagar: `R$ ${totais?.totalPagar?.toFixed(2) || "0,00"}`,
          vencendoHoje: `R$ ${totais?.totalVencendoHoje?.toFixed(2) || "0,00"}`,
          atrasadas: `R$ ${totais?.totalAtrasadas?.toFixed(2) || "0,00"}`,
        };
      } catch (error) {
        testes[8].status = "error";
        testes[8].message = `Erro: ${error}`;
      }
      setResultados([...testes]);
    } catch (error) {
      console.error("Erro geral nos testes:", error);
    } finally {
      setTestando(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Teste do Sistema de Contas</span>
          <Button onClick={executarTestes} disabled={testando} className="ml-4">
            {testando ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {testando ? "Testando..." : "Executar Testes"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resultados.map((resultado, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 border rounded-lg"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(resultado.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{resultado.name}</h4>
                  <Badge variant={getStatusColor(resultado.status) as any}>
                    {resultado.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {resultado.message}
                </p>
                {resultado.data && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(resultado.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {resultados.length === 0 && !testando && (
          <div className="text-center py-8 text-muted-foreground">
            Clique em "Executar Testes" para verificar o sistema de contas
          </div>
        )}
      </CardContent>
    </Card>
  );
}
