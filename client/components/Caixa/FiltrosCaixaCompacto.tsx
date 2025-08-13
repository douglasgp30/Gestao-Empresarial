import React, { useEffect, useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { useClientes } from "../../contexts/ClientesContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import FiltroDataCaixaSimples from "./FiltroDataCaixaSimples";
import { Filter, ChevronDown, X, Search } from "lucide-react";

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
    descricoes,
    cidades,
    isLoading: entidadesLoading,
  } = useEntidades();

  const { clientes, isLoading: clientesLoading } = useClientes();

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
      categoria: "todas",
      descricao: "todas",
      cliente: "todos",
      cidade: "todas",
      numeroNota: "",
    };
    setFiltrosLocal(filtrosLimpos);
    setFiltros(filtrosLimpos);
    // Fechar os filtros avançados após limpar
    setFiltrosAvancadosAbertos(false);
  };

  // Contar filtros ativos (além das datas)
  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtrosLocal.tipo !== "todos") count++;
    if (filtrosLocal.formaPagamento !== "todas") count++;
    if (filtrosLocal.tecnico !== "todos") count++;
    if (filtrosLocal.setor !== "todos") count++;
    if (filtrosLocal.campanha !== "todas") count++;
    if (filtrosLocal.categoria !== "todas") count++;
    if (filtrosLocal.descricao !== "todas") count++;
    if (filtrosLocal.cliente !== "todos") count++;
    if (filtrosLocal.cidade !== "todas") count++;
    if (filtrosLocal.numeroNota && filtrosLocal.numeroNota.trim() !== "")
      count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();
  const isLoading = caixaLoading || entidadesLoading || clientesLoading;

  // Obter categorias únicas das descrições
  const categorias = [
    ...new Set(
      descricoes
        .map((d) => d.categoria)
        .filter((categoria) => categoria && categoria.trim() !== ""),
    ),
  ].sort();

  // Filtrar descrições pela categoria selecionada
  const descricoesFiltradas =
    filtrosLocal.categoria !== "todas"
      ? descricoes.filter((d) => d.categoria === filtrosLocal.categoria)
      : descricoes;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Linha Principal: Tudo em uma linha compacta */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
            {/* Filtro de Data - 4 colunas */}
            <div className="lg:col-span-4">
              <FiltroDataCaixaSimples />
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
                <div className="space-y-4">
                  {/* Primeira linha de filtros */}
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

                    {/* Cidade */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Cidade
                      </label>
                      <Select
                        value={filtrosLocal.cidade || "todas"}
                        onValueChange={(value) =>
                          setFiltrosLocal((prev) => ({
                            ...prev,
                            cidade: value,
                          }))
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          {cidades.map((cidade) => (
                            <SelectItem key={cidade} value={cidade}>
                              {cidade}
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
                  </div>

                  {/* Segunda linha de filtros */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Conta */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Conta
                      </label>
                      <Select
                        value={filtrosLocal.conta || "todas"}
                        onValueChange={(value) =>
                          setFiltrosLocal((prev) => ({ ...prev, conta: value }))
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          <SelectItem value="empresa">Empresa</SelectItem>
                          <SelectItem value="pessoal">Pessoal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Categoria */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Categoria
                      </label>
                      <Select
                        value={filtrosLocal.categoria || "todas"}
                        onValueChange={(value) => {
                          setFiltrosLocal((prev) => ({
                            ...prev,
                            categoria: value,
                            descricao: "todas", // Limpar descrição quando categoria muda
                          }));
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Descrição
                      </label>
                      <Select
                        value={filtrosLocal.descricao || "todas"}
                        onValueChange={(value) =>
                          setFiltrosLocal((prev) => ({
                            ...prev,
                            descricao: value,
                          }))
                        }
                        disabled={
                          isLoading || filtrosLocal.categoria === "todas"
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue
                            placeholder={
                              filtrosLocal.categoria === "todas"
                                ? "Selecione categoria primeiro"
                                : "Todas"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          {descricoesFiltradas.map((descricao) => (
                            <SelectItem
                              key={descricao.id}
                              value={descricao.id.toString()}
                            >
                              {descricao.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cliente */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Cliente
                      </label>
                      <Select
                        value={filtrosLocal.cliente || "todos"}
                        onValueChange={(value) =>
                          setFiltrosLocal((prev) => ({
                            ...prev,
                            cliente: value,
                          }))
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {clientes.map((cliente) => (
                            <SelectItem
                              key={cliente.id}
                              value={cliente.id.toString()}
                            >
                              {cliente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Terceira linha - Campanha e Número da Nota */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

                    {/* Número da Nota */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Número da Nota
                      </label>
                      <Input
                        placeholder="Ex: 12345"
                        value={filtrosLocal.numeroNota || ""}
                        onChange={(e) =>
                          setFiltrosLocal((prev) => ({
                            ...prev,
                            numeroNota: e.target.value,
                          }))
                        }
                        className="h-8 text-xs bg-white"
                        disabled={isLoading}
                      />
                    </div>
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
