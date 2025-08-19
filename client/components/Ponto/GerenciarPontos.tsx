import React, { useState, useEffect } from "react";
import { Calendar, Clock, Edit, Plus, Search, Filter, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { usePonto } from "../../contexts/PontoContext";
import { pontoApi } from "../../lib/pontoApi";
import type { Ponto, Funcionario } from "../../../shared/types";

interface EditarPontoModalProps {
  ponto: Ponto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pontoId: string, dados: any) => Promise<void>;
}

function EditarPontoModal({ ponto, isOpen, onClose, onSave }: EditarPontoModalProps) {
  const [formData, setFormData] = useState({
    horaEntrada: "",
    horaSaidaAlmoco: "",
    horaRetornoAlmoco: "",
    horaSaida: "",
    observacao: "",
    justificativaAtraso: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ponto) {
      setFormData({
        horaEntrada: ponto.horaEntrada ? new Date(ponto.horaEntrada).toISOString().slice(0, 16) : "",
        horaSaidaAlmoco: ponto.horaSaidaAlmoco ? new Date(ponto.horaSaidaAlmoco).toISOString().slice(0, 16) : "",
        horaRetornoAlmoco: ponto.horaRetornoAlmoco ? new Date(ponto.horaRetornoAlmoco).toISOString().slice(0, 16) : "",
        horaSaida: ponto.horaSaida ? new Date(ponto.horaSaida).toISOString().slice(0, 16) : "",
        observacao: ponto.observacao || "",
        justificativaAtraso: ponto.justificativaAtraso || ""
      });
    }
  }, [ponto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ponto) return;

    setIsSubmitting(true);
    try {
      const dados = {
        horaEntrada: formData.horaEntrada || undefined,
        horaSaidaAlmoco: formData.horaSaidaAlmoco || undefined,
        horaRetornoAlmoco: formData.horaRetornoAlmoco || undefined,
        horaSaida: formData.horaSaida || undefined,
        observacao: formData.observacao || undefined,
        justificativaAtraso: formData.justificativaAtraso || undefined
      };

      await onSave(ponto.id, dados);
      onClose();
    } catch (error) {
      // Erro já tratado no context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Editar Ponto - {ponto?.funcionario?.nome}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horaEntrada">Hora de Entrada</Label>
              <Input
                id="horaEntrada"
                type="datetime-local"
                value={formData.horaEntrada}
                onChange={(e) => setFormData({ ...formData, horaEntrada: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaSaidaAlmoco">Saída para Almoço</Label>
              <Input
                id="horaSaidaAlmoco"
                type="datetime-local"
                value={formData.horaSaidaAlmoco}
                onChange={(e) => setFormData({ ...formData, horaSaidaAlmoco: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaRetornoAlmoco">Retorno do Almoço</Label>
              <Input
                id="horaRetornoAlmoco"
                type="datetime-local"
                value={formData.horaRetornoAlmoco}
                onChange={(e) => setFormData({ ...formData, horaRetornoAlmoco: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaSaida">Hora de Saída</Label>
              <Input
                id="horaSaida"
                type="datetime-local"
                value={formData.horaSaida}
                onChange={(e) => setFormData({ ...formData, horaSaida: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificativaAtraso">Justificativa de Atraso</Label>
            <Textarea
              id="justificativaAtraso"
              value={formData.justificativaAtraso}
              onChange={(e) => setFormData({ ...formData, justificativaAtraso: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RegistrarPontoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: any) => Promise<void>;
  funcionarios: Funcionario[];
}

function RegistrarPontoModal({ isOpen, onClose, onSave, funcionarios }: RegistrarPontoModalProps) {
  const [formData, setFormData] = useState({
    funcionarioId: "",
    data: new Date().toISOString().split('T')[0],
    tipoBatida: "entrada" as "entrada" | "saida_almoco" | "retorno_almoco" | "saida",
    horario: new Date().toISOString().slice(0, 16),
    observacao: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.funcionarioId) return;

    setIsSubmitting(true);
    try {
      await onSave({
        funcionarioId: formData.funcionarioId,
        data: formData.data,
        tipoBatida: formData.tipoBatida,
        horario: formData.horario,
        observacao: formData.observacao || undefined
      });
      
      // Reset form
      setFormData({
        funcionarioId: "",
        data: new Date().toISOString().split('T')[0],
        tipoBatida: "entrada",
        horario: new Date().toISOString().slice(0, 16),
        observacao: ""
      });
      
      onClose();
    } catch (error) {
      // Erro já tratado no context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Registrar Ponto para Funcionário</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="funcionarioId">Funcionário</Label>
            <Select
              value={formData.funcionarioId}
              onValueChange={(value) => setFormData({ ...formData, funcionarioId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {funcionarios.map((funcionario) => (
                  <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                    {funcionario.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoBatida">Tipo de Batida</Label>
            <Select
              value={formData.tipoBatida}
              onValueChange={(value: any) => setFormData({ ...formData, tipoBatida: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida_almoco">Saída para Almoço</SelectItem>
                <SelectItem value="retorno_almoco">Retorno do Almoço</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario">Horário</Label>
            <Input
              id="horario"
              type="datetime-local"
              value={formData.horario}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.funcionarioId}>
              {isSubmitting ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GerenciarPontos() {
  const {
    todosPontos,
    funcionariosComPonto,
    isLoading,
    filtros,
    atualizarFiltros,
    carregarTodosPontos,
    editarPonto,
    registrarPontoAdmin
  } = usePonto();

  const [pontoParaEditar, setPontoParaEditar] = useState<Ponto | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalRegistrarAberto, setModalRegistrarAberto] = useState(false);

  const [filtroFuncionario, setFiltroFuncionario] = useState(filtros.funcionarioId || "");
  const [filtroStatus, setFiltroStatus] = useState(filtros.status || "todos");
  const [dataInicio, setDataInicio] = useState(filtros.dataInicio.toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(filtros.dataFim.toISOString().split('T')[0]);

  const aplicarFiltros = () => {
    atualizarFiltros({
      funcionarioId: filtroFuncionario || undefined,
      status: filtroStatus as any,
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim)
    });
  };

  const handleEditarPonto = (ponto: Ponto) => {
    setPontoParaEditar(ponto);
    setModalEditarAberto(true);
  };

  const handleSalvarEdicao = async (pontoId: string, dados: any) => {
    await editarPonto(pontoId, dados);
  };

  const handleRegistrarPonto = async (dados: any) => {
    await registrarPontoAdmin(dados);
  };

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros e Ações</span>
            </div>
            <Button onClick={() => setModalRegistrarAberto(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Ponto
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="funcionario">Funcionário</Label>
              <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {funcionariosComPonto.map((funcionario) => (
                    <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                      {funcionario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="completo">Completo</SelectItem>
                  <SelectItem value="incompleto">Incompleto</SelectItem>
                  <SelectItem value="com_atraso">Com Atraso</SelectItem>
                  <SelectItem value="com_extras">Com Horas Extras</SelectItem>
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
              <Button onClick={aplicarFiltros} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pontos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pontos dos Funcionários</span>
            </div>
            {todosPontos.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {todosPontos.length} registros
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando pontos...</p>
            </div>
          ) : todosPontos.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
              <p className="text-muted-foreground">
                Não há registros de ponto para os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Saída Almoço</TableHead>
                    <TableHead>Retorno</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todosPontos.map((ponto) => {
                    const { status, cor } = getStatusPonto(ponto);
                    
                    return (
                      <TableRow key={ponto.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ponto.funcionario?.nome}</p>
                            {ponto.editadoPorAdmin && (
                              <p className="text-xs text-blue-600">
                                Editado por {ponto.usuarioEdicao}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-mono text-sm">{pontoApi.formatarData(ponto.data)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(ponto.data).toLocaleDateString('pt-BR', { weekday: 'short' })}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell className="font-mono text-sm">
                          {pontoApi.formatarHorario(ponto.horaEntrada)}
                        </TableCell>
                        
                        <TableCell className="font-mono text-sm">
                          {pontoApi.formatarHorario(ponto.horaSaidaAlmoco)}
                        </TableCell>
                        
                        <TableCell className="font-mono text-sm">
                          {pontoApi.formatarHorario(ponto.horaRetornoAlmoco)}
                        </TableCell>
                        
                        <TableCell className="font-mono text-sm">
                          {pontoApi.formatarHorario(ponto.horaSaida)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            {ponto.totalHoras !== undefined && ponto.totalHoras > 0 && (
                              <p className="text-sm font-medium">
                                {pontoApi.formatarDuracaoHoras(ponto.totalHoras)}
                              </p>
                            )}
                            {ponto.atraso !== undefined && ponto.atraso > 0 && (
                              <p className="text-xs text-orange-600">
                                Atraso: {pontoApi.formatarMinutos(ponto.atraso)}
                              </p>
                            )}
                            {ponto.horasExtras !== undefined && ponto.horasExtras > 0 && (
                              <p className="text-xs text-green-600">
                                Extra: {pontoApi.formatarDuracaoHoras(ponto.horasExtras)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={cor}>
                            {status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditarPonto(ponto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <EditarPontoModal
        ponto={pontoParaEditar}
        isOpen={modalEditarAberto}
        onClose={() => {
          setModalEditarAberto(false);
          setPontoParaEditar(null);
        }}
        onSave={handleSalvarEdicao}
      />

      <RegistrarPontoModal
        isOpen={modalRegistrarAberto}
        onClose={() => setModalRegistrarAberto(false)}
        onSave={handleRegistrarPonto}
        funcionarios={funcionariosComPonto}
      />
    </div>
  );
}
