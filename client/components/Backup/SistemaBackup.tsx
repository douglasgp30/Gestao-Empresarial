import React, { useState } from "react";
import { Button } from "../ui/button";
import { BackupService } from "../../lib/backupService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  HardDrive,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FolderOpen,
  Database,
} from "lucide-react";

interface BackupStatus {
  isRunning: boolean;
  progress: number;
  stage: string;
  completed: boolean;
  error: string | null;
  filePath: string | null;
}

export default function SistemaBackup() {
  const [isOpen, setIsOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    isRunning: false,
    progress: 0,
    stage: "",
    completed: false,
    error: null,
    filePath: null,
  });

  const gerarNomeBackup = () => {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");

    return `SolucaoDesentupimento_Backup_${ano}${mes}${dia}_${hora}${minuto}.bak`;
  };

  const simularBackup = async () => {
    setBackupStatus({
      isRunning: true,
      progress: 0,
      stage: "Preparando backup...",
      completed: false,
      error: null,
      filePath: null,
    });

    const etapas = [
      { stage: "Verificando conexão com banco de dados...", duration: 1000 },
      { stage: "Validando integridade dos dados...", duration: 1500 },
      { stage: "Iniciando backup do SQL Server...", duration: 2000 },
      { stage: "Compactando dados...", duration: 1500 },
      { stage: "Finalizando backup...", duration: 1000 },
    ];

    try {
      for (let i = 0; i < etapas.length; i++) {
        const etapa = etapas[i];
        setBackupStatus((prev) => ({
          ...prev,
          stage: etapa.stage,
          progress: ((i + 1) / etapas.length) * 100,
        }));

        await new Promise((resolve) => setTimeout(resolve, etapa.duration));
      }

      // Simular criação do arquivo
      const nomeArquivo = gerarNomeBackup();
      const caminhoCompleto = `C:\\Backups\\${nomeArquivo}`;

      setBackupStatus({
        isRunning: false,
        progress: 100,
        stage: "Backup concluído com sucesso!",
        completed: true,
        error: null,
        filePath: caminhoCompleto,
      });
    } catch (error) {
      setBackupStatus({
        isRunning: false,
        progress: 0,
        stage: "",
        completed: false,
        error:
          "Erro ao executar backup. Verifique as permissões e tente novamente.",
        filePath: null,
      });
    }
  };

  const resetBackup = () => {
    setBackupStatus({
      isRunning: false,
      progress: 0,
      stage: "",
      completed: false,
      error: null,
      filePath: null,
    });
  };

  const abrirPastaBackup = () => {
    // Em um sistema real, isso abriria o explorador de arquivos
    alert("Abrindo pasta de backups...\nC:\\Backups\\");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <HardDrive className="h-4 w-4" />
          Fazer Backup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Backup Manual do Sistema
          </DialogTitle>
          <DialogDescription>
            Gere uma cópia de segurança completa do banco de dados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status do Backup */}
          {!backupStatus.isRunning &&
            !backupStatus.completed &&
            !backupStatus.error && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Pronto para Backup
                  </CardTitle>
                  <CardDescription>
                    O backup criará um arquivo .bak completo do SQL Server
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">O que será incluído:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Dados do Caixa (receitas e despesas)</li>
                      <li>• Contas a pagar e receber</li>
                      <li>• Cadastro de funcionários</li>
                      <li>• Campanhas e configurações</li>
                      <li>• Estrutura completa do banco</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">
                          Importante:
                        </p>
                        <p className="text-yellow-700">
                          Certifique-se de ter permissões de escrita na pasta de
                          destino.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={simularBackup}
                    className="w-full"
                    disabled={backupStatus.isRunning}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Iniciar Backup
                  </Button>
                </CardContent>
              </Card>
            )}

          {/* Backup em Progresso */}
          {backupStatus.isRunning && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-medium">Executando Backup</h3>
                    <p className="text-sm text-muted-foreground">
                      {backupStatus.stage}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Progress
                      value={backupStatus.progress}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(backupStatus.progress)}% concluído
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Backup Concluído */}
          {backupStatus.completed && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-600">
                      Backup Concluído!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      O backup foi criado com sucesso
                    </p>
                  </div>

                  {backupStatus.filePath && (
                    <Alert>
                      <AlertDescription className="text-sm">
                        <strong>Arquivo criado:</strong>
                        <br />
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {backupStatus.filePath}
                        </code>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Button
                      onClick={abrirPastaBackup}
                      variant="outline"
                      className="w-full"
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Abrir Pasta de Backups
                    </Button>
                    <Button onClick={resetBackup} className="w-full">
                      Fazer Novo Backup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Erro no Backup */}
          {backupStatus.error && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-600">Erro no Backup</h3>
                    <p className="text-sm text-muted-foreground">
                      {backupStatus.error}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button onClick={resetBackup} className="w-full">
                      Tentar Novamente
                    </Button>
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
