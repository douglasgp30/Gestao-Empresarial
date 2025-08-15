import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function TestDeleteApi() {
  const [itemId, setItemId] = useState("");
  const [result, setResult] = useState<string>("");

  const testDelete = async () => {
    if (!itemId) {
      setResult("Por favor, informe um ID");
      return;
    }

    try {
      setResult("Fazendo requisição...");

      const response = await fetch(`/api/descricoes-e-categorias/${itemId}`, {
        method: "DELETE",
      });

      console.log("Response:", response);
      console.log("Status:", response.status);
      console.log("StatusText:", response.statusText);
      console.log("Headers:", {
        contentType: response.headers.get("content-type"),
        contentLength: response.headers.get("content-length"),
      });

      if (response.status === 204) {
        setResult(`✅ Sucesso: HTTP ${response.status} - Item excluído`);
        return;
      }

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        console.log("Content-Type:", contentType);

        // Verificar content-type para decidir como processar
        try {
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            console.log("Error data:", errorData);
            setResult(
              `❌ Erro JSON: ${errorData.error || "Erro desconhecido"}`,
            );
          } else {
            const textData = await response.text();
            console.log("Text data:", textData);
            setResult(`❌ Erro Text: ${textData || response.statusText}`);
          }
        } catch (parseError) {
          console.log("Parse error:", parseError);
          setResult(`❌ Erro HTTP ${response.status}: ${response.statusText}`);
        }
        return;
      }

      setResult(`✅ Sucesso: HTTP ${response.status}`);
    } catch (error) {
      console.error("Catch error:", error);
      setResult(
        `❌ Erro de rede: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-4">Debug: Teste Delete API</h3>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="ID do item para deletar"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="flex-1"
        />
        <Button onClick={testDelete}>Testar Delete</Button>
      </div>

      {result && (
        <div className="p-3 bg-white border rounded text-sm">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
