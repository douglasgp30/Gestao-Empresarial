import React from "react";
import { useRelatorios } from "../../contexts/RelatoriosContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  Users,
  Download,
  FileText,
  TrendingUp,
  User,
  DollarSign,
  Award,
} from "lucide-react";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export default function RelatorioTecnicos() {
  const { relatorioTecnicos, exportarPDF, exportarExcel } = useRelatorios();

  // Se o relatório ainda não foi calculado, não renderizar
  if (!relatorioTecnicos) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Carregando relatório...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const relatorio = relatorioTecnicos;

  const handleExportarPDF = () => {
    exportarPDF("tecnicos", relatorio);
  };

  const handleExportarExcel = () => {
    exportarExcel("tecnicos", relatorio);
  };

  const melhorTecnico =
    relatorio.performanceTecnicos.length > 0
      ? relatorio.performanceTecnicos.reduce((prev, current) =>
          prev.valorTotal > current.valorTotal ? prev : current,
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Relatório de Técnicos
          </h2>
          <p className="text-muted-foreground">
            Período: {formatDate(relatorio.periodo.inicio)} -{" "}
            {formatDate(relatorio.periodo.fim)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportarPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportarExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total de Serviços
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {relatorio.resumo.totalServicos}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comissões</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(relatorio.resumo.totalComissoes)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(relatorio.resumo.ticketMedio)}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Técnicos Ativos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {relatorio.performanceTecnicos.length}
                </p>
              </div>
              <User className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Destaque do Período */}
      {melhorTecnico && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Destaque do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{melhorTecnico.nome}</p>
                <p className="text-muted-foreground">
                  Técnico com maior faturamento
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(melhorTecnico.valorTotal)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {melhorTecnico.totalServicos} serviço(s) •{" "}
                  {formatCurrency(melhorTecnico.comissaoTotal)} comissão
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance por Técnico */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Técnico</CardTitle>
          <CardDescription>
            Detalhamento de performance individual dos técnicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {relatorio.performanceTecnicos.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhum serviço encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Não há serviços realizados por técnicos no período selecionado.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Técnico</TableHead>
                    <TableHead className="text-center">Serviços</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead className="text-right">Ticket Médio</TableHead>
                    <TableHead className="text-center">Ranking</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorio.performanceTecnicos
                    .sort((a, b) => b.valorTotal - a.valorTotal)
                    .map((tecnico, index) => (
                      <TableRow key={tecnico.nome}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{tecnico.nome}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {tecnico.totalServicos}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="font-bold text-green-600">
                            {formatCurrency(tecnico.valorTotal)}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="font-medium text-blue-600">
                            {formatCurrency(tecnico.comissaoTotal)}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="font-medium">
                            {formatCurrency(tecnico.ticketMedio)}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          {index === 0 && (
                            <Badge className="bg-yellow-500 text-yellow-50">
                              ��� 1º
                            </Badge>
                          )}
                          {index === 1 && (
                            <Badge className="bg-gray-400 text-gray-50">
                              🥈 2º
                            </Badge>
                          )}
                          {index === 2 && (
                            <Badge className="bg-orange-600 text-orange-50">
                              🥉 3º
                            </Badge>
                          )}
                          {index > 2 && (
                            <Badge variant="outline">{index + 1}º</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análises Complementares */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Produtividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Array.isArray(relatorio.performanceTecnicos)
                ? relatorio.performanceTecnicos
                : []
              ).map((tecnico, index) => {
                const maxValor = Math.max(
                  ...(Array.isArray(relatorio.performanceTecnicos)
                    ? relatorio.performanceTecnicos
                    : []
                  ).map((t) => t.valorTotal),
                );
                const porcentagem =
                  maxValor > 0 ? (tecnico.valorTotal / maxValor) * 100 : 0;

                return (
                  <div key={tecnico.nome} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{tecnico.nome}</span>
                      <span>{formatCurrency(tecnico.valorTotal)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${porcentagem}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Média de Serviços por Técnico
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {relatorio.performanceTecnicos.length > 0
                    ? (
                        relatorio.resumo.totalServicos /
                        relatorio.performanceTecnicos.length
                      ).toFixed(1)
                    : "0"}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Comissão Média por Técnico
                </p>
                <p className="text-xl font-bold text-green-600">
                  {relatorio.performanceTecnicos.length > 0
                    ? formatCurrency(
                        relatorio.resumo.totalComissoes /
                          relatorio.performanceTecnicos.length,
                      )
                    : formatCurrency(0)}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Faturamento Médio
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {relatorio.performanceTecnicos.length > 0
                    ? formatCurrency(
                        relatorio.performanceTecnicos.reduce(
                          (total, t) => total + t.valorTotal,
                          0,
                        ) / relatorio.performanceTecnicos.length,
                      )
                    : formatCurrency(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
