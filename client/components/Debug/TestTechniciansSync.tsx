import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useFuncionarios } from "../../contexts/FuncionariosContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { funcionariosApi } from "../../lib/apiService";

export function TestTechniciansSync() {
  const [apiTechnicians, setApiTechnicians] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<string>("");

  // Get data from contexts
  const { funcionarios: funcionariosContext } = useFuncionarios();
  const {
    funcionarios: funcionariosEntidades,
    getTecnicos,
    tecnicos,
  } = useEntidades();
  const tecnicosFromFunction = getTecnicos();

  const loadApiTechnicians = async () => {
    try {
      setTestResult("🔄 Loading technicians from API...");
      const response = await funcionariosApi.listarTecnicos();
      if (response.error) {
        throw new Error(response.error);
      }
      setApiTechnicians(response.data || []);
      setTestResult("✅ API technicians loaded successfully");
    } catch (error) {
      setTestResult(`❌ Error loading API technicians: ${error.message}`);
    }
  };

  useEffect(() => {
    loadApiTechnicians();
  }, []);

  const reloadData = async () => {
    setTestResult("🔄 Reloading all data...");
    await loadApiTechnicians();
    // Force context reload by calling the API endpoint
    try {
      await fetch("/api/reload-employees-context", { method: "POST" });
      setTimeout(() => {
        setTestResult("✅ Data reloaded - contexts should sync now");
      }, 1000);
    } catch (error) {
      setTestResult(`❌ Error reloading contexts: ${error.message}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🔍 Test Technicians Synchronization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* API Technicians */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2">
              API Technicians ({apiTechnicians.length})
            </h4>
            <div className="space-y-1 text-sm">
              {apiTechnicians.map((tech) => (
                <div key={tech.id} className="text-xs">
                  ID: {tech.id}, Nome: {tech.nome}, Técnico:{" "}
                  {tech.ehTecnico ? "✅" : "❌"}
                </div>
              ))}
            </div>
          </div>

          {/* FuncionariosContext */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2">
              FuncionariosContext ({funcionariosContext.length})
            </h4>
            <div className="space-y-1 text-sm">
              {funcionariosContext.map((func) => (
                <div key={func.id} className="text-xs">
                  ID: {func.id}, Nome: {func.nomeCompleto}, Técnico:{" "}
                  {func.ehTecnico ? "✅" : "❌"}
                </div>
              ))}
            </div>
          </div>

          {/* EntidadesContext funcionarios */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2">
              EntidadesContext Funcionarios ({funcionariosEntidades.length})
            </h4>
            <div className="space-y-1 text-sm">
              {funcionariosEntidades.map((func) => (
                <div key={func.id} className="text-xs">
                  ID: {func.id}, Nome: {func.nomeCompleto}, Técnico:{" "}
                  {func.ehTecnico ? "✅" : "❌"}
                </div>
              ))}
            </div>
          </div>

          {/* EntidadesContext tecnicos */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2">
              EntidadesContext Tecnicos ({tecnicos.length})
            </h4>
            <div className="space-y-1 text-sm">
              {tecnicos.map((tech) => (
                <div key={tech.id} className="text-xs">
                  ID: {tech.id}, Nome: {tech.nome || tech.nomeCompleto},
                  Técnico: {tech.ehTecnico ? "✅" : "❌"}
                </div>
              ))}
            </div>
          </div>

          {/* getTecnicos() function result */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2">
              getTecnicos() Function ({tecnicosFromFunction.length})
            </h4>
            <div className="space-y-1 text-sm">
              {tecnicosFromFunction.map((tech) => (
                <div key={tech.id} className="text-xs">
                  ID: {tech.id}, Nome: {tech.nome || tech.nomeCompleto},
                  Técnico: {tech.ehTecnico ? "✅" : "❌"}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="mt-4 p-3 border rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-1">Test Result:</h4>
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={loadApiTechnicians}
            variant="outline"
            className="flex-1"
          >
            🔄 Reload API Data
          </Button>
          <Button onClick={reloadData} className="flex-1">
            🔄 Reload All Contexts
          </Button>
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 border rounded-lg bg-blue-50">
          <h4 className="font-semibold mb-2">🎯 Diagnosis:</h4>
          <div className="text-sm space-y-1">
            <p>
              <strong>Expected:</strong> All sources should show Marcelinho as a
              technician
            </p>
            <p>
              <strong>API Technicians:</strong> {apiTechnicians.length} found
            </p>
            <p>
              <strong>FuncionariosContext:</strong>{" "}
              {funcionariosContext.filter((f) => f.ehTecnico).length}{" "}
              technicians found
            </p>
            <p>
              <strong>EntidadesContext getTecnicos():</strong>{" "}
              {tecnicosFromFunction.length} technicians found
            </p>

            {tecnicosFromFunction.length === 0 && (
              <p className="text-red-600 font-semibold">
                ❌ This is why technicians don't appear in forms and filters!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
