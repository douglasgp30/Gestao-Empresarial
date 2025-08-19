import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  Search, 
  Eye, 
  Download, 
  RefreshCw, 
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../lib/apiService';

interface LogAuditoria {
  id: number;
  acao: string;
  entidade: string;
  entidadeId?: string;
  dadosAntigos?: string;
  dadosNovos?: string;
  descricao?: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioLogin?: string;
  ip?: string;
  userAgent?: string;
  sessaoId?: string;
  sucesso: boolean;
  mensagemErro?: string;
  duracaoMs?: number;
  dataHora: string;
}

interface LogsStats {
  totalLogs: number;
  logsPorAcao: Array<{ acao: string; total: number }>;
  logsPorEntidade: Array<{ entidade: string; total: number }>;
  logsPorUsuario: Array<{ usuarioNome: string; total: number }>;
}

interface LogsFilters {
  usuario?: string;
  entidade?: string;
  acao?: string;
  dataInicio?: string;
  dataFim?: string;
  sucesso?: boolean;
  busca?: string;
}

export default function LogsAuditoria() {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [stats, setStats] = useState<LogsStats | null>(null);
  const [filtros, setFiltros] = useState<LogsFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogAuditoria | null>(null);
  const [entidades, setEntidades] = useState<string[]>([]);
  const [acoes, setAcoes] = useState<string[]>([]);

  useEffect(() => {
    carregarDados();
    carregarFiltrosDisponiveis();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [logsResponse, statsResponse] = await Promise.all([
        apiService.get('/auditoria/logs', { params: filtros }).catch(() => ({ data: [] })),
        apiService.get('/auditoria/stats').catch(() => ({
          data: {
            totalLogs: 0,
            logsPorAcao: [],
            logsPorEntidade: [],
            logsPorUsuario: []
          }
        }))
      ]);

      setLogs(logsResponse.data?.data || []);
      setStats(statsResponse.data || {
        totalLogs: 0,
        logsPorAcao: [],
        logsPorEntidade: [],
        logsPorUsuario: []
      });
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      setLogs([]);
      setStats({
        totalLogs: 0,
        logsPorAcao: [],
        logsPorEntidade: [],
        logsPorUsuario: []
      });
      toast.error('Sistema de auditoria não disponível. Contate o administrador.');
    } finally {
      setIsLoading(false);
    }
  };

  const carregarFiltrosDisponiveis = async () => {
    try {
      const [entidadesResponse, acoesResponse] = await Promise.all([
        apiService.get('/auditoria/entidades').catch(() => ({ data: [] })),
        apiService.get('/auditoria/acoes').catch(() => ({ data: [] }))
      ]);

      setEntidades(entidadesResponse.data || []);
      setAcoes(acoesResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
      setEntidades([]);
      setAcoes([]);
    }
  };

  const aplicarFiltros = () => {
    carregarDados();
  };

  const limparFiltros = () => {
    setFiltros({});
    setTimeout(() => carregarDados(), 100);
  };

  const exportarLogs = async () => {
    toast.info('Função de exportação será implementada em breve');
  };

  const formatarDataHora = (dataHora: string) => {
    return format(new Date(dataHora), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  };

  const getAcaoBadgeVariant = (acao: string) => {
    switch (acao.toLowerCase()) {
      case 'create':
      case 'criar':
        return 'default';
      case 'update':
      case 'atualizar':
      case 'editar':
        return 'secondary';
      case 'delete':
      case 'deletar':
      case 'excluir':
        return 'destructive';
      case 'login':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getSucessoBadge = (sucesso: boolean) => {
    return sucesso ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Sucesso
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertCircle className="h-3 w-3 mr-1" />
        Erro
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações Mais Comuns</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.logsPorAcao.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="capitalize">{item.acao}</span>
                    <span className="font-medium">{item.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entidades</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.logsPorEntidade.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="capitalize">{item.entidade}</span>
                    <span className="font-medium">{item.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.logsPorUsuario.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="truncate">{item.usuarioNome}</span>
                    <span className="font-medium">{item.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
          <CardDescription>
            Use os filtros para encontrar logs específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="busca">Busca Geral</Label>
              <Input
                id="busca"
                placeholder="Buscar em logs..."
                value={filtros.busca || ''}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entidade">Entidade</Label>
              <Select
                value={filtros.entidade || 'all'}
                onValueChange={(value) => setFiltros({ ...filtros, entidade: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {entidades.filter(entidade => entidade && entidade.trim()).map((entidade) => (
                    <SelectItem key={entidade} value={entidade}>
                      {entidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="acao">Ação</Label>
              <Select
                value={filtros.acao || 'all'}
                onValueChange={(value) => setFiltros({ ...filtros, acao: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {acoes.filter(acao => acao && acao.trim()).map((acao) => (
                    <SelectItem key={acao} value={acao}>
                      {acao}
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
                value={filtros.dataInicio || ''}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtros.dataFim || ''}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sucesso">Status</Label>
              <Select
                value={filtros.sucesso !== undefined ? filtros.sucesso.toString() : 'all'}
                onValueChange={(value) => setFiltros({
                  ...filtros,
                  sucesso: value === 'all' ? undefined : value === 'true'
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Sucesso</SelectItem>
                  <SelectItem value="false">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={aplicarFiltros} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={limparFiltros}>
              Limpar
            </Button>
            <Button variant="outline" onClick={carregarDados} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportarLogs} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
          <CardDescription>
            Histórico completo de ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">
                  Carregando logs...
                </p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhum log encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Não há logs que correspondam aos filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>A��ões</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatarDataHora(log.dataHora)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.usuarioNome}</div>
                          {log.usuarioLogin && (
                            <div className="text-sm text-muted-foreground">
                              @{log.usuarioLogin}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getAcaoBadgeVariant(log.acao)}>
                          {log.acao}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{log.entidade}</TableCell>
                      <TableCell>
                        {getSucessoBadge(log.sucesso)}
                      </TableCell>
                      <TableCell>
                        {log.duracaoMs ? `${log.duracaoMs}ms` : '-'}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Log #{log.id}</DialogTitle>
                              <DialogDescription>
                                Informações completas sobre a ação realizada
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Data/Hora</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {formatarDataHora(log.dataHora)}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Usuário</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {log.usuarioNome} {log.usuarioLogin && `(@${log.usuarioLogin})`}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Ação</Label>
                                  <p className="text-sm text-muted-foreground">{log.acao}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Entidade</Label>
                                  <p className="text-sm text-muted-foreground">{log.entidade}</p>
                                </div>
                                {log.entidadeId && (
                                  <div>
                                    <Label className="text-sm font-medium">ID da Entidade</Label>
                                    <p className="text-sm text-muted-foreground">{log.entidadeId}</p>
                                  </div>
                                )}
                                {log.ip && (
                                  <div>
                                    <Label className="text-sm font-medium">IP</Label>
                                    <p className="text-sm text-muted-foreground">{log.ip}</p>
                                  </div>
                                )}
                              </div>

                              {log.descricao && (
                                <div>
                                  <Label className="text-sm font-medium">Descrição</Label>
                                  <p className="text-sm text-muted-foreground">{log.descricao}</p>
                                </div>
                              )}

                              {!log.sucesso && log.mensagemErro && (
                                <div>
                                  <Label className="text-sm font-medium">Erro</Label>
                                  <p className="text-sm text-red-600">{log.mensagemErro}</p>
                                </div>
                              )}

                              {log.dadosAntigos && (
                                <div>
                                  <Label className="text-sm font-medium">Dados Anteriores</Label>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify(JSON.parse(log.dadosAntigos), null, 2)}
                                  </pre>
                                </div>
                              )}

                              {log.dadosNovos && (
                                <div>
                                  <Label className="text-sm font-medium">Dados Novos</Label>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify(JSON.parse(log.dadosNovos), null, 2)}
                                  </pre>
                                </div>
                              )}

                              {log.userAgent && (
                                <div>
                                  <Label className="text-sm font-medium">User Agent</Label>
                                  <p className="text-xs text-muted-foreground break-all">
                                    {log.userAgent}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
