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
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const LimpezaCompleta = () => {
  const [isLoading, setIsLoading] = useState(false);

  const executarLimpezaCompleta = async () => {
    setIsLoading(true);

    try {
      console.log("🧹 [LimpezaCompleta] INICIANDO LIMPEZA COMPLETA DOS DADOS");

      // Lista de chaves do localStorage que serão APAGADAS
      const chavesParaLimpar = [
        // Dados principais
        "lancamentos_caixa",
        "campanhas", 
        "clientes",
        "agendamentos",
        "lembretes_agendamentos",
        "contas_pagar",
        "contas_receber",
        "fornecedores",
        
        // Categorias e descrições
        "descricoes_e_categorias",
        "categorias_receita", 
        "categorias_despesa",
        
        // Localizações (cidades de Goiás serão preservadas)
        // "localizacoes_geograficas", // REMOVIDO - preservar cidades conforme solicitado
        
        // Funcionários (exceto o admin atual será recriado)
        "funcionarios",
        
        // Estados de filtros
        "filtros_caixa",
        "filtros_contas",
        "filtros_agendamentos", 
        "filtros_funcionarios",
        "filtros_clientes",
        
        // Backups e caches
        "contas-backup",
        "ultimo_backup",
        "ultimo_login_backup",
      ];

      // Metas mensais (todas as chaves que começam com metaMes_)
      const todasAsChaves = Object.keys(localStorage);
      const chavesMetas = todasAsChaves.filter(chave => chave.startsWith("metaMes_"));
      chavesParaLimpar.push(...chavesMetas);

      console.log(`🧹 [LimpezaCompleta] ${chavesParaLimpar.length} tipos de dados serão limpos`);

      // Remover todas as chaves identificadas
      chavesParaLimpar.forEach((chave) => {
        const valorAntes = localStorage.getItem(chave);
        if (valorAntes) {
          localStorage.removeItem(chave);
          console.log(`✅ [LimpezaCompleta] ${chave} removido`);
        }
      });

      // Aguardar um pouco para garantir que a limpeza foi feita
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("🎉 [LimpezaCompleta] LIMPEZA COMPLETA CONCLUÍDA!");

      toast.success("LIMPEZA COMPLETA REALIZADA! 🧹", {
        description: "Dados removidos com sucesso! Preservadas: formas de pagamento e cidades de Goiás. Recarregando sistema...",
        duration: 3000,
      });

      // Recarregar a página após 3 segundos para aplicar as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error("❌ [LimpezaCompleta] Erro durante a limpeza:", error);
      toast.error("Erro durante a limpeza dos dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-orange-300 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-700">
          <Trash2 className="w-5 h-5" />
          <span>Limpeza Completa de Dados</span>
        </CardTitle>
        <CardDescription className="text-orange-600">
          Remove TODOS os dados lançados (fictícios ou reais), mas mantém formas de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-orange-100 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-800 font-medium mb-2">
            🧹 Esta função vai APAGAR:
          </p>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Todos os lançamentos de caixa</li>
            <li>• Todas as campanhas</li>
            <li>• Todos os clientes</li>
            <li>• Todos os agendamentos</li>
            <li>• Todas as contas (a pagar e receber)</li>
            <li>• Todas as categorias e descrições</li>
            <li>• Setores temporários (cidades de Goiás serão mantidas)</li>
            <li>• Todos os fornecedores</li>
            <li>• Todas as metas configuradas</li>
          </ul>
        </div>

        <div className="p-4 bg-green-100 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 font-medium mb-2">
            ✅ Esta função vai MANTER:
          </p>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Formas de pagamento (conforme solicitado)</li>
            <li>• Cidades de Goiás e localizações geográficas</li>
            <li>• Usuário logado atual</li>
            <li>• Configurações da empresa</li>
            <li>• Configurações de backup</li>
          </ul>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isLoading ? "Limpando..." : "EXECUTAR LIMPEZA COMPLETA"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Confirmar Limpeza Completa</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <div>
                  Tem certeza de que deseja APAGAR todos os dados lançados?
                </div>
                <div className="font-medium text-orange-700">
                  Esta ação removerá TODOS os lançamentos, clientes, campanhas, agendamentos, etc.
                </div>
                <div className="font-medium text-green-700">
                  As FORMAS DE PAGAMENTO e CIDADES DE GOIÁS serão mantidas.
                </div>
                <div className="text-sm text-gray-600">
                  O sistema será recarregado após a limpeza.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={executarLimpezaCompleta}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Sim, Limpar Tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default LimpezaCompleta;
