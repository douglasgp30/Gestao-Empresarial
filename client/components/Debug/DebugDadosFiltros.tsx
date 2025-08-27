import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { RefreshCw, Eye, Users, CreditCard, Target } from "lucide-react";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";

export function DebugDadosFiltros() {
  const [showDetails, setShowDetails] = useState(false);

  const {
    campanhas,
    isLoading: caixaLoading,
  } = useCaixa();

  const {
    formasPagamento,
    getTecnicos,
    tecnicos: tecnicosArray,
    isLoading: entidadesLoading,
  } = useEntidades();

  const tecnicosCombinados = getTecnicos();

  const refresh = () => {
    window.location.reload();
  };

  const dados = {
    campanhas: {
      fonte: "useCaixa()",
      total: campanhas?.length || 0,
      dados: campanhas,
      loading: caixaLoading
    },
    formasPagamento: {
      fonte: "useEntidades()",
      total: formasPagamento?.length || 0,
      dados: formasPagamento,
      loading: entidadesLoading
    },
    tecnicosArray: {
      fonte: "useEntidades() - tecnicos array",
      total: tecnicosArray?.length || 0,
      dados: tecnicosArray,
      loading: entidadesLoading
    },
    tecnicosCombinados: {
      fonte: "useEntidades() - getTecnicos()",
      total: tecnicosCombinados?.length || 0,
      dados: tecnicosCombinados,
      loading: entidadesLoading
    }
  };

  useEffect(() => {
    console.log("🔍 [DebugDadosFiltros] Dados atuais:", dados);
  }, [campanhas, formasPagamento, tecnicosArray, tecnicosCombinados]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Debug - Dados dos Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status dos dados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Campanhas
                </span>
                <Badge variant={dados.campanhas.total > 0 ? "default" : "secondary"}>
                  {dados.campanhas.total}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">{dados.campanhas.fonte}</div>
              {dados.campanhas.loading && (
                <div className="text-xs text-orange-600 mt-1">Carregando...</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Formas Pagto
                </span>
                <Badge variant={dados.formasPagamento.total > 0 ? "default" : "secondary"}>
                  {dados.formasPagamento.total}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">{dados.formasPagamento.fonte}</div>
              {dados.formasPagamento.loading && (
                <div className="text-xs text-orange-600 mt-1">Carregando...</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Técnicos Array
                </span>
                <Badge variant={dados.tecnicosArray.total > 0 ? "default" : "secondary"}>
                  {dados.tecnicosArray.total}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">{dados.tecnicosArray.fonte}</div>
              {dados.tecnicosArray.loading && (
                <div className="text-xs text-orange-600 mt-1">Carregando...</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Técnicos getTecnicos()
                </span>
                <Badge variant={dados.tecnicosCombinados.total > 0 ? "default" : "secondary"}>
                  {dados.tecnicosCombinados.total}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">{dados.tecnicosCombinados.fonte}</div>
              {dados.tecnicosCombinados.loading && (
                <div className="text-xs text-orange-600 mt-1">Carregando...</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button 
            onClick={refresh} 
            size="sm" 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recarregar
          </Button>
          
          <Button 
            onClick={() => setShowDetails(!showDetails)} 
            size="sm" 
            variant="outline"
          >
            {showDetails ? "Ocultar" : "Mostrar"} Detalhes
          </Button>
        </div>

        {/* Detalhes */}
        {showDetails && (
          <div className="space-y-4">
            {Object.entries(dados).map(([key, item]) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{key} ({item.total} itens):</h4>
                  <div className="text-xs text-gray-600 mb-2">Fonte: {item.fonte}</div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(item.dados?.slice(0, 3), null, 2)}
                    {item.dados && item.dados.length > 3 && `\n... e mais ${item.dados.length - 3} itens`}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Comparação */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Comparação Técnicos:</h4>
            <div className="text-sm space-y-1">
              <div>Array básico: {dados.tecnicosArray.total} técnicos</div>
              <div>getTecnicos(): {dados.tecnicosCombinados.total} técnicos</div>
              <div className={`font-medium ${dados.tecnicosArray.total === dados.tecnicosCombinados.total ? 'text-green-600' : 'text-orange-600'}`}>
                {dados.tecnicosArray.total === dados.tecnicosCombinados.total 
                  ? '✅ Contagem igual' 
                  : '⚠️ Contagem diferente - usar getTecnicos() nos filtros!'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recomendações */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Recomendações:</h4>
            <div className="text-sm space-y-1">
              <div>• Filtros devem usar getTecnicos() ao invés do array tecnicos</div>
              <div>• Verificar se campanhas estão sendo carregadas corretamente</div>
              <div>• Formas de pagamento devem vir da API automaticamente</div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
