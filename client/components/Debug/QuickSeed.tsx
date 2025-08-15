import React, { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

export function QuickSeed() {
  const [isCreating, setIsCreating] = useState(false);

  const createData = async () => {
    setIsCreating(true);
    
    try {
      console.log("🚀 Criando dados de teste...");
      
      const response = await fetch("/api/seed/unified-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const result = await response.json();
      console.log("📝 Resultado:", result);
      
      if (result.success) {
        toast({
          title: "✅ Dados criados!",
          description: `${result.stats?.total || 0} itens criados`,
          variant: "default"
        });
      } else {
        toast({
          title: "ℹ️ Info",
          description: result.message || "Dados já existem",
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error("❌ Erro:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar dados",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={createData} 
      disabled={isCreating}
      variant="outline"
      size="sm"
      className="text-xs"
    >
      {isCreating ? "Criando..." : "🧪 Seed Data"}
    </Button>
  );
}
