import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "../ui/use-toast";

export function CleanFakeData() {
  const [isLoading, setIsLoading] = useState(false);

  const cleanFakeData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/clean-fake-data", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Dados fictícios removidos com sucesso",
          variant: "default",
        });
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao limpar dados fictícios:", error);
      toast({
        title: "Erro",
        description: "Erro ao limpar dados fictícios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limpeza de Dados Fictícios</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Remove técnicos e funcionários fictícios do banco de dados.
        </p>
        <Button
          onClick={cleanFakeData}
          disabled={isLoading}
          variant="destructive"
        >
          {isLoading ? "Limpando..." : "Limpar Dados Fictícios"}
        </Button>
      </CardContent>
    </Card>
  );
}
