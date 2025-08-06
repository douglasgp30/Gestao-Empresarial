import React, { useState } from "react";
import { useContas } from "../../contexts/ContasContext";
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

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

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

export default function ListaContas() {
  const { contas, filtros, excluirConta, marcarComoPaga } = useContas();
  const [contaParaExcluir, setContaParaExcluir] = useState<string | null>(null);
  const [contaParaPagar, setContaParaPagar] = useState<string | null>(null);

  // Filtrar contas
  const contasFiltradas = contas
    .filter((conta) => {
      const dataVencimento = new Date(conta.dataVencimento);
      const dentroDataInicio = dataVencimento >= filtros.dataInicio;
      const dentroDataFim = dataVencimento <= filtros.dataFim;
      const tipoCorreto =
        filtros.tipo === "ambos" || conta.tipo === filtros.tipo;
      const statusCorreto = !filtros.status || conta.status === filtros.status;
      const fornecedorCorreto =
        !filtros.fornecedorCliente ||
        conta.fornecedorCliente
          .toLowerCase()
          .includes(filtros.fornecedorCliente.toLowerCase());

      return (
        dentroDataInicio &&
        dentroDataFim &&
        tipoCorreto &&
        statusCorreto &&
        fornecedorCorreto
      );
    })
    .sort((a, b) => {
      // Ordenar por status (atrasada, vence hoje, pendente, paga) e depois por data
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
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fornecedor/Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
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
