import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Check, Calendar, RefreshCw } from "lucide-react";

interface FiltrosPeriodoCompactoProps {
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (data: string) => void;
  onDataFimChange: (data: string) => void;
  onAplicar: () => void;
  onLimpar?: () => void;
  isLoading?: boolean;
  className?: string;
  filtroInicialDashboard?: boolean; // Para definir filtro inicial diferente no Dashboard
}

export default function FiltrosPeriodoCompacto({
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
  onAplicar,
  onLimpar,
  isLoading = false,
  className = "",
  filtroInicialDashboard = false,
}: FiltrosPeriodoCompactoProps) {
  const [filtroAtivo, setFiltroAtivo] = useState<string>("");

  // Determinar qual filtro está ativo com base nas datas
  const determinarFiltroAtivo = () => {
    const hoje = new Date();
    const dataInicioDate = new Date(dataInicio);
    const dataFimDate = new Date(dataFim);

    // Normalizar datas para comparação (apenas ano, mês, dia)
    const hojeNorm = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const inicioNorm = new Date(dataInicioDate.getFullYear(), dataInicioDate.getMonth(), dataInicioDate.getDate());
    const fimNorm = new Date(dataFimDate.getFullYear(), dataFimDate.getMonth(), dataFimDate.getDate());

    // Hoje
    if (inicioNorm.getTime() === hojeNorm.getTime() && fimNorm.getTime() === hojeNorm.getTime()) {
      return "hoje";
    }

    // Esta Semana
    const inicioSemana = new Date(hoje);
    const dia = hoje.getDay();
    const diasAtras = dia === 0 ? 6 : dia - 1;
    inicioSemana.setDate(hoje.getDate() - diasAtras);
    const inicioSemanaNorm = new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate());

    // Fim da semana (domingo)
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    const fimSemanaNorm = new Date(fimSemana.getFullYear(), fimSemana.getMonth(), fimSemana.getDate());

    // Se ainda estamos na semana atual, usar até hoje, senão usar até domingo
    const dataFimSemana = fimSemana <= hoje ? fimSemanaNorm : hojeNorm;

    if (inicioNorm.getTime() === inicioSemanaNorm.getTime() && fimNorm.getTime() === dataFimSemana.getTime()) {
      return "esta-semana";
    }

    // Últimos 7 Dias
    const ultimos7 = new Date(hoje.getTime() - 6 * 24 * 60 * 60 * 1000);
    const ultimos7Norm = new Date(ultimos7.getFullYear(), ultimos7.getMonth(), ultimos7.getDate());

    if (inicioNorm.getTime() === ultimos7Norm.getTime() && fimNorm.getTime() === hojeNorm.getTime()) {
      return "ultimos-7";
    }

    // Últimos 15 Dias
    const ultimos15 = new Date(hoje.getTime() - 14 * 24 * 60 * 60 * 1000);
    const ultimos15Norm = new Date(ultimos15.getFullYear(), ultimos15.getMonth(), ultimos15.getDate());

    if (inicioNorm.getTime() === ultimos15Norm.getTime() && fimNorm.getTime() === hojeNorm.getTime()) {
      return "ultimos-15";
    }

    // Últimos 30 Dias
    const ultimos30 = new Date(hoje.getTime() - 29 * 24 * 60 * 60 * 1000);
    const ultimos30Norm = new Date(ultimos30.getFullYear(), ultimos30.getMonth(), ultimos30.getDate());

    if (inicioNorm.getTime() === ultimos30Norm.getTime() && fimNorm.getTime() === hojeNorm.getTime()) {
      return "ultimos-30";
    }

    // Este Mês
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const inicioMesNorm = new Date(inicioMes.getFullYear(), inicioMes.getMonth(), inicioMes.getDate());
    const fimMesNorm = new Date(fimMes.getFullYear(), fimMes.getMonth(), fimMes.getDate());

    if (inicioNorm.getTime() === inicioMesNorm.getTime() && fimNorm.getTime() === fimMesNorm.getTime()) {
      return "este-mes";
    }

    return "";
  };

  React.useEffect(() => {
    const filtroCalculado = determinarFiltroAtivo();
    setFiltroAtivo(filtroCalculado);
  }, [dataInicio, dataFim]);

  // Inicializar com filtro correto na primeira renderização
  React.useEffect(() => {
    const filtroInicial = determinarFiltroAtivo();
    if (!filtroInicial) {
      // Se não há filtro ativo, definir padrão
      if (filtroInicialDashboard) {
        setFiltroAtivo("este-mes");
      } else {
        setFiltroAtivo("hoje");
      }
    }
  }, []);

  // Remover o auto-apply para evitar loops infinitos
  // Os botões agora chamam onAplicar() diretamente

  // Detectar quando o usuário altera as datas manualmente (não por botão)
  const handleDataInicioChangeInterno = (data: string) => {
    onDataInicioChange(data);
    // Limpar filtro ativo temporariamente para detectar mudança manual
    setTimeout(() => {
      const novoFiltro = determinarFiltroAtivo();
      setFiltroAtivo(novoFiltro);
    }, 100);
  };

  const handleDataFimChangeInterno = (data: string) => {
    onDataFimChange(data);
    // Limpar filtro ativo temporariamente para detectar mudança manual
    setTimeout(() => {
      const novoFiltro = determinarFiltroAtivo();
      setFiltroAtivo(novoFiltro);
    }, 100);
  };

  const handleLimparInterno = () => {
    // Reset para "Hoje" em todos os módulos, exceto Dashboard que usa "Este Mês"
    const hoje = new Date();
    if (filtroInicialDashboard) {
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      onDataInicioChange(inicioMes.toISOString().split('T')[0]);
      onDataFimChange(fimMes.toISOString().split('T')[0]);
      setFiltroAtivo("este-mes");
    } else {
      onDataInicioChange(hoje.toISOString().split('T')[0]);
      onDataFimChange(hoje.toISOString().split('T')[0]);
      setFiltroAtivo("hoje");
    }
    if (onLimpar) {
      onLimpar();
    }
    onAplicar();
  };

  return (
    <div className={`bg-muted/30 rounded-lg p-3 border ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        {/* Período */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="dataInicio" className="text-xs font-medium">
                Data Inicial
              </Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => handleDataInicioChangeInterno(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="dataFim" className="text-xs font-medium">
                Data Final
              </Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => handleDataFimChangeInterno(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2 sm:flex-shrink-0">
          <Button
            onClick={onAplicar}
            disabled={isLoading}
            size="sm"
            className="flex-1 sm:flex-none gap-1"
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">Aplicar</span>
          </Button>
          
          {onLimpar && (
            <Button
              onClick={handleLimparInterno}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline ml-1">Limpar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filtros Rápidos - Mobile/Desktop */}
      <div className="mt-2 pt-2 border-t border-muted">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {/* 1. Hoje */}
          <Button
            variant={filtroAtivo === "hoje" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              const hoje = new Date();
              onDataInicioChange(hoje.toISOString().split('T')[0]);
              onDataFimChange(hoje.toISOString().split('T')[0]);
              onAplicar();
              setFiltroAtivo("hoje");
            }}
            className={`text-xs h-7 px-2 sm:px-3 transition-all duration-200 ${
              filtroAtivo === "hoje"
                ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20 scale-105"
                : "hover:bg-muted hover:scale-105"
            }`}
          >
            Hoje
          </Button>

          {/* 2. Esta Semana (iniciando na segunda-feira) */}
          <Button
            variant={filtroAtivo === "esta-semana" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              const hoje = new Date();
              const inicioSemana = new Date(hoje);
              const dia = hoje.getDay();
              const diasAtras = dia === 0 ? 6 : dia - 1; // Segunda-feira como início
              inicioSemana.setDate(hoje.getDate() - diasAtras);

              // Fim da semana (domingo)
              const fimSemana = new Date(inicioSemana);
              fimSemana.setDate(inicioSemana.getDate() + 6);

              // Se ainda estamos na semana atual, usar até hoje, senão usar até domingo
              const dataFim = fimSemana <= hoje ? fimSemana : hoje;

              onDataInicioChange(inicioSemana.toISOString().split('T')[0]);
              onDataFimChange(dataFim.toISOString().split('T')[0]);
              onAplicar();
              setFiltroAtivo("esta-semana");
            }}
            className={`text-xs h-7 px-2 sm:px-3 transition-all duration-200 ${
              filtroAtivo === "esta-semana"
                ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20 scale-105"
                : "hover:bg-muted hover:scale-105"
            }`}
          >
            Esta Semana
          </Button>

          {/* 3. Últimos 7 Dias */}
          <Button
            variant={filtroAtivo === "ultimos-7" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              const hoje = new Date();
              const ultimos7 = new Date(hoje.getTime() - 6 * 24 * 60 * 60 * 1000);
              onDataInicioChange(ultimos7.toISOString().split('T')[0]);
              onDataFimChange(hoje.toISOString().split('T')[0]);
              onAplicar();
              setFiltroAtivo("ultimos-7");
            }}
            className={`text-xs h-7 px-2 sm:px-3 transition-all duration-200 ${
              filtroAtivo === "ultimos-7"
                ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20 scale-105"
                : "hover:bg-muted hover:scale-105"
            }`}
          >
            Últimos 7 Dias
          </Button>

          {/* 4. Últimos 15 Dias */}
          <Button
            variant={filtroAtivo === "ultimos-15" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              const hoje = new Date();
              const ultimos15 = new Date(hoje.getTime() - 14 * 24 * 60 * 60 * 1000);
              onDataInicioChange(ultimos15.toISOString().split('T')[0]);
              onDataFimChange(hoje.toISOString().split('T')[0]);
              onAplicar();
              setFiltroAtivo("ultimos-15");
            }}
            className={`text-xs h-7 px-2 sm:px-3 transition-all duration-200 ${
              filtroAtivo === "ultimos-15"
                ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20 scale-105"
                : "hover:bg-muted hover:scale-105"
            }`}
          >
            Últimos 15 Dias
          </Button>

          {/* 5. Últimos 30 Dias */}
          <Button
            variant={filtroAtivo === "ultimos-30" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              const hoje = new Date();
              const ultimos30 = new Date(hoje.getTime() - 29 * 24 * 60 * 60 * 1000);
              onDataInicioChange(ultimos30.toISOString().split('T')[0]);
              onDataFimChange(hoje.toISOString().split('T')[0]);
              onAplicar();
              setFiltroAtivo("ultimos-30");
            }}
            className={`text-xs h-7 px-2 sm:px-3 transition-all duration-200 ${
              filtroAtivo === "ultimos-30"
                ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20 scale-105"
                : "hover:bg-muted hover:scale-105"
            }`}
          >
            Últimos 30 Dias
          </Button>

          {/* 6. Este Mês (início e fim do mês atual) */}
          <Button
            variant={filtroAtivo === "este-mes" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              const hoje = new Date();
              const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
              const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
              onDataInicioChange(inicioMes.toISOString().split('T')[0]);
              onDataFimChange(fimMes.toISOString().split('T')[0]);
              onAplicar();
              setFiltroAtivo("este-mes");
            }}
            className={`text-xs h-7 px-2 sm:px-3 transition-all duration-200 ${
              filtroAtivo === "este-mes"
                ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20 scale-105"
                : "hover:bg-muted hover:scale-105"
            }`}
          >
            Este Mês
          </Button>
        </div>
      </div>
    </div>
  );
}
