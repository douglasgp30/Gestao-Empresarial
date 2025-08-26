import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export function DebugPrimeiroAcesso() {
  const [localStorageData, setLocalStorageData] = useState<Record<string, any>>(
    {},
  );
  const [showValues, setShowValues] = useState(false);

  const loadLocalStorageData = () => {
    const data: Record<string, any> = {};

    // Chaves importantes para verificar
    const chavesImportantes = [
      "funcionarios",
      "auth_user",
      "primeiro_acesso_completo",
      "tour_visualizado",
      "tour_completo",
      "descricoes_e_categorias",
    ];

    chavesImportantes.forEach((chave) => {
      const valor = localStorage.getItem(chave);
      data[chave] = {
        existe: valor !== null,
        valor: valor ? JSON.parse(valor) : null,
        tamanho: valor ? valor.length : 0,
      };
    });

    // Verificar se existe administrador usando a mesma lógica do AuthContext
    const funcionariosStorage = localStorage.getItem("funcionarios");
    let existeAdmin = false;
    let quantidadeFuncionarios = 0;
    let administradores: any[] = [];

    if (funcionariosStorage) {
      try {
        const funcionarios = JSON.parse(funcionariosStorage);
        quantidadeFuncionarios = funcionarios.length;
        administradores = funcionarios.filter(
          (f: any) =>
            f.permissaoAcesso && f.ativo && f.tipoAcesso === "Administrador",
        );
        existeAdmin = administradores.length > 0;
      } catch (error) {
        console.error("Erro ao parsear funcionários:", error);
      }
    }

    data._verificacao = {
      existeAdmin,
      quantidadeFuncionarios,
      quantidadeAdministradores: administradores.length,
      administradores: administradores.map((admin) => ({
        id: admin.id,
        nomeCompleto: admin.nomeCompleto,
        login: admin.login,
        ativo: admin.ativo,
        permissaoAcesso: admin.permissaoAcesso,
        tipoAcesso: admin.tipoAcesso,
      })),
    };

    setLocalStorageData(data);
  };

  useEffect(() => {
    loadLocalStorageData();
  }, []);

  const limparChave = (chave: string) => {
    localStorage.removeItem(chave);
    toast.success(`Chave "${chave}" removida do localStorage`);
    loadLocalStorageData();
  };

  const simularPrimeiroAdmin = () => {
    const adminTeste = {
      id: `admin-debug-${Date.now()}`,
      nomeCompleto: "Admin Teste",
      login: "admin",
      senha: "123456",
      permissaoAcesso: true,
      tipoAcesso: "Administrador",
      ativo: true,
      ehTecnico: false,
      temAcessoSistema: true,
      telefone: "",
      email: "",
      cargo: "Administrador",
      dataCadastro: new Date(),
      percentualComissao: 0,
      salario: 0,
      permissoes: {
        acessarDashboard: true,
        verCaixa: true,
        lancarReceita: true,
        lancarDespesa: true,
        editarLancamentos: true,
        verContas: true,
        acessarConfiguracoes: true,
        gerenciarFuncionarios: true,
        alterarPermissoes: true,
      },
    };

    localStorage.setItem("funcionarios", JSON.stringify([adminTeste]));
    localStorage.setItem("primeiro_acesso_completo", "true");

    toast.success("Admin teste criado! Recarregue a página para ver o efeito.");
    loadLocalStorageData();
  };

  const resetarCompleto = () => {
    const chaves = [
      "funcionarios",
      "auth_user",
      "primeiro_acesso_completo",
      "tour_visualizado",
      "tour_completo",
    ];
    chaves.forEach((chave) => localStorage.removeItem(chave));
    toast.info(
      "Todas as chaves removidas. Sistema voltará ao primeiro acesso.",
    );
    loadLocalStorageData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🔍 Debug - Primeiro Acesso
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValues(!showValues)}
              >
                {showValues ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {showValues ? "Ocultar" : "Mostrar"} Valores
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadLocalStorageData}
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Verificação */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">📊 Status da Verificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {localStorageData._verificacao?.existeAdmin ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>
                  {localStorageData._verificacao?.existeAdmin
                    ? "Admin encontrado"
                    : "Nenhum admin encontrado"}
                </span>
              </div>
              <div>
                Funcionários:{" "}
                <Badge variant="secondary">
                  {localStorageData._verificacao?.quantidadeFuncionarios || 0}
                </Badge>
              </div>
              <div>
                Administradores:{" "}
                <Badge variant="secondary">
                  {localStorageData._verificacao?.quantidadeAdministradores ||
                    0}
                </Badge>
              </div>
            </div>

            {localStorageData._verificacao?.administradores?.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-2">
                  Administradores encontrados:
                </h4>
                {localStorageData._verificacao.administradores.map(
                  (admin: any, index: number) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded">
                      <strong>{admin.nomeCompleto}</strong> ({admin.login}) -
                      Ativo: {admin.ativo ? "✅" : "❌"}, Permissão:{" "}
                      {admin.permissaoAcesso ? "✅" : "❌"}, Tipo:{" "}
                      {admin.tipoAcesso}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Chaves do localStorage */}
          <div className="space-y-3">
            <h3 className="font-semibold">🗄️ Chaves do localStorage</h3>
            {Object.entries(localStorageData).map(
              ([chave, dados]: [string, any]) => {
                if (chave === "_verificacao") return null;

                return (
                  <div
                    key={chave}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong>{chave}</strong>
                        <Badge
                          variant={dados?.existe ? "default" : "destructive"}
                        >
                          {dados?.existe ? "Existe" : "Não existe"}
                        </Badge>
                        {dados?.existe && (
                          <Badge variant="outline">{dados.tamanho} chars</Badge>
                        )}
                      </div>
                      {showValues && dados?.existe && (
                        <pre className="mt-2 p-2 bg-muted text-xs rounded overflow-auto max-h-32">
                          {JSON.stringify(dados.valor, null, 2)}
                        </pre>
                      )}
                    </div>
                    {dados?.existe && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => limparChave(chave)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              },
            )}
          </div>

          {/* Ações de Debug */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={simularPrimeiroAdmin}>
              ➕ Criar Admin Teste
            </Button>
            <Button variant="destructive" onClick={resetarCompleto}>
              🔄 Reset Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
