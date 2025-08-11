import React, { useEffect, useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Badge } from "../ui/badge";
import {
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronDown,
  X,
} from "lucide-react";

export function FiltrosCaixaCompacto() {
  const {
    filtros,
    setFiltros,
    totais,
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

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
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
    <div className="space-y-3 sm:space-y-4">
      {/* Filtros Básicos */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          {/* Período e Tipo - Sempre visíveis */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio" className="text-sm font-medium">
                  Data Início
                </Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={filtrosLocal.dataInicio.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFiltrosLocal((prev) => ({
                      ...prev,
                      dataInicio: new Date(e.target.value),
                    }))
                  }
                  className="h-10 sm:h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim" className="text-sm font-medium">
                  Data Fim
                </Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={filtrosLocal.dataFim.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFiltrosLocal((prev) => ({
                      ...prev,
                      dataFim: new Date(e.target.value),
                    }))
                  }
                  className="h-10 sm:h-9"
                />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="tipo" className="text-sm font-medium">
                  Tipo
                </Label>
                <Select
                  value={filtrosLocal.tipo}
                  onValueChange={(value: "todos" | "receita" | "despesa") =>
                    setFiltrosLocal((prev) => ({ ...prev, tipo: value }))
                  }
                >
                  <SelectTrigger className="h-10 sm:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="receita">Receitas</SelectItem>
                    <SelectItem value="despesa">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros Avançados Colapsáveis */}
            <Collapsible
              open={filtrosAvancadosAbertos}
              onOpenChange={setFiltrosAvancadosAbertos}
            >
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-10 text-sm">
                    <Filter className="h-4 w-4" />
                    <span className="hidden xs:inline">Filtros Avançados</span>
                    <span className="xs:hidden">Filtros</span>
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
                    className="gap-1 text-muted-foreground hover:text-foreground h-10 px-3"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden xs:inline">Limpar</span>
                  </Button>
                )}
              </div>

              <CollapsibleContent className="mt-3">
                <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="formaPagamento" className="text-sm font-medium">
                        Forma de Pagamento
                      </Label>
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
                        <SelectTrigger className="h-10 sm:h-9">
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

                    <div className="space-y-1">
                      <Label htmlFor="tecnico" className="text-xs">
                        Técnico
                      </Label>
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
                        <SelectTrigger className="h-8">
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

                    <div className="space-y-1">
                      <Label htmlFor="setor" className="text-xs">
                        Setor
                      </Label>
                      <Select
                        value={filtrosLocal.setor}
                        onValueChange={(value) =>
                          setFiltrosLocal((prev) => ({ ...prev, setor: value }))
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8">
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

                    <div className="space-y-1 md:col-span-2 lg:col-span-3">
                      <Label htmlFor="campanha" className="text-xs">
                        Campanha
                      </Label>
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
                        <SelectTrigger className="h-8">
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

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button onClick={aplicarFiltros} size="sm" className="flex-1 h-10 text-sm">
                Aplicar Filtros
              </Button>
              <Button onClick={limparFiltros} variant="outline" size="sm" className="h-10 text-sm sm:w-auto">
                Limpar Tudo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totais - Mais compactos */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Receitas</p>
                <p className="text-lg font-bold text-green-600">
                  {formatarMoeda(totais.receitas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Despesas</p>
                <p className="text-lg font-bold text-red-600">
                  {formatarMoeda(totais.despesas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 ${totais.saldo >= 0 ? "border-l-blue-500" : "border-l-red-500"}`}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p
                  className={`text-lg font-bold ${
                    totais.saldo >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {formatarMoeda(totais.saldo)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Comissões</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatarMoeda(totais.comissoes)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status de carregamento */}
      {isLoading && (
        <div className="text-center text-sm text-muted-foreground p-4">
          Carregando dados...
        </div>
      )}
    </div>
  );
}
