import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useFuncionarios } from "../../contexts/FuncionariosContext";
import { funcionariosApi } from "../../lib/apiService";

export function TestEmployeeDeletion() {
  const [contextEmployees, setContextEmployees] = useState<any[]>([]);
  const [apiEmployees, setApiEmployees] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<string>("");
  const { funcionarios, excluirFuncionario } = useFuncionarios();

  useEffect(() => {
    setContextEmployees(funcionarios);
  }, [funcionarios]);

  const loadApiEmployees = async () => {
    try {
      const response = await funcionariosApi.listar();
      if (response.error) {
        throw new Error(response.error);
      }
      setApiEmployees(response.data || []);
      setTestResult("✅ API employees loaded successfully");
    } catch (error) {
      setTestResult(`❌ Error loading API employees: ${error.message}`);
    }
  };

  const testApiDeletion = async (id: number) => {
    try {
      setTestResult(`🔄 Testing API deletion of employee ID ${id}...`);
      const response = await funcionariosApi.excluir(id);

      if (response.error) {
        setTestResult(`❌ API deletion failed: ${response.error}`);
      } else {
        setTestResult(`✅ API deletion succeeded for ID ${id}`);
        // Reload employees to see the change
        await loadApiEmployees();
      }
    } catch (error) {
      setTestResult(`❌ API deletion error: ${error.message}`);
    }
  };

  const testContextDeletion = async (id: string) => {
    try {
      setTestResult(`🔄 Testing context deletion of employee ID ${id}...`);
      await excluirFuncionario(id);
      setTestResult(`✅ Context deletion succeeded for ID ${id}`);
    } catch (error) {
      setTestResult(`❌ Context deletion error: ${error.message}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🧪 Test Employee Deletion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Context Employees */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2">
              Context Employees ({contextEmployees.length})
            </h4>
            <div className="space-y-1 text-sm">
              {contextEmployees.map((emp) => (
                <div key={emp.id} className="flex justify-between items-center">
                  <span>
                    {emp.nomeCompleto} (ID: {emp.id})
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testContextDeletion(emp.id)}
                  >
                    Delete via Context
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* API Employees */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2">
              API Employees ({apiEmployees.length})
              <Button
                size="sm"
                variant="outline"
                onClick={loadApiEmployees}
                className="ml-2"
              >
                Refresh
              </Button>
            </h4>
            <div className="space-y-1 text-sm">
              {apiEmployees.map((emp) => (
                <div key={emp.id} className="flex justify-between items-center">
                  <span>
                    {emp.nome} (ID: {emp.id})
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testApiDeletion(emp.id)}
                  >
                    Delete via API
                  </Button>
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

        <Button onClick={loadApiEmployees} className="w-full">
          🔄 Load API Employees
        </Button>
      </CardContent>
    </Card>
  );
}
