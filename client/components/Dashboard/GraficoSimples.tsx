import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { formatarMoeda } from "../../contexts/CaixaContext";

interface DadosGrafico {
  receitas: number;
  despesas: number;
  saldo: number;
}

interface GraficoSimplesProps {
  dados: DadosGrafico;
  className?: string;
}

export default function GraficoSimples({ dados, className }: GraficoSimplesProps) {
  const { receitas, despesas, saldo, meta } = dados;
  
  // Calcular percentuais para as barras
  const total = receitas + despesas;
  const percentualReceitas = total > 0 ? (receitas / total) * 100 : 0;
  const percentualDespesas = total > 0 ? (despesas / total) * 100 : 0;
  
  // Calcular progresso da meta se existir
  const progressoMeta = meta && meta > 0 ? Math.min((receitas / meta) * 100, 100) : 0;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Resumo Financeiro
        </CardTitle>
        <CardDescription className="text-sm">
          Visão gráfica do período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comparação Receitas vs Despesas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 font-medium">Receitas</span>
            <span className="text-green-600 font-medium">{formatarMoeda(receitas)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${percentualReceitas}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-red-600 font-medium">Despesas</span>
            <span className="text-red-600 font-medium">{formatarMoeda(despesas)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-300"
              style={{ width: `${percentualDespesas}%` }}
            />
          </div>
        </div>

        {/* Saldo */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {saldo >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium text-sm">Saldo</span>
            </div>
            <span className={`font-bold ${
              saldo >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatarMoeda(saldo)}
            </span>
          </div>
        </div>

        {/* Meta do Mês (se disponível) */}
        {meta && meta > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Meta do Mês</span>
              <span className="text-muted-foreground">
                {formatarMoeda(receitas)} / {formatarMoeda(meta)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  progressoMeta >= 100 ? 'bg-green-500' : 
                  progressoMeta >= 75 ? 'bg-blue-500' :
                  progressoMeta >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ width: `${progressoMeta}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">
                {progressoMeta.toFixed(1)}% da meta
              </span>
              <span className={`font-medium ${
                progressoMeta >= 100 ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                {progressoMeta >= 100 ? '✓ Meta atingida!' : 
                 `Faltam ${formatarMoeda(meta - receitas)}`}
              </span>
            </div>
          </div>
        )}

        {/* Mini insights */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium text-green-600">
                {percentualReceitas.toFixed(1)}%
              </div>
              <div className="text-muted-foreground">Receitas</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium text-red-600">
                {percentualDespesas.toFixed(1)}%
              </div>
              <div className="text-muted-foreground">Despesas</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
