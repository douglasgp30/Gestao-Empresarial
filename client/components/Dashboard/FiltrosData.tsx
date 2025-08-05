import React, { useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  Calendar as CalendarIcon, 
  Filter,
  Clock,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import { cn } from '../../lib/utils';

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

function formatDateRange(dataInicio: Date, dataFim: Date): string {
  if (dataInicio.toDateString() === dataFim.toDateString()) {
    return formatDate(dataInicio);
  }
  return `${formatDate(dataInicio)} - ${formatDate(dataFim)}`;
}

export default function FiltrosData() {
  const { filtros, setFiltros, setFiltroRapido, isLoading } = useDashboard();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDataInicio, setTempDataInicio] = useState<Date | undefined>(filtros.dataInicio);
  const [tempDataFim, setTempDataFim] = useState<Date | undefined>(filtros.dataFim);

  const opcoesFiltro = [
    { 
      id: 'mesAtual', 
      label: 'Mês Atual', 
      icon: CalendarDays,
      descricao: 'Do dia 1 até hoje'
    },
    { 
      id: 'ultimos7dias', 
      label: 'Últimos 7 Dias', 
      icon: Clock,
      descricao: 'Últimos 7 dias'
    },
    { 
      id: 'estaemana', 
      label: 'Esta Semana', 
      icon: CalendarRange,
      descricao: 'Segunda-feira até hoje'
    },
    { 
      id: 'ultimos30dias', 
      label: 'Últimos 30 Dias', 
      icon: CalendarDays,
      descricao: 'Últimos 30 dias'
    }
  ] as const;

  const handleFiltroRapido = (tipo: typeof opcoesFiltro[number]['id']) => {
    setFiltroRapido(tipo);
  };

  const aplicarFiltroPersonalizado = () => {
    if (tempDataInicio && tempDataFim) {
      setFiltros({
        dataInicio: tempDataInicio,
        dataFim: tempDataFim
      });
      setIsCalendarOpen(false);
    }
  };

  const isPeriodoAtivo = (tipo: typeof opcoesFiltro[number]['id']): boolean => {
    const hoje = new Date();
    
    switch (tipo) {
      case 'mesAtual': {
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        return filtros.dataInicio.toDateString() === inicioMes.toDateString() &&
               filtros.dataFim.toDateString() === hoje.toDateString();
      }
      case 'ultimos7dias': {
        const inicio7dias = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 6);
        return filtros.dataInicio.toDateString() === inicio7dias.toDateString() &&
               filtros.dataFim.toDateString() === hoje.toDateString();
      }
      case 'estaemana': {
        const diaSemana = hoje.getDay();
        const diasAtras = diaSemana === 0 ? 6 : diaSemana - 1;
        const inicioSemana = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - diasAtras);
        return filtros.dataInicio.toDateString() === inicioSemana.toDateString() &&
               filtros.dataFim.toDateString() === hoje.toDateString();
      }
      case 'ultimos30dias': {
        const inicio30dias = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 29);
        return filtros.dataInicio.toDateString() === inicio30dias.toDateString() &&
               filtros.dataFim.toDateString() === hoje.toDateString();
      }
      default:
        return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filtros de Período</span>
          {isLoading && (
            <Badge variant="secondary" className="ml-auto">
              Carregando...
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Período selecionado: {formatDateRange(filtros.dataInicio, filtros.dataFim)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros Rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {opcoesFiltro.map((opcao) => {
            const Icon = opcao.icon;
            const ativo = isPeriodoAtivo(opcao.id);
            
            return (
              <Button
                key={opcao.id}
                variant={ativo ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltroRapido(opcao.id)}
                className={cn(
                  "flex flex-col h-auto p-3 space-y-1",
                  ativo && "ring-2 ring-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{opcao.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Filtro Personalizado */}
        <div className="pt-2 border-t">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Período Personalizado
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Data Início</h4>
                  <Calendar
                    mode="single"
                    selected={tempDataInicio}
                    onSelect={setTempDataInicio}
                    initialFocus
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data Fim</h4>
                  <Calendar
                    mode="single"
                    selected={tempDataFim}
                    onSelect={setTempDataFim}
                    disabled={(date) => tempDataInicio ? date < tempDataInicio : false}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={aplicarFiltroPersonalizado}>
                    Aplicar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsCalendarOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
