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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Badge } from "../ui/badge";
import FiltroDataAgendamentos from "./FiltroDataAgendamentos";
import { Filter, ChevronDown, X, Calendar } from "lucide-react";

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
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Filtro de Data estilo Google Ads */}
      <div className="max-w-sm">
        <FiltroDataAgendamentos />
      </div>

      {/* Filtros Básicos - Layout Compacto */}
      <div className="bg-background border rounded-lg p-4 max-w-4xl">
        <div className="space-y-4">
          {/* Filtro de Status - Compacto */}
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">
              Status do Agendamento
            </label>
            <Select
              value={filtrosLocal.status}
              onValueChange={(
                value: "todos" | "agendado" | "concluido" | "cancelado",
              ) => setFiltrosLocal((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
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
                    <label className="text-sm font-medium">Setor</label>
                    <Select
                      value={filtrosLocal.setor || ""}
                      onValueChange={(value) =>
                        setFiltrosLocal((prev) => ({ ...prev, setor: value }))
                      }
                      disabled={isLoadingGeral}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os setores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os Setores</SelectItem>
                        {setores.map((setor) => (
                          <SelectItem
                            key={setor.id}
                            value={setor.id.toString()}
                          >
                            {setor.nome} - {setor.cidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Técnico</label>
                    <Select
                      value={filtrosLocal.tecnico || ""}
                      onValueChange={(value) =>
                        setFiltrosLocal((prev) => ({ ...prev, tecnico: value }))
                      }
                      disabled={isLoadingGeral}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os técnicos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os Técnicos</SelectItem>
                        {tecnicos.map((tecnico) => (
                          <SelectItem
                            key={tecnico.id}
                            value={tecnico.id.toString()}
                          >
                            {tecnico.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              disabled={isLoadingGeral}
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
      {isLoadingGeral && (
        <div className="text-center text-sm text-muted-foreground p-4">
          Carregando dados...
        </div>
      )}
    </div>
  );
}
