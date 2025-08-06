import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Receipt,
  User,
  MapPin,
  CreditCard,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ListaLancamentos() {
  const { lancamentos, filtros, excluirLancamento } = useCaixa();
  const [lancamentoParaExcluir, setLancamentoParaExcluir] = useState<
    string | null
  >(null);

  // Filtrar lançamentos
  const lancamentosFiltrados = lancamentos
    .filter((lancamento) => {
      const dataLancamento = new Date(lancamento.data);
      const dentroDataInicio = dataLancamento >= filtros.dataInicio;
      const dentroDataFim = dataLancamento <= filtros.dataFim;
      const tipoCorreto =
        filtros.tipo === "todos" || lancamento.tipo === filtros.tipo;
      const formaCorreta =
        !filtros.formaPagamento ||
        lancamento.formaPagamento === filtros.formaPagamento;
      const tecnicoCorreto =
        !filtros.tecnico || lancamento.tecnicoResponsavel === filtros.tecnico;
      const campanhaCorreta =
        !filtros.campanha || lancamento.campanha === filtros.campanha;
      const setorCorreto = !filtros.setor || lancamento.setor === filtros.setor;

      return (
        dentroDataInicio &&
        dentroDataFim &&
        tipoCorreto &&
        formaCorreta &&
        tecnicoCorreto &&
        campanhaCorreta &&
        setorCorreto
      );
    })
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const handleExcluir = (id: string) => {
    excluirLancamento(id);
    setLancamentoParaExcluir(null);
  };

  if (lancamentosFiltrados.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nenhum lançamento encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou adicione novos lançamentos de receitas e
            despesas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos</CardTitle>
          <CardDescription>
            {lancamentosFiltrados.length} lançamento(s) encontrado(s) no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Forma Pagto.</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lancamentosFiltrados.map((lancamento) => (
                  <TableRow key={lancamento.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(lancamento.data)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          lancamento.tipo === "receita"
                            ? "default"
                            : "destructive"
                        }
                        className="flex items-center space-x-1 w-fit"
                      >
                        {lancamento.tipo === "receita" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {lancamento.tipo === "receita"
                            ? "Receita"
                            : "Despesa"}
                        </span>
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div>
                        {lancamento.tipo === "receita" ? (
                          <div>
                            <p className="font-medium">
                              Serviço - {lancamento.setor || "Geral"}
                            </p>
                            {lancamento.campanha && (
                              <p className="text-xs text-muted-foreground">
                                Campanha: {lancamento.campanha}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">
                              {lancamento.categoria}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lancamento.descricao}
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p
                          className={`font-bold ${
                            lancamento.tipo === "receita"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(
                            lancamento.valorLiquido || lancamento.valor,
                          )}
                        </p>
                        {lancamento.valorLiquido &&
                          lancamento.valorLiquido !== lancamento.valor && (
                            <p className="text-xs text-muted-foreground">
                              Bruto: {formatCurrency(lancamento.valor)}
                            </p>
                          )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {lancamento.formaPagamento}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {lancamento.tecnicoResponsavel && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{lancamento.tecnicoResponsavel}</span>
                          </div>
                        )}
                        {lancamento.comissao && (
                          <div className="text-xs text-blue-600">
                            Comissão: {formatCurrency(lancamento.comissao)}
                          </div>
                        )}
                        {lancamento.notaFiscal && (
                          <Badge variant="outline" className="text-xs">
                            NF
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              setLancamentoParaExcluir(lancamento.id)
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
              onClick={() =>
                lancamentoParaExcluir && handleExcluir(lancamentoParaExcluir)
              }
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
