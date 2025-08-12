import React, { useEffect, useState } from "react";
import { useRelatorios } from "../../contexts/RelatoriosContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { useCaixa } from "../../contexts/CaixaContext";
import { Button } from "../ui/button";
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
import FiltroDataRelatorios from "./FiltroDataRelatorios";
import {
  Filter,
  ChevronDown,
  X,
  Search,
  Download,
  Printer,
} from "lucide-react";

export default function FiltrosRelatoriosCompacto() {
  const { filtros, setFiltros, isLoading, exportarPDF, exportarExcel } =
    useRelatorios();
  const {
    setores,
    tecnicos,
    formasPagamento,
    isLoading: entidadesLoading,
  } = useEntidades();
  const { campanhas, isLoading: caixaLoading } = useCaixa();
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
      periodo: {
        dataInicio: inicioMes,
        dataFim: fimMes,
      },
      tipo: "ambos" as const,
      formaPagamento: "",
      tecnico: "",
      setor: "",
      campanha: "",
      status: "",
    };
    setFiltrosLocal(filtrosLimpos);
    setFiltros(filtrosLimpos);
  };

  // Contar filtros ativos
  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtrosLocal.tipo && filtrosLocal.tipo !== "ambos") count++;
    if (filtrosLocal.formaPagamento) count++;
    if (filtrosLocal.tecnico) count++;
    if (filtrosLocal.setor) count++;
    if (filtrosLocal.campanha) count++;
    if (filtrosLocal.status) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();
  const isLoadingGeral = isLoading || entidadesLoading || caixaLoading;

  return (
    <div className="space-y-3">
      {/* Ações de Relatório */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="text-sm font-medium text-gray-600">
              Ações de Relatório:
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportarPDF("financeiro", {})}
                className="gap-2 h-8 text-xs"
              >
                <Printer className="h-3 w-3" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportarExcel("financeiro", {})}
                className="gap-2 h-8 text-xs"
              >
                <Download className="h-3 w-3" />
                Excel
              </Button>
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
                <FiltroDataRelatorios />
              </div>

              {/* Filtro de Tipo - 3 colunas */}
              <div className="lg:col-span-3">
                <label className="text-xs font-medium mb-1 block text-gray-600">
                  Tipo
                </label>
                <Select
                  value={filtrosLocal.tipo || "ambos"}
                  onValueChange={(value: "receitas" | "despesas" | "ambos") =>
                    setFiltrosLocal((prev) => ({ ...prev, tipo: value }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambos">Todos</SelectItem>
                    <SelectItem value="receitas">Receitas</SelectItem>
                    <SelectItem value="despesas">Despesas</SelectItem>
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
                  disabled={isLoadingGeral}
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
                  <div className="space-y-3">
                    {/* Primeira linha de filtros avançados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Forma de Pagamento */}
                      <div>
                        <label className="text-xs font-medium mb-1 block text-gray-600">
                          Forma Pagamento
                        </label>
                        <Select
                          value={filtrosLocal.formaPagamento || "todas"}
                          onValueChange={(value) =>
                            setFiltrosLocal((prev) => ({
                              ...prev,
                              formaPagamento: value === "todas" ? "" : value,
                            }))
                          }
                          disabled={isLoadingGeral}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todas">Todas</SelectItem>
                            {formasPagamento?.map((forma) => (
                              <SelectItem
                                key={forma.id}
                                value={forma.id.toString()}
                              >
                                {forma.nome}
                              </SelectItem>
                            )) || []}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Técnico */}
                      <div>
                        <label className="text-xs font-medium mb-1 block text-gray-600">
                          Técnico
                        </label>
                        <Select
                          value={filtrosLocal.tecnico || "todos"}
                          onValueChange={(value) =>
                            setFiltrosLocal((prev) => ({
                              ...prev,
                              tecnico: value === "todos" ? "" : value,
                            }))
                          }
                          disabled={isLoadingGeral}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            {tecnicos?.map((tecnico) => (
                              <SelectItem
                                key={tecnico.id}
                                value={tecnico.id.toString()}
                              >
                                {tecnico.nome}
                              </SelectItem>
                            )) || []}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Setor */}
                      <div>
                        <label className="text-xs font-medium mb-1 block text-gray-600">
                          Setor
                        </label>
                        <Select
                          value={filtrosLocal.setor || "todos"}
                          onValueChange={(value) =>
                            setFiltrosLocal((prev) => ({
                              ...prev,
                              setor: value === "todos" ? "" : value,
                            }))
                          }
                          disabled={isLoadingGeral}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            {setores?.map((setor) => (
                              <SelectItem
                                key={setor.id}
                                value={setor.id.toString()}
                              >
                                {setor.nome} - {setor.cidade}
                              </SelectItem>
                            )) || []}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Campanha */}
                      <div>
                        <label className="text-xs font-medium mb-1 block text-gray-600">
                          Campanha
                        </label>
                        <Select
                          value={filtrosLocal.campanha || "todas"}
                          onValueChange={(value) =>
                            setFiltrosLocal((prev) => ({
                              ...prev,
                              campanha: value === "todas" ? "" : value,
                            }))
                          }
                          disabled={isLoadingGeral}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todas">Todas</SelectItem>
                            {campanhas?.map((campanha) => (
                              <SelectItem
                                key={campanha.id}
                                value={campanha.id.toString()}
                              >
                                {campanha.nome}
                              </SelectItem>
                            )) || []}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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
