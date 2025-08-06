import React, { useState } from "react";
import { useAgendamentos } from "../../contexts/AgendamentosContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
  MoreHorizontal, 
  Edit, 
  Trash2, 
  CheckCircle, 
  ArrowUpDown,
  Calendar,
  Clock,
  User,
  Phone
} from "lucide-react";
import { Agendamento } from "../../../shared/types";
import FormularioAgendamento from "./FormularioAgendamento";
import { toast } from "../../hooks/use-toast";

type ColunaOrdenacao = 'dataServico' | 'horaServico' | 'descricaoServico' | 'setor' | 'tecnicoResponsavel' | 'status';
type DirecaoOrdenacao = 'asc' | 'desc';

export default function ListaAgendamentos() {
  const { 
    agendamentosFiltrados, 
    excluirAgendamento, 
    concluirAgendamento,
    isLoading 
  } = useAgendamentos();
  
  const [ordenacao, setOrdenacao] = useState<{
    coluna: ColunaOrdenacao;
    direcao: DirecaoOrdenacao;
  }>({
    coluna: 'dataServico',
    direcao: 'asc'
  });
  
  const [agendamentoExcluir, setAgendamentoExcluir] = useState<string | null>(null);
  const [agendamentoEditar, setAgendamentoEditar] = useState<string | null>(null);

  const handleOrdenar = (coluna: ColunaOrdenacao) => {
    setOrdenacao(prev => ({
      coluna,
      direcao: prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const agendamentosOrdenados = [...agendamentosFiltrados].sort((a, b) => {
    const { coluna, direcao } = ordenacao;
    let valorA: any;
    let valorB: any;

    switch (coluna) {
      case 'dataServico':
        valorA = new Date(a.dataServico);
        valorB = new Date(b.dataServico);
        break;
      case 'horaServico':
        valorA = a.horaServico;
        valorB = b.horaServico;
        break;
      default:
        valorA = a[coluna] || '';
        valorB = b[coluna] || '';
    }

    if (valorA < valorB) return direcao === 'asc' ? -1 : 1;
    if (valorA > valorB) return direcao === 'asc' ? 1 : -1;
    return 0;
  });

  const handleExcluir = () => {
    if (agendamentoExcluir) {
      excluirAgendamento(agendamentoExcluir);
      setAgendamentoExcluir(null);
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso.",
      });
    }
  };

  const handleConcluir = (id: string) => {
    concluirAgendamento(id);
    toast({
      title: "Serviço concluído",
      description: "O agendamento foi marcado como concluído.",
    });
  };

  const getStatusBadge = (status: Agendamento['status']) => {
    switch (status) {
      case 'agendado':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Agendado</Badge>;
      case 'concluido':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data: Date, hora: string) => {
    const dataFormatada = formatarData(data);
    return `${dataFormatada} às ${hora}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando agendamentos...</div>
      </div>
    );
  }

  if (agendamentosOrdenados.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Nenhum agendamento encontrado
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Não há agendamentos para o período selecionado.
        </p>
        <FormularioAgendamento>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Criar Primeiro Agendamento
          </Button>
        </FormularioAgendamento>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Versão Desktop */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleOrdenar('dataServico')}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data & Hora
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleOrdenar('descricaoServico')}
              >
                <div className="flex items-center gap-2">
                  Serviço
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleOrdenar('setor')}
              >
                <div className="flex items-center gap-2">
                  Setor
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>
                Cidade
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleOrdenar('tecnicoResponsavel')}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Técnico
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Tel. Final
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleOrdenar('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agendamentosOrdenados.map((agendamento) => (
              <TableRow key={agendamento.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatarData(agendamento.dataServico)}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {agendamento.horaServico}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <div className="truncate" title={agendamento.descricaoServico}>
                    {agendamento.descricaoServico}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{agendamento.setor}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{agendamento.cidade}</span>
                </TableCell>
                <TableCell>
                  {agendamento.tecnicoResponsavel || (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    ***{agendamento.finalTelefoneCliente}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(agendamento.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setAgendamentoEditar(agendamento.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {agendamento.status === 'agendado' && (
                        <DropdownMenuItem onClick={() => handleConcluir(agendamento.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Concluir
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => setAgendamentoExcluir(agendamento.id)}
                        className="text-red-600"
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

      {/* Versão Mobile */}
      <div className="md:hidden space-y-3">
        {agendamentosOrdenados.map((agendamento) => (
          <div key={agendamento.id} className="border rounded-lg p-4 bg-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {formatarDataHora(agendamento.dataServico, agendamento.horaServico)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {agendamento.descricaoServico}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(agendamento.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setAgendamentoEditar(agendamento.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {agendamento.status === 'agendado' && (
                      <DropdownMenuItem onClick={() => handleConcluir(agendamento.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Concluir
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => setAgendamentoExcluir(agendamento.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Setor:</span>
                <Badge variant="secondary" className="text-xs">
                  {agendamento.setor}
                </Badge>
              </div>
              
              {agendamento.tecnicoResponsavel && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {agendamento.tecnicoResponsavel}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-muted-foreground">
                  ***{agendamento.finalTelefoneCliente}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog de Edição */}
      {agendamentoEditar && (
        <FormularioAgendamento agendamentoId={agendamentoEditar}>
          <div />
        </FormularioAgendamento>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!agendamentoExcluir} onOpenChange={() => setAgendamentoExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
