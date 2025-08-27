import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CheckCircle, AlertTriangle, CreditCard, RefreshCw } from "lucide-react";
import { useEntidades } from "../../contexts/EntidadesContext";

export function VerificarConsistenciaNomes() {
  const [formasAPI, setFormasAPI] = useState([]);
  const [loading, setLoading] = useState(false);

  const { formasPagamento } = useEntidades();

  const nomesCorretos = ["Pix", "Boleto", "Dinheiro", "C/ Débito", "C/ Crédito", "Transferência"];

  const buscarFormasAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/formas-pagamento");
      if (response.ok) {
        const dados = await response.json();
        setFormasAPI(dados);
        console.log("🔍 Formas de pagamento da API:", dados);
      }
    } catch (error) {
      console.error("Erro ao buscar formas da API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarFormasAPI();
  }, []);

  // Verificar se os nomes estão corretos
  const verificarNomes = (lista) => {
    const nomesNaLista = lista.map(f => f.nome);
    const todasCorretas = nomesCorretos.every(nome => nomesNaLista.includes(nome));
    const nenhumaExtra = nomesNaLista.every(nome => nomesCorretos.includes(nome));
    return todasCorretas && nenhumaExtra && lista.length === nomesCorretos.length;
  };

  const apiCorreta = verificarNomes(formasAPI);
  const contextoCorreto = verificarNomes(formasPagamento || []);
  const statusGeral = apiCorreta && contextoCorreto;

  const corrigirNomes = async () => {
    try {
      console.log("���� Aplicando correção dos nomes...");
      const response = await fetch("/api/fix/formas-pagamento-names?confirm=true", {
        method: "POST",
      });
      
      if (response.ok) {
        const resultado = await response.json();
        console.log("✅ Correção aplicada:", resultado);
        
        // Recarregar dados
        await buscarFormasAPI();
        // Recarregar contexto
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error("Erro na correção:", error);
    }
  };

  // Comparar listas
  const nomesAPI = formasAPI.map(f => f.nome).sort();
  const nomesContexto = (formasPagamento || []).map(f => f.nome).sort();
  const saoIguais = JSON.stringify(nomesAPI) === JSON.stringify(nomesContexto);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Verificação - Consistência dos Nomes
          <Badge variant={statusGeral ? "default" : "destructive"}>
            {statusGeral ? "✅ Corretos" : "⚠️ Inconsistentes"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className={`p-3 rounded border ${statusGeral ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center gap-2">
            {statusGeral ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            )}
            <span className={`text-sm font-medium ${statusGeral ? 'text-green-800' : 'text-orange-800'}`}>
              {statusGeral 
                ? "✅ Nomes das formas de pagamento estão corretos e consistentes!"
                : "⚠️ Nomes precisam de correção para ficar consistentes."}
            </span>
          </div>
        </div>

        {/* Nomes Esperados */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-800 mb-1">📋 Nomes Corretos Esperados:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-sm text-blue-700">
            {nomesCorretos.map((nome, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {nome}
              </div>
            ))}
          </div>
        </div>

        {/* Comparação API vs Contexto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">API Backend</span>
                <div className="flex gap-1">
                  <Badge variant={apiCorreta ? "default" : "destructive"}>
                    {formasAPI.length} formas
                  </Badge>
                  {apiCorreta ? (
                    <Badge variant="default">✅ Correto</Badge>
                  ) : (
                    <Badge variant="destructive">❌ Incorreto</Badge>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {nomesAPI.join(", ") || "Carregando..."}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Contexto Frontend</span>
                <div className="flex gap-1">
                  <Badge variant={contextoCorreto ? "default" : "destructive"}>
                    {(formasPagamento || []).length} formas
                  </Badge>
                  {contextoCorreto ? (
                    <Badge variant="default">✅ Correto</Badge>
                  ) : (
                    <Badge variant="destructive">❌ Incorreto</Badge>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {nomesContexto.join(", ") || "Carregando..."}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verificação de Igualdade */}
        <div className={`p-3 rounded border ${saoIguais ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-sm font-medium">
            {saoIguais ? (
              <span className="text-green-800">
                ✅ API e Contexto têm exatamente os mesmos nomes
              </span>
            ) : (
              <span className="text-red-800">
                ❌ API e Contexto têm nomes diferentes
              </span>
            )}
          </div>
          {!saoIguais && (
            <div className="text-xs text-red-700 mt-1">
              Isso pode causar inconsistências entre Filtros e Formulário
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button onClick={buscarFormasAPI} size="sm" variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Verificar API
          </Button>
          
          <Button onClick={() => window.location.reload()} size="sm" variant="outline">
            🔄 Recarregar
          </Button>

          {!statusGeral && (
            <Button onClick={corrigirNomes} size="sm" variant="secondary">
              🔧 Corrigir Nomes
            </Button>
          )}
        </div>

        {/* Detalhes se houver problemas */}
        {!statusGeral && (
          <div className="space-y-2">
            <h4 className="font-medium text-orange-800">Problemas Encontrados:</h4>
            
            {!apiCorreta && (
              <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                <div className="text-sm text-orange-700">
                  <strong>API Backend:</strong> Nomes não coincidem com os esperados
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  Atual: {nomesAPI.join(", ")}
                </div>
              </div>
            )}
            
            {!contextoCorreto && (
              <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                <div className="text-sm text-orange-700">
                  <strong>Contexto Frontend:</strong> Nomes não coincidem com os esperados
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  Atual: {nomesContexto.join(", ")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Positivo */}
        {statusGeral && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800 mb-1">✅ Verificação Completa:</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>• Tela de Lançamento e Filtros Avançados mostram os mesmos nomes</div>
              <div>• Todos os 6 nomes estão corretos conforme especificado</div>
              <div>• API e Contexto estão sincronizados</div>
              <div>• Filtragem deve funcionar corretamente</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
