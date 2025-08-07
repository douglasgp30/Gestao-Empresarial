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
    const hojeNorm = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
    );
    const inicioNorm = new Date(
      dataInicioDate.getFullYear(),
      dataInicioDate.getMonth(),
      dataInicioDate.getDate(),
    );
    const fimNorm = new Date(
      dataFimDate.getFullYear(),
      dataFimDate.getMonth(),
      dataFimDate.getDate(),
    );

    // Hoje
    if (
      inicioNorm.getTime() === hojeNorm.getTime() &&
      fimNorm.getTime() === hojeNorm.getTime()
    ) {
      return "hoje";
    }

    // Esta Semana (segunda-feira da semana atual até hoje)
    const inicioSemana = new Date(hoje);
    const dia = hoje.getDay();
    const diasAtras = dia === 0 ? 6 : dia - 1;
    inicioSemana.setDate(hoje.getDate() - diasAtras);
    const inicioSemanaNorm = new Date(
      inicioSemana.getFullYear(),
      inicioSemana.getMonth(),
      inicioSemana.getDate(),
    );

    if (
      inicioNorm.getTime() === inicioSemanaNorm.getTime() &&
      fimNorm.getTime() === hojeNorm.getTime()
    ) {
      return "esta-semana";
    }

    // Últimos 7 Dias (7 dias antes de hoje até hoje)
    const ultimos7 = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ultimos7Norm = new Date(
      ultimos7.getFullYear(),
      ultimos7.getMonth(),
      ultimos7.getDate(),
    );

    if (
      inicioNorm.getTime() === ultimos7Norm.getTime() &&
      fimNorm.getTime() === hojeNorm.getTime()
    ) {
      return "ultimos-7";
    }

    // Últimos 15 Dias (15 dias antes de hoje até hoje)
    const ultimos15 = new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000);
    const ultimos15Norm = new Date(
      ultimos15.getFullYear(),
      ultimos15.getMonth(),
      ultimos15.getDate(),
    );

    if (
      inicioNorm.getTime() === ultimos15Norm.getTime() &&
      fimNorm.getTime() === hojeNorm.getTime()
    ) {
      return "ultimos-15";
    }

    // Últimos 30 Dias (30 dias atrás até hoje)
    const ultimos30 = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ultimos30Norm = new Date(
      ultimos30.getFullYear(),
      ultimos30.getMonth(),
      ultimos30.getDate(),
    );

    if (
      inicioNorm.getTime() === ultimos30Norm.getTime() &&
      fimNorm.getTime() === hojeNorm.getTime()
    ) {
      return "ultimos-30";
    }

    // Este Mês (do primeiro dia do mês até o último dia)
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const inicioMesNorm = new Date(
      inicioMes.getFullYear(),
      inicioMes.getMonth(),
      inicioMes.getDate(),
    );
    const fimMesNorm = new Date(
      fimMes.getFullYear(),
      fimMes.getMonth(),
      fimMes.getDate(),
    );

    if (
      inicioNorm.getTime() === inicioMesNorm.getTime() &&
      fimNorm.getTime() === fimMesNorm.getTime()
    ) {
      return "este-mes";
    }

    return "";
  };

  // Detectar filtro ativo baseado nas datas atuais
  React.useEffect(() => {
    const filtroCalculado = determinarFiltroAtivo();
    setFiltroAtivo(filtroCalculado);
  }, [dataInicio, dataFim]);

  // Aplicar filtro inicial automaticamente na primeira renderização
  React.useEffect(() => {
    // Se não há datas definidas, aplicar padrão
    if (!dataInicio || !dataFim) {
      if (filtroInicialDashboard) {
        aplicarFiltroEsteMes();
      } else {
        aplicarFiltroHoje();
      }
    }
  }, []);

  // Remover o auto-apply para evitar loops infinitos
  // Os botões agora chamam onAplicar() diretamente

  // Detectar quando o usuário altera as datas manualmente (não por botão)
  const handleDataInicioChangeInterno = (data: string) => {
    onDataInicioChange(data);
    setFiltroAtivo(""); // Limpar filtro ativo quando alterado manualmente
  };

  const handleDataFimChangeInterno = (data: string) => {
    onDataFimChange(data);
    setFiltroAtivo(""); // Limpar filtro ativo quando alterado manualmente
  };

  // Funções auxiliares para aplicar filtros
  const aplicarFiltroHoje = () => {
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split("T")[0];

    // Aplicar mudanças imediatamente
    onDataInicioChange(dataHoje);
    onDataFimChange(dataHoje);
    setFiltroAtivo("hoje");
    onAplicar();
  };

  const aplicarFiltroEsteMes = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const dataInicioMes = inicioMes.toISOString().split("T")[0];
    const dataFimMes = fimMes.toISOString().split("T")[0];

    // Aplicar mudanças imediatamente
    onDataInicioChange(dataInicioMes);
    onDataFimChange(dataFimMes);
    setFiltroAtivo("este-mes");
    onAplicar();
  };

  const handleLimparInterno = () => {
    // Reset para "Hoje" em todos os módulos, exceto Dashboard que usa "Este Mês"
    if (filtroInicialDashboard) {
      aplicarFiltroEsteMes();
    } else {
      aplicarFiltroHoje();
    }
    if (onLimpar) {
      onLimpar();
    }
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
                  onChange={(e) =>
                    handleDataInicioChangeInterno(e.target.value)
                  }
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
            onClick={aplicarFiltroHoje}
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

              const dataInicioSemana = inicioSemana.toISOString().split("T")[0];
              const dataHoje = hoje.toISOString().split("T")[0];

              // Aplicar mudanças imediatamente
              onDataInicioChange(dataInicioSemana);
              onDataFimChange(dataHoje);
              setFiltroAtivo("esta-semana");
              onAplicar();
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
              // Últimos 7 dias = 7 dias antes de hoje até hoje
              const ultimos7 = new Date(
                hoje.getTime() - 7 * 24 * 60 * 60 * 1000,
              );
              const dataInicio7 = ultimos7.toISOString().split("T")[0];
              const dataHoje = hoje.toISOString().split("T")[0];

              // Aplicar mudanças imediatamente
              onDataInicioChange(dataInicio7);
              onDataFimChange(dataHoje);
              setFiltroAtivo("ultimos-7");
              onAplicar();
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
              // Últimos 15 dias = 15 dias antes de hoje até hoje
              const ultimos15 = new Date(
                hoje.getTime() - 15 * 24 * 60 * 60 * 1000,
              );
              const dataInicio15 = ultimos15.toISOString().split("T")[0];
              const dataHoje = hoje.toISOString().split("T")[0];

              // Aplicar mudanças imediatamente
              onDataInicioChange(dataInicio15);
              onDataFimChange(dataHoje);
              setFiltroAtivo("ultimos-15");
              onAplicar();
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
              // Para "Últimos 30 dias" - 30 dias atrás até hoje
              const ultimos30 = new Date(
                hoje.getTime() - 30 * 24 * 60 * 60 * 1000,
              );
              const dataInicio30 = ultimos30.toISOString().split("T")[0];
              const dataHoje = hoje.toISOString().split("T")[0];

              // Aplicar mudanças imediatamente
              onDataInicioChange(dataInicio30);
              onDataFimChange(dataHoje);
              setFiltroAtivo("ultimos-30");
              onAplicar();
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
            onClick={aplicarFiltroEsteMes}
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
