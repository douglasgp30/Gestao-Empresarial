import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { initializeTestData } from "../../lib/initTestData";
import { toast } from "./use-toast";
import { Info, Zap } from "lucide-react";

interface AlertaDadosVaziosProps {
  show: boolean;
}

export function AlertaDadosVazios({ show }: AlertaDadosVaziosProps) {
  const handleInitData = () => {
    try {
      initializeTestData();
      toast({
        title: "✅ Dados Inicializados!",
        description: "Dados de teste criados. Agora você pode testar os formulários!",
        variant: "default",
      });
      
      // Recarregar a página após 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Erro ao inicializar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao inicializar dados de teste.",
        variant: "destructive",
      });
    }
  };

  if (!show) return null;

  return (
    <Alert className="mb-6 border-yellow-200 bg-yellow-50">
      <Info className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">
        ⚠️ Sem Dados para Testar os Formulários
      </AlertTitle>
      <AlertDescription className="text-yellow-700 space-y-3">
        <p>
          Os formulários precisam de dados básicos (técnicos, categorias, formas de pagamento) 
          para funcionar corretamente. Atualmente não há dados cadastrados.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleInitData}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Gerar Dados de Teste Agora
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              window.open("/funcionarios", "_blank");
            }}
          >
            Ou Cadastrar Manualmente
          </Button>
        </div>
        
        <div className="text-xs text-yellow-600 mt-2">
          <strong>Isso criará:</strong> 3 funcionários (incluindo técnicos), categorias (Serviços, Produtos, etc.), 
          formas de pagamento (Dinheiro, Cartão, PIX) e outros dados essenciais.
        </div>
      </AlertDescription>
    </Alert>
  );
}
