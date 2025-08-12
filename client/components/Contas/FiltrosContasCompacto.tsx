import React, { useEffect, useState } from "react";
import { useContas } from "../../contexts/ContasContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Badge } from "../ui/badge";
import FiltroDataContas from "./FiltroDataContas";
import {
  Filter,
  ChevronDown,
  X,
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

const statusOptions = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-500" },
  { value: "paga", label: "Paga", color: "bg-green-500" },
  { value: "atrasada", label: "Atrasada", color: "bg-red-500" },
  { value: "vence_hoje", label: "Vence Hoje", color: "bg-orange-500" },
];

function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "R$ 0,00";
  }
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function FiltrosContasCompacto() {
  const { filtros, setFiltros, totais, isLoading } = useContas();
  const [filtrosLocal, setFiltrosLocal] = useState(filtros);
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false);

  useEffect(() => {
    setFiltrosLocal(filtros);
  }, [filtros]);

  const aplicarFiltros = () => {
    setFiltros(filtrosLocal);
  };

  const limparFiltros = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const filtrosLimpos = {
      dataInicio: inicioMes,
      dataFim: fimMes,
      tipo: "ambos" as const,
      status: "",
      fornecedorCliente: "",
    };

    setFiltrosLocal(filtrosLimpos);
    setFiltros(filtrosLimpos);
  };

  // Contar filtros ativos
  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtrosLocal.tipo !== "ambos") count++;
    if (filtrosLocal.status) count++;
    if (filtrosLocal.fornecedorCliente) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  // Totais seguros para evitar undefined
  const totaisSeguro = {
    totalPagar: totais?.totalPagar || 0,
    totalReceber: totais?.totalReceber || 0,
    totalVencendoHoje: totais?.totalVencendoHoje || 0,
    totalAtrasadas: totais?.totalAtrasadas || 0,
    totalPagas: totais?.totalPagas || 0,
    totalContasRecebidas: totais?.totalContasRecebidas || 0,
    totalContasPagas: totais?.totalContasPagas || 0,
  };

  return (
    <div className="space-y-3">
      {/* Totais */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(totaisSeguro.totalReceber)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />A Receber
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(totaisSeguro.totalPagar)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <TrendingDown className="h-3 w-3" />A Pagar
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-lg font-bold ${
                  totaisSeguro.totalReceber - totaisSeguro.totalPagar >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(
                  totaisSeguro.totalReceber - totaisSeguro.totalPagar,
                )}
              </div>
              <div className="text-xs text-muted-foreground">Saldo</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(totaisSeguro.totalAtrasadas)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Atrasadas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Linha Principal: Tudo em uma linha compacta */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              {/* Filtro de Data - 4 colunas */}
              <div className="lg:col-span-4">
                <FiltroDataContas />
              </div>

              {/* Filtro de Tipo - 3 colunas */}
              <div className="lg:col-span-3">
                <label className="text-xs font-medium mb-1 block text-gray-600">
                  Tipo
                </label>
                <Select
                  value={filtrosLocal.tipo}
                  onValueChange={(value: "pagar" | "receber" | "ambos") =>
                    setFiltrosLocal((prev) => ({ ...prev, tipo: value }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambos">Todos</SelectItem>
                    <SelectItem value="pagar">A Pagar</SelectItem>
                    <SelectItem value="receber">A Receber</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros Avançados - 3 colunas */}
              <div className="lg:col-span-3">
                <Collapsible
                  open={filtrosAvancadosAbertos}
                  onOpenChange={setFiltrosAvancadosAbertos}
                >
                  <CollapsibleTrigger asChild>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Mais Filtros
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs justify-between"
                      >
                        <span className="flex items-center gap-1">
                          <Filter className="h-3 w-3" />
                          Avançados
                          {filtrosAtivos > 0 && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 text-xs"
                            >
                              {filtrosAtivos}
                            </Badge>
                          )}
                        </span>
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${
                            filtrosAvancadosAbertos ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>

              {/* Botões de Ação - 2 colunas */}
              <div className="lg:col-span-2 flex gap-1">
                <Button
                  onClick={aplicarFiltros}
                  size="sm"
                  className="h-8 text-xs flex-1"
                  disabled={isLoading}
                >
                  <Search className="h-3 w-3 mr-1" />
                  Filtrar
                </Button>
                <Button
                  onClick={limparFiltros}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Filtros Avançados Colapsáveis */}
            <Collapsible
              open={filtrosAvancadosAbertos}
              onOpenChange={setFiltrosAvancadosAbertos}
            >
              <CollapsibleContent>
                <div className="bg-gray-50 rounded p-3 mt-2 border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Status */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Status
                      </label>
                      <Select
                        value={filtrosLocal.status || "todos"}
                        onValueChange={(value) =>
                          setFiltrosLocal((prev) => ({ ...prev, status: value === "todos" ? "" : value }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Status</SelectItem>
                          {statusOptions?.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${status.color}`}
                                />
                                {status.label}
                              </div>
                            </SelectItem>
                          )) || []}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fornecedor/Cliente */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Fornecedor/Cliente
                      </label>
                      <Input
                        placeholder="Nome do fornecedor ou cliente"
                        value={filtrosLocal.fornecedorCliente || ""}
                        onChange={(e) =>
                          setFiltrosLocal((prev) => ({
                            ...prev,
                            fornecedorCliente: e.target.value,
                          }))
                        }
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Botões dos Filtros Avançados */}
                  <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-200">
                    <Button
                      onClick={() => {
                        setFiltrosLocal((prev) => ({
                          ...prev,
                          status: "",
                          fornecedorCliente: "",
                        }));
                      }}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                    >
                      Limpar
                    </Button>
                    <Button
                      onClick={aplicarFiltros}
                      size="sm"
                      className="h-7 text-xs px-3"
                      disabled={isLoading}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
