import React from "react";
import { FuncionariosProvider } from "../contexts/FuncionariosContext";
import FormularioFuncionario from "../components/Funcionarios/FormularioFuncionario";
import FiltrosFuncionariosCompacto from "../components/Funcionarios/FiltrosFuncionariosCompacto";
import ListaFuncionarios from "../components/Funcionarios/ListaFuncionarios";
import { Users } from "lucide-react";

function FuncionariosContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Funcionários
          </h1>
          <p className="text-muted-foreground">
            Gestão completa de funcionários, permissões e comissões
          </p>
        </div>
        <div className="flex space-x-2">
          <FormularioFuncionario />
        </div>
      </div>

      {/* Lista de Funcionários */}
      <ListaFuncionarios />
    </div>
  );
}

export default function Funcionarios() {
  return (
    <FuncionariosProvider>
      <FuncionariosContent />
    </FuncionariosProvider>
  );
}
