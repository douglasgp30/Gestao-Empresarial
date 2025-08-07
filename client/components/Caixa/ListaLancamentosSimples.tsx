import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import TabelaResponsivaLancamentos from "../ui/tabela-responsiva";
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
} from "../ui/alert-dialog";
import { Receipt, FileText, Download, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

export default function ListaLancamentosSimples() {
  const { lancamentos, excluirLancamento, filtros, isLoading } = useCaixa();
  const [lancamentoParaExcluir, setLancamentoParaExcluir] = useState<
    string | null
  >(null);
  const [notaFiscalVisualizada, setNotaFiscalVisualizada] = useState<
    any | null
  >(null);

  // Filtrar lançamentos baseado nos filtros atuais
  const lancamentosFiltrados = React.useMemo(() => {
    return lancamentos.filter((lancamento) => {
      const dataLancamento = new Date(lancamento.data);
      const dentroDataInicio = dataLancamento >= filtros.dataInicio;
      const dentroDataFim = dataLancamento <= filtros.dataFim;
      const tipoCorreto =
        !filtros.tipo ||
        filtros.tipo === "todos" ||
        lancamento.tipo === filtros.tipo;
      const formaPagamentoCorreta =
        !filtros.formaPagamento ||
        filtros.formaPagamento === "todas" ||
        lancamento.formaPagamento === filtros.formaPagamento;
      const tecnicoCorreto =
        !filtros.tecnico ||
        filtros.tecnico === "todos" ||
        lancamento.tecnicoResponsavel === filtros.tecnico;
      const campanhaCorreta =
        !filtros.campanha ||
        filtros.campanha === "todas" ||
        lancamento.campanha === filtros.campanha;
      const setorCorreto =
        !filtros.setor ||
        filtros.setor === "todos" ||
        lancamento.setor === filtros.setor;

      return (
        dentroDataInicio &&
        dentroDataFim &&
        tipoCorreto &&
        formaPagamentoCorreta &&
        tecnicoCorreto &&
        campanhaCorreta &&
        setorCorreto
      );
    });
  }, [lancamentos, filtros]);

  const handleExcluir = () => {
    if (lancamentoParaExcluir) {
      excluirLancamento(lancamentoParaExcluir);
      setLancamentoParaExcluir(null);
    }
  };

  const handleEditar = (id: string) => {
    // TODO: Implementar edição
    console.log("Editar lançamento:", id);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Lançamentos</span>
          </CardTitle>
          <CardDescription>
            {lancamentosFiltrados.length} lançamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <TabelaResponsivaLancamentos
            dados={lancamentosFiltrados}
            onEditar={handleEditar}
            onExcluir={setLancamentoParaExcluir}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!lancamentoParaExcluir}
        onOpenChange={() => setLancamentoParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lançamento? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
