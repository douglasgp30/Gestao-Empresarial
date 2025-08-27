import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TestTube, AlertTriangle, CheckCircle } from "lucide-react";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { useClientes } from "../../contexts/ClientesContext";

export function TesteDadosFiltros() {
  const { campanhas } = useCaixa();
  const { formasPagamento, getTecnicos, tecnicos } = useEntidades();
  const { clientes } = useClientes();

  const tecnicosCombinados = getTecnicos();

  const testes = [
    {
      nome: "Campanhas carregadas",
      passou: Array.isArray(campanhas) && campanhas.length > 0,
      detalhes: `${campanhas?.length || 0} campanhas encontradas`,
      importante: true,
    },
    {
      nome: "Formas de Pagamento carregadas",
      passou: Array.isArray(formasPagamento) && formasPagamento.length > 0,
      detalhes: `${formasPagamento?.length || 0} formas encontradas`,
      importante: true,
    },
    {
      nome: "Técnicos (array) carregados",
      passou: Array.isArray(tecnicos) && tecnicos.length > 0,
      detalhes: `${tecnicos?.length || 0} técnicos no array`,
      importante: false,
    },
    {
      nome: "Técnicos (getTecnicos) carregados",
      passou:
        Array.isArray(tecnicosCombinados) && tecnicosCombinados.length > 0,
      detalhes: `${tecnicosCombinados?.length || 0} técnicos via getTecnicos()`,
      importante: true,
    },
    {
      nome: "Clientes carregados",
      passou: Array.isArray(clientes) && clientes.length > 0,
      detalhes: `${clientes?.length || 0} clientes encontrados`,
      importante: false,
    },
    {
      nome: "Consistência técnicos",
      passou: tecnicosCombinados?.length >= (tecnicos?.length || 0),
      detalhes: `getTecnicos() deve ter >= que array tecnicos`,
      importante: true,
    },
  ];

  const testesImportantes = testes.filter((t) => t.importante);
  const testesPassaram = testesImportantes.filter((t) => t.passou).length;
  const statusGeral = testesPassaram === testesImportantes.length;

  const executarTestesCompletos = () => {
    console.log("🧪 [TesteDadosFiltros] Executando testes completos...");
    testes.forEach((teste, index) => {
      console.log(
        `${teste.passou ? "✅" : "❌"} Teste ${index + 1}: ${teste.nome}`,
      );
      console.log(`   ${teste.detalhes}`);
    });

    console.log(
      `\n📊 Resumo: ${testesPassaram}/${testesImportantes.length} testes importantes passaram`,
    );

    if (!statusGeral) {
      console.warn(
        "⚠️ Alguns testes falharam - verifique os dados dos filtros!",
      );
    } else {
      console.log("✅ Todos os testes importantes passaram!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Teste Rápido - Dados dos Filtros
          <Badge variant={statusGeral ? "default" : "destructive"}>
            {testesPassaram}/{testesImportantes.length}
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
                ? "✅ Todos os dados essenciais estão carregados"
                : "❌ Alguns dados essenciais não foram carregados"}
            </span>
          </div>
        </div>

        {/* Lista de Testes */}
        <div className="space-y-2">
          {testes.map((teste, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="flex items-center gap-2">
                {teste.passou ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">{teste.nome}</span>
                {teste.importante && (
                  <Badge variant="outline" className="text-xs">
                    Essencial
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-600">{teste.detalhes}</span>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button onClick={executarTestesCompletos} size="sm" variant="outline">
            🧪 Executar Testes Completos
          </Button>

          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
          >
            🔄 Recarregar Página
          </Button>
        </div>

        {/* Diagnóstico */}
        {!statusGeral && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-800 mb-1">
              💡 Possíveis Soluções:
            </h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>
                • Recarregue a página para forçar o carregamento dos dados
              </div>
              <div>
                • Verifique se há dados cadastrados (campanhas, formas de
                pagamento, técnicos)
              </div>
              <div>
                • Use o componente "Debug - Dados dos Filtros" para análise
                detalhada
              </div>
              <div>• Filtros usam getTecnicos() ao invés do array tecnicos</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
