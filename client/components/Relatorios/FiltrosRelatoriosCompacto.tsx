import React, { useState } from "react";
import { useRelatorios } from "../../contexts/RelatoriosContext";
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
import {
  Filter,
  ChevronDown,
  X,
  BarChart3,
  Download,
  Users,
  DollarSign,
} from "lucide-react";

const tiposRelatorio = [
  { value: "financeiro", label: "Financeiro", icon: DollarSign },
  { value: "tecnicos", label: "Técnicos", icon: Users },
  { value: "contas", label: "Contas", icon: BarChart3 },
];

const statusOptions = ["Todos", "Ativo", "Inativo", "Pendente", "Concluído"];

const formasPagamento = [
  "Dinheiro",
  "Pix",
  "Boleto",
  "Transferência",
  "Cartão de Débito",
  "Cartão de Crédito",
];

const tecnicos = [
  "João Silva",
  "Carlos Santos",
  "Roberto Lima",
  "Fernando Costa",
];

export default function FiltrosRelatoriosCompacto() {
  const { filtros, setFiltros, isLoading } = useRelatorios();
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false);

  const handleDataInicioChange = (data: string) => {
    setFiltros({
      ...filtros,
      periodo: {
        ...filtros.periodo,
        dataInicio: new Date(data),
      },
    });
  };

  const handleDataFimChange = (data: string) => {
    setFiltros({
      ...filtros,
      periodo: {
        ...filtros.periodo,
        dataFim: new Date(data),
      },
    });
  };

  const handleAplicarPeriodo = () => {
    // Força atualização com novos filtros
    setFiltros({ ...filtros });
  };

  const limparFiltros = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    setFiltros({
      periodo: {
        dataInicio: inicioMes,
        dataFim: hoje,
      },
      tipo: "todos",
      formaPagamento: "todas",
      tecnico: "todos",
      setor: "todos",
      campanha: "todas",
      status: "todos",
    });
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.tipo) count++;
    if (filtros.formaPagamento) count++;
    if (filtros.tecnico) count++;
    if (filtros.setor) count++;
    if (filtros.campanha) count++;
    if (filtros.status) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  const gerarRelatorio = () => {
    // TODO: Implementar geração de relatório
    console.log("Gerando relatório com filtros:", filtros);
  };

  const exportarRelatorio = (formato: "excel" | "pdf") => {
    // TODO: Implementar exportação
    console.log("Exportando relatório em:", formato);
  };

  return (
    <div className="space-y-3">
      {/* Filtros de Período */}
      <FiltrosPeriodoCompacto
        dataInicio={filtros.periodo.dataInicio.toISOString().split("T")[0]}
        dataFim={filtros.periodo.dataFim.toISOString().split("T")[0]}
        onDataInicioChange={handleDataInicioChange}
        onDataFimChange={handleDataFimChange}
        onAplicar={handleAplicarPeriodo}
        onLimpar={limparFiltros}
        isLoading={isLoading}
      />

      {/* Ações Rápidas */}
      <div className="bg-background border rounded-lg p-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Ações de Relatório:
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={gerarRelatorio}
              size="sm"
              className="gap-2"
              disabled={isLoading}
            >
              <BarChart3 className="h-3 w-3" />
              Gerar Relatório
            </Button>
            <Button
              onClick={() => exportarRelatorio("excel")}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-3 w-3" />
              Excel
            </Button>
            <Button
              onClick={() => exportarRelatorio("pdf")}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-3 w-3" />
              PDF
            </Button>
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
              <ChevronDown
                className={`h-4 w-4 transition-transform ${filtrosAvancadosAbertos ? "rotate-180" : ""}`}
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
              <X className="h-3 w-3" />
              Limpar
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-3">
          <div className="bg-muted/30 rounded-lg p-3 border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Tipo de Relatório */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Tipo de Relatório
                </label>
                <Select
                  value={filtros.tipo || ""}
                  onValueChange={(value) =>
                    setFiltros({
                      ...filtros,
                      tipo: value === "" ? undefined : (value as any),
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="receitas">Receitas</SelectItem>
                    <SelectItem value="despesas">Despesas</SelectItem>
                    <SelectItem value="ambos">Receitas e Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Forma de Pagamento
                </label>
                <Select
                  value={filtros.formaPagamento || ""}
                  onValueChange={(value) =>
                    setFiltros({
                      ...filtros,
                      formaPagamento: value === "" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
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

              {/* Técnico */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Técnico
                </label>
                <Select
                  value={filtros.tecnico || ""}
                  onValueChange={(value) =>
                    setFiltros({
                      ...filtros,
                      tecnico: value === "" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
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

              {/* Setor */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Setor
                </label>
                <Select
                  value={filtros.setor || ""}
                  onValueChange={(value) =>
                    setFiltros({
                      ...filtros,
                      setor: value === "" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Residencial">Residencial</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Condomínio">Condomínio</SelectItem>
                    <SelectItem value="Emergência">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <Select
                  value={filtros.status || ""}
                  onValueChange={(value) =>
                    setFiltros({
                      ...filtros,
                      status: value === "" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
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
