import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { Filter, ChevronDown, X, Search, RefreshCw } from "lucide-react";
import { toast } from "../ui/use-toast";

export function FiltrosCaixaCompacto() {
  const {
    filtros,
    setFiltros,
    campanhas,
    isLoading: caixaLoading,
  } = useCaixa();

  const {
    formasPagamento,
    getTecnicos,
    setores,
    descricoes,
    cidades,
    isLoading: entidadesLoading,
  } = useEntidades();

  // Obter técnicos usando a mesma função do formulário
  const tecnicos = getTecnicos();

  const { clientes, isLoading: clientesLoading } = useClientes();

  // Debug dos dados carregados
  useEffect(() => {
    console.log("🔍 [FiltrosCaixaCompacto] Debug dos dados:");
    console.log("  - Campanhas:", campanhas?.length || 0, campanhas);
    console.log("  - Formas Pagamento:", formasPagamento?.length || 0, formasPagamento);
    console.log("  - Técnicos:", tecnicos?.length || 0, tecnicos);
    console.log("  - Clientes:", clientes?.length || 0, clientes);
  }, [campanhas, formasPagamento, tecnicos, clientes]);

  // Função para forçar recarregamento dos dados
  const recarregarDados = useCallback(() => {
    console.log("🔄 [FiltrosCaixaCompacto] Forçando recarregamento dos dados...");
    window.location.reload();
  }, []);

  const [filtrosLocal, setFiltrosLocal] = useState(filtros);
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false);

  // Atualizar filtros locais quando os filtros do contexto mudarem
  useEffect(() => {
    setFiltrosLocal(filtros);
  }, [filtros]);

  const aplicarFiltros = useCallback(() => {
    console.log("���� [FiltrosCaixaCompacto] Aplicando filtros:", filtrosLocal);

    // Normalizar filtros - transformar "todos"/"todas" para undefined
    const filtrosNormalizados = { ...filtrosLocal };
    Object.keys(filtrosNormalizados).forEach((key) => {
      const value =
        filtrosNormalizados[key as keyof typeof filtrosNormalizados];
      if (
        typeof value === "string" &&
        (value === "todos" || value === "todas")
      ) {
        filtrosNormalizados[key as keyof typeof filtrosNormalizados] =
          undefined as any;
      }
    });

    setFiltros(filtrosNormalizados);
    toast({
      title: "Filtros aplicados",
      description: "Os filtros foram aplicados com sucesso",
    });
  }, [filtrosLocal, setFiltros]);

  // Handlers específicos memoizados para evitar re-renders
  const handleFormaPagamentoChange = useCallback((value: string) => {
    setFiltrosLocal((prev) => ({ ...prev, formaPagamento: value }));
  }, []);

  const handleTecnicoChange = useCallback((value: string) => {
    setFiltrosLocal((prev) => ({ ...prev, tecnico: value }));
  }, []);

  const handleCidadeChange = useCallback((value: string) => {
    setFiltrosLocal((prev) => ({ ...prev, cidade: value }));
  }, []);

  const handleSetorChange = useCallback((value: string) => {
    setFiltrosLocal((prev) => ({ ...prev, setor: value }));
  }, []);

  const handleCategoriaChange = useCallback((value: string) => {
    setFiltrosLocal((prev) => ({
      ...prev,
      categoria: value,
      descricao: "todas", // Limpar descrição quando categoria muda
    }));
  }, []);

  const handleDescricaoChange = useCallback((value: string) => {
    setFiltrosLocal((prev) => ({ ...prev, descricao: value }));
  }, []);

  const handleClienteChange = useCallback((value: string) => {
    setFiltrosLocal((prev) => ({ ...prev, cliente: value }));
  }, []);

  const handleCampanhaChange = useCallback((value: string) => {
    setFiltrosLocal((prev) => ({ ...prev, campanha: value }));
  }, []);

  const handleNumeroNotaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltrosLocal((prev) => ({ ...prev, numeroNota: e.target.value }));
  }, []);

  // Handler genérico para casos especiais
  const handleFieldChange = useCallback(
    (field: string) => (value: any) => {
      setFiltrosLocal((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const limparFiltros = useCallback(() => {
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
  }, [setFiltros]);

  // Contar filtros ativos (além das datas) - memoizado
  const filtrosAtivos = useMemo(() => {
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
  }, [filtrosLocal]);

  const isLoading = useMemo(
    () => caixaLoading || entidadesLoading || clientesLoading,
    [caixaLoading, entidadesLoading, clientesLoading],
  );

  // Obter categorias únicas das descrições - memoizado
  const categorias = useMemo(
    () =>
      [
        ...new Set(
          descricoes
            .map((d) => d.categoria)
            .filter((categoria) => categoria && categoria.trim() !== ""),
        ),
      ].sort(),
    [descricoes],
  );

  // Filtrar descrições pela categoria selecionada - memoizado
  const descricoesFiltradas = useMemo(
    () =>
      filtrosLocal.categoria !== "todas"
        ? descricoes.filter((d) => d.categoria === filtrosLocal.categoria)
        : descricoes,
    [descricoes, filtrosLocal.categoria],
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-3">
        <div className="space-y-3">
          <Collapsible
            open={filtrosAvancadosAbertos}
            onOpenChange={setFiltrosAvancadosAbertos}
          >
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
                  onValueChange={handleFieldChange("tipo")}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos" />
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
                  title="Limpar filtros"
                >
                  <X className="h-3 w-3" />
                </Button>
                {/* DEBUG: Botão para recarregar dados */}
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    onClick={recarregarDados}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Recarregar dados (DEBUG)"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filtros Avançados Colapsáveis */}
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
                        onValueChange={handleFormaPagamentoChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          {(Array.isArray(formasPagamento) ? formasPagamento : []).map((forma) => (
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
                        onValueChange={handleTecnicoChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {(Array.isArray(tecnicos) ? tecnicos : []).map(
                            (tecnico) => (
                              <SelectItem
                                key={tecnico.id}
                                value={tecnico.id.toString()}
                              >
                                {tecnico.nome}
                              </SelectItem>
                            ),
                          )}
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
                        onValueChange={handleCidadeChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          {(Array.isArray(cidades) ? cidades : []).map(
                            (cidade) => (
                              <SelectItem key={cidade} value={cidade}>
                                {cidade}
                              </SelectItem>
                            ),
                          )}
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
                        onValueChange={handleSetorChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {(Array.isArray(setores) ? setores : []).map(
                            (setor) => (
                              <SelectItem
                                key={setor.id}
                                value={setor.id.toString()}
                              >
                                {setor.nome} -{" "}
                                {typeof setor.cidade === "object"
                                  ? setor.cidade?.nome
                                  : setor.cidade}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Segunda linha de filtros */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Categoria */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Categoria
                      </label>
                      <Select
                        value={filtrosLocal.categoria || "todas"}
                        onValueChange={handleCategoriaChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue placeholder="Todas" />
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
                        onValueChange={handleDescricaoChange}
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
                        onValueChange={handleClienteChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {(Array.isArray(clientes) ? clientes : []).map((cliente) => (
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
                        onValueChange={handleCampanhaChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          {(Array.isArray(campanhas) ? campanhas : []).map(
                            (campanha) => (
                              <SelectItem
                                key={campanha.id}
                                value={campanha.id.toString()}
                              >
                                {campanha.nome}
                              </SelectItem>
                            ),
                          )}
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
                        onChange={handleNumeroNotaChange}
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
