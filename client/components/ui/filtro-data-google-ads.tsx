import React, { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subDays, 
  subWeeks, 
  subMonths,
  startOfDay,
  endOfDay,
  isSameDay,
  parseISO
} from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-day-picker/dist/style.css";

export interface FiltroDataGoogleAdsProps {
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (data: string) => void;
  onDataFimChange: (data: string) => void;
  onAplicar: () => void;
  onLimpar?: () => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
  label?: string;
}

type PeriodoPredefinido = 
  | "hoje"
  | "ontem" 
  | "esta-semana"
  | "7-dias-atras"
  | "semana-passada"
  | "14-dias-atras"
  | "este-mes"
  | "30-dias-atras"
  | "ultimo-mes"
  | "todo-periodo"
  | "personalizar";

interface OpcaoPeriodo {
  id: PeriodoPredefinido;
  label: string;
  calcularDatas: () => { inicio: Date; fim: Date };
}

export default function FiltroDataGoogleAds({
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
  onAplicar,
  onLimpar,
  isLoading = false,
  className = "",
  placeholder = "Selecionar período",
  label,
}: FiltroDataGoogleAdsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoPredefinido>("hoje");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempDataInicio, setTempDataInicio] = useState("");
  const [tempDataFim, setTempDataFim] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hoje = new Date();

  const opcoesPeriodo: OpcaoPeriodo[] = [
    {
      id: "hoje",
      label: "Hoje",
      calcularDatas: () => ({
        inicio: startOfDay(hoje),
        fim: endOfDay(hoje),
      }),
    },
    {
      id: "ontem",
      label: "Ontem",
      calcularDatas: () => {
        const ontem = subDays(hoje, 1);
        return {
          inicio: startOfDay(ontem),
          fim: endOfDay(ontem),
        };
      },
    },
    {
      id: "esta-semana",
      label: "Esta semana (seg. até hoje)",
      calcularDatas: () => ({
        inicio: startOfWeek(hoje, { weekStartsOn: 1 }),
        fim: endOfDay(hoje),
      }),
    },
    {
      id: "7-dias-atras",
      label: "7 dias atrás",
      calcularDatas: () => ({
        inicio: startOfDay(subDays(hoje, 6)),
        fim: endOfDay(hoje),
      }),
    },
    {
      id: "semana-passada",
      label: "Semana passada (seg. a dom.)",
      calcularDatas: () => {
        const semanaPassada = subWeeks(hoje, 1);
        return {
          inicio: startOfWeek(semanaPassada, { weekStartsOn: 1 }),
          fim: endOfWeek(semanaPassada, { weekStartsOn: 1 }),
        };
      },
    },
    {
      id: "14-dias-atras",
      label: "14 dias atrás",
      calcularDatas: () => ({
        inicio: startOfDay(subDays(hoje, 13)),
        fim: endOfDay(hoje),
      }),
    },
    {
      id: "este-mes",
      label: "Este mês",
      calcularDatas: () => ({
        inicio: startOfMonth(hoje),
        fim: endOfDay(hoje),
      }),
    },
    {
      id: "30-dias-atras",
      label: "30 dias atrás",
      calcularDatas: () => ({
        inicio: startOfDay(subDays(hoje, 29)),
        fim: endOfDay(hoje),
      }),
    },
    {
      id: "ultimo-mes",
      label: "Último mês",
      calcularDatas: () => {
        const ultimoMes = subMonths(hoje, 1);
        return {
          inicio: startOfMonth(ultimoMes),
          fim: endOfMonth(ultimoMes),
        };
      },
    },
    {
      id: "todo-periodo",
      label: "Todo o período",
      calcularDatas: () => ({
        inicio: new Date(2020, 0, 1), // 1 de janeiro de 2020
        fim: endOfDay(hoje),
      }),
    },
    {
      id: "personalizar",
      label: "Personalizar",
      calcularDatas: () => ({
        inicio: dataInicio ? parseISO(dataInicio) : startOfDay(hoje),
        fim: dataFim ? parseISO(dataFim) : endOfDay(hoje),
      }),
    },
  ];

  // Determinar qual período está selecionado baseado nas datas atuais
  useEffect(() => {
    if (!dataInicio || !dataFim) return;

    const inicioAtual = parseISO(dataInicio);
    const fimAtual = parseISO(dataFim);

    for (const opcao of opcoesPeriodo) {
      if (opcao.id === "personalizar") continue;
      
      const { inicio, fim } = opcao.calcularDatas();
      
      if (isSameDay(inicioAtual, inicio) && isSameDay(fimAtual, fim)) {
        setPeriodoSelecionado(opcao.id);
        return;
      }
    }
    
    setPeriodoSelecionado("personalizar");
  }, [dataInicio, dataFim]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCalendar(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatarPeriodoDisplay = () => {
    if (!dataInicio || !dataFim) return placeholder;

    const inicio = parseISO(dataInicio);
    const fim = parseISO(dataFim);

    if (isSameDay(inicio, fim)) {
      return format(inicio, "dd/MM/yyyy", { locale: ptBR });
    }

    return `${format(inicio, "dd/MM/yyyy", { locale: ptBR })} - ${format(fim, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  const aplicarPeriodo = (opcao: OpcaoPeriodo) => {
    if (opcao.id === "personalizar") {
      setShowCalendar(true);
      return;
    }

    const { inicio, fim } = opcao.calcularDatas();
    
    setPeriodoSelecionado(opcao.id);
    onDataInicioChange(format(inicio, "yyyy-MM-dd"));
    onDataFimChange(format(fim, "yyyy-MM-dd"));
    
    setTimeout(() => {
      onAplicar();
      setIsOpen(false);
    }, 100);
  };

  const aplicarDatasPersonalizadas = () => {
    if (dateRange?.from && dateRange?.to) {
      onDataInicioChange(format(dateRange.from, "yyyy-MM-dd"));
      onDataFimChange(format(dateRange.to, "yyyy-MM-dd"));
      setPeriodoSelecionado("personalizar");
      
      setTimeout(() => {
        onAplicar();
        setIsOpen(false);
        setShowCalendar(false);
      }, 100);
    } else if (tempDataInicio && tempDataFim) {
      onDataInicioChange(tempDataInicio);
      onDataFimChange(tempDataFim);
      setPeriodoSelecionado("personalizar");
      
      setTimeout(() => {
        onAplicar();
        setIsOpen(false);
        setShowCalendar(false);
      }, 100);
    }
  };

  const voltarParaOpcoes = () => {
    setShowCalendar(false);
  };

  return (
    <div className={`relative filtro-data-google-ads ${className}`} ref={dropdownRef}>
      {label && (
        <Label className="text-sm font-medium mb-2 block">{label}</Label>
      )}
      
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-10 px-3 text-sm font-normal"
        disabled={isLoading}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{formatarPeriodoDisplay()}</span>
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-w-lg">
          {!showCalendar ? (
            <div className="flex">
              {/* Lista de opções predefinidas */}
              <div className="w-48 p-2 border-r border-gray-100">
                <div className="space-y-1">
                  {opcoesPeriodo.map((opcao) => (
                    <button
                      key={opcao.id}
                      onClick={() => aplicarPeriodo(opcao)}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors ${
                        periodoSelecionado === opcao.id 
                          ? "bg-blue-50 text-blue-700 font-medium" 
                          : "text-gray-700"
                      }`}
                    >
                      {opcao.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview das datas */}
              <div className="flex-1 p-4 min-w-64">
                <div className="text-sm text-gray-600 mb-3">
                  Período selecionado:
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-4">
                  {formatarPeriodoDisplay()}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      if (periodoSelecionado !== "personalizar") {
                        const opcaoAtual = opcoesPeriodo.find(o => o.id === periodoSelecionado);
                        if (opcaoAtual) aplicarPeriodo(opcaoAtual);
                      } else {
                        aplicarDatasPersonalizadas();
                      }
                    }}
                    className="flex-1"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Aplicar
                  </Button>
                  {onLimpar && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        onLimpar();
                        setIsOpen(false);
                      }}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {/* Header do calendário personalizado */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={voltarParaOpcoes}
                  className="text-sm"
                >
                  ← Voltar
                </Button>
                <h3 className="font-medium">Datas personalizadas</h3>
                <div></div>
              </div>

              {/* Campos de data manual */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <Label className="text-xs text-gray-600">Data de início</Label>
                  <Input
                    type="date"
                    value={tempDataInicio || dataInicio}
                    onChange={(e) => setTempDataInicio(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Data de término</Label>
                  <Input
                    type="date"
                    value={tempDataFim || dataFim}
                    onChange={(e) => setTempDataFim(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Calendário duplo */}
              <div className="border rounded p-3 bg-gray-50">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={ptBR}
                  className="text-sm"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md border border-gray-300 hover:bg-gray-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-gray-100",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />
              </div>

              {/* Botões do calendário */}
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  onClick={aplicarDatasPersonalizadas}
                  className="flex-1"
                  disabled={(!dateRange?.from || !dateRange?.to) && (!tempDataInicio || !tempDataFim)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Aplicar período
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setDateRange(undefined);
                    setTempDataInicio("");
                    setTempDataFim("");
                  }}
                >
                  Limpar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
