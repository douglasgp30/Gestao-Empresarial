import React, { useEffect, useState } from "react";
import { useContas } from "../../contexts/ContasContext";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const statusOptions = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-500" },
  { value: "paga", label: "Paga", color: "bg-green-500" },
  { value: "atrasada", label: "Atrasada", color: "bg-red-500" },
  { value: "vence_hoje", label: "Vence Hoje", color: "bg-orange-500" },
];

const formasPagamento = [
  "Dinheiro",
  "Pix",
  "Boleto",
  "Transferência",
  "Cartão de Débito",
  "Cartão de Crédito",
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

  const handleDataInicioChange = (data: string) => {
    const novaData = new Date(data);
    novaData.setHours(0, 0, 0, 0);
    setFiltros({
      ...filtros,
      dataInicio: novaData,
    });
  };

  const handleDataFimChange = (data: string) => {
    const novaData = new Date(data);
    novaData.setHours(23, 59, 59, 999);
    setFiltros({
      ...filtros,
      dataFim: novaData,
    });
  };

  const handleAplicarPeriodo = () => {
    // Já aplicado automaticamente pelos handlers acima
  };

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
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Filtro de Data estilo Google Ads */}
      <div className="max-w-sm">
        <FiltroDataContas />
      </div>

      {/* Totais */}
      <div className="bg-background border rounded-lg p-4 max-w-4xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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
              className={`text-lg font-bold ${totaisSeguro.totalReceber - totaisSeguro.totalPagar >= 0 ? "text-green-600" : "text-red-600"}`}
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
      </div>

      {/* Filtros Básicos - Layout Compacto */}
      <div className="bg-background border rounded-lg p-4 max-w-4xl">
        <div className="space-y-4">
          {/* Filtro de Tipo - Compacto */}
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">
              Tipo de Conta
            </label>
            <Select
              value={filtrosLocal.tipo}
              onValueChange={(value: "pagar" | "receber" | "ambos") =>
                setFiltrosLocal((prev) => ({ ...prev, tipo: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ambos">Todos os Tipos</SelectItem>
                <SelectItem value="pagar">Contas a Pagar</SelectItem>
                <SelectItem value="receber">Contas a Receber</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros Avançados */}
          <Collapsible
            open={filtrosAvancadosAbertos}
            onOpenChange={setFiltrosAvancadosAbertos}
          >
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros Avançados
                  {filtrosAtivos > 0 && (
                    <Badge variant="secondary" className="h-5 px-2 text-xs">
                      {filtrosAtivos}
                    </Badge>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      filtrosAvancadosAbertos ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              {filtrosAtivos > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limparFiltros}
                  className="gap-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>

            <CollapsibleContent className="mt-4">
              <div className="bg-muted/30 rounded-lg p-4 border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={filtrosLocal.status || ""}
                      onValueChange={(value) =>
                        setFiltrosLocal((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os Status</SelectItem>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${status.color}`}
                              />
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Fornecedor/Cliente
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do fornecedor ou cliente"
                      value={filtrosLocal.fornecedorCliente || ""}
                      onChange={(e) =>
                        setFiltrosLocal((prev) => ({
                          ...prev,
                          fornecedorCliente: e.target.value,
                        }))
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Botões de Ação */}
          <div className="flex gap-3 max-w-md">
            <Button
              onClick={aplicarFiltros}
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              Aplicar Filtros
            </Button>
            <Button
              onClick={limparFiltros}
              variant="outline"
              size="sm"
              className="px-6"
            >
              Limpar
            </Button>
          </div>
        </div>
      </div>

      {/* Status de carregamento */}
      {isLoading && (
        <div className="text-center text-sm text-muted-foreground p-4">
          Carregando dados...
        </div>
      )}
    </div>
  );
}
