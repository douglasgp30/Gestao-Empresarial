import React, { useEffect, useState } from "react";
import { useRelatorios } from "../../contexts/RelatoriosContext";
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
import FiltroDataRelatorios from "./FiltroDataRelatorios";
import {
  Filter,
  ChevronDown,
  X,
  FileText,
  Download,
  Printer,
} from "lucide-react";

export default function FiltrosRelatoriosCompacto() {
  const { filtros, setFiltros, isLoading, exportarPDF, exportarExcel } = useRelatorios();
  const { setores, tecnicos, campanhas, formasPagamento, isLoading: entidadesLoading } = useEntidades();
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
  const isLoadingGeral = isLoading || entidadesLoading;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Filtro de Data estilo Google Ads */}
      <div className="max-w-sm">
        <FiltroDataRelatorios />
      </div>

      {/* Ações de Relatório */}
      <div className="bg-background border rounded-lg p-4 max-w-4xl">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Ações de Relatório:
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportarPDF("financeiro", {})}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportarExcel("financeiro", {})}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros Básicos - Layout Compacto */}
      <div className="bg-background border rounded-lg p-4 max-w-4xl">
        <div className="space-y-4">
          {/* Filtro de Tipo - Compacto */}
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">
              Tipo de Movimento
            </label>
            <Select
              value={filtrosLocal.tipo || "ambos"}
              onValueChange={(value: "receitas" | "despesas" | "ambos") =>
                setFiltrosLocal((prev) => ({ ...prev, tipo: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ambos">Todos os Tipos</SelectItem>
                <SelectItem value="receitas">Apenas Receitas</SelectItem>
                <SelectItem value="despesas">Apenas Despesas</SelectItem>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Forma de Pagamento</label>
                    <Select
                      value={filtrosLocal.formaPagamento || ""}
                      onValueChange={(value) =>
                        setFiltrosLocal((prev) => ({ ...prev, formaPagamento: value }))
                      }
                      disabled={isLoadingGeral}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas</SelectItem>
                        {formasPagamento.map((forma) => (
                          <SelectItem key={forma.id} value={forma.id.toString()}>
                            {forma.nome}
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
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        {tecnicos.map((tecnico) => (
                          <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                            {tecnico.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        {setores.map((setor) => (
                          <SelectItem key={setor.id} value={setor.id.toString()}>
                            {setor.nome} - {setor.cidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Campanha</label>
                    <Select
                      value={filtrosLocal.campanha || ""}
                      onValueChange={(value) =>
                        setFiltrosLocal((prev) => ({ ...prev, campanha: value }))
                      }
                      disabled={isLoadingGeral}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas</SelectItem>
                        {campanhas.map((campanha) => (
                          <SelectItem key={campanha.id} value={campanha.id.toString()}>
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
