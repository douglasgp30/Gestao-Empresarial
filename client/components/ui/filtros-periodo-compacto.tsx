import React from "react";
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
}: FiltrosPeriodoCompactoProps) {
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
                  onChange={(e) => onDataInicioChange(e.target.value)}
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
                  onChange={(e) => onDataFimChange(e.target.value)}
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
              onClick={onLimpar}
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
        <div className="flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const hoje = new Date();
              const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
              onDataInicioChange(inicioMes.toISOString().split('T')[0]);
              onDataFimChange(hoje.toISOString().split('T')[0]);
              onAplicar();
            }}
            className="text-xs h-7 px-2"
          >
            Este Mês
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const hoje = new Date();
              const ultimos7 = new Date(hoje.getTime() - 6 * 24 * 60 * 60 * 1000);
              onDataInicioChange(ultimos7.toISOString().split('T')[0]);
              onDataFimChange(hoje.toISOString().split('T')[0]);
              onAplicar();
            }}
            className="text-xs h-7 px-2"
          >
            7 Dias
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const hoje = new Date();
              const ultimos30 = new Date(hoje.getTime() - 29 * 24 * 60 * 60 * 1000);
              onDataInicioChange(ultimos30.toISOString().split('T')[0]);
              onDataFimChange(hoje.toISOString().split('T')[0]);
              onAplicar();
            }}
            className="text-xs h-7 px-2"
          >
            30 Dias
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const hoje = new Date();
              const inicioSemana = new Date(hoje);
              const dia = hoje.getDay();
              const diasAtras = dia === 0 ? 6 : dia - 1;
              inicioSemana.setDate(hoje.getDate() - diasAtras);
              onDataInicioChange(inicioSemana.toISOString().split('T')[0]);
              onDataFimChange(hoje.toISOString().split('T')[0]);
              onAplicar();
            }}
            className="text-xs h-7 px-2"
          >
            Esta Semana
          </Button>
        </div>
      </div>
    </div>
  );
}
