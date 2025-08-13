import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ChevronDown, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useContas } from "@/contexts/ContasContext";
import { ContaLancamento } from "@shared/types";
import { useToast } from "@/hooks/use-toast";

interface ListaContasProps {
  onEditarConta?: (conta: ContaLancamento) => void;
}

export function ListaContas({ onEditarConta }: ListaContasProps) {
  const { toast } = useToast();
  const { 
    contas, 
    carregando, 
    erro, 
    excluirConta, 
    marcarComoPago, 
    formasPagamento, 
    forcarRecarregamento 
  } = useContas();

  const [contaParaExcluir, setContaParaExcluir] = useState<ContaLancamento | null>(null);
  const [contaParaPagar, setContaParaPagar] = useState<ContaLancamento | null>(null);
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState("");
  const [processando, setProcessando] = useState(false);

  console.log("🔍 [LISTA CONTAS] Contas recebidas do contexto:", {
    total: contas.length,
    carregando,
    erro,
    primeiras3: contas.slice(0, 3).map(c => ({
      id: c.codLancamentoContas,
      tipo: c.tipo,
      valor: c.valor,
      vencimento: c.dataVencimento,
      cliente: c.cliente?.nome,
      fornecedor: c.fornecedor?.nome
    }))
  });

  // Filtrar e ordenar contas
  const contasProcessadas = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    return contas.map(conta => {
      let status = "pendente";
      let statusColor = "default";

      if (conta.pago) {
        status = "pago";
        statusColor = "success";
      } else {
        const vencimento = new Date(conta.dataVencimento);
        vencimento.setHours(23, 59, 59, 999);

        if (vencimento < hoje) {
          status = "atrasado";
          statusColor = "destructive";
        } else if (vencimento.toDateString() === hoje.toDateString()) {
          status = "vence_hoje";
          statusColor = "warning";
        }
      }

      return {
        ...conta,
        status,
        statusColor,
      };
    }).sort((a, b) => {
      // Ordenar por: atrasadas primeiro, depois vence hoje, depois pendentes, por último pagas
      const ordemStatus = { atrasado: 1, vence_hoje: 2, pendente: 3, pago: 4 };
      const ordemA = ordemStatus[a.status as keyof typeof ordemStatus] || 5;
      const ordemB = ordemStatus[b.status as keyof typeof ordemStatus] || 5;
      
      if (ordemA !== ordemB) {
        return ordemA - ordemB;
      }
      
      // Se status igual, ordenar por data de vencimento
      return new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime();
    });
  }, [contas]);

  const handleExcluir = async () => {
    if (!contaParaExcluir) return;

    setProcessando(true);
    try {
      await excluirConta(contaParaExcluir.codLancamentoContas);
      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso!",
      });
      setContaParaExcluir(null);
    } catch (error) {
      console.error("❌ [LISTA CONTAS] Erro ao excluir conta:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleMarcarComoPago = async () => {
    if (!contaParaPagar || !formaPagamentoSelecionada) return;

    setProcessando(true);
    try {
      await marcarComoPago(contaParaPagar.codLancamentoContas, parseInt(formaPagamentoSelecionada));
      toast({
        title: "Sucesso",
        description: "Conta marcada como paga com sucesso!",
      });
      setContaParaPagar(null);
      setFormaPagamentoSelecionada("");
    } catch (error) {
      console.error("❌ [LISTA CONTAS] Erro ao marcar conta como paga:", error);
      toast({
        title: "Erro",
        description: "Erro ao marcar conta como paga. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessando(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pago":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "atrasado":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "vence_hoje":
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pago":
        return "Pago";
      case "atrasado":
        return "Atrasado";
      case "vence_hoje":
        return "Vence Hoje";
      default:
        return "Pendente";
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  if (carregando) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Carregando contas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (erro) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-red-600">{erro}</p>
            <Button onClick={forcarRecarregamento} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lista de Contas
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Debug: {contas.length} contas no contexto, {contasProcessadas.length} após filtros</span>
              <Button 
                onClick={forcarRecarregamento} 
                variant="ghost" 
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contasProcessadas.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma conta encontrada</p>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione uma nova conta ou ajuste os filtros de data
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente/Fornecedor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasProcessadas.map((conta) => (
                    <TableRow key={conta.codLancamentoContas}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(conta.status)}
                          <Badge variant={conta.statusColor as any}>
                            {getStatusText(conta.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={conta.tipo === "receber" ? "default" : "secondary"}>
                          {conta.tipo === "receber" ? "Receber" : "Pagar"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {conta.tipo === "receber" 
                          ? conta.cliente?.nome || "Cliente não encontrado"
                          : conta.fornecedor?.nome || "Fornecedor não encontrado"
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatarMoeda(conta.valor)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(conta.dataVencimento), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {conta.categoria?.nome || "-"}
                      </TableCell>
                      <TableCell>
                        {conta.observacoes ? (
                          <div className="max-w-[200px] truncate" title={conta.observacoes}>
                            {conta.observacoes}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditarConta?.(conta)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {!conta.pago && (
                              <DropdownMenuItem 
                                onClick={() => setContaParaPagar(conta)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar como Pago
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => setContaParaExcluir(conta)}
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
          )}
        </CardContent>
      </Card>

      {/* Dialog para confirmar exclusão */}
      <AlertDialog open={!!contaParaExcluir} onOpenChange={() => setContaParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExcluir}
              disabled={processando}
              className="bg-red-600 hover:bg-red-700"
            >
              {processando && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para marcar como pago */}
      <AlertDialog open={!!contaParaPagar} onOpenChange={() => setContaParaPagar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar Como Pago</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione a forma de pagamento utilizada:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Select
              value={formaPagamentoSelecionada}
              onValueChange={setFormaPagamentoSelecionada}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((forma) => (
                  <SelectItem key={forma.id} value={forma.id.toString()}>
                    {forma.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFormaPagamentoSelecionada("")}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarcarComoPago}
              disabled={!formaPagamentoSelecionada || processando}
            >
              {processando && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
