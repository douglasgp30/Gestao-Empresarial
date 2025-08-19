import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const ResetarSistema = () => {
  const [isLoading, setIsLoading] = useState(false);

  const resetarSistemaCompleto = async () => {
    setIsLoading(true);

    try {
      // Listar todas as chaves do localStorage que queremos limpar
      const chavesParaLimpar = [
        // Dados principais
        "funcionarios",
        "auth_user",
        "clientes",
        "lancamentos_caixa",
        "contas_pagar",
        "contas_receber",
        "agendamentos",
        "campanhas",

        // Configurações
        "config_sistema",
        "categorias_receita",
        "categorias_despesa",
        "formas_pagamento",

        // Estados de primeiro acesso e tour
        "primeiro_acesso_completo",
        "tour_visualizado",
        "tour_completo",

        // Configurações de backup
        "ultimo_backup",
        "ultimo_login_backup",

        // Outros dados temporários
        "filtros_caixa",
        "filtros_contas",
        "filtros_agendamentos",
        "filtros_funcionarios",
        "filtros_clientes",
      ];

      // Remover todas as chaves
      chavesParaLimpar.forEach((chave) => {
        localStorage.removeItem(chave);
      });

      // Aguardar um pouco para garantir que a limpeza foi feita
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Sistema resetado com sucesso! Recarregando...", {
        duration: 2000,
      });

      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Erro ao resetar sistema:", error);
      toast.error("Erro ao resetar o sistema. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <span>Resetar Sistema</span>
        </CardTitle>
        <CardDescription>
          Apagar todos os dados e voltar ao estado inicial do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-destructive/10 rounded-lg">
          <p className="text-sm text-destructive font-medium mb-2">
            ⚠️ ATENÇÃO: Esta ação é irreversível!
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Todos os funcionários serão removidos</li>
            <li>• Todos os lançamentos de caixa serão perdidos</li>
            <li>• Todas as contas e agendamentos serão apagados</li>
            <li>• Todas as configurações serão resetadas</li>
            <li>• O sistema voltará à tela de primeiro acesso</li>
          </ul>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isLoading ? "Resetando..." : "Resetar Sistema Completo"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span>Confirmar Reset do Sistema</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <div>
                  Tem certeza de que deseja resetar completamente o sistema?
                </div>
                <div className="font-medium text-destructive">
                  Esta ação apagará TODOS os dados e não pode ser desfeita.
                </div>
                <div>
                  Após o reset, você voltará à tela de criação do primeiro
                  administrador.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={resetarSistemaCompleto}
                className="bg-destructive hover:bg-destructive/90"
              >
                Sim, Resetar Tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default ResetarSistema;
