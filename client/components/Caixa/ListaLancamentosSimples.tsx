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
import { ModalEditarLancamentoCompleto } from "./ModalEditarLancamentoCompleto";
import { ColumnManager } from "../ui/column-manager";
import { useTableColumns, ColumnConfig } from "../../hooks/use-table-columns";
import { LancamentoCaixa } from "@shared/types";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Configuração das colunas padrão - todas as colunas do lançamento
const defaultColumns: ColumnConfig[] = [
  { key: "data", label: "Data", visible: true, order: 0 },
  { key: "tipo", label: "Tipo", visible: true, order: 1 },
  { key: "categoria", label: "Categoria", visible: true, order: 2 },
  { key: "descricao", label: "Descrição", visible: true, order: 3 },
  { key: "valor", label: "Valor", visible: true, order: 4 },
  { key: "valorLiquido", label: "Valor Líquido", visible: false, order: 5 },
  { key: "valorRecebido", label: "Valor Recebido", visible: false, order: 6 },
  { key: "valorParaEmpresa", label: "Para Empresa", visible: true, order: 6.5 },
  { key: "comissao", label: "Comissão", visible: true, order: 7 },
  { key: "imposto", label: "Imposto/Taxa", visible: false, order: 8 },
  {
    key: "formaPagamento",
    label: "Forma de Pagamento",
    visible: true,
    order: 9,
  },
  { key: "tecnico", label: "Técnico", visible: true, order: 10 },
  { key: "setor", label: "Setor", visible: true, order: 11 },
  { key: "campanha", label: "Campanha", visible: true, order: 12 },
  { key: "observacoes", label: "Observações", visible: true, order: 13 },
  { key: "numeroNota", label: "Número da Nota", visible: false, order: 14 },
  { key: "cliente", label: "Cliente", visible: true, order: 15 },
  { key: "acoes", label: "Ações", visible: true, order: 16 },
];

