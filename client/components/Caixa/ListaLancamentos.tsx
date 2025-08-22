import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import {
  isFormaPagamentoBoleto,
  formatCurrencySafe,
  extractSafeName,
} from "../../lib/stringUtils";
import { useClientes } from "../../contexts/ClientesContext";
import {
  getFormaPagamentoNome,
  getSetorNome,
  getTecnicoNome,
  getCampanhaNome,
  getClienteNome,
  getDescricaoDisplay,
  matchesFilter,
  getSortValue,
} from "./helpers";
import TabelaResponsivaLancamentos from "../ui/tabela-responsiva";
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

// Helper seguro para detectar boleto
const isFormaBoleto = (fp: any) => isFormaPagamentoBoleto(fp);

type SortField =
  | "data"
  | "tipo"
  | "valor"
  | "formaPagamento"
  | "tecnicoResponsavel"
  | "setor"
  | "cidade";
type SortDirection = "asc" | "desc" | null;

export default function ListaLancamentos() {
  const { lancamentos, filtros, excluirLancamento, campanhas } = useCaixa();
  const { formasPagamento, setores, getTecnicos } = useEntidades();
  const { clientes } = useClientes();
  const [lancamentoParaExcluir, setLancamentoParaExcluir] = useState<
    string | null
  >(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Se clicou na mesma coluna, alterna a direção
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      // Nova coluna, inicia com ordenação crescente
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-3 w-3 text-foreground" />;
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="h-3 w-3 text-foreground" />;
    }
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
  };

  // Filtrar e ordenar lançamentos
  const lancamentosFiltrados = lancamentos
    .filter((lancamento) => {
      const dataLancamento = new Date(lancamento.data);
      // Normalizar datas para comparação (apenas ano, mês, dia)
      const dataInicio = new Date(
        filtros.dataInicio.getFullYear(),
        filtros.dataInicio.getMonth(),
        filtros.dataInicio.getDate(),
      );
      const dataFim = new Date(
        filtros.dataFim.getFullYear(),
        filtros.dataFim.getMonth(),
        filtros.dataFim.getDate(),
      );
      const dataLancNorm = new Date(
        dataLancamento.getFullYear(),
        dataLancamento.getMonth(),
        dataLancamento.getDate(),
      );

      const dentroDataInicio = dataLancNorm >= dataInicio;
      const dentroDataFim = dataLancNorm <= dataFim;
      const tipoCorreto =
        filtros.tipo === "todos" || lancamento.tipo === filtros.tipo;
      const formaCorreta = matchesFilter(
        lancamento.formaPagamento,
        filtros.formaPagamento,
        formasPagamento,
      );
      const tecnicoCorreto = matchesFilter(
        lancamento.tecnicoResponsavel,
        filtros.tecnico,
        getTecnicos(),
      );
      const campanhaCorreta = matchesFilter(
        lancamento.campanha,
        filtros.campanha,
        campanhas,
      );
      const setorCorreto = matchesFilter(
        lancamento.setor,
        filtros.setor,
        setores,
      );

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
    .sort((a, b) => {
      // Aplicar ordenação personalizada se houver
      if (sortField && sortDirection) {
        const allItems = {
          formasPagamento,
          tecnicos: getTecnicos(),
          setores,
          campanhas,
          clientes,
        };

        const aValue = getSortValue(a, sortField, allItems[sortField] || []);
        const bValue = getSortValue(b, sortField, allItems[sortField] || []);

        let normalizedA = aValue;
        let normalizedB = bValue;

        if (typeof aValue === "string" && typeof bValue === "string") {
          normalizedA = aValue.toLowerCase();
          normalizedB = bValue.toLowerCase();
        }

        if (normalizedA < normalizedB) return sortDirection === "asc" ? -1 : 1;
        if (normalizedA > normalizedB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }

      // Ordenação padrão por data (mais recente primeiro)
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });

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
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort("data")}
                    >
                      Data
                      {getSortIcon("data")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort("tipo")}
                    >
                      Tipo
                      {getSortIcon("tipo")}
                    </Button>
                  </TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Código Serviço</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort("valor")}
                    >
                      Valores
                      {getSortIcon("valor")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort("formaPagamento")}
                    >
                      Forma Pagto.
                      {getSortIcon("formaPagamento")}
                    </Button>
                  </TableHead>
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
                        <p className="font-medium text-sm">
                          {lancamento.categoria || "N/A"}
                        </p>
                        {getSetorNome(lancamento.setor, setores) && (
                          <p className="text-xs text-muted-foreground">
                            {getSetorNome(lancamento.setor, setores)}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {getDescricaoDisplay(lancamento)}
                        </p>
                        {getCampanhaNome(lancamento.campanha, campanhas) && (
                          <p className="text-xs text-blue-600">
                            Campanha:{" "}
                            {getCampanhaNome(lancamento.campanha, campanhas)}
                          </p>
                        )}
                        {getClienteNome(lancamento.cliente, clientes) && (
                          <p className="text-xs text-green-600">
                            Cliente:{" "}
                            {getClienteNome(lancamento.cliente, clientes)}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {lancamento.codigoServico ? (
                        <div>
                          <p className="text-xs font-mono text-gray-600">
                            {lancamento.codigoServico}
                          </p>
                          {isFormaBoleto(lancamento.formaPagamento) && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Boleto
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div>
                        {/* Valor Integral */}
                        <p className="text-sm font-medium text-gray-700">
                          <span className="text-xs text-muted-foreground">
                            Integral:
                          </span>{" "}
                          {formatCurrencySafe(lancamento.valor)}
                        </p>

                        {/* Valor para Empresa */}
                        {lancamento.tipo === "receita" && (
                          <>
                            {lancamento.valorParaEmpresa !== undefined ? (
                              <p className={`font-bold text-green-600`}>
                                <span className="text-xs text-muted-foreground">
                                  P/ Empresa:
                                </span>{" "}
                                {formatCurrencySafe(
                                  lancamento.valorParaEmpresa,
                                )}
                              </p>
                            ) : // Verificar se é boleto
                            isFormaBoleto(lancamento.formaPagamento) ? (
                              <p className="text-xs text-orange-600 font-medium">
                                Aguardando recebimento
                              </p>
                            ) : (
                              <p className={`font-bold text-green-600`}>
                                <span className="text-xs text-muted-foreground">
                                  P/ Empresa:
                                </span>{" "}
                                {formatCurrencySafe(
                                  (lancamento.valorLiquido ||
                                    lancamento.valorRecebido ||
                                    lancamento.valor ||
                                    0) - (lancamento.comissao || 0),
                                )}
                              </p>
                            )}
                          </>
                        )}

                        {/* Para despesas, mostrar apenas o valor */}
                        {lancamento.tipo === "despesa" && (
                          <p className="font-bold text-red-600">
                            <span className="text-xs text-muted-foreground">
                              Despesa:
                            </span>{" "}
                            {formatCurrencySafe(lancamento.valor)}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {getFormaPagamentoNome(
                            lancamento.formaPagamento,
                            formasPagamento,
                          )}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {getTecnicoNome(
                          lancamento.tecnicoResponsavel,
                          getTecnicos(),
                        ) && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>
                              {getTecnicoNome(
                                lancamento.tecnicoResponsavel,
                                getTecnicos(),
                              )}
                            </span>
                          </div>
                        )}
                        {lancamento.comissao && lancamento.comissao > 0 && (
                          <div className="text-xs text-blue-600">
                            Comissão: {formatCurrency(lancamento.comissao)}
                          </div>
                        )}
                        {lancamento.numeroNota && (
                          <Badge variant="outline" className="text-xs">
                            NF: {lancamento.numeroNota}
                          </Badge>
                        )}
                        {lancamento.observacoes && (
                          <div
                            className="text-xs text-gray-500 truncate max-w-32"
                            title={lancamento.observacoes}
                          >
                            Obs: {lancamento.observacoes}
                          </div>
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
