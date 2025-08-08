import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
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
import { Filter, ChevronDown, X, DollarSign } from "lucide-react";

const formasPagamento = [
  "Dinheiro",
  "Pix",
  "Cartão de Débito",
  "Cartão de Crédito",
  "Boleto",
  "Transferência",
];

const tecnicos = [
  "João Silva",
  "Carlos Santos",
  "Roberto Lima",
  "Fernando Costa",
];

export default function FiltrosCaixaCompacto() {
  const { filtros, setFiltros, totais, isLoading } = useCaixa();
  const { setores, campanhas } = useEntidades();
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false);

  const handleDataInicioChange = (data: string) => {
    console.log("handleDataInicioChange chamado com:", data); // Debug
    const novaData = new Date(data);
    // Normalizar para início do dia
    novaData.setHours(0, 0, 0, 0);
    console.log("Nova data início criada:", novaData); // Debug

    setFiltros({
      ...filtros,
      dataInicio: novaData,
      __timestamp: Date.now(), // Força re-render
    });
  };

  const handleDataFimChange = (data: string) => {
    console.log("handleDataFimChange chamado com:", data); // Debug
    const novaData = new Date(data);
    // Normalizar para fim do dia
    novaData.setHours(23, 59, 59, 999);
    console.log("Nova data fim criada:", novaData); // Debug

    setFiltros({
      ...filtros,
      dataFim: novaData,
      __timestamp: Date.now(), // Força re-render
    });
  };

  const handleAplicarPeriodo = () => {
    console.log("handleAplicarPeriodo chamado"); // Debug
    console.log("Filtros atuais:", filtros); // Debug

    // Força atualização com novos filtros criando nova referência
    setFiltros({
      ...filtros,
      __timestamp: Date.now(), // Força re-render
    });
  };

  const limparFiltros = () => {
    const hoje = new Date();
    setFiltros({
      dataInicio: hoje,
      dataFim: hoje,
      tipo: "todos",
      formaPagamento: "todas",
      tecnico: "todos",
      campanha: "todas",
      setor: "todos",
    });
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.tipo !== "todos") count++;
    if (filtros.formaPagamento && filtros.formaPagamento !== "todas") count++;
    if (filtros.tecnico && filtros.tecnico !== "todos") count++;
    if (filtros.campanha && filtros.campanha !== "todas") count++;
    if (filtros.setor && filtros.setor !== "todos") count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <div className="space-y-3">
      {/* Filtros de Período */}
      <FiltrosPeriodoCompacto
        dataInicio={filtros.dataInicio.toISOString().split("T")[0]}
        dataFim={filtros.dataFim.toISOString().split("T")[0]}
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
              {totais.receitas.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <div className="text-xs text-muted-foreground">Receitas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {totais.despesas.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <div className="text-xs text-muted-foreground">Despesas</div>
          </div>
          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                totais.saldo > 0
                  ? "text-green-600"
                  : totais.saldo < 0
                    ? "text-red-600"
                    : "text-foreground"
              }`}
            >
              {totais.saldo.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <div className="text-xs text-muted-foreground">Saldo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {totais.comissoes.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <div className="text-xs text-muted-foreground">Comissões</div>
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
              {/* Tipo */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Tipo
                </label>
                <Select
                  value={filtros.tipo || "todos"}
                  onValueChange={(value) =>
                    setFiltros({ ...filtros, tipo: value as any })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="receita">Receitas</SelectItem>
                    <SelectItem value="despesa">Despesas</SelectItem>
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
                    setFiltros({ ...filtros, formaPagamento: value })
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
                    setFiltros({ ...filtros, tecnico: value })
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
                    setFiltros({ ...filtros, setor: value })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {setores.map((setor) => (
                      <SelectItem key={setor.id} value={setor.nome}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campanha */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Campanha
                </label>
                <Select
                  value={filtros.campanha || ""}
                  onValueChange={(value) =>
                    setFiltros({ ...filtros, campanha: value })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {campanhas
                      ?.filter((c) => c.ativa)
                      .map((campanha) => (
                        <SelectItem key={campanha.id} value={campanha.nome}>
                          {campanha.nome}
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
