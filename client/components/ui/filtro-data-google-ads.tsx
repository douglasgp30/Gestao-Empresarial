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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hoje = new Date(2025, 7, 14); // Forçar data atual real (14/08/2025)

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

  // Inicializar período selecionado apenas uma vez
  React.useEffect(() => {
    if (!dataInicio || !dataFim) return;

    console.log('🔍 Debug filtro de data:', {
      dataInicio,
      dataFim,
      inicioAtual: parseISO(dataInicio),
      fimAtual: parseISO(dataFim)
    });

    const inicioAtual = parseISO(dataInicio);
    const fimAtual = parseISO(dataFim);

    // Verificar se as datas correspondem a "hoje"
    const hoje = new Date(2025, 7, 14); // Forçar data atual real (14/08/2025)
    const inicioHoje = startOfDay(hoje);
    const fimHoje = endOfDay(hoje);

    // Se as datas são iguais, é "hoje"
    if (isSameDay(inicioAtual, fimAtual)) {
      setPeriodoSelecionado("hoje");
    } else {
      setPeriodoSelecionado("personalizar");
    }
  }, []); // Executar apenas uma vez na inicialização

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
    if (dateRange?.from && dateRange?.to) {
      onDataInicioChange(format(dateRange.from, "yyyy-MM-dd"));
      onDataFimChange(format(dateRange.to, "yyyy-MM-dd"));
      setPeriodoSelecionado("personalizar");

      onAplicar();
      setIsOpen(false);
      setShowCalendar(false);
    } else if (tempDataInicio && tempDataFim) {
      onDataInicioChange(tempDataInicio);
      onDataFimChange(tempDataFim);
      setPeriodoSelecionado("personalizar");

      onAplicar();
      setIsOpen(false);
      setShowCalendar(false);
    }
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
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 w-[700px]">
            {!showCalendar ? (
              <div className="flex">
                {/* Lista de opções predefinidas */}
                <div className="w-72 p-4 border-r border-gray-200">
                  <div className="space-y-2">
                    {opcoesPeriodo.map((opcao) => (
                      <button
                        key={opcao.id}
                        onClick={() => aplicarPeriodo(opcao)}
                        className={`w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-gray-100 transition-colors ${
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

                {/* Preview das datas */}
                <div className="flex-1 p-6">
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-500 mb-3">
                      Período selecionado:
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-6">
                      {formatarPeriodoDisplay()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Data de início*
                      </label>
                      <div className="text-base font-medium text-gray-900">
                        {dataInicio
                          ? parseISO(dataInicio).toLocaleDateString("pt-BR")
                          : "-"}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Data de término
                      </label>
                      <div className="text-base font-medium text-gray-900">
                        {dataFim
                          ? parseISO(dataFim).toLocaleDateString("pt-BR")
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      size="lg"
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
                      className="flex-1 h-12 text-base font-semibold"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Aplicar
                    </Button>
                    {onLimpar && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => {
                          onLimpar();
                          setIsOpen(false);
                        }}
                        className="h-12 px-6 text-base"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {/* Header do calendário personalizado */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="ghost"
                    size="default"
                    onClick={voltarParaOpcoes}
                    className="text-sm font-medium"
                  >
                    ← Voltar
                  </Button>
                  <h3 className="text-lg font-semibold">
                    Datas personalizadas
                  </h3>
                  <div></div>
                </div>

                {/* Campos de data manual */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <Label className="text-sm font-semibold text-gray-600 mb-3 block">
                      Data de início*
                    </Label>
                    <Input
                      type="date"
                      value={tempDataInicio || dataInicio}
                      onChange={(e) => setTempDataInicio(e.target.value)}
                      className="h-12 text-base font-medium"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <Label className="text-sm font-semibold text-gray-600 mb-3 block">
                      Data de término
                    </Label>
                    <Input
                      type="date"
                      value={tempDataFim || dataFim}
                      onChange={(e) => setTempDataFim(e.target.value)}
                      className="h-12 text-base font-medium"
                    />
                  </div>
                </div>

                {/* Calendário duplo */}
                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                    className="text-base"
                    classNames={{
                      months:
                        "flex flex-col sm:flex-row space-y-6 sm:space-x-8 sm:space-y-0",
                      month: "space-y-5",
                      caption:
                        "flex justify-center pt-3 relative items-center mb-5",
                      caption_label: "text-lg font-bold text-gray-800",
                      nav: "space-x-3 flex items-center",
                      nav_button:
                        "h-10 w-10 bg-white p-0 opacity-70 hover:opacity-100 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all duration-200 shadow-sm",
                      nav_button_previous: "absolute left-3",
                      nav_button_next: "absolute right-3",
                      table: "w-full border-collapse space-y-2",
                      head_row: "flex mb-3",
                      head_cell:
                        "text-gray-600 rounded-lg w-11 h-11 font-semibold text-sm flex items-center justify-center",
                      row: "flex w-full mt-2",
                      cell: "text-center text-base p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
                      day: "h-11 w-11 p-0 font-medium aria-selected:opacity-100 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-150 text-base flex items-center justify-center border border-transparent hover:border-gray-200",
                      day_selected:
                        "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white font-semibold border-blue-600 shadow-md",
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
                <div className="flex gap-4 mt-8">
                  <Button
                    size="lg"
                    onClick={aplicarDatasPersonalizadas}
                    className="flex-1 h-12 text-base font-semibold"
                    disabled={
                      (!dateRange?.from || !dateRange?.to) &&
                      (!tempDataInicio || !tempDataFim)
                    }
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Aplicar período
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setDateRange(undefined);
                      setTempDataInicio("");
                      setTempDataFim("");
                    }}
                    className="h-12 px-6 text-base"
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
