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
        const result = await response.json();
        toast({
          title: "Sucesso!",
          description: "Banco de dados populado com dados iniciais.",
        });
        
        // Recarregar página para atualizar contextos
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro desconhecido');
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
