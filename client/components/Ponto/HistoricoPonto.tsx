import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { usePonto } from "../../contexts/PontoContext";
import { useAuth } from "../../contexts/AuthContext";
import { pontoApi } from "../../lib/pontoApi";
import type { Ponto } from "../../../shared/types";

interface HistoricoPontoProps {
  funcionarioId?: string;
  mostrarFiltros?: boolean;
}

export function HistoricoPonto({
  funcionarioId,
  mostrarFiltros = true,
}: HistoricoPontoProps) {
  const { user } = useAuth();
  const {
    historicoPontos,
    paginacaoHistorico,
    filtros,
    isLoading,
    carregarHistorico,
    atualizarFiltros,
  } = usePonto();

  const [dataInicio, setDataInicio] = useState(
    filtros.dataInicio.toISOString().split("T")[0],
  );
  const [dataFim, setDataFim] = useState(
    filtros.dataFim.toISOString().split("T")[0],
  );

  const idFuncionario = funcionarioId || user?.id;

  // Aplicar filtros
  const aplicarFiltros = () => {
    atualizarFiltros({
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
    });
  };

  // Carregar próxima página
  const carregarPagina = (pagina: number) => {
    if (idFuncionario) {
      carregarHistorico(idFuncionario, pagina);
    }
  };

  // Reset para página 1 quando filtros mudarem
  useEffect(() => {
    if (idFuncionario) {
      carregarHistorico(idFuncionario, 1);
    }
  }, [filtros, idFuncionario, carregarHistorico]);

  const getStatusPonto = (ponto: Ponto): { status: string; cor: string } => {
    if (ponto.horaEntrada && ponto.horaSaida) {
      return { status: "Completo", cor: "bg-green-100 text-green-800" };
    }
    if (ponto.horaEntrada) {
      return { status: "Incompleto", cor: "bg-yellow-100 text-yellow-800" };
    }
    return { status: "Não iniciado", cor: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      {mostrarFiltros && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={aplicarFiltros} className="w-full">
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de pontos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Histórico de Pontos</span>
            </div>
            {paginacaoHistorico && (
              <span className="text-sm text-muted-foreground">
                {paginacaoHistorico.total} registros
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : historicoPontos.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-muted-foreground">
                Não há registros de ponto para o período selecionado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historicoPontos.map((ponto) => {
                const { status, cor } = getStatusPonto(ponto);

                return (
                  <div
                    key={ponto.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-semibold">
                            {pontoApi.formatarData(ponto.data)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ponto.data).toLocaleDateString("pt-BR", {
                              weekday: "long",
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge className={cor}>{status}</Badge>
                    </div>

                    {/* Horários */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          Entrada
                        </div>
                        <div
                          className={`text-sm font-mono ${ponto.horaEntrada ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {pontoApi.formatarHorario(ponto.horaEntrada)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          Saída Almoço
                        </div>
                        <div
                          className={`text-sm font-mono ${ponto.horaSaidaAlmoco ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {pontoApi.formatarHorario(ponto.horaSaidaAlmoco)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          Retorno
                        </div>
                        <div
                          className={`text-sm font-mono ${ponto.horaRetornoAlmoco ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {pontoApi.formatarHorario(ponto.horaRetornoAlmoco)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          Saída
                        </div>
                        <div
                          className={`text-sm font-mono ${ponto.horaSaida ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {pontoApi.formatarHorario(ponto.horaSaida)}
                        </div>
                      </div>
                    </div>

                    {/* Informações extras */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {ponto.totalHoras !== undefined &&
                        ponto.totalHoras > 0 && (
                          <div className="flex items-center space-x-1">
                            <span className="text-muted-foreground">
                              Total:
                            </span>
                            <span className="font-medium">
                              {pontoApi.formatarDuracaoHoras(ponto.totalHoras)}
                            </span>
                          </div>
                        )}

                      {ponto.atraso !== undefined && ponto.atraso > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-muted-foreground">Atraso:</span>
                          <span className="font-medium text-orange-600">
                            {pontoApi.formatarMinutos(ponto.atraso)}
                          </span>
                        </div>
                      )}

                      {ponto.horasExtras !== undefined &&
                        ponto.horasExtras > 0 && (
                          <div className="flex items-center space-x-1">
                            <span className="text-muted-foreground">
                              Extras:
                            </span>
                            <span className="font-medium text-green-600">
                              {pontoApi.formatarDuracaoHoras(ponto.horasExtras)}
                            </span>
                          </div>
                        )}

                      {ponto.editadoPorAdmin && (
                        <div className="flex items-center space-x-1">
                          <span className="text-muted-foreground">
                            Editado por:
                          </span>
                          <span className="font-medium text-blue-600">
                            {ponto.usuarioEdicao || "Admin"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Observações */}
                    {(ponto.observacao || ponto.justificativaAtraso) && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {ponto.observacao && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Observação:
                            </span>
                            <p className="text-sm mt-1">{ponto.observacao}</p>
                          </div>
                        )}
                        {ponto.justificativaAtraso && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Justificativa de atraso:
                            </span>
                            <p className="text-sm mt-1">
                              {ponto.justificativaAtraso}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginação */}
          {paginacaoHistorico && paginacaoHistorico.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Página {paginacaoHistorico.page} de {paginacaoHistorico.pages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => carregarPagina(paginacaoHistorico.page - 1)}
                  disabled={paginacaoHistorico.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => carregarPagina(paginacaoHistorico.page + 1)}
                  disabled={paginacaoHistorico.page >= paginacaoHistorico.pages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
