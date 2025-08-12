import React from "react";
import { Button } from "./button";
import { initializeTestData } from "../../lib/initTestData";
import { toast } from "./use-toast";

export function InitDadosTeste() {
  const handleInitData = () => {
    try {
      initializeTestData();
      toast({
        title: "Sucesso!",
        description:
          "Dados de teste inicializados. Recarregue a página para ver as mudanças.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao inicializar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao inicializar dados de teste.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleInitData}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
      >
        🌱 Inicializar Dados de Teste
      </Button>
    </div>
  );
}
