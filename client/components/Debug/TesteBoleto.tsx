import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "../ui/use-toast";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { isFormaPagamentoBoleto } from "../../lib/stringUtils";

export function TesteBoleto() {
  const { formasPagamento, clientes } = useEntidades();
  const { adicionarLancamento } = useCaixa();
  const [isLoading, setIsLoading] = useState(false);

  const testarValidacaoBoleto = async () => {
    setIsLoading(true);
    try {
      console.log("[TesteBoleto] Iniciando teste de validação de boleto");
      
      // Encontrar forma de pagamento boleto
      const formaBoleto = formasPagamento.find(f => 
        isFormaPagamentoBoleto(f)
      );
      
      if (!formaBoleto) {
        toast({
          title: "Erro",
          description: "Forma de pagamento Boleto não encontrada",
          variant: "destructive"
        });
        return;
      }

      console.log("[TesteBoleto] Forma boleto encontrada:", formaBoleto);

      // Encontrar um cliente para teste
      const clienteTeste = clientes[0];
      if (!clienteTeste) {
        toast({
          title: "Erro", 
          description: "Nenhum cliente encontrado para teste",
          variant: "destructive"
        });
        return;
      }

      console.log("[TesteBoleto] Cliente teste:", clienteTeste);

      // Criar lançamento de teste
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + 30); // 30 dias

      const lancamentoTeste = {
        data: new Date(),
        tipo: "receita" as const,
        valor: 500,
        valorLiquido: 500,
        valorParaEmpresa: 0, // Boletos não entram no saldo imediatamente
        valorQueEntrou: 500,
        comissao: 0,
        imposto: 0,
        categoria: "Serviços",
        descricao: "Teste de boleto - IGNORAR",
        formaPagamento: formaBoleto,
        formaPagamentoId: formaBoleto.id.toString(),
        cliente: clienteTeste,
        clienteId: clienteTeste.id,
        observacoes: `[TESTE] Boleto teste - Data vencimento: ${dataVencimento.toLocaleDateString()}`,
        codigoServico: `TEST_BOLETO_${Date.now()}`,
      };

      console.log("[TesteBoleto] Criando lançamento:", lancamentoTeste);

      await adicionarLancamento(lancamentoTeste);

      toast({
        title: "Sucesso!",
        description: `Lançamento de boleto criado com sucesso. Cliente: ${clienteTeste.nome}`,
        variant: "default"
      });

    } catch (error) {
      console.error("[TesteBoleto] Erro:", error);
      toast({
        title: "Erro",
        description: `Erro no teste: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verificarDeteccaoBoleto = () => {
    console.log("[TesteBoleto] Verificando detecção de boleto...");
    
    formasPagamento.forEach(forma => {
      const eBoleto = isFormaPagamentoBoleto(forma);
      console.log(`[TesteBoleto] ${forma.nome} (ID: ${forma.id}) - É boleto: ${eBoleto}`);
    });

    // Testar casos específicos
    const casos = [
      { nome: "Boleto Bancário", esperado: true },
      { nome: "Transferência Bancária", esperado: false },
      { nome: "Boleto", esperado: true },
      { nome: "Pagamento Bancário", esperado: true }, // Este deveria ser true
      { nome: "Cartão de Crédito", esperado: false }
    ];

    casos.forEach(caso => {
      const resultado = isFormaPagamentoBoleto({ nome: caso.nome });
      const status = resultado === caso.esperado ? "✅" : "❌";
      console.log(`[TesteBoleto] ${status} "${caso.nome}" - Esperado: ${caso.esperado}, Resultado: ${resultado}`);
    });

    toast({
      title: "Teste de detecção concluído",
      description: "Verifique o console para ver os resultados",
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Teste de Boleto - Debug</CardTitle>
        <CardDescription>
          Componente para testar validações e integração do sistema de boletos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Button
            onClick={verificarDeteccaoBoleto}
            variant="outline"
          >
            🔍 Verificar Detecção de Boleto
          </Button>

          <Button
            onClick={testarValidacaoBoleto}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Testando..." : "🧪 Testar Lançamento de Boleto"}
          </Button>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Formas de pagamento disponíveis:</strong></p>
          <ul className="space-y-1">
            {formasPagamento.map(forma => (
              <li key={forma.id} className="flex justify-between">
                <span>{forma.nome}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  isFormaPagamentoBoleto(forma) 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isFormaPagamentoBoleto(forma) ? 'BOLETO' : 'OUTRO'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
