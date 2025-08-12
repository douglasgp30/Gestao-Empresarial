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
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Linha Principal: Tudo em uma linha compacta */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
            {/* Filtro de Data - 4 colunas */}
            <div className="lg:col-span-4">
              <FiltroDataCaixa />
            </div>
            
            {/* Filtro de Tipo - 3 colunas */}
            <div className="lg:col-span-3">
              <label className="text-xs font-medium mb-1 block text-gray-600">
                Tipo
              </label>
              <Select
                value={filtrosLocal.tipo}
                onValueChange={(value: "todos" | "receita" | "despesa") =>
                  setFiltrosLocal((prev) => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
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
                          <Badge variant="secondary" className="h-4 px-1 text-xs">
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
                disabled={isLoading}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Forma de Pagamento */}
                  <div>
                    <label className="text-xs font-medium mb-1 block text-gray-600">
                      Forma Pagamento
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
                      <SelectTrigger className="h-8 text-xs bg-white">
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
                  <div>
                    <label className="text-xs font-medium mb-1 block text-gray-600">
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
                      <SelectTrigger className="h-8 text-xs bg-white">
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
                  <div>
                    <label className="text-xs font-medium mb-1 block text-gray-600">
                      Setor
                    </label>
                    <Select
                      value={filtrosLocal.setor}
                      onValueChange={(value) =>
                        setFiltrosLocal((prev) => ({ ...prev, setor: value }))
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white">
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
                  <div>
                    <label className="text-xs font-medium mb-1 block text-gray-600">
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
                      <SelectTrigger className="h-8 text-xs bg-white">
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

                {/* Botões dos Filtros Avançados */}
                <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-200">
                  <Button
                    onClick={() => {
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
                    className="h-7 text-xs px-2"
                  >
                    Limpar
                  </Button>
                  <Button
                    onClick={aplicarFiltros}
                    size="sm"
                    className="h-7 text-xs px-3"
                    disabled={isLoading}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
