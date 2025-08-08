import React, { useState } from "react";
import { useContas } from "../../contexts/ContasContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Filter,
  Calendar as CalendarIcon,
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";


function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function FiltrosContas() {
  const { filtros, setFiltros, totais, isLoading } = useContas();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDataInicio, setTempDataInicio] = useState<Date | undefined>(
    filtros.dataInicio,
  );
  const [tempDataFim, setTempDataFim] = useState<Date | undefined>(
    filtros.dataFim,
  );

  const aplicarFiltroData = () => {
    if (tempDataInicio && tempDataFim) {
      setFiltros({
        ...filtros,
        dataInicio: tempDataInicio,
        dataFim: tempDataFim,
      });
      setIsCalendarOpen(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: new Date(2024, 11, 1),
      dataFim: new Date(2024, 11, 31),
      tipo: "ambos",
    });
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.tipo !== "ambos") count++;
    if (filtros.status) count++;
    if (filtros.fornecedorCliente) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Resumo Totais */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A Pagar</p>
                <p className="text-xl font-bold text-red-600">
                  {isLoading ? "..." : formatCurrency(totais.totalPagar)}
                </p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-xl font-bold text-green-600">
                  {isLoading ? "..." : formatCurrency(totais.totalReceber)}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vence Hoje</p>
                <p className="text-xl font-bold text-orange-600">
                  {isLoading ? "..." : formatCurrency(totais.totalVencendoHoje)}
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasadas</p>
                <p className="text-xl font-bold text-red-700">
                  {isLoading ? "..." : formatCurrency(totais.totalAtrasadas)}
                </p>
              </div>
              <div className="bg-red-200 p-2 rounded-full">
                <Clock className="h-4 w-4 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagas</p>
                <p className="text-xl font-bold text-green-700">
                  {isLoading ? "..." : formatCurrency(totais.totalPagas)}
                </p>
              </div>
              <div className="bg-green-200 p-2 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
              {contarFiltrosAtivos() > 0 && (
                <Badge variant="secondary">
                  {contarFiltrosAtivos()} ativo(s)
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={limparFiltros}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </CardTitle>
          <CardDescription>
            Período: {formatDate(filtros.dataInicio)} -{" "}
            {formatDate(filtros.dataFim)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-6">
            {/* Período */}
            <div className="md:col-span-2">
              <Label>Período</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Alterar Datas
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
                      <Button size="sm" onClick={aplicarFiltroData}>
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

            {/* Tipo */}
            <div>
              <Label>Tipo</Label>
              <Select
                value={filtros.tipo}
                onValueChange={(value: any) =>
                  setFiltros({ ...filtros, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambos">Ambos</SelectItem>
                  <SelectItem value="pagar">A Pagar</SelectItem>
                  <SelectItem value="receber">A Receber</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select
                value={filtros.status || "todos"}
                onValueChange={(value) =>
                  setFiltros({
                    ...filtros,
                    status: value === "todos" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="vence_hoje">Vence Hoje</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                  <SelectItem value="paga">Paga</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Busca por Fornecedor/Cliente */}
            <div className="md:col-span-2">
              <Label>Fornecedor/Cliente</Label>
              <Input
                placeholder="Buscar por nome..."
                value={filtros.fornecedorCliente || ""}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    fornecedorCliente: e.target.value || undefined,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
