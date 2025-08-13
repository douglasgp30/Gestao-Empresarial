import React, { useState, useEffect, useRef } from "react";
import { useContas } from "../../contexts/ContasContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Calendar, ChevronDown } from "lucide-react";
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FiltroDataContasSimples() {
  const { filtros, setFiltros, isLoading } = useContas();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Verificar e corrigir datas inválidas na inicialização
  useEffect(() => {
    if (!filtros?.dataInicio || !filtros?.dataFim || 
        !(filtros.dataInicio instanceof Date) || !(filtros.dataFim instanceof Date) ||
        isNaN(filtros.dataInicio.getTime()) || isNaN(filtros.dataFim.getTime())) {
      console.log('🔧 Corrigindo datas inválidas nos filtros de contas');
      const hoje = new Date();
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0);
      const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);
      
      setFiltros({
        ...filtros,
        dataInicio: inicioHoje,
        dataFim: fimHoje,
        __timestamp: Date.now(),
      });
    }
  }, [filtros, setFiltros]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Função para formatar data para input com validação
  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      date = new Date();
    }
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
    console.log('🚀 Aplicando período nas contas:', tipo);
    const hoje = new Date();
    let inicio: Date;
    let fim: Date;

    // Normalizar hoje para evitar problemas de horário
    const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    switch (tipo) {
      case 'hoje':
        inicio = new Date(hojeNormalizado.getFullYear(), hojeNormalizado.getMonth(), hojeNormalizado.getDate(), 0, 0, 0, 0);
        fim = new Date(hojeNormalizado.getFullYear(), hojeNormalizado.getMonth(), hojeNormalizado.getDate(), 23, 59, 59, 999);
        break;
      case 'ontem':
        const ontem = new Date(hojeNormalizado);
        ontem.setDate(ontem.getDate() - 1);
        inicio = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 0, 0, 0, 0);
        fim = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 23, 59, 59, 999);
        break;
      case 'esta-semana':
        const inicioSemana = startOfWeek(hojeNormalizado, { weekStartsOn: 0 }); // 0 = domingo
        inicio = new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate(), 0, 0, 0, 0);
        fim = new Date(hojeNormalizado.getFullYear(), hojeNormalizado.getMonth(), hojeNormalizado.getDate(), 23, 59, 59, 999);
        break;
      case '7-dias':
        // Últimos 7 dias incluindo hoje (hoje + 6 dias anteriores = 7 dias total)
        const seteDiasAtras = new Date(hojeNormalizado);
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
        inicio = new Date(seteDiasAtras.getFullYear(), seteDiasAtras.getMonth(), seteDiasAtras.getDate(), 0, 0, 0, 0);
        fim = new Date(hojeNormalizado.getFullYear(), hojeNormalizado.getMonth(), hojeNormalizado.getDate(), 23, 59, 59, 999);
        break;
      case 'este-mes':
        inicio = new Date(hojeNormalizado.getFullYear(), hojeNormalizado.getMonth(), 1, 0, 0, 0, 0);
        fim = new Date(hojeNormalizado.getFullYear(), hojeNormalizado.getMonth(), hojeNormalizado.getDate(), 23, 59, 59, 999);
        break;
      case '30-dias':
        // Últimos 30 dias incluindo hoje (hoje + 29 dias anteriores = 30 dias total)
        const trintaDiasAtras = new Date(hojeNormalizado);
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 29);
        inicio = new Date(trintaDiasAtras.getFullYear(), trintaDiasAtras.getMonth(), trintaDiasAtras.getDate(), 0, 0, 0, 0);
        fim = new Date(hojeNormalizado.getFullYear(), hojeNormalizado.getMonth(), hojeNormalizado.getDate(), 23, 59, 59, 999);
        break;
      default:
        return;
    }

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
    console.log('🖱️ Toggle dropdown contas, isOpen atual:', isOpen);
    setIsOpen(!isOpen);
  };

  // Garantir que as datas existem, senão usar valores padrão
  const dataInicio = filtros?.dataInicio || new Date();
  const dataFim = filtros?.dataFim || new Date();
  
  const periodoAtual = `${formatarDataDisplay(dataInicio)} - ${formatarDataDisplay(dataFim)}`;

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-600">Período de vencimento das contas</Label>
      
      <div className="relative w-full max-w-sm" ref={dropdownRef}>
        <Button
          variant="outline"
          onClick={toggleDropdown}
          className="w-full justify-between h-10 px-4 text-sm font-normal"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{periodoAtual}</span>
            {isLoading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
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
                      value={formatDateForInput(dataInicio)}
                      onChange={(e) => {
                        // Usar parseFloat e depois criar data local para evitar problemas de timezone
                        const [ano, mes, dia] = e.target.value.split('-').map(Number);
                        const novaData = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
                        console.log('📅 [FILTRO CONTAS] Data início alterada:', e.target.value, '->', novaData);

                        const novosFiltros = {
                          ...filtros,
                          dataInicio: novaData,
                          __timestamp: Date.now(),
                        };

                        console.log('📅 [FILTRO CONTAS] Aplicando filtros com nova data início:', novosFiltros);
                        setFiltros(novosFiltros);
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={formatDateForInput(dataFim)}
                      onChange={(e) => {
                        // Usar parseFloat e depois criar data local para evitar problemas de timezone
                        const [ano, mes, dia] = e.target.value.split('-').map(Number);
                        const novaData = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
                        console.log('📅 [FILTRO CONTAS] Data fim alterada:', e.target.value, '->', novaData);

                        const novosFiltros = {
                          ...filtros,
                          dataFim: novaData,
                          __timestamp: Date.now(),
                        };

                        console.log('📅 [FILTRO CONTAS] Aplicando filtros com nova data fim:', novosFiltros);
                        setFiltros(novosFiltros);
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
