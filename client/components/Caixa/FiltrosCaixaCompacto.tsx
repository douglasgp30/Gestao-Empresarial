import React, { useEffect, useState } from "react";
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
  Card,
  CardContent,
} from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Badge } from "../ui/badge";
import FiltroDataCaixa from "./FiltroDataCaixa";
import {
  Filter,
  ChevronDown,
  X,
} from "lucide-react";

export function FiltrosCaixaCompacto() {
  const {
    filtros,
    setFiltros,
    campanhas,
    isLoading: caixaLoading,
  } = useCaixa();

  const {
    formasPagamento,
    tecnicos,
    setores,
    isLoading: entidadesLoading,
  } = useEntidades();

  const [filtrosLocal, setFiltrosLocal] = useState(filtros);
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false);

  // Atualizar filtros locais quando os filtros do contexto mudarem
  useEffect(() => {
    setFiltrosLocal(filtros);
  }, [filtros]);

  const aplicarFiltros = () => {
    setFiltros(filtrosLocal);
  };

  const limparFiltros = () => {
    const filtrosLimpos = {
      dataInicio: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
      dataFim: new Date(),
      tipo: "todos" as const,
      formaPagamento: "todas",
      tecnico: "todos",
      campanha: "todas",
      setor: "todos",
    };
    setFiltrosLocal(filtrosLimpos);
    setFiltros(filtrosLimpos);
  };

  // Contar filtros ativos (além das datas)
  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtrosLocal.tipo !== "todos") count++;
    if (filtrosLocal.formaPagamento !== "todas") count++;
    if (filtrosLocal.tecnico !== "todos") count++;
    if (filtrosLocal.setor !== "todos") count++;
    if (filtrosLocal.campanha !== "todas") count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();
  const isLoading = caixaLoading || entidadesLoading;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Filtro de Data estilo Google Ads */}
      <div className="max-w-sm">
        <FiltroDataCaixa />
      </div>
      
      {/* Filtros Básicos - Layout Compacto */}
      <Card className="max-w-4xl">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Filtro de Tipo - Compacto */}
            <div className="max-w-xs">
              <label className="text-sm font-medium mb-2 block">
                Tipo de Lançamento
              </label>
              <Select
                value={filtrosLocal.tipo}
                onValueChange={(value: "todos" | "receita" | "despesa") =>
                  setFiltrosLocal((prev) => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros Avançados Colapsáveis */}
            <Collapsible
              open={filtrosAvancadosAbertos}
              onOpenChange={setFiltrosAvancadosAbertos}
            >
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-10"
                  >
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
                    className="gap-1 text-muted-foreground hover:text-foreground h-10"
                  >
                    <X className="h-4 w-4" />
                    Limpar
                  </Button>
                )}
              </div>

              <CollapsibleContent className="mt-4">
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Forma de Pagamento
                      </label>
                      <Select
                        value={filtrosLocal.formaPagamento}
                        onValueChange={(value) =>
                          setFiltrosLocal((prev) => ({
                            ...prev,
                            formaPagamento: value,
                          }))
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          {formasPagamento.map((forma) => (
                            <SelectItem
                              key={forma.id}
                              value={forma.id.toString()}
                            >
                              {forma.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Técnico
                      </label>
                      <Select
                        value={filtrosLocal.tecnico}
                        onValueChange={(value) =>
                          setFiltrosLocal((prev) => ({
                            ...prev,
                            tecnico: value,
                          }))
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Setor
                      </label>
                      <Select
                        value={filtrosLocal.setor}
                        onValueChange={(value) =>
                          setFiltrosLocal((prev) => ({ ...prev, setor: value }))
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
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
                      <label className="text-sm font-medium">
                        Campanha
                      </label>
                      <Select
                        value={filtrosLocal.campanha}
                        onValueChange={(value) =>
                          setFiltrosLocal((prev) => ({
                            ...prev,
                            campanha: value,
                          }))
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          {campanhas.map((campanha) => (
                            <SelectItem
                              key={campanha.id}
                              value={campanha.id.toString()}
                            >
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

            {/* Botões de Ação - Compactos */}
            <div className="flex gap-3 max-w-md">
              <Button
                onClick={aplicarFiltros}
                size="sm"
                className="flex-1"
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
        </CardContent>
      </Card>

      {/* Status de carregamento */}
      {isLoading && (
        <div className="text-center text-sm text-muted-foreground p-4">
          Carregando dados...
        </div>
      )}
    </div>
  );
}
