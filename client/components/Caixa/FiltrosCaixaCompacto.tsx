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
import { Badge } from "../ui/badge";
import { Calendar, Filter, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export function FiltrosCaixaCompacto() {
  const { 
    filtros, 
    setFiltros, 
    totais, 
    campanhas,
    isLoading: caixaLoading 
  } = useCaixa();
  
  const { 
    formasPagamento, 
    tecnicos, 
    setores, 
    isLoading: entidadesLoading 
  } = useEntidades();

  const [filtrosLocal, setFiltrosLocal] = useState(filtros);

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
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const isLoading = caixaLoading || entidadesLoading;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtrosLocal.dataInicio.toISOString().split('T')[0]}
                onChange={(e) => setFiltrosLocal(prev => ({
                  ...prev,
                  dataInicio: new Date(e.target.value)
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtrosLocal.dataFim.toISOString().split('T')[0]}
                onChange={(e) => setFiltrosLocal(prev => ({
                  ...prev,
                  dataFim: new Date(e.target.value)
                }))}
              />
            </div>
          </div>

          {/* Filtros complementares */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={filtrosLocal.tipo}
                onValueChange={(value: "todos" | "receita" | "despesa") => 
                  setFiltrosLocal(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
              <Select
                value={filtrosLocal.formaPagamento}
                onValueChange={(value) => setFiltrosLocal(prev => ({ ...prev, formaPagamento: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {formasPagamento.map((forma) => (
                    <SelectItem key={forma.id} value={forma.id.toString()}>
                      {forma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tecnico">Técnico</Label>
              <Select
                value={filtrosLocal.tecnico}
                onValueChange={(value) => setFiltrosLocal(prev => ({ ...prev, tecnico: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                      {tecnico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Select
                value={filtrosLocal.setor}
                onValueChange={(value) => setFiltrosLocal(prev => ({ ...prev, setor: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {setores.map((setor) => (
                    <SelectItem key={setor.id} value={setor.id.toString()}>
                      {setor.nome} - {setor.cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campanha */}
          <div className="space-y-2">
            <Label htmlFor="campanha">Campanha</Label>
            <Select
              value={filtrosLocal.campanha}
              onValueChange={(value) => setFiltrosLocal(prev => ({ ...prev, campanha: value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {campanhas.map((campanha) => (
                  <SelectItem key={campanha.id} value={campanha.id.toString()}>
                    {campanha.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <Button onClick={aplicarFiltros} className="flex-1">
              Aplicar Filtros
            </Button>
            <Button onClick={limparFiltros} variant="outline">
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Totais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatarMoeda(totais.receitas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatarMoeda(totais.despesas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Saldo</p>
                <p className={`text-2xl font-bold ${
                  totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatarMoeda(totais.saldo)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Comissões</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatarMoeda(totais.comissoes)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status de carregamento */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-600">
              Carregando dados...
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
