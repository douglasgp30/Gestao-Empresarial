import React, { useState } from "react";
import { useContas } from "../../contexts/ContasContext";
import { formatDate } from "../../lib/dateUtils";
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
  CheckCircle2,
  Calendar,
  User,
  CreditCard,
  FileText,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";


function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "paga":
      return "bg-green-100 text-green-800 border-green-200";
    case "atrasada":
      return "bg-red-100 text-red-800 border-red-200";
    case "vence_hoje":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "pendente":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "paga":
      return <CheckCircle2 className="h-3 w-3" />;
    case "atrasada":
      return <Clock className="h-3 w-3" />;
    case "vence_hoje":
      return <AlertTriangle className="h-3 w-3" />;
    case "pendente":
      return <Calendar className="h-3 w-3" />;
    default:
      return <FileText className="h-3 w-3" />;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "paga":
      return "Paga";
    case "atrasada":
      return "Atrasada";
    case "vence_hoje":
      return "Vence Hoje";
    case "pendente":
      return "Pendente";
    default:
      return status;
  }
}

type SortField =
  | "dataVencimento"
  | "tipo"
  | "fornecedorCliente"
  | "valor"
  | "tipoPagamento"
  | "status";
type SortDirection = "asc" | "desc" | null;

export default function ListaContas() {
  const { contas, filtros, excluirConta, marcarComoPaga } = useContas();
  const [contaParaExcluir, setContaParaExcluir] = useState<string | null>(null);
  const [contaParaPagar, setContaParaPagar] = useState<string | null>(null);
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

  // Aplicar apenas filtros não processados pela API (fornecedor/cliente)
  const contasFiltradas = contas
    .filter((conta) => {
      const fornecedorCorreto =
        !filtros.fornecedorCliente ||
        (conta.fornecedorCliente && conta.fornecedorCliente
          .toLowerCase()
          .includes(filtros.fornecedorCliente.toLowerCase()));

      return fornecedorCorreto;
    })
    .sort((a, b) => {
      // Aplicar ordenação personalizada se houver
      if (sortField && sortDirection) {
        let aValue: any, bValue: any;

        switch (sortField) {
          case "dataVencimento":
            aValue = new Date(a.dataVencimento).getTime();
            bValue = new Date(b.dataVencimento).getTime();
            break;
          case "tipo":
            aValue = a.tipo;
            bValue = b.tipo;
            break;
          case "fornecedorCliente":
            aValue = a.fornecedorCliente.toLowerCase();
            bValue = b.fornecedorCliente.toLowerCase();
            break;
          case "valor":
            aValue = a.valor;
            bValue = b.valor;
            break;
          case "tipoPagamento":
            aValue = a.tipoPagamento.toLowerCase();
            bValue = b.tipoPagamento.toLowerCase();
            break;
          case "status":
            const statusOrder = {
              atrasada: 0,
              vence_hoje: 1,
              pendente: 2,
              paga: 3,
            };
            aValue = statusOrder[a.status as keyof typeof statusOrder];
            bValue = statusOrder[b.status as keyof typeof statusOrder];
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }

      // Ordenação padrão por status (atrasada, vence hoje, pendente, paga) e depois por data
      const statusOrder = { atrasada: 0, vence_hoje: 1, pendente: 2, paga: 3 };
      const statusDiff =
        statusOrder[a.status as keyof typeof statusOrder] -
        statusOrder[b.status as keyof typeof statusOrder];
      if (statusDiff !== 0) return statusDiff;
      return (
        new Date(a.dataVencimento).getTime() -
        new Date(b.dataVencimento).getTime()
      );
    });

  const handleExcluir = (id: string) => {
    excluirConta(id);
    setContaParaExcluir(null);
  };

  const handleMarcarComoPaga = (id: string) => {
    marcarComoPaga(id);
    setContaParaPagar(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Carregando contas...
          </h3>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto carregamos suas contas.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (contasFiltradas.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nenhuma conta encontrada
          </h3>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou adicione novas contas a pagar e receber.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Contas</CardTitle>
          <CardDescription>
            {contasFiltradas.length} conta(s) encontrada(s) no período
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
                      onClick={() => handleSort("dataVencimento")}
                    >
                      Vencimento
                      {getSortIcon("dataVencimento")}
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
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort("fornecedorCliente")}
                    >
                      Fornecedor/Cliente
                      {getSortIcon("fornecedorCliente")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort("valor")}
                    >
                      Valor
                      {getSortIcon("valor")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort("tipoPagamento")}
                    >
                      Pagamento
                      {getSortIcon("tipoPagamento")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      {getSortIcon("status")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasFiltradas.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(conta.dataVencimento)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          conta.tipo === "receber" ? "default" : "destructive"
                        }
                        className="flex items-center space-x-1 w-fit"
                      >
                        {conta.tipo === "receber" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {conta.tipo === "receber" ? "A Receber" : "A Pagar"}
                        </span>
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">{conta.fornecedorCliente}</p>
                        {conta.observacoes && (
                          <p className="text-xs text-muted-foreground">
                            {conta.observacoes}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p
                          className={`font-bold ${
                            conta.tipo === "receber"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(conta.valor)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{conta.tipoPagamento}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`flex items-center space-x-1 w-fit ${getStatusColor(conta.status)}`}
                      >
                        {getStatusIcon(conta.status)}
                        <span>{getStatusLabel(conta.status)}</span>
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {conta.status !== "paga" && (
                            <DropdownMenuItem
                              onClick={() => setContaParaPagar(conta.id)}
                              className="text-green-600"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Marcar como Paga
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setContaParaExcluir(conta.id)}
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

      {/* Dialog de confirmação para marcar como paga */}
      <AlertDialog
        open={!!contaParaPagar}
        onOpenChange={() => setContaParaPagar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como Paga</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar esta conta como paga? Esta ação
              registrará a data de pagamento como hoje.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                contaParaPagar && handleMarcarComoPaga(contaParaPagar)
              }
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!contaParaExcluir}
        onOpenChange={() => setContaParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                contaParaExcluir && handleExcluir(contaParaExcluir)
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
