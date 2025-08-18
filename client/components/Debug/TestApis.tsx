import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";

export function TestApis() {
  const [resultados, setResultados] = useState<any>({});

  const testarAPIs = async () => {
    console.log("Testando APIs diretamente...");
    
    try {
      // Testar cada API diretamente
      const [formas, campanhas, descricoes, cidades, setores] = await Promise.all([
        fetch('/api/formas-pagamento').then(r => r.json()),
        fetch('/api/campanhas').then(r => r.json()),
        fetch('/api/descricoes-e-categorias').then(r => r.json()),
        fetch('/api/cidades').then(r => r.json()),
        fetch('/api/setores').then(r => r.json()),
      ]);

      setResultados({
        formas: Array.isArray(formas) ? formas : [],
        campanhas: Array.isArray(campanhas) ? campanhas : [],
        descricoes: descricoes?.data || [],
        cidades: Array.isArray(cidades) ? cidades : [],
        setores: Array.isArray(setores) ? setores : [],
      });

      console.log("Resultados das APIs:", {
        formas: formas.length,
        campanhas: campanhas.length,
        descricoes: (descricoes?.data || []).length,
        cidades: cidades.length,
        setores: setores.length
      });
    } catch (error) {
      console.error("Erro ao testar APIs:", error);
    }
  };

  useEffect(() => {
    testarAPIs();
  }, []);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
      <h3 className="font-bold text-yellow-800 mb-2">🔧 Debug APIs</h3>
      <div className="text-sm space-y-1">
        <div>Formas: {resultados.formas?.length || 0}</div>
        <div>Campanhas: {resultados.campanhas?.length || 0}</div>
        <div>Descrições: {resultados.descricoes?.length || 0}</div>
        <div>Cidades: {resultados.cidades?.length || 0}</div>
        <div>Setores: {resultados.setores?.length || 0}</div>
      </div>
      <Button onClick={testarAPIs} size="sm" className="mt-2">
        Recarregar APIs
      </Button>
    </div>
  );
}
