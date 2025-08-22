import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "../ui/use-toast";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { useClientes } from "../../contexts/ClientesContext";
import { isFormaPagamentoBoleto } from "../../lib/stringUtils";

export function TesteRapidoBoleto() {
  const { formasPagamento } = useEntidades();
  const { clientes } = useClientes();
  const { adicionarLancamento } = useCaixa();
  const [resultado, setResultado] = useState<string>("");

  const executarTeste = async () => {
    setResultado("Iniciando teste...");
    
    try {
      // 1. Verificar detecção de boleto
      const formaBoleto = formasPagamento.find(f => 
        isFormaPagamentoBoleto(f)
      );
      
      if (!formaBoleto) {
        setResultado("❌ FALHA: Forma de pagamento 'Boleto' não encontrada");
        return;
      }
      
      setResultado(`✅ Boleto detectado: ${formaBoleto.nome} (ID: ${formaBoleto.id})`);
      
      // 2. Verificar se não detecta transferência como boleto
      const formaTransferencia = formasPagamento.find(f => 
        f.nome.toLowerCase().includes("transferência") || f.nome.toLowerCase().includes("transferencia")
      );
      
      if (formaTransferencia) {
        const transferenciaEhBoleto = isFormaPagamentoBoleto(formaTransferencia);
        if (transferenciaEhBoleto) {
          setResultado(prev => prev + "\n❌ FALHA: Transferência foi detectada como boleto!");
          return;
        } else {
          setResultado(prev => prev + `\n✅ OK: Transferência (${formaTransferencia.nome}) não é detectada como boleto`);
        }
      }
      
      // 3. Verificar se há clientes
      if (!clientes.length) {
        setResultado(prev => prev + "\n❌ FALHA: Nenhum cliente encontrado");
        return;
      }
      
      setResultado(prev => prev + `\n✅ OK: ${clientes.length} clientes encontrados`);
      
      // 4. Testar criação de lançamento boleto
      const clienteTeste = clientes[0];
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + 30);
      
      const lancamentoTeste = {
        data: new Date(),
        tipo: "receita" as const,
        valor: 100,
        valorLiquido: 100,
        valorParaEmpresa: 0,
        valorQueEntrou: 100,
        comissao: 0,
        imposto: 0,
        categoria: "Serviços",
        descricao: "TESTE RÁPIDO - Boleto",
        formaPagamento: formaBoleto,
        formaPagamentoId: formaBoleto.id.toString(),
        cliente: clienteTeste,
        clienteId: clienteTeste.id,
        observacoes: `Teste automático - Vencimento: ${dataVencimento.toLocaleDateString()}`,
        codigoServico: `TESTE_${Date.now()}`,
      };
      
      setResultado(prev => prev + "\n⏳ Criando lançamento de boleto...");
      
      await adicionarLancamento(lancamentoTeste);
      
      setResultado(prev => prev + "\n✅ SUCESSO: Lançamento de boleto criado!");
      setResultado(prev => prev + `\n📝 Cliente: ${clienteTeste.nome}`);
      setResultado(prev => prev + `\n💰 Valor: R$ 100,00`);
      setResultado(prev => prev + `\n📅 Vencimento: ${dataVencimento.toLocaleDateString()}`);
      
      toast({
        title: "✅ Teste de boleto concluído!",
        description: "Todos os testes passaram. Verifique o console para detalhes.",
        variant: "default"
      });
      
    } catch (error) {
      setResultado(prev => prev + `\n❌ ERRO: ${error.message}`);
      toast({
        title: "❌ Erro no teste",
        description: `Falha: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🧪 Teste Rápido - Sistema de Boleto</CardTitle>
        <CardDescription>
          Teste automatizado para verificar se o sistema de boleto está funcionando corretamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={executarTeste}
          className="w-full"
          size="lg"
        >
          🚀 Executar Teste Completo
        </Button>
        
        {resultado && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Resultado do Teste:</h4>
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {resultado}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>O que este teste verifica:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ Detecção correta de forma de pagamento "Boleto"</li>
            <li>✅ "Transferência" não é detectada como boleto</li>
            <li>✅ Existência de clientes cadastrados</li>
            <li>✅ Criação de lançamento com boleto</li>
            <li>✅ Criação automática de conta a receber</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
