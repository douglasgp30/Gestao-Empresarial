import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
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
import { Filter, Calendar as CalendarIcon, X, Search } from "lucide-react";
import { cn } from "../../lib/utils";

const formasPagamento = [
  "Dinheiro",
  "Pix",
  "Cartão de Débito",
  "Cartão de Crédito",
  "Boleto",
  "Transferência",
];
const setores = [
  "Residencial",
  "Comercial",
  "Industrial",
  "Condomínio",
  "Emergência",
];
const tecnicos = [
  "João Silva",
  "Carlos Santos",
  "Roberto Lima",
  "Fernando Costa",
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export default function FiltrosCaixa() {
  const { filtros, setFiltros, campanhas, totais, isLoading } = useCaixa();
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
      dataFim: new Date(),
      tipo: "todos",
    });
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.tipo !== "todos") count++;
    if (filtros.formaPagamento) count++;
    if (filtros.tecnico) count++;
    if (filtros.campanha) count++;
    if (filtros.setor) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Resumo Totais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading
                    ? "..."
                    : `R$ ${totais.receitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {isLoading
                    ? "..."
                    : `R$ ${totais.despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Final</p>
                <p
                  className={`text-2xl font-bold ${
                    totais.saldo > 0
                      ? "text-green-600"
                      : totais.saldo < 0
                        ? "text-red-600"
                        : "text-foreground"
                  }`}
                >
                  {isLoading
                    ? "..."
                    : `R$ ${totais.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                </p>
              </div>
              <div
                className={`p-2 rounded-full ${totais.saldo >= 0 ? "bg-green-100" : "bg-red-100"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${totais.saldo >= 0 ? "bg-green-600" : "bg-red-600"}`}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comissões</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading
                    ? "..."
                    : `R$ ${totais.comissoes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
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
          {/* Período */}
          <div className="grid gap-4 md:grid-cols-6">
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
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Forma Pagamento</Label>
              <Select
                value={filtros.formaPagamento || "todas"}
                onValueChange={(value) =>
                  setFiltros({
                    ...filtros,
                    formaPagamento: value === "todas" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {formasPagamento.map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {forma}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
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
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico} value={tecnico}>
                      {tecnico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Setor</Label>
              <Select
                value={filtros.setor || "todos"}
                onValueChange={(value) =>
                  setFiltros({
                    ...filtros,
                    setor: value === "todos" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {setores.map((setor) => (
                    <SelectItem key={setor} value={setor}>
                      {setor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Campanha</Label>
            <Select
              value={filtros.campanha || "todas"}
              onValueChange={(value) =>
                setFiltros({
                  ...filtros,
                  campanha: value === "todas" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as campanhas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {campanhas.map((campanha) => (
                  <SelectItem key={campanha.id} value={campanha.nome}>
                    {campanha.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
