import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function TesteCarregamentoDados() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [descricoes, setDescricoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[TesteCarregamento] ${message}`);
  };

  const testarAPI = async () => {
    setLoading(true);
    addLog("🟡 Iniciando teste de carregamento...");
    
    try {
      // Testar endpoint de categorias
      addLog("📋 Carregando categorias...");
      const categoriasResponse = await fetch("/api/descricoes-e-categorias/categorias");
      addLog(`📋 Status categorias: ${categoriasResponse.status}`);
      
      const categoriasData = await categoriasResponse.json();
      addLog(`📋 Dados categorias: ${JSON.stringify(categoriasData).substring(0, 100)}...`);
      
      setCategorias(categoriasData.data || []);
      addLog(`✅ Categorias carregadas: ${(categoriasData.data || []).length} itens`);

      // Testar endpoint de descrições  
      addLog("📝 Carregando descrições...");
      const descricoesResponse = await fetch("/api/descricoes-e-categorias/descricoes");
      addLog(`📝 Status descrições: ${descricoesResponse.status}`);
      
      const descricoesData = await descricoesResponse.json();
      addLog(`📝 Dados descrições: ${JSON.stringify(descricoesData).substring(0, 100)}...`);
      
      setDescricoes(descricoesData.data || []);
      addLog(`✅ Descrições carregadas: ${(descricoesData.data || []).length} itens`);

    } catch (error) {
      addLog(`❌ Erro: ${error}`);
    } finally {
      setLoading(false);
      addLog("🏁 Teste concluído");
    }
  };

  const popularDados = async () => {
    setLoading(true);
    addLog("🌱 Populando dados de teste...");
    
    try {
      const response = await fetch("/api/seed/unified-data", { method: "POST" });
      addLog(`🌱 Status seed: ${response.status}`);
      
      const result = await response.json();
      addLog(`🌱 Resultado seed: ${JSON.stringify(result)}`);
      
      // Recarregar dados após popular
      setTimeout(() => testarAPI(), 1000);
      
    } catch (error) {
      addLog(`❌ Erro ao popular: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Teste de Carregamento de Dados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testarAPI} disabled={loading}>
            🧪 Testar API
          </Button>
          <Button onClick={popularDados} disabled={loading} variant="outline">
            🌱 Popular Dados
          </Button>
          <Button onClick={() => setLogs([])} variant="ghost">
            🧹 Limpar Logs
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">📋 Categorias ({categorias.length})</h3>
            <div className="bg-gray-50 p-2 rounded text-sm max-h-32 overflow-y-auto">
              {categorias.length > 0 ? (
                categorias.map((cat, idx) => (
                  <div key={idx}>{cat.nome} ({cat.tipo})</div>
                ))
              ) : (
                <div className="text-gray-500">Nenhuma categoria encontrada</div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">📝 Descrições ({descricoes.length})</h3>
            <div className="bg-gray-50 p-2 rounded text-sm max-h-32 overflow-y-auto">
              {descricoes.length > 0 ? (
                descricoes.map((desc, idx) => (
                  <div key={idx}>{desc.nome} - {desc.categoria}</div>
                ))
              ) : (
                <div className="text-gray-500">Nenhuma descrição encontrada</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">📜 Logs ({logs.length})</h3>
          <div className="bg-black text-green-400 p-3 rounded text-sm max-h-64 overflow-y-auto font-mono">
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))
            ) : (
              <div className="text-gray-500">Nenhum log ainda...</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
