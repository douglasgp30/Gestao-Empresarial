import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Calendar, ChevronDown } from "lucide-react";
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FiltroDataCaixaSimples() {
  const { filtros, setFiltros, isLoading } = useCaixa();
  const [isOpen, setIsOpen] = useState(false);

  // Função para formatar data para input
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função para formatar data para exibição com validação
  const formatarDataDisplay = (date: Date | null | undefined): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return format(new Date(), "dd/MM/yyyy", { locale: ptBR });
    }
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const aplicarPeriodo = (tipo: string) => {
    console.log('🚀 Aplicando período:', tipo);
    const hoje = new Date();
    let inicio: Date;
    let fim: Date;

    switch (tipo) {
      case 'hoje':
        inicio = startOfDay(hoje);
        fim = endOfDay(hoje);
        break;
      case 'ontem':
        const ontem = subDays(hoje, 1);
        inicio = startOfDay(ontem);
        fim = endOfDay(ontem);
        break;
      case 'esta-semana':
        inicio = startOfWeek(hoje, { weekStartsOn: 1 });
        fim = endOfDay(hoje);
        break;
      case '7-dias':
        inicio = startOfDay(subDays(hoje, 6));
        fim = endOfDay(hoje);
        break;
      case 'este-mes':
        inicio = startOfMonth(hoje);
        fim = endOfDay(hoje);
        break;
      case '30-dias':
        inicio = startOfDay(subDays(hoje, 29));
        fim = endOfDay(hoje);
        break;
      default:
        return;
    }

    console.log('🚀 Datas calculadas:', { inicio, fim });

    // Aplicar diretamente
    setFiltros({
      ...filtros,
      dataInicio: inicio,
      dataFim: fim,
      __timestamp: Date.now(),
    });

    setIsOpen(false);
  };

  const toggleDropdown = () => {
    console.log('🖱️ Toggle dropdown, isOpen atual:', isOpen);
    setIsOpen(!isOpen);
  };

  const periodoAtual = `${formatarDataDisplay(filtros.dataInicio)} - ${formatarDataDisplay(filtros.dataFim)}`;

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-600">Período dos Lançamentos</Label>
      
      <div className="relative w-full max-w-sm">
        <Button
          variant="outline"
          onClick={toggleDropdown}
          className="w-full justify-between h-10 px-4 text-sm font-normal"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{periodoAtual}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-[9999] w-[300px] p-3">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => aplicarPeriodo('hoje')}
              >
                Hoje
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => aplicarPeriodo('ontem')}
              >
                Ontem
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => aplicarPeriodo('esta-semana')}
              >
                Esta semana
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => aplicarPeriodo('7-dias')}
              >
                Últimos 7 dias
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => aplicarPeriodo('este-mes')}
              >
                Este mês
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => aplicarPeriodo('30-dias')}
              >
                Últimos 30 dias
              </Button>
              
              <div className="border-t pt-2 mt-2">
                <Label className="text-xs text-gray-600">Personalizar</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Input
                      type="date"
                      value={formatDateForInput(filtros.dataInicio)}
                      onChange={(e) => {
                        const novaData = new Date(e.target.value);
                        novaData.setHours(0, 0, 0, 0);
                        setFiltros({
                          ...filtros,
                          dataInicio: novaData,
                          __timestamp: Date.now(),
                        });
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={formatDateForInput(filtros.dataFim)}
                      onChange={(e) => {
                        const novaData = new Date(e.target.value);
                        novaData.setHours(23, 59, 59, 999);
                        setFiltros({
                          ...filtros,
                          dataFim: novaData,
                          __timestamp: Date.now(),
                        });
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
