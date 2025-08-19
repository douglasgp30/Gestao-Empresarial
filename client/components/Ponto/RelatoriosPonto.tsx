import React, { useState } from "react";
import { Calendar, FileText, Download, TrendingUp, Clock, User, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Separator } from "../ui/separator";
import { usePonto } from "../../contexts/PontoContext";
import { pontoApi } from "../../lib/pontoApi";
import { exportarRelatorioExcel, exportarRelatorioPDF, exportarRelatorioJSON } from "../../lib/exportacaoRelatorios";
import type { RelatorioPonto, Funcionario } from "../../../shared/types";

interface EstatisticasResumoProps {
  relatorio?: RelatorioPonto;
}

function EstatisticasResumo({ relatorio }: EstatisticasResumoProps) {
  if (!relatorio) return null;

  const { estatisticas } = relatorio;

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{estatisticas.totalDiasTrabalhados}</p>
              <p className="text-xs text-muted-foreground">Dias Trabalhados</p>
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {pontoApi.formatarDuracaoHoras(estatisticas.totalHorasTrabalhadas)}
              </p>
              <p className="text-xs text-muted-foreground">Total Trabalhado</p>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {pontoApi.formatarDuracaoHoras(estatisticas.totalHorasExtras)}
              </p>
              <p className="text-xs text-muted-foreground">Horas Extras</p>
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {pontoApi.formatarMinutos(estatisticas.totalMinutosAtraso)}
              </p>
              <p className="text-xs text-muted-foreground">Total Atrasos</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Jornada vs Trabalhado */}
      <Card className="md:col-span-2">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Jornada Esperada</span>
              <span className="font-medium">
                {pontoApi.formatarDuracaoHoras((relatorio?.funcionario?.jornadaDiaria || 8) * estatisticas.totalDiasTrabalhados)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Trabalhado</span>
              <span className="font-medium">
                {pontoApi.formatarDuracaoHoras(estatisticas.totalHorasTrabalhadas)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Saldo</span>
              <span className={`font-bold ${
                estatisticas.totalHorasTrabalhadas >= (relatorio?.funcionario?.jornadaDiaria || 8) * estatisticas.totalDiasTrabalhados
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {estatisticas.totalHorasTrabalhadas >= (relatorio?.funcionario?.jornadaDiaria || 8) * estatisticas.totalDiasTrabalhados ? '+' : ''}
                {pontoApi.formatarDuracaoHoras(
                  estatisticas.totalHorasTrabalhadas - (relatorio?.funcionario?.jornadaDiaria || 8) * estatisticas.totalDiasTrabalhados
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DetalhesRelatorioProps {
  relatorio?: RelatorioPonto;
}

function DetalhesRelatorio({ relatorio }: DetalhesRelatorioProps) {
  if (!relatorio) return null;

  const { pontos, estatisticas } = relatorio;

  return (
    <div className="space-y-6">
      {/* Estatísticas detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Média de horas por dia</p>
              <p className="font-medium">
                {pontoApi.formatarDuracaoHoras(estatisticas.mediaHorasDiarias)}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Dias com atraso</p>
              <p className="font-medium text-orange-600">
                {estatisticas.diasComAtraso} dias
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Dias com horas extras</p>
              <p className="font-medium text-green-600">
                {estatisticas.diasComHorasExtras} dias
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Período</p>
              <p className="font-medium">
                {pontoApi.formatarData(relatorio.periodo.dataInicio)} a{' '}
                {pontoApi.formatarData(relatorio.periodo.dataFim)}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Dias no período</p>
              <p className="font-medium">
                {Math.ceil((relatorio.periodo.dataFim.getTime() - relatorio.periodo.dataInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1} dias
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Taxa de presença</p>
              <p className="font-medium">
                {((estatisticas.totalDiasTrabalhados /
                  (Math.ceil((relatorio.periodo.dataFim.getTime() - relatorio.periodo.dataInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1)) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground">Dias com almoço vendido</p>
              <p className="font-medium text-amber-600">
                {pontos.filter(p => p.vendeuAlmoco).length} dias
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground">Jornada esperada</p>
              <p className="font-medium">
                {pontoApi.formatarDuracaoHoras((relatorio.funcionario?.jornadaDiaria || 8) * estatisticas.totalDiasTrabalhados)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground">Saldo geral</p>
              <p className={`font-medium ${
                estatisticas.totalHorasTrabalhadas >= (relatorio.funcionario?.jornadaDiaria || 8) * estatisticas.totalDiasTrabalhados
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {estatisticas.totalHorasTrabalhadas >= (relatorio.funcionario?.jornadaDiaria || 8) * estatisticas.totalDiasTrabalhados ? '+' : ''}
                {pontoApi.formatarDuracaoHoras(
                  estatisticas.totalHorasTrabalhadas - (relatorio.funcionario?.jornadaDiaria || 8) * estatisticas.totalDiasTrabalhados
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento por dia */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída Almoço</TableHead>
                  <TableHead>Retorno</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Almoço</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Jornada</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Atraso</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pontos.map((ponto) => {
                  const isCompleto = ponto.horaEntrada && ponto.horaSaida;
                  const temAtraso = ponto.atraso && ponto.atraso > 0;
                  const temExtras = ponto.horasExtras && ponto.horasExtras > 0;

                  return (
                    <TableRow key={ponto.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pontoApi.formatarData(ponto.data)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(ponto.data).toLocaleDateString('pt-BR', { weekday: 'long' })}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell className="font-mono text-sm">
                        {pontoApi.formatarHorario(ponto.horaEntrada)}
                      </TableCell>
                      
                      <TableCell className="font-mono text-sm">
                        {ponto.vendeuAlmoco ? (
                          <Badge variant="secondary" className="text-xs">
                            Vendido
                          </Badge>
                        ) : (
                          pontoApi.formatarHorario(ponto.horaSaidaAlmoco)
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-sm">
                        {ponto.vendeuAlmoco ? (
                          <Badge variant="secondary" className="text-xs">
                            Vendido
                          </Badge>
                        ) : (
                          pontoApi.formatarHorario(ponto.horaRetornoAlmoco)
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-sm">
                        {pontoApi.formatarHorario(ponto.horaSaida)}
                      </TableCell>

                      <TableCell>
                        {ponto.vendeuAlmoco ? (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">
                            Vendido
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Normal
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="font-medium">
                        {ponto.totalHoras ? pontoApi.formatarDuracaoHoras(ponto.totalHoras) : '--'}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {relatorio?.funcionario?.jornadaDiaria ?
                          pontoApi.formatarDuracaoHoras(relatorio.funcionario.jornadaDiaria) :
                          '8h 0min'
                        }
                      </TableCell>

                      <TableCell>
                        {ponto.saldoHoras !== undefined ? (
                          <span className={`font-medium ${
                            ponto.saldoHoras >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {ponto.saldoHoras >= 0 ? '+' : ''}
                            {pontoApi.formatarDuracaoHoras(ponto.saldoHoras)}
                          </span>
                        ) : '--'}
                      </TableCell>

                      <TableCell>
                        {temAtraso ? (
                          <span className="text-orange-600 font-medium">
                            {pontoApi.formatarMinutos(ponto.atraso!)}
                          </span>
                        ) : '--'}
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={isCompleto ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {isCompleto ? 'Completo' : 'Incompleto'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RelatoriosPonto() {
  const { funcionariosComPonto, gerarRelatorio } = usePonto();

  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState("");
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const [relatorio, setRelatorio] = useState<RelatorioPonto | null>(null);
  const [isGerando, setIsGerando] = useState(false);

  const handleGerarRelatorio = async () => {
    if (!funcionarioSelecionado) return;

    setIsGerando(true);
    try {
      const relatorioGerado = await gerarRelatorio(funcionarioSelecionado, dataInicio, dataFim);
      setRelatorio(relatorioGerado);
    } catch (error) {
      // Erro já tratado no context
    } finally {
      setIsGerando(false);
    }
  };

  const handleExportar = (formato: 'excel' | 'pdf' | 'json') => {
    if (!relatorio) return;

    try {
      switch (formato) {
        case 'excel':
          exportarRelatorioExcel(relatorio);
          break;
        case 'pdf':
          exportarRelatorioPDF(relatorio);
          break;
        case 'json':
          exportarRelatorioJSON(relatorio);
          break;
        default:
          console.error('Formato de exportação não suportado:', formato);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      // Aqui você pode adicionar um toast de erro se desejar
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de geração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Gerar Relatório de Ponto</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="funcionario">Funcionário</Label>
              <Select value={funcionarioSelecionado} onValueChange={setFuncionarioSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {funcionariosComPonto.map((funcionario) => (
                    <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                      {funcionario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <Button 
                onClick={handleGerarRelatorio} 
                disabled={!funcionarioSelecionado || isGerando}
                className="w-full"
              >
                {isGerando ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatório gerado */}
      {relatorio && (
        <>
          {/* Cabeçalho do relatório */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{relatorio.funcionario.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Relatório de {pontoApi.formatarData(relatorio.periodo.dataInicio)} a{' '}
                      {pontoApi.formatarData(relatorio.periodo.dataFim)}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => handleExportar('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" onClick={() => handleExportar('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Estatísticas resumo */}
          <EstatisticasResumo relatorio={relatorio} />

          {/* Detalhes do relatório */}
          <DetalhesRelatorio relatorio={relatorio} />
        </>
      )}

      {/* Estado vazio */}
      {!relatorio && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecione um funcionário</h3>
              <p className="text-muted-foreground">
                Escolha um funcionário e período para gerar o relatório de ponto.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
