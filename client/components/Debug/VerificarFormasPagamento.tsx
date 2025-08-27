import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { useEntidades } from "../../contexts/EntidadesContext";

export function VerificarFormasPagamento() {
  const [formasAPI, setFormasAPI] = useState([]);
  const [loading, setLoading] = useState(false);

  const { formasPagamento } = useEntidades();

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

  // Verificar se há duplicatas
  const hasDuplicates = (lista) => {
    const nomes = lista.map((f) => f.nome.toLowerCase());
    return nomes.length !== new Set(nomes).size;
  };

  const duplicatasAPI = hasDuplicates(formasAPI);
  const duplicatasContexto = hasDuplicates(formasPagamento);

  const statusGeral =
    !duplicatasAPI &&
    !duplicatasContexto &&
    formasAPI.length > 0 &&
    formasPagamento.length > 0;

  const limparDuplicatas = async () => {
    try {
      const response = await fetch("/api/clean/formas-pagamento?confirm=true", {
        method: "POST",
      });

      if (response.ok) {
        const resultado = await response.json();
        console.log("🧹 Resultado da limpeza:", resultado);

        // Recarregar dados
        await buscarFormasAPI();
        window.location.reload(); // Recarregar para atualizar contexto
      }
    } catch (error) {
      console.error("Erro na limpeza:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Verificação - Formas de Pagamento
          <Badge variant={statusGeral ? "default" : "destructive"}>
            {statusGeral ? "✅ OK" : "⚠️ Problemas"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div
          className={`p-3 rounded border ${statusGeral ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <div className="flex items-center gap-2">
            {statusGeral ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${statusGeral ? "text-green-800" : "text-red-800"}`}
            >
              {statusGeral
                ? "✅ Formas de pagamento sem duplicatas! Filtros e formulário devem funcionar corretamente."
                : "❌ Detectadas duplicatas ou dados faltando nas formas de pagamento."}
            </span>
          </div>
        </div>

        {/* Comparação API vs Contexto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  API (/api/formas-pagamento)
                </span>
                <div className="flex gap-1">
                  <Badge variant={duplicatasAPI ? "destructive" : "default"}>
                    {formasAPI.length} itens
                  </Badge>
                  {duplicatasAPI && (
                    <Badge variant="destructive">Duplicatas</Badge>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {formasAPI.map((f) => f.nome).join(", ") ||
                  "Nenhuma forma carregada"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Contexto (useEntidades)
                </span>
                <div className="flex gap-1">
                  <Badge
                    variant={duplicatasContexto ? "destructive" : "default"}
                  >
                    {formasPagamento?.length || 0} itens
                  </Badge>
                  {duplicatasContexto && (
                    <Badge variant="destructive">Duplicatas</Badge>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {formasPagamento?.map((f) => f.nome).join(", ") ||
                  "Nenhuma forma carregada"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            onClick={buscarFormasAPI}
            size="sm"
            variant="outline"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Verificar API
          </Button>

          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
          >
            🔄 Recarregar Contexto
          </Button>

          {(duplicatasAPI || duplicatasContexto) && (
            <Button onClick={limparDuplicatas} size="sm" variant="destructive">
              🧹 Limpar Duplicatas
            </Button>
          )}
        </div>

        {/* Lista detalhada se houver problemas */}
        {(duplicatasAPI || duplicatasContexto) && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-800">
              Detalhes dos Problemas:
            </h4>

            {duplicatasAPI && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <div className="text-sm text-red-700">
                  <strong>API tem duplicatas:</strong> Múltiplos registros com o
                  mesmo nome.
                </div>
              </div>
            )}

            {duplicatasContexto && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <div className="text-sm text-red-700">
                  <strong>Contexto tem duplicatas:</strong> Lista local com
                  nomes repetidos.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status OK */}
        {statusGeral && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800 mb-1">
              ✅ Verificação Completa:
            </h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>• API retorna {formasAPI.length} formas únicas</div>
              <div>
                • Contexto carregou {formasPagamento?.length} formas únicas
              </div>
              <div>• Nenhuma duplicata detectada</div>
              <div>• Filtros e formulário devem funcionar corretamente</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
