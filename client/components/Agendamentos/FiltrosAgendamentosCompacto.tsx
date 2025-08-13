import React, { useEffect, useState } from "react";
import { useAgendamentos } from "../../contexts/AgendamentosContext";
import { useEntidades } from "../../contexts/EntidadesContext";
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
import FiltroDataAgendamentosSimples from "./FiltroDataAgendamentosSimples";
import { Filter, ChevronDown, X, Search } from "lucide-react";

export default function FiltrosAgendamentosCompacto() {
  const { filtros, setFiltros, isLoading } = useAgendamentos();
  const { setores, tecnicos, isLoading: entidadesLoading } = useEntidades();
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
    const filtrosLimpos = {
      dataInicio: hoje,
      dataFim: hoje,
      setor: "",
      tecnico: "",
      status: "todos" as const,
    };
    setFiltrosLocal(filtrosLimpos);
    setFiltros(filtrosLimpos);
  };

  // Contar filtros ativos
  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtrosLocal.setor) count++;
    if (filtrosLocal.tecnico) count++;
    if (filtrosLocal.status !== "todos") count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();
  const isLoadingGeral = isLoading || entidadesLoading;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Linha Principal: Tudo em uma linha compacta */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
            {/* Filtro de Data - 4 colunas */}
            <div className="lg:col-span-4">
              <FiltroDataAgendamentosSimples />
            </div>

            {/* Filtro de Status - 3 colunas */}
            <div className="lg:col-span-3">
              <label className="text-xs font-medium mb-1 block text-gray-600">
                Status
              </label>
              <Select
                value={filtrosLocal.status}
                onValueChange={(
                  value: "todos" | "agendado" | "concluido" | "cancelado",
                ) => setFiltrosLocal((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <SelectValue placeholder="Todos os setores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Setores</SelectItem>
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
                        <SelectValue placeholder="Todos os técnicos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Técnicos</SelectItem>
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
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
