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
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [periodoSelecionado, setPeriodoSelecionado] =
    useState<PeriodoPredefinido>("hoje");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (dataInicio && dataFim) {
      return {
        from: parseISO(dataInicio),
        to: parseISO(dataFim)
      };
    }
    return undefined;
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempDataInicio, setTempDataInicio] = useState(dataInicio || "");
  const [tempDataFim, setTempDataFim] = useState(dataFim || "");

  // Sincronizar campos temporários com dateRange
  const handleTempDataInicioChange = (value: string) => {
    setTempDataInicio(value);
    if (value && tempDataFim) {
      setDateRange({
        from: parseISO(value),
        to: parseISO(tempDataFim)
      });
    }
  };

  const handleTempDataFimChange = (value: string) => {
    setTempDataFim(value);
    if (tempDataInicio && value) {
      setDateRange({
        from: parseISO(tempDataInicio),
        to: parseISO(value)
      });
    }
  };

  // Sincronizar dateRange com campos temporários
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setTempDataInicio(format(dateRange.from, "yyyy-MM-dd"));
      setTempDataFim(format(dateRange.to, "yyyy-MM-dd"));
    }
  }, [dateRange]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hoje = new Date(); // Usar data atual do sistema

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

  // Detectar período baseado nas props
  React.useEffect(() => {
    if (!dataInicio || !dataFim) return;

    const inicioAtual = parseISO(dataInicio);
    const fimAtual = parseISO(dataFim);

    // Se as datas são iguais (mesmo dia), é "hoje"
    if (isSameDay(inicioAtual, fimAtual)) {
      setPeriodoSelecionado("hoje");
    } else {
      setPeriodoSelecionado("personalizar");
    }
  }, [dataInicio, dataFim]); // Executar sempre que as props mudarem

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowCalendar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      // Sincronizar campos temporários com os valores atuais
      setTempDataInicio(dataInicio || "");
      setTempDataFim(dataFim || "");

      // Sincronizar dateRange com os valores atuais
      if (dataInicio && dataFim) {
        setDateRange({
          from: parseISO(dataInicio),
          to: parseISO(dataFim)
        });
      }

      setShowCalendar(true);
      return;
    }

    const { inicio, fim } = opcao.calcularDatas();

    setPeriodoSelecionado(opcao.id);

    // Aplicar as datas imediatamente
    const dataInicioFormatada = format(inicio, "yyyy-MM-dd");
    const dataFimFormatada = format(fim, "yyyy-MM-dd");

    onDataInicioChange(dataInicioFormatada);
    onDataFimChange(dataFimFormatada);

    // Aplicar os filtros imediatamente
    onAplicar();
    setIsOpen(false);
  };

  const aplicarDatasPersonalizadas = () => {
    // Priorizar dateRange do calendário se disponível
    if (dateRange?.from && dateRange?.to) {
      const dataInicioFormatada = format(dateRange.from, "yyyy-MM-dd");
      const dataFimFormatada = format(dateRange.to, "yyyy-MM-dd");

      onDataInicioChange(dataInicioFormatada);
      onDataFimChange(dataFimFormatada);

      // Sincronizar campos temporários
      setTempDataInicio(dataInicioFormatada);
      setTempDataFim(dataFimFormatada);
    }
    // Caso contrário, usar campos temporários
    else if (tempDataInicio && tempDataFim) {
      onDataInicioChange(tempDataInicio);
      onDataFimChange(tempDataFim);

      // Sincronizar dateRange
      setDateRange({
        from: parseISO(tempDataInicio),
        to: parseISO(tempDataFim)
      });
    }
    else {
      // Se nenhum estiver preenchido, não fazer nada
      return;
    }

    setPeriodoSelecionado("personalizar");
    onAplicar();
    setIsOpen(false);
    setShowCalendar(false);
  };

  const voltarParaOpcoes = () => {
    setShowCalendar(false);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <Label className="text-xs font-medium text-gray-600">{label}</Label>
      )}

      <div
        className="relative filtro-data-google-ads w-full max-w-sm"
        ref={dropdownRef}
      >
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-10 px-4 text-sm font-normal"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{formatarPeriodoDisplay()}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 w-[520px]">
            {!showCalendar ? (
              <div className="p-4">
                {/* Período selecionado no topo */}
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Período selecionado:</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatarPeriodoDisplay()}
                  </div>
                </div>

                <div className="flex gap-4">
                  {/* Lista de opções predefinidas - mais compacta */}
                  <div className="w-48">
                    <div className="space-y-1">
                      {/* Personalizar no topo */}
                      <button
                        onClick={() => aplicarPeriodo(opcoesPeriodo.find(o => o.id === "personalizar")!)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                          periodoSelecionado === "personalizar"
                            ? "bg-blue-100 text-blue-800 font-medium border border-blue-200"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        📅 Personalizar
                      </button>

                      <div className="border-t border-gray-200 my-2"></div>

                      {/* Outras opções */}
                      {opcoesPeriodo
                        .filter(opcao => opcao.id !== "personalizar")
                        .map((opcao) => (
                        <button
                          key={opcao.id}
                          onClick={() => aplicarPeriodo(opcao)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                            periodoSelecionado === opcao.id
                              ? "bg-blue-100 text-blue-800 font-medium border border-blue-200"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opcao.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview das datas - mais compacto */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-md border">
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Data de início
                        </label>
                        <div className="text-sm font-medium text-gray-900">
                          {dataInicio
                            ? parseISO(dataInicio).toLocaleDateString("pt-BR")
                            : "-"}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border">
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Data de término
                        </label>
                        <div className="text-sm font-medium text-gray-900">
                          {dataFim
                            ? parseISO(dataFim).toLocaleDateString("pt-BR")
                            : "-"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (periodoSelecionado !== "personalizar") {
                            const opcaoAtual = opcoesPeriodo.find(
                              (o) => o.id === periodoSelecionado,
                            );
                            if (opcaoAtual) aplicarPeriodo(opcaoAtual);
                          } else {
                            aplicarDatasPersonalizadas();
                          }
                        }}
                        className="flex-1 h-9 text-sm font-medium"
                      >
                        <Check className="h-4 w-4 mr-1" />
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
                          className="h-9 px-3 text-sm"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
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
                    className="text-sm font-medium"
                  >
                    ← Voltar
                  </Button>
                  <h3 className="text-base font-semibold">
                    Datas personalizadas
                  </h3>
                  <div></div>
                </div>

                {/* Campos de data manual */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <Label className="text-xs font-medium text-gray-600 mb-2 block">
                      Data de início*
                    </Label>
                    <Input
                      type="date"
                      value={tempDataInicio || dataInicio}
                      onChange={(e) => handleTempDataInicioChange(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <Label className="text-xs font-medium text-gray-600 mb-2 block">
                      Data de término
                    </Label>
                    <Input
                      type="date"
                      value={tempDataFim || dataFim}
                      onChange={(e) => handleTempDataFimChange(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Calendário mais compacto */}
                <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                    className="text-sm"
                    classNames={{
                      months:
                        "flex flex-col sm:flex-row space-y-4 sm:space-x-6 sm:space-y-0",
                      month: "space-y-3",
                      caption:
                        "flex justify-center pt-2 relative items-center mb-3",
                      caption_label: "text-sm font-semibold text-gray-800",
                      nav: "space-x-2 flex items-center",
                      nav_button:
                        "h-8 w-8 bg-white p-0 opacity-70 hover:opacity-100 rounded-md border border-gray-300 hover:bg-gray-100 transition-all duration-200",
                      nav_button_previous: "absolute left-2",
                      nav_button_next: "absolute right-2",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex mb-2",
                      head_cell:
                        "text-gray-600 rounded-md w-8 h-8 font-medium text-xs flex items-center justify-center",
                      row: "flex w-full mt-1",
                      cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-8 w-8 p-0 font-medium aria-selected:opacity-100 rounded-md hover:bg-white hover:shadow-sm transition-all duration-150 text-sm flex items-center justify-center border border-transparent hover:border-gray-200",
                      day_selected:
                        "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white font-semibold border-blue-600",
                      day_today:
                        "bg-blue-100 text-blue-800 font-bold border-blue-300",
                      day_outside: "text-gray-400 opacity-60",
                      day_disabled: "text-gray-300 opacity-40",
                      day_range_middle:
                        "aria-selected:bg-blue-100 aria-selected:text-blue-800",
                      day_hidden: "invisible",
                    }}
                  />
                </div>

                {/* Botões do calendário */}
                <div className="flex gap-3 mt-4">
                  <Button
                    size="sm"
                    onClick={aplicarDatasPersonalizadas}
                    className="flex-1 h-9 text-sm font-medium"
                    disabled={
                      (!dateRange?.from || !dateRange?.to) &&
                      (!tempDataInicio || !tempDataFim)
                    }
                  >
                    <Check className="h-4 w-4 mr-1" />
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
                    className="h-9 px-4 text-sm"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
