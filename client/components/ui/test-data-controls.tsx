import React from "react";
import { Button } from "./button";
import { initializeTestData, clearTestData } from "../../lib/initTestData";

export function TestDataControls() {
  return (
    <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 mb-6">
      <h3 className="font-semibold text-blue-800 mb-2">
        🧪 Controles de Dados de Teste
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        Use estes controles para testar as funcionalidades dos formulários com
        dados de exemplo
      </p>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={initializeTestData}
          variant="outline"
          size="sm"
          className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
        >
          Criar Dados de Teste
        </Button>

        <Button
          onClick={clearTestData}
          variant="outline"
          size="sm"
          className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
        >
          Limpar Dados de Teste
        </Button>
      </div>

      <div className="text-xs text-blue-600">
        <strong>Os dados de teste incluem:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>
            <strong>Técnicos:</strong> João Silva Técnico, Maria Santos Técnica
            - para testar o dropdown de técnicos
          </li>
          <li>
            <strong>Categorias:</strong> Serviços, Produtos, Materiais,
            Combustível, Alimentação - para testar fluxo categoria→descrição
          </li>
          <li>
            <strong>Clientes:</strong> João da Silva, Maria Santos - para testar
            formulários
          </li>
          <li>
            <strong>Formas de Pagamento:</strong> Servidor tem "Cartão de
            Crédito" - para testar campo valor recebido
          </li>
        </ul>

        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
          <strong>Como testar:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Clique em "Criar Dados de Teste"</li>
            <li>Vá para Caixa → Lançar Receita</li>
            <li>
              Teste: categoria→descrição, técnico responsável, valor recebido
              para cartão
            </li>
            <li>Vá para Caixa → Lançar Despesa</li>
            <li>Teste: conta (Pessoal/Empresa), categoria→descrição</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
