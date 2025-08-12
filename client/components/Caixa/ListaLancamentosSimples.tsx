import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { formatDate } from "../../lib/dateUtils";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
import { toast } from "../ui/use-toast";
import { ModalEditarLancamento } from "./ModalEditarLancamento";
import { LancamentoCaixa } from "@shared/types";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export function ListaLancamentosSimples() {
  const { lancamentos, excluirLancamento, isLoading, error } = useCaixa();
  const [lancamentoParaExcluir, setLancamentoParaExcluir] = useState<
    string | null
  >(null);
  const [lancamentoParaEditar, setLancamentoParaEditar] =
    useState<LancamentoCaixa | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const handleExcluir = async () => {
    if (!lancamentoParaExcluir) return;

    setExcluindo(true);
    try {
      await excluirLancamento(lancamentoParaExcluir);
      toast({
        title: "Sucesso",
        description: "Lançamento excluído com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir lançamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setExcluindo(false);
      setLancamentoParaExcluir(null);
    }
  };

  const handleEditar = (lancamento: LancamentoCaixa) => {
    setLancamentoParaEditar(lancamento);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando lançamentos...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Erro ao carregar lançamentos: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Lançamentos
        </CardTitle>
        <CardDescription>
          {lancamentos.length} lançamento(s) encontrado(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lancamentos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum lançamento encontrado para o período selecionado.
          </div>
        ) : (
          <>
            {/* Versão Desktop - Tabela */}
            <div className="hidden lg:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lancamentos.map((lancamento) => (
                    <TableRow key={lancamento.id}>
                      <TableCell>{formatDate(lancamento.data)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lancamento.tipo === "receita"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            lancamento.tipo === "receita"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }
                        >
                          {lancamento.tipo === "receita" ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {lancamento.tipo === "receita"
                            ? "Receita"
                            : "Despesa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lancamento.descricao?.nome || "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatarMoeda(
                          lancamento.valorLiquido || lancamento.valor,
                        )}
                      </TableCell>
                      <TableCell>
                        {lancamento.formaPagamento?.nome || "N/A"}
                      </TableCell>
                      <TableCell>
                        {lancamento.funcionario?.nome || "-"}
                      </TableCell>
                      <TableCell>
                        {lancamento.setor
                          ? `${lancamento.setor.nome} - ${lancamento.setor.cidade}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEditar(lancamento)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setLancamentoParaExcluir(
                                  lancamento.id.toString(),
                                )
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Versão Mobile - Cards */}
            <div className="lg:hidden space-y-3">
              {lancamentos.map((lancamento) => (
                <Card key={lancamento.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header do Card */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={
                                lancamento.tipo === "receita"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                lancamento.tipo === "receita"
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }
                            >
                              {lancamento.tipo === "receita" ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {lancamento.tipo === "receita"
                                ? "Receita"
                                : "Despesa"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(lancamento.data)}
                            </span>
                          </div>
                          <p className="font-medium text-sm">
                            {lancamento.descricao?.nome || "N/A"}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditar(lancamento)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setLancamentoParaExcluir(
                                  lancamento.id.toString(),
                                )
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Valor em destaque */}
                      <div className="text-right">
                        <span
                          className={`text-lg font-bold ${
                            lancamento.tipo === "receita"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatarMoeda(
                            lancamento.valorLiquido || lancamento.valor,
                          )}
                        </span>
                      </div>

                      {/* Detalhes em grid */}
                      <div className="grid grid-cols-1 gap-2 text-sm border-t pt-3">
                        {lancamento.formaPagamento?.nome && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Forma:</span>
                            <span className="font-medium">
                              {lancamento.formaPagamento.nome}
                            </span>
                          </div>
                        )}
                        {lancamento.funcionario?.nome && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Técnico:</span>
                            <span className="font-medium">
                              {lancamento.funcionario.nome}
                            </span>
                          </div>
                        )}
                        {lancamento.setor && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Setor:</span>
                            <span className="font-medium">
                              {lancamento.setor.nome} -{" "}
                              {lancamento.setor.cidade}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!lancamentoParaExcluir}
        onOpenChange={() => setLancamentoParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lançamento? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              disabled={excluindo}
              className="bg-red-600 hover:bg-red-700"
            >
              {excluindo ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de edição */}
      {lancamentoParaEditar && (
        <ModalEditarLancamento
          lancamento={lancamentoParaEditar}
          isOpen={!!lancamentoParaEditar}
          onClose={() => setLancamentoParaEditar(null)}
        />
      )}
    </Card>
  );
}
