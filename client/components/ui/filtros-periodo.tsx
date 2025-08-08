import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./card";
import { Calendar, Filter, RefreshCw } from "lucide-react";

interface FiltrosPeriodoProps {
  onFiltroChange: (dataInicio: Date, dataFim: Date) => void;
  titulo?: string;
  periodoInicialDias?: number; // Padrão 30 dias
  className?: string;
}

export function FiltrosPeriodo({ 
  onFiltroChange, 
  titulo = "Filtros de Período",
  periodoInicialDias = 30,
  className = "" 
}: FiltrosPeriodoProps) {
  const [dataInicio, setDataInicio] = useState(() => {
    const hoje = new Date();
    const dataInicial = new Date(hoje.getTime() - periodoInicialDias * 24 * 60 * 60 * 1000);
    return dataInicial.toISOString().split('T')[0];
  });
  
  const [dataFim, setDataFim] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Aplicar filtros automaticamente quando as datas mudarem
  useEffect(() => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    // Ajustar fim do dia para incluir o dia completo
    fim.setHours(23, 59, 59, 999);
    onFiltroChange(inicio, fim);
  }, [dataInicio, dataFim, onFiltroChange]);

  const aplicarFiltroRapido = (dias: number) => {
    const hoje = new Date();
    const inicio = new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000);
    
    setDataInicio(inicio.toISOString().split('T')[0]);
    setDataFim(hoje.toISOString().split('T')[0]);
  };

  const limparFiltros = () => {
    aplicarFiltroRapido(periodoInicialDias);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => aplicarFiltroRapido(7)}
          >
            Últimos 7 dias
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => aplicarFiltroRapido(30)}
          >
            Últimos 30 dias
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => aplicarFiltroRapido(90)}
          >
            Últimos 90 dias
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const hoje = new Date();
              const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
              setDataInicio(inicioMes.toISOString().split('T')[0]);
              setDataFim(hoje.toISOString().split('T')[0]);
            }}
          >
            Este mês
          </Button>
        </div>

        {/* Seleção manual de datas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data Início</Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataFim">Data Fim</Label>
            <Input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={limparFiltros}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Informação do período */}
        <div className="text-sm text-muted-foreground">
          Mostrando dados de {new Date(dataInicio).toLocaleDateString('pt-BR')} até {new Date(dataFim).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
}
