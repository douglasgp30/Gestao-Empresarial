import React, { useState } from "react";
import { useRelatorios } from "../../contexts/RelatoriosContext";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Filter,
  Calendar as CalendarIcon,
  Clock,
  CalendarDays,
  CalendarRange,
} from "lucide-react";

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

function getInicioDoMes(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

function getHoje(): Date {
  return new Date();
}

function getUltimos7Dias(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 6);
}

function getInicioSemana(): Date {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diasAtras = diaSemana === 0 ? 6 : diaSemana - 1;
  return new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate() - diasAtras,
  );
}

function getUltimos30Dias(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 29);
}

export default function FiltrosRelatorios() {
  const { filtros, setFiltros } = useRelatorios();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDataInicio, setTempDataInicio] = useState<Date | undefined>(
    filtros.periodo.dataInicio,
  );
  const [tempDataFim, setTempDataFim] = useState<Date | undefined>(
    filtros.periodo.dataFim,
  );

  const opcoesFiltro = [
    {
      id: "mesAtual",
      label: "Mês Atual",
      icon: CalendarDays,
      descricao: "Do dia 1 até hoje",
    },
    {
      id: "ultimos7dias",
      label: "Últimos 7 Dias",
      icon: Clock,
      descricao: "Últimos 7 dias",
    },
    {
      id: "estaemana",
      label: "Esta Semana",
      icon: CalendarRange,
      descricao: "Segunda-feira até hoje",
    },
    {
      id: "ultimos30dias",
      label: "Últimos 30 Dias",
      icon: CalendarDays,
      descricao: "Últimos 30 dias",
    },
  ] as const;

  const handleFiltroRapido = (tipo: (typeof opcoesFiltro)[number]["id"]) => {
    let novoFiltro: { dataInicio: Date; dataFim: Date };

    switch (tipo) {
      case "ultimos7dias":
        novoFiltro = { dataInicio: getUltimos7Dias(), dataFim: getHoje() };
        break;
      case "estaemana":
        novoFiltro = { dataInicio: getInicioSemana(), dataFim: getHoje() };
        break;
      case "ultimos30dias":
        novoFiltro = { dataInicio: getUltimos30Dias(), dataFim: getHoje() };
        break;
      case "mesAtual":
        novoFiltro = { dataInicio: getInicioDoMes(), dataFim: getHoje() };
        break;
      default:
        novoFiltro = filtros.periodo;
    }

    setFiltros({
      ...filtros,
      periodo: novoFiltro,
    });
  };

  const aplicarFiltroPersonalizado = () => {
    if (tempDataInicio && tempDataFim) {
      setFiltros({
        ...filtros,
        periodo: {
          dataInicio: tempDataInicio,
          dataFim: tempDataFim,
        },
      });
      setIsCalendarOpen(false);
    }
  };

  const isPeriodoAtivo = (
    tipo: (typeof opcoesFiltro)[number]["id"],
  ): boolean => {
    const hoje = new Date();

    switch (tipo) {
      case "mesAtual": {
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        return (
          filtros.periodo.dataInicio.toDateString() ===
            inicioMes.toDateString() &&
          filtros.periodo.dataFim.toDateString() === hoje.toDateString()
        );
      }
      case "ultimos7dias": {
        const inicio7dias = new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          hoje.getDate() - 6,
        );
        return (
          filtros.periodo.dataInicio.toDateString() ===
            inicio7dias.toDateString() &&
          filtros.periodo.dataFim.toDateString() === hoje.toDateString()
        );
      }
      case "estaemana": {
        const diaSemana = hoje.getDay();
        const diasAtras = diaSemana === 0 ? 6 : diaSemana - 1;
        const inicioSemana = new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          hoje.getDate() - diasAtras,
        );
        return (
          filtros.periodo.dataInicio.toDateString() ===
            inicioSemana.toDateString() &&
          filtros.periodo.dataFim.toDateString() === hoje.toDateString()
        );
      }
      case "ultimos30dias": {
        const inicio30dias = new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          hoje.getDate() - 29,
        );
        return (
          filtros.periodo.dataInicio.toDateString() ===
            inicio30dias.toDateString() &&
          filtros.periodo.dataFim.toDateString() === hoje.toDateString()
        );
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
        </CardTitle>
        <CardDescription>
          Período selecionado: {formatDate(filtros.periodo.dataInicio)} -{" "}
          {formatDate(filtros.periodo.dataFim)}
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
                className={`flex flex-col h-auto p-3 space-y-1 ${
                  ativo ? "ring-2 ring-primary" : ""
                }`}
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
                    disabled={(date) =>
                      tempDataInicio ? date < tempDataInicio : false
                    }
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

        {/* Filtros Adicionais */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <Select
              value={filtros.tipo || "todos"}
              onValueChange={(value) =>
                setFiltros({
                  ...filtros,
                  tipo:
                    value === "todos"
                      ? undefined
                      : (value as "receitas" | "despesas"),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="receitas">Apenas Receitas</SelectItem>
                <SelectItem value="despesas">Apenas Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select
              value={filtros.formaPagamento || "todos"}
              onValueChange={(value) =>
                setFiltros({
                  ...filtros,
                  formaPagamento: value === "todos" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Pix">Pix</SelectItem>
                <SelectItem value="Cartão">Cartão</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Técnico</Label>
            <Select
              value={filtros.tecnico || "todos"}
              onValueChange={(value) =>
                setFiltros({
                  ...filtros,
                  tecnico: value === "todos" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="João Silva">João Silva</SelectItem>
                <SelectItem value="Carlos Santos">Carlos Santos</SelectItem>
                <SelectItem value="Roberto Lima">Roberto Lima</SelectItem>
                <SelectItem value="Fernando Costa">Fernando Costa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