export function ListaLancamentosSimples() {
  const { lancamentos, excluirLancamento, isLoading, error } = useCaixa();
  const [lancamentoParaExcluir, setLancamentoParaExcluir] = useState<
    string | null
  >(null);
  const [lancamentoParaEditar, setLancamentoParaEditar] =
    useState<LancamentoCaixa | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Hook para gerenciar colunas
  const {
    columns,
    toggleColumnVisibility,
    reorderColumns,
    resetColumns,
    getVisibleColumns,
    getColumnByKey,
  } = useTableColumns("lancamentos-caixa", defaultColumns);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Função para renderizar o conteúdo de cada célula
  const renderCellContent = (
    lancamento: LancamentoCaixa,
    columnKey: string,
  ) => {
    switch (columnKey) {
      case "data":
        return formatDate(lancamento.data);

      case "tipo":
        return (
          <Badge
            variant={lancamento.tipo === "receita" ? "default" : "destructive"}
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
            {lancamento.tipo === "receita" ? "Receita" : "Despesa"}
          </Badge>
        );

      case "categoria":
        return lancamento.categoria || "N/A";

      case "descricao":
        // Suporta tanto string quanto objeto com nome, evitando números aleatórios
        let descricao = "N/A";

        if (typeof lancamento.descricao === "string") {
          // Se for string e não for um número, usar como está
          if (!/^\d+$/.test(lancamento.descricao.trim())) {
            descricao = lancamento.descricao;
          }
        } else if (
          typeof lancamento.descricao === "object" &&
          lancamento.descricao?.nome
        ) {
          // Se for objeto, usar o nome
          descricao = lancamento.descricao.nome;
        }

        // Fallback para descrição unificada se disponível
        if (descricao === "N/A" && lancamento.descricaoECategoria?.nome) {
          descricao = lancamento.descricaoECategoria.nome;
        }

        return descricao;

      case "valor":
        return (
          <span className="font-medium">{formatarMoeda(lancamento.valor)}</span>
        );

      case "valorLiquido":
        return (
          <span className="font-medium text-green-600">
            {formatarMoeda(lancamento.valorLiquido || lancamento.valor)}
          </span>
        );

      case "valorRecebido":
        return lancamento.valorRecebido
          ? formatarMoeda(lancamento.valorRecebido)
          : "-";

      case "valorParaEmpresa":
        // Calcular valor para empresa: valor líquido - comissão
        if (lancamento.tipo === "receita") {
          const valorLiquidoEfetivo =
            lancamento.valorLiquido ||
            lancamento.valorRecebido ||
            lancamento.valor;
          const comissaoEfetiva = lancamento.comissao || 0;
          const valorParaEmpresa = valorLiquidoEfetivo - comissaoEfetiva;

          // Verificar se é boleto (valor não entra imediatamente)
          const isBoleto =
            typeof lancamento.formaPagamento === "object"
              ? lancamento.formaPagamento?.nome
                  ?.toLowerCase()
                  .includes("boleto") ||
                lancamento.formaPagamento?.nome
                  ?.toLowerCase()
                  .includes("bancario")
              : typeof lancamento.formaPagamento === "string"
                ? lancamento.formaPagamento.toLowerCase().includes("boleto") ||
                  lancamento.formaPagamento.toLowerCase().includes("bancario")
                : false;

          return (
            <span
              className={`font-medium ${isBoleto ? "text-yellow-600" : "text-green-600"}`}
            >
              {isBoleto ? "Pendente" : formatarMoeda(valorParaEmpresa)}
            </span>
          );
        }
        return (
          <span className="font-medium text-red-600">
            {formatarMoeda(-lancamento.valor)}
          </span>
        );

      case "comissao":
        return lancamento.comissao ? formatarMoeda(lancamento.comissao) : "-";

      case "imposto":
        return lancamento.imposto ? formatarMoeda(lancamento.imposto) : "-";

      case "formaPagamento":
        // Debug para verificar dados da forma de pagamento
        console.log("[ListaLancamentos] Debug forma pagamento:", {
          id: lancamento.id,
          formaPagamento: lancamento.formaPagamento,
          tipoFormaPagamento: typeof lancamento.formaPagamento,
        });

        // Suporta tanto string quanto objeto com nome
        const formaPagamento =
          typeof lancamento.formaPagamento === "string"
            ? lancamento.formaPagamento
            : lancamento.formaPagamento?.nome;
        return formaPagamento || "N/A";

      case "tecnico":
        // Priorizar funcionario do banco de dados
        if (lancamento.funcionario?.nome) {
          return lancamento.funcionario.nome;
        }
        // Fallback para tecnicoResponsavel (dados legados)
        if (
          typeof lancamento.tecnicoResponsavel === "object" &&
          lancamento.tecnicoResponsavel?.nome
        ) {
          return lancamento.tecnicoResponsavel.nome;
        }
        if (
          typeof lancamento.tecnicoResponsavel === "string" &&
          lancamento.tecnicoResponsavel !== "" &&
          !/^\d+$/.test(lancamento.tecnicoResponsavel.trim()) // Evitar IDs numéricos
        ) {
          return lancamento.tecnicoResponsavel;
        }
        return "-";

      case "setor":
        // Priorizar localizacao do banco de dados
        if (lancamento.localizacao?.nome) {
          return lancamento.localizacao.nome;
        }
        // Fallback para setor (dados legados)
        if (!lancamento.setor) return "-";

        if (typeof lancamento.setor === "string") {
          // Evitar exibir IDs numéricos como setor
          if (!/^\d+$/.test(lancamento.setor.trim())) {
            return lancamento.setor;
          } else {
            return "-";
          }
        }

        // Formato objeto
        const nomeSetor = lancamento.setor.nome || lancamento.setor;
        const cidadeSetor =
          typeof lancamento.setor.cidade === "object"
            ? lancamento.setor.cidade?.nome
            : lancamento.setor.cidade;

        return cidadeSetor ? `${nomeSetor} - ${cidadeSetor}` : nomeSetor;

      case "campanha":
        // Suporta tanto string quanto objeto com nome
        let campanha = "-";
        if (typeof lancamento.campanha === "string") {
          // Evitar exibir IDs numéricos como campanha
          if (!/^\d+$/.test(lancamento.campanha.trim())) {
            campanha = lancamento.campanha;
          }
        } else if (
          typeof lancamento.campanha === "object" &&
          lancamento.campanha?.nome
        ) {
          campanha = lancamento.campanha.nome;
        }
        return campanha;

      case "observacoes":
        return lancamento.observacoes ? (
          <span
            className="text-sm text-muted-foreground"
            title={lancamento.observacoes}
          >
            {lancamento.observacoes.length > 30
              ? `${lancamento.observacoes.substring(0, 30)}...`
              : lancamento.observacoes}
          </span>
        ) : (
          "-"
        );

      case "numeroNota":
        return lancamento.numeroNota || "-";

      case "cliente":
        // Debug para verificar dados do cliente
        console.log("[ListaLancamentos] Debug cliente:", {
          id: lancamento.id,
          cliente: lancamento.cliente,
          tipoCliente: typeof lancamento.cliente,
        });

        // Priorizar dados do banco de dados
        if (lancamento.cliente?.nome) {
          return lancamento.cliente.nome;
        }
        if (
          typeof lancamento.cliente === "string" &&
          lancamento.cliente !== "" &&
          !/^\d+$/.test(lancamento.cliente.trim()) // Evitar IDs numéricos
        ) {
          return lancamento.cliente;
        }
        return "-";

      case "acoes":
        return (
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
              <DropdownMenuItem onClick={() => handleEditar(lancamento)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setLancamentoParaExcluir(lancamento.id.toString())
                }
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );

      default:
        return "-";
    }
  };

  const handleExcluir = async () => {
    if (!lancamentoParaExcluir || excluindo) return;

    setExcluindo(true);

    try {
      console.log("🗑️ Iniciando exclusão do lançamento:", lancamentoParaExcluir);

      await excluirLancamento(lancamentoParaExcluir);

      console.log("✅ Lançamento excluído com sucesso");

      toast({
        title: "Sucesso",
        description: "Lançamento excluído com sucesso!",
      });

      setLancamentoParaExcluir(null);
    } catch (error) {
      console.error("❌ Erro ao excluir lançamento:", error);

      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      toast({
        title: "Erro ao excluir",
        description: errorMessage.includes('Timeout')
          ? "A operação demorou muito. Verifique sua conexão e tente novamente."
          : "Erro ao excluir lançamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setExcluindo(false);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Lançamentos
            </CardTitle>
            <CardDescription>
              {lancamentos.length} lançamento(s) encontrado(s)
            </CardDescription>
          </div>
          <ColumnManager
            columns={columns}
            onToggleVisibility={toggleColumnVisibility}
            onReorderColumns={reorderColumns}
            onReset={resetColumns}
          />
        </div>
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
                    {getVisibleColumns().map((column) => (
                      <TableHead
                        key={column.key}
                        className={column.key === "acoes" ? "text-right" : ""}
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lancamentos.map((lancamento) => (
                    <TableRow key={lancamento.id}>
                      {getVisibleColumns().map((column) => (
                        <TableCell
                          key={column.key}
                          className={column.key === "acoes" ? "text-right" : ""}
                        >
                          {renderCellContent(lancamento, column.key)}
                        </TableCell>
                      ))}
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
                              {typeof lancamento.setor.cidade === "object"
                                ? lancamento.setor.cidade?.nome
                                : lancamento.setor.cidade}
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
        onOpenChange={(open) => {
          // Só permitir fechar se não estiver excluindo
          if (!open && !excluindo) {
            setLancamentoParaExcluir(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {excluindo ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                  Excluindo...
                </>
              ) : (
                "Confirmar exclusão"
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {excluindo ? (
                "Aguarde, excluindo o lançamento do sistema..."
              ) : (
                "Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>
              {excluindo ? "Aguarde..." : "Cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              disabled={excluindo}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {excluindo ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de edição */}
      {lancamentoParaEditar && (
        <ModalEditarLancamentoCompleto
          lancamento={lancamentoParaEditar}
          isOpen={!!lancamentoParaEditar}
          onClose={() => setLancamentoParaEditar(null)}
        />
      )}
    </Card>
  );
}
