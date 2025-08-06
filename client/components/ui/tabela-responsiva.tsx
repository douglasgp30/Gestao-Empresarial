import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { MoreVertical, Calendar, DollarSign, User, Tag } from "lucide-react";

interface DadosLancamento {
  id: string;
  data: Date;
  tipo: "receita" | "despesa";
  valor: number;
  valorLiquido?: number;
  formaPagamento: string;
  tecnicoResponsavel?: string;
  categoria?: string;
  setor?: string;
  campanha?: string;
  descricao?: string;
  notaFiscal?: boolean;
}

interface TabelaResponsivaLancamentosProps {
  dados: DadosLancamento[];
  onEditar?: (id: string) => void;
  onExcluir?: (id: string) => void;
  isLoading?: boolean;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export default function TabelaResponsivaLancamentos({
  dados,
  onEditar,
  onExcluir,
  isLoading = false,
}: TabelaResponsivaLancamentosProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (dados.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nenhum lançamento encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou adicione novos lançamentos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Forma Pagamento</TableHead>
                <TableHead>Técnico/Categoria</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dados.map((lancamento) => (
                <TableRow key={lancamento.id}>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
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
                    >
                      {lancamento.tipo === "receita" ? "Receita" : "Despesa"}
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
                          <p className="font-medium">{lancamento.categoria}</p>
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
                    <Badge variant="outline">{lancamento.formaPagamento}</Badge>
                  </TableCell>

                  <TableCell>
                    {lancamento.tipo === "receita"
                      ? lancamento.tecnicoResponsavel
                      : lancamento.categoria}
                  </TableCell>

                  <TableCell>
                    {(onEditar || onExcluir) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEditar && (
                            <DropdownMenuItem
                              onClick={() => onEditar(lancamento.id)}
                            >
                              Editar
                            </DropdownMenuItem>
                          )}
                          {onExcluir && (
                            <DropdownMenuItem
                              onClick={() => onExcluir(lancamento.id)}
                              className="text-red-600"
                            >
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {dados.map((lancamento) => (
          <Card key={lancamento.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      lancamento.tipo === "receita" ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {lancamento.tipo === "receita" ? "Receita" : "Despesa"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {lancamento.formaPagamento}
                  </Badge>
                </div>

                {(onEditar || onExcluir) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEditar && (
                        <DropdownMenuItem
                          onClick={() => onEditar(lancamento.id)}
                        >
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onExcluir && (
                        <DropdownMenuItem
                          onClick={() => onExcluir(lancamento.id)}
                          className="text-red-600"
                        >
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="space-y-2">
                {/* Valor */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor:</span>
                  <div className="text-right">
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
                </div>

                {/* Descrição */}
                <div>
                  <span className="text-sm text-muted-foreground">
                    Descrição:
                  </span>
                  <div className="mt-1">
                    {lancamento.tipo === "receita" ? (
                      <div>
                        <p className="font-medium text-sm">
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
                        <p className="font-medium text-sm">
                          {lancamento.categoria}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lancamento.descricao}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data e Técnico/Categoria */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(lancamento.data)}</span>
                  </div>

                  {lancamento.tipo === "receita" &&
                    lancamento.tecnicoResponsavel && (
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{lancamento.tecnicoResponsavel}</span>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
