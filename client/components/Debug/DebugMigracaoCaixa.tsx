import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AlertTriangle, Database, RefreshCw, Eye, Trash2 } from "lucide-react";

export function DebugMigracaoCaixa() {
  const [dadosLocalStorage, setDadosLocalStorage] = useState<any[]>([]);
  const [dadosBanco, setDadosBanco] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupDisponivel, setBackupDisponivel] = useState(false);

  const verificarDados = () => {
    // Verificar localStorage
    const lancamentosLocal = localStorage.getItem("lancamentos_caixa");
    const dadosLocal = lancamentosLocal ? JSON.parse(lancamentosLocal) : [];
    setDadosLocalStorage(dadosLocal);

    // Verificar backup
    const backup = localStorage.getItem("backup_antes_migracao_banco");
    setBackupDisponivel(!!backup);

    console.log("📊 Dados localStorage:", dadosLocal);
    console.log("📊 Backup disponível:", !!backup);
  };

  const verificarDadosBanco = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/caixa");
      if (response.ok) {
        const dados = await response.json();
        setDadosBanco(dados);
        console.log("📊 Dados banco:", dados);
      } else {
        console.error("❌ Erro ao buscar dados do banco");
      }
    } catch (error) {
      console.error("❌ Erro ao verificar banco:", error);
    } finally {
      setLoading(false);
    }
  };

  const restaurarBackup = () => {
    const backup = localStorage.getItem("backup_antes_migracao_banco");
    if (backup) {
      const dadosBackup = JSON.parse(backup);
      localStorage.setItem(
        "lancamentos_caixa",
        JSON.stringify(dadosBackup.dados),
      );
      console.log(
        "🔄 Backup restaurado:",
        dadosBackup.dados.length,
        "lançamentos",
      );
      verificarDados();
      alert(
        `Backup restaurado! ${dadosBackup.dados.length} lançamentos recuperados.`,
      );
    }
  };

  const limparTodosDados = () => {
    if (
      confirm(
        "⚠️ Isso vai limpar TODOS os dados (localStorage e backup). Confirma?",
      )
    ) {
      localStorage.removeItem("lancamentos_caixa");
      localStorage.removeItem("backup_antes_migracao_banco");
      localStorage.removeItem("migracao_caixa_verificada");
      verificarDados();
      alert("🧹 Todos os dados foram limpos.");
    }
  };

  const testarMigracao = async () => {
    if (dadosLocalStorage.length === 0) {
      alert("❌ Não há dados no localStorage para migrar");
      return;
    }

    try {
      const resultado = await (window as any).migrarUmLancamento(0);
      console.log("🧪 Teste de migração:", resultado);

      if (resultado.success) {
        alert(
          "✅ Teste de migração bem-sucedido! Verifique o console para detalhes.",
        );
        verificarDadosBanco();
      } else {
        alert(`❌ Erro no teste: ${resultado.erro}`);
      }
    } catch (error) {
      alert(`❌ Erro inesperado: ${error.message}`);
    }
  };

  useEffect(() => {
    verificarDados();
    verificarDadosBanco();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Debug - Migração do Caixa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status dos dados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">localStorage</span>
                <Badge
                  variant={
                    dadosLocalStorage.length > 0 ? "destructive" : "secondary"
                  }
                >
                  {dadosLocalStorage.length} lançamentos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Banco de Dados</span>
                <Badge
                  variant={dadosBanco.length > 0 ? "default" : "secondary"}
                >
                  {dadosBanco.length} lançamentos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backup</span>
                <Badge variant={backupDisponivel ? "default" : "secondary"}>
                  {backupDisponivel ? "Disponível" : "Não disponível"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={verificarDados}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>

          <Button
            onClick={verificarDadosBanco}
            size="sm"
            variant="outline"
            loading={loading}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Verificar Banco
          </Button>

          {dadosLocalStorage.length > 0 && (
            <Button
              onClick={testarMigracao}
              size="sm"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Testar Migração (1 item)
            </Button>
          )}

          {backupDisponivel && (
            <Button
              onClick={restaurarBackup}
              size="sm"
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Restaurar Backup
            </Button>
          )}

          <Button
            onClick={limparTodosDados}
            size="sm"
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Tudo
          </Button>
        </div>

        {/* Informações detalhadas */}
        {dadosLocalStorage.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Dados no localStorage:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(dadosLocalStorage.slice(0, 2), null, 2)}
                {dadosLocalStorage.length > 2 &&
                  "\n... e mais " + (dadosLocalStorage.length - 2) + " itens"}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Alertas */}
        {dadosLocalStorage.length > 0 && dadosBanco.length === 0 && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-700">
              <strong>Migração necessária:</strong> Há{" "}
              {dadosLocalStorage.length} lançamentos no localStorage que
              precisam ser migrados para o banco de dados.
            </div>
          </div>
        )}

        {dadosLocalStorage.length > 0 && dadosBanco.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <strong>Duplicação possível:</strong> Há dados tanto no
              localStorage quanto no banco. Verifique se a migração já foi
              concluída.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
