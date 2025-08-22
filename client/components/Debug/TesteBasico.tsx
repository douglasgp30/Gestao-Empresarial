import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "../ui/use-toast";

export function TesteBasico() {
  const [resultado, setResultado] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testarBoleto = async () => {
    setIsLoading(true);
    setResultado("Iniciando teste direto...");

    try {
      // 1. Testar criação de lançamento direto
      const dadosLancamento = {
        valor: 100,
        valorRecebido: 100,
        valorLiquido: 100,
        comissao: 0,
        imposto: 0,
        observacoes: "Teste básico direto",
        numeroNota: "",
        tipo: "receita",
        data: new Date().toISOString().split("T")[0],
        categoria: "Serviços",
        descricao: "Teste Direto",
        formaPagamentoId: 5, // Boleto
        funcionarioId: 10,
        setorId: 157,
        campanhaId: 3,
        clienteId: "cPIcYlG3z", // ID de cliente existente
      };

      setResultado(prev => prev + "\n⏳ Criando lançamento diretamente...");

      const responseLancamento = await fetch("/api/caixa/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosLancamento),
      });

      if (!responseLancamento.ok) {
        const errorData = await responseLancamento.json();
        setResultado(prev => prev + `\n❌ Erro no lançamento: ${errorData.error}`);
        return;
      }

      const lancamentoCriado = await responseLancamento.json();
      setResultado(prev => prev + `\n✅ Lançamento criado! ID: ${lancamentoCriado.id}`);

      // 2. Testar criação de conta a receber diretamente
      const dadosConta = {
        tipo: "receber",
        descricao: "Boleto - Teste Direto",
        valor: 100,
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "pendente",
        categoria: "Serviços",
        clienteId: "cPIcYlG3z", // AQUI ESTÁ O PROBLEMA - usar clienteId correto
        observacoes: "Conta criada via teste direto",
        sistemaOrigem: "caixa_boleto",
        pago: false,
        lancamentoCaixaId: lancamentoCriado.id,
      };

      setResultado(prev => prev + "\n⏳ Criando conta a receber diretamente...");

      const responseConta = await fetch("/api/contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosConta),
      });

      if (!responseConta.ok) {
        const errorData = await responseConta.json();
        setResultado(prev => prev + `\n❌ Erro na conta: ${JSON.stringify(errorData)}`);
        return;
      }

      const contaCriada = await responseConta.json();
      setResultado(prev => prev + `\n✅ Conta criada! ID: ${contaCriada.id}`);
      setResultado(prev => prev + `\n🎉 TESTE CONCLUÍDO COM SUCESSO!`);

      toast({
        title: "✅ Teste direto bem-sucedido!",
        description: "Lançamento e conta a receber criados diretamente",
        variant: "default"
      });

    } catch (error) {
      setResultado(prev => prev + `\n❌ ERRO: ${error.message}`);
      toast({
        title: "❌ Erro no teste",
        description: `Falha: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🧪 Teste Básico - Sem Contextos</CardTitle>
        <CardDescription>
          Teste direto com APIs para verificar se o problema está nos contextos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testarBoleto}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Testando..." : "🚀 Testar Boleto Direto"}
        </Button>
        
        {resultado && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Resultado:</h4>
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {resultado}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p><strong>Este teste bypassa os contextos e testa:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ Criação direta de lançamento (POST /api/caixa/criar)</li>
            <li>✅ Criação direta de conta a receber (POST /api/contas)</li>
            <li>✅ Validação do clienteId correto</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
