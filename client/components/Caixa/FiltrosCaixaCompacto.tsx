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
  CardHeader,
  CardTitle,
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
  RefreshCw,
  Search,
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
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5" />
          Filtros de Busca
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Linha 1: Filtros Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          {/* Filtro de Data */}
          <div className="lg:col-span-1">
            <FiltroDataCaixa />
          </div>
          
          {/* Filtro de Tipo */}
          <div>
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
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button
              onClick={aplicarFiltros}
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Aplicando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Aplicar
                </>
              )}
            </Button>
            <Button
              onClick={limparFiltros}
              variant="outline"
              size="sm"
              className="px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-200" />

        {/* Linha 2: Filtros Avançados */}
        <Collapsible
          open={filtrosAvancadosAbertos}
          onOpenChange={setFiltrosAvancadosAbertos}
        >
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 h-auto p-2 text-muted-foreground hover:text-foreground"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">
                  Filtros Avançados
                  {filtrosAtivos > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                      {filtrosAtivos}
                    </Badge>
                  )}
                </span>
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
                className="gap-1 text-muted-foreground hover:text-foreground text-xs"
              >
                <X className="h-3 w-3" />
                Limpar filtros avançados
              </Button>
            )}
          </div>

          <CollapsibleContent className="mt-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Forma de Pagamento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
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
                    <SelectTrigger className="bg-white">
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

                {/* Técnico */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Técnico Responsável
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
                    <SelectTrigger className="bg-white">
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

                {/* Setor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Setor / Cidade
                  </label>
                  <Select
                    value={filtrosLocal.setor}
                    onValueChange={(value) =>
                      setFiltrosLocal((prev) => ({ ...prev, setor: value }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white">
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

                {/* Campanha */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
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
                    <SelectTrigger className="bg-white">
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

              {/* Botões de Ação dos Filtros Avançados */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    // Limpar apenas filtros avançados, manter data e tipo
                    setFiltrosLocal((prev) => ({
                      ...prev,
                      formaPagamento: "todas",
                      tecnico: "todos",
                      campanha: "todas",
                      setor: "todos",
                    }));
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Limpar Avançados
                </Button>
                <Button
                  onClick={aplicarFiltros}
                  size="sm"
                  className="text-xs"
                  disabled={isLoading}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Status de Filtros Ativos */}
        {(filtrosAtivos > 0 || filtrosLocal.tipo !== "todos") && (
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3" />
              <span>
                {filtrosAtivos + (filtrosLocal.tipo !== "todos" ? 1 : 0)} filtro(s) ativo(s)
              </span>
            </div>
            <Button
              onClick={limparFiltros}
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs hover:bg-blue-100"
            >
              Limpar todos
            </Button>
          </div>
        )}

        {/* Status de carregamento */}
        {isLoading && (
          <div className="text-center text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
            Carregando dados...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
