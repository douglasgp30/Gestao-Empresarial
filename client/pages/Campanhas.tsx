import React, { useState, useEffect, useCallback } from "react";
import { useCaixa } from "../contexts/CaixaContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { FiltrosPeriodo } from "../components/ui/filtros-periodo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Link } from 'react-router-dom';
import { 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowRight,
  Zap,
  BarChart3,
  Megaphone,
  Eye
} from "lucide-react";

export default function Campanhas() {
  const { campanhas, lancamentos } = useCaixa();
  const [campanhasFiltradas, setCampanhasFiltradas] = useState(campanhas);
  const [filtrosPeriodo, setFiltrosPeriodo] = useState({
    dataInicio: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000),
    dataFim: new Date(),
  });

  // Aplicar filtros quando mudarem
  useEffect(() => {
    const campanhasResultado = campanhas.filter((campanha) => {
      // Filtro por período (data de criação da campanha)
      const dataCriacao = new Date(campanha.dataCriacao || campanha.dataInicio);
      const dentroDataInicio = dataCriacao >= filtrosPeriodo.dataInicio;
      const dentroDataFim = dataCriacao <= filtrosPeriodo.dataFim;

      return dentroDataInicio && dentroDataFim;
    });

    setCampanhasFiltradas(campanhasResultado);
  }, [campanhas, filtrosPeriodo]);

  const handleFiltrosPeriodoChange = useCallback((dataInicio: Date, dataFim: Date) => {
    setFiltrosPeriodo({ dataInicio, dataFim });
  }, []);

  // Calcular estatísticas das campanhas no período
  const calcularEstatisticasCampanhas = () => {
    const lancamentosPeriodo = lancamentos.filter(lancamento => {
      const dataLancamento = new Date(lancamento.data);
      return dataLancamento >= filtrosPeriodo.dataInicio && 
             dataLancamento <= filtrosPeriodo.dataFim;
    });

    const totalReceitas = lancamentosPeriodo
      .filter(l => l.tipo === 'receita' && l.campanha)
      .reduce((total, l) => total + (l.valorLiquido || l.valor), 0);

    const totalLancamentos = lancamentosPeriodo.filter(l => l.campanha).length;

    return {
      totalReceitas,
      totalLancamentos,
      campanhasAtivas: campanhasFiltradas.length,
      totalCampanhas: campanhasFiltradas.length
    };
  };

  const estatisticas = calcularEstatisticasCampanhas();

  // Calcular estatísticas por campanha
  const obterEstatisticasCampanha = (campanhaId: string) => {
    const lancamentosCampanha = lancamentos.filter(l => 
      l.campanha === campanhaId &&
      new Date(l.data) >= filtrosPeriodo.dataInicio &&
      new Date(l.data) <= filtrosPeriodo.dataFim
    );

    const receitas = lancamentosCampanha
      .filter(l => l.tipo === 'receita')
      .reduce((total, l) => total + (l.valorLiquido || l.valor), 0);

    return {
      totalLancamentos: lancamentosCampanha.length,
      totalReceitas: receitas,
    };
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            Campanhas
          </h1>
          <p className="text-muted-foreground">
            Gerencie campanhas de marketing e analise sua performance
          </p>
        </div>
        <Link to="/caixa">
          <Button>
            <DollarSign className="h-4 w-4 mr-2" />
            Criar Campanha no Caixa
          </Button>
        </Link>
      </div>

      {/* Filtros de Período */}
      <FiltrosPeriodo 
        onFiltroChange={handleFiltrosPeriodoChange}
        titulo="Filtrar Campanhas por Período"
        periodoInicialDias={90}
      />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-blue-600">{estatisticas.campanhasAtivas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Receita de Campanhas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatarMoeda(estatisticas.totalReceitas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Lançamentos</p>
                <p className="text-2xl font-bold text-purple-600">{estatisticas.totalLancamentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Total Campanhas</p>
                <p className="text-2xl font-bold text-orange-600">{estatisticas.totalCampanhas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Campanhas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Campanhas no Período
          </CardTitle>
          <CardDescription>
            {campanhasFiltradas.length} campanha(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campanhasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma campanha encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                Não há campanhas cadastradas no período selecionado.
              </p>
              <Link to="/caixa">
                <Button>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Fim</TableHead>
                    <TableHead>Lançamentos</TableHead>
                    <TableHead>Receitas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campanhasFiltradas.map((campanha) => {
                    const stats = obterEstatisticasCampanha(campanha.id.toString());
                    return (
                      <TableRow key={campanha.id}>
                        <TableCell className="font-medium">
                          {campanha.nome}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={campanha.ativa ? "default" : "secondary"}
                            className={campanha.ativa ? "bg-green-100 text-green-700" : ""}
                          >
                            {campanha.ativa ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campanha.dataInicio ? formatarData(campanha.dataInicio) : "-"}
                        </TableCell>
                        <TableCell>
                          {campanha.dataFim ? formatarData(campanha.dataFim) : "-"}
                        </TableCell>
                        <TableCell>
                          {stats.totalLancamentos}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatarMoeda(stats.totalReceitas)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informação sobre integração */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-700">
            <div className="flex items-start space-x-2">
              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>As campanhas são criadas durante o lançamento de receitas no módulo Caixa</span>
            </div>
            <div className="flex items-start space-x-2">
              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Cada serviço pode ser vinculado a uma campanha para tracking de performance</span>
            </div>
            <div className="flex items-start space-x-2">
              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Relatórios detalhados de ROI e conversões ficam disponíveis no módulo Relatórios</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
