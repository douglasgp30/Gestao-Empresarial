import React, { useState } from "react";
import { useAgendamentos } from "../../contexts/AgendamentosContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { useFuncionarios } from "../../contexts/FuncionariosContext";
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
  const { filtros, setFiltros, agendamentosHoje, isLoading } =
    useAgendamentos();
  const { setores } = useEntidades();
  const { funcionarios } = useFuncionarios();
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false);

  const tecnicos = funcionarios.filter((f) => f.ativo);

  const handleDataInicioChange = (data: string) => {
    const novaData = new Date(data);
    // Normalizar para início do dia
    novaData.setHours(0, 0, 0, 0);
    setFiltros({
      ...filtros,
      dataInicio: novaData,
      __timestamp: Date.now(), // Força re-render
    });
  };

  const handleDataFimChange = (data: string) => {
    const novaData = new Date(data);
    // Normalizar para fim do dia
    novaData.setHours(23, 59, 59, 999);
    setFiltros({
      ...filtros,
      dataFim: novaData,
      __timestamp: Date.now(), // Força re-render
    });
  };

  const handleAplicarPeriodo = () => {
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
      status: "todos",
      setor: undefined,
      tecnico: undefined,
    });
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.status !== "todos") count++;
    if (filtros.setor) count++;
    if (filtros.tecnico) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <div className="space-y-3">
      {/* Filtro de Data estilo Google Ads */}
      <FiltroDataAgendamentos />

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
              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <Select
                  value={filtros.status}
                  onValueChange={(value) =>
                    setFiltros({ ...filtros, status: value as any })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="agendado">Agendados</SelectItem>
                    <SelectItem value="concluido">Concluídos</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Setor */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Setor
                </label>
                <Select
                  value={filtros.setor || "todos"}
                  onValueChange={(value) =>
                    setFiltros({
                      ...filtros,
                      setor: value === "todos" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos os setores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os setores</SelectItem>
                    {setores.map((setor) => (
                      <SelectItem key={setor.id} value={setor.nome}>
                        {setor.nome}
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
                  value={filtros.tecnico || "todos"}
                  onValueChange={(value) =>
                    setFiltros({
                      ...filtros,
                      tecnico: value === "todos" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos os técnicos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os técnicos</SelectItem>
                    <SelectItem value="sem_tecnico">Sem técnico</SelectItem>
                    {tecnicos.map((tecnico) => (
                      <SelectItem key={tecnico.id} value={tecnico.nomeCompleto}>
                        {tecnico.nomeCompleto}
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
