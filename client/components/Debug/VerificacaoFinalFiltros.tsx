import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { useClientes } from "../../contexts/ClientesContext";

export function VerificacaoFinalFiltros() {
  const [verificacoes, setVerificacoes] = useState({});

  const { campanhas } = useCaixa();
  const { formasPagamento, getTecnicos } = useEntidades();
  const { clientes } = useClientes();

  const tecnicos = getTecnicos();

  const executarVerificacao = () => {
    const resultados = {
      campanhas: {
        quantidade: campanhas?.length || 0,
        ok: (campanhas?.length || 0) >= 2,
        detalhes: campanhas?.map((c) => c.nome).join(", ") || "Nenhuma",
      },
      formasPagamento: {
        quantidade: formasPagamento?.length || 0,
        ok: (formasPagamento?.length || 0) >= 5,
        detalhes:
          formasPagamento
            ?.slice(0, 3)
            .map((f) => f.nome)
            .join(", ") + (formasPagamento?.length > 3 ? "..." : "") ||
          "Nenhuma",
      },
      tecnicos: {
        quantidade: tecnicos?.length || 0,
        ok: (tecnicos?.length || 0) >= 3,
        detalhes:
          tecnicos
            ?.slice(0, 3)
            .map((t) => t.nome)
            .join(", ") + (tecnicos?.length > 3 ? "..." : "") || "Nenhum",
      },
      clientes: {
        quantidade: clientes?.length || 0,
        ok: true, // Clientes são opcionais
        detalhes:
          clientes
            ?.slice(0, 2)
            .map((c) => c.nome)
            .join(", ") + (clientes?.length > 2 ? "..." : "") || "Nenhum",
      },
    };

    setVerificacoes(resultados);

    console.log(
      "🔍 [VerificacaoFinalFiltros] Resultados da verificação:",
      resultados,
    );
  };

  useEffect(() => {
    executarVerificacao();
  }, [campanhas, formasPagamento, tecnicos, clientes]);

  const todosOk = Object.values(verificacoes).every((v: any) => v?.ok);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {todosOk ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          )}
          Verificação Final - Dados dos Filtros
          <Badge variant={todosOk ? "default" : "secondary"}>
            {todosOk ? "✅ OK" : "⚠️ Pendente"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div
          className={`p-3 rounded border ${todosOk ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}
        >
          <div className="text-sm font-medium">
            {todosOk
              ? "✅ Todos os dados necessários estão carregados! Os filtros devem funcionar corretamente."
              : "⚠️ Alguns dados podem estar faltando. Verifique os itens abaixo."}
          </div>
        </div>

        {/* Detalhes de cada verificação */}
        <div className="space-y-3">
          {Object.entries(verificacoes).map(([key, dados]: [string, any]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div className="flex items-center gap-2">
                {dados?.ok ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                )}
                <span className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <Badge variant={dados?.ok ? "default" : "secondary"}>
                  {dados?.quantidade || 0}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 max-w-xs truncate">
                {dados?.detalhes}
              </div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button onClick={executarVerificacao} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Verificar Novamente
          </Button>

          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
          >
            🔄 Recarregar Página
          </Button>
        </div>

        {/* Instruções */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-800 mb-1">
            📋 Status dos Dados:
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• **Período padrão**: Agora é "Hoje" (corrigido)</div>
            <div>
              • **Campanhas**:{" "}
              {verificacoes.campanhas?.ok
                ? "✅ OK"
                : "❌ Precisa de pelo menos 2"}
            </div>
            <div>
              • **Formas Pagamento**:{" "}
              {verificacoes.formasPagamento?.ok
                ? "✅ OK"
                : "❌ Precisa de pelo menos 5"}
            </div>
            <div>
              • **Técnicos**:{" "}
              {verificacoes.tecnicos?.ok
                ? "✅ OK"
                : "❌ Precisa de pelo menos 3"}
            </div>
            <div>
              • **Filtros**: Agora usam getTecnicos() igual ao formulário de
              lançamento
            </div>
          </div>
        </div>

        {!todosOk && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-800 mb-1">
              💡 Como corrigir:
            </h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>
                1. Execute: curl -X POST
                http://localhost:8080/api/init/test-users
              </div>
              <div>
                2. Execute: curl -X POST
                http://localhost:8080/api/init/basic-data
              </div>
              <div>3. Recarregue a página para ver os dados atualizados</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
