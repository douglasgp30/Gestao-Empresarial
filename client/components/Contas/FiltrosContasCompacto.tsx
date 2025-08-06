import React, { useState } from "react";
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
import FiltrosPeriodoCompacto from "../ui/filtros-periodo-compacto";
import { Filter, ChevronDown, X, FileText, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";

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
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false);

  // Valores padrão para evitar erros durante o carregamento
  const totaisSeguro = totais || {
    totalReceber: 0,
    totalPagar: 0,
    totalAtrasadas: 0,
    totalVencendoHoje: 0,
    totalPagas: 0,
  };

  const handleDataInicioChange = (data: string) => {
    setFiltros({
      ...filtros,
      dataInicio: new Date(data)
    });
  };

  const handleDataFimChange = (data: string) => {
    setFiltros({
      ...filtros,
      dataFim: new Date(data)
    });
  };

  const handleAplicarPeriodo = () => {
    // Força atualização com novos filtros
    setFiltros({ ...filtros });
  };

  const limparFiltros = () => {
    const hoje = new Date();
    setFiltros({
      dataInicio: hoje,
      dataFim: hoje,
      tipo: "ambos",
      status: "todos",
      fornecedorCliente: "todos",
    });
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.tipo && filtros.tipo !== "ambos") count++;
    if (filtros.status) count++;
    if (filtros.fornecedorCliente) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <div className="space-y-3">
      {/* Filtros de Período */}
      <FiltrosPeriodoCompacto
        dataInicio={filtros.dataInicio.toISOString().split('T')[0]}
        dataFim={filtros.dataFim.toISOString().split('T')[0]}
        onDataInicioChange={handleDataInicioChange}
        onDataFimChange={handleDataFimChange}
        onAplicar={handleAplicarPeriodo}
        onLimpar={limparFiltros}
        isLoading={isLoading}
      />

      {/* Totais */}
      <div className="bg-background border rounded-lg p-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(totaisSeguro.totalReceber)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              A Receber
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(totaisSeguro.totalPagar)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <TrendingDown className="h-3 w-3" />
              A Pagar
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${totaisSeguro.totalReceber - totaisSeguro.totalPagar >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totaisSeguro.totalReceber - totaisSeguro.totalPagar)}
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
              <ChevronDown className={`h-4 w-4 transition-transform ${filtrosAvancadosAbertos ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          {filtrosAtivos > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Limpar
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-3">
          <div className="bg-muted/30 rounded-lg p-3 border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Tipo */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <Select
                  value={filtros.tipo || "ambos"}
                  onValueChange={(value) =>
                    setFiltros({ ...filtros, tipo: value as "pagar" | "receber" | "ambos" })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambos">Todos</SelectItem>
                    <SelectItem value="pagar">Contas a Pagar</SelectItem>
                    <SelectItem value="receber">Contas a Receber</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select
                  value={filtros.status || ""}
                  onValueChange={(value) =>
                    setFiltros({ ...filtros, status: value })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status.color}`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              {/* Fornecedor/Cliente */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Fornecedor/Cliente</label>
                <Select
                  value={filtros.fornecedorCliente || ""}
                  onValueChange={(value) =>
                    setFiltros({ ...filtros, fornecedorCliente: value === "" ? undefined : value })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Empresa XYZ Ltda">Empresa XYZ Ltda</SelectItem>
                    <SelectItem value="João Silva">João Silva</SelectItem>
                    <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                    <SelectItem value="Posto de Gasolina ABC">Posto de Gasolina ABC</SelectItem>
                    <SelectItem value="Fornecedor de Materiais Silva">Fornecedor de Materiais Silva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
