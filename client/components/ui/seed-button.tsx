import React, { useState } from "react";
import { Button } from "./button";
import { toast } from "./use-toast";
import { Loader2, Database } from "lucide-react";

export function SeedButton() {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Banco de dados populado com dados iniciais.",
        });

        // Recarregar página para atualizar contextos
        window.location.reload();
      } else {
        // Tentar ler o JSON de erro, mas com fallback seguro
        let errorMessage = 'Erro desconhecido';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // Se não conseguir ler o JSON, usar status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao popular banco:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao popular banco de dados",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      onClick={handleSeed} 
      disabled={isSeeding}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isSeeding ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {isSeeding ? "Populando..." : "Popular Dados"}
    </Button>
  );
}
