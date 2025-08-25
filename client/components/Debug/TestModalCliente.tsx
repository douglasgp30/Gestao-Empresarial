import React, { useState } from "react";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";
import ModalCadastroCliente from "../Clientes/ModalCadastroCliente";

export function TestModalCliente() {
  const [testResult, setTestResult] = useState("");

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
      <h3 className="font-bold mb-2">🔧 TESTE - Modal Cliente</h3>
      
      {/* Teste 1: Botão direto */}
      <div className="mb-4">
        <p className="text-sm mb-2">Teste 1: Botão básico</p>
        <Button 
          onClick={() => {
            setTestResult("Botão básico funciona!");
            console.log("Botão de teste funciona!");
          }}
          className="mr-2"
        >
          Teste Básico
        </Button>
        <span className="text-sm text-green-600">{testResult}</span>
      </div>

      {/* Teste 2: Modal Cliente */}
      <div className="mb-4">
        <p className="text-sm mb-2">Teste 2: Modal Cliente</p>
        <ModalCadastroCliente
          trigger={
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Abrir Modal Cliente
            </Button>
          }
          onClienteAdicionado={(cliente) => {
            setTestResult(`Cliente ${cliente.nome} adicionado com sucesso!`);
            console.log("Cliente adicionado no teste:", cliente);
          }}
        />
      </div>

      {/* Resultado */}
      {testResult && (
        <div className="p-2 bg-green-100 border border-green-300 rounded text-sm">
          ✅ {testResult}
        </div>
      )}
    </div>
  );
}
