import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { apiService } from "../../lib/apiService";

export function AddLegitimateEmployees() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAddEmployees = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log("🔧 Adicionando funcionários legítimos...");
      
      const response = await apiService.post("/add-legitimate-employees");
      
      if (response.error) {
        throw new Error(response.error);
      }

      setResult(response.data);
      console.log("✅ Funcionários adicionados com sucesso:", response.data);
      
    } catch (error) {
      console.error("❌ Erro ao adicionar funcionários:", error);
      setResult({
        success: false,
        error: error.message || "Erro desconhecido"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔧 Adicionar Funcionários Legítimos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Este botão irá adicionar Douglas (Administrador) e Marcelinho (Técnico) ao sistema.
        </p>
        
        <Button 
          onClick={handleAddEmployees}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "🔄 Adicionando..." : "➕ Adicionar Douglas e Marcelinho"}
        </Button>

        {result && (
          <div className="mt-4 p-4 border rounded-lg">
            {result.success ? (
              <div className="text-green-600">
                <h4 className="font-semibold">✅ Sucesso!</h4>
                <p>{result.message}</p>
                <div className="mt-2">
                  <p><strong>Total de funcionários:</strong> {result.data?.total}</p>
                  {result.data?.employees && (
                    <div className="mt-2">
                      <p><strong>Funcionários:</strong></p>
                      <ul className="list-disc list-inside text-sm">
                        {result.data.employees.map((emp: any) => (
                          <li key={emp.id}>
                            {emp.nome} (ID: {emp.id}, Login: {emp.login}, Tipo: {emp.tipoAcesso})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-red-600">
                <h4 className="font-semibold">❌ Erro</h4>
                <p>{result.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
