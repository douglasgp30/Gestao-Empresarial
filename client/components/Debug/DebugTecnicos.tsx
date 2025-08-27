import React from "react";
import { useEntidades } from "../../contexts/EntidadesContext";
import { useFuncionarios } from "../../contexts/FuncionariosContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function DebugTecnicos() {
  const { getTecnicos } = useEntidades();
  const { funcionarios } = useFuncionarios();

  const tecnicos = getTecnicos();

  const handleDebugLocalStorage = () => {
    console.log("=== DEBUG TÉCNICOS ===");

    // Verificar localStorage
    const funcionariosLS = localStorage.getItem("funcionarios");
    const funcionariosParsed = funcionariosLS ? JSON.parse(funcionariosLS) : [];

    console.log("1. Funcionários no localStorage:", funcionariosParsed);
    console.log("2. Funcionários no contexto:", funcionarios);
    console.log("3. Técnicos retornados por getTecnicos():", tecnicos);

    // Filtrar técnicos manualmente para verificar a lógica
    const tecnicosManual = funcionariosParsed.filter((f: any) => {
      const ehTecnicoPorCampo = f.ehTecnico === true;
      const ehTecnicoPorTipo =
        f.tipoAcesso && f.tipoAcesso.toLowerCase().includes("técnico");
      console.log(`Funcionário ${f.nomeCompleto || f.nome}:`, {
        ehTecnico: f.ehTecnico,
        tipoAcesso: f.tipoAcesso,
        ehTecnicoPorCampo,
        ehTecnicoPorTipo,
        consideradoTecnico: ehTecnicoPorCampo || ehTecnicoPorTipo,
      });
      return ehTecnicoPorCampo || ehTecnicoPorTipo;
    });

    console.log("4. Técnicos filtrados manualmente:", tecnicosManual);
    console.log("=== FIM DEBUG ===");
  };

  const handleForceReload = async () => {
    // Recarregar funcionários do contexto se possível
    try {
      const response = await fetch("/api/funcionarios");
      if (response.ok) {
        const funcionariosApi = await response.json();
        console.log("Funcionários da API:", funcionariosApi);
      }
    } catch (error) {
      console.error("Erro ao buscar funcionários da API:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Debug - Técnicos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">
            Técnicos encontrados: {tecnicos.length}
          </h3>
          {tecnicos.length === 0 ? (
            <p className="text-red-600">Nenhum técnico encontrado!</p>
          ) : (
            <ul className="space-y-1">
              {tecnicos.map((tecnico, index) => (
                <li key={index} className="p-2 bg-gray-50 rounded">
                  <strong>{tecnico.nome || tecnico.nomeCompleto}</strong>
                  <div className="text-sm text-gray-600">
                    ID: {tecnico.id} | ehTecnico: {String(tecnico.ehTecnico)} |
                    tipoAcesso: {tecnico.tipoAcesso} | percentual:{" "}
                    {tecnico.percentualComissao ||
                      tecnico.percentualServico ||
                      0}
                    %
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">
            Funcionários no contexto: {funcionarios.length}
          </h3>
          {funcionarios.map((func, index) => (
            <div key={index} className="p-2 bg-blue-50 rounded text-sm">
              {func.nomeCompleto} - ehTecnico: {String(func.ehTecnico)} -
              tipoAcesso: {func.tipoAcesso}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDebugLocalStorage} variant="outline">
            Debug Console
          </Button>
          <Button onClick={handleForceReload} variant="outline">
            Testar API
          </Button>
        </div>

        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
          <h4 className="font-medium text-yellow-800">Instruções de Debug:</h4>
          <ol className="text-sm text-yellow-700 mt-1 space-y-1">
            <li>1. Clique em "Debug Console" e veja o console do navegador</li>
            <li>
              2. Verifique se o funcionário cadastrado tem ehTecnico: true OU
              tipoAcesso: "Técnico"
            </li>
            <li>
              3. Se não tiver, vá em Funcionários e marque o checkbox "É
              Técnico"
            </li>
            <li>
              4. Após cadastrar/editar, recarregue esta página para ver se
              aparece
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
