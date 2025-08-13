import React from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { Card, CardContent } from "../ui/card";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, FileText } from "lucide-react";

export function TotaisCaixa() {
  const { totais } = useCaixa();

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  return (
    <div className="flex flex-wrap gap-2 lg:gap-3 justify-center lg:justify-end">
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        <TrendingUp className="h-4 w-4 text-emerald-600" />
        <div className="text-center">
          <p className="text-xs text-emerald-700/70 font-medium">Rec. Bruta</p>
          <p className="text-sm font-bold text-emerald-700">
            {formatarMoeda(totais.receitaBruta || totais.receitas)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <CreditCard className="h-4 w-4 text-green-600" />
        <div className="text-center">
          <p className="text-xs text-green-700/70 font-medium">Rec. Líquida</p>
          <p className="text-sm font-bold text-green-700">
            {formatarMoeda(totais.receitaLiquida || totais.receitas)}
          </p>
        </div>
      </div>


      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        <TrendingDown className="h-4 w-4 text-red-600" />
        <div className="text-center">
          <p className="text-xs text-red-700/70 font-medium">Despesas</p>
          <p className="text-sm font-bold text-red-700">
            {formatarMoeda(totais.despesas)}
          </p>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
          totais.saldo >= 0
            ? "bg-blue-50 border-blue-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <DollarSign className="h-4 w-4 text-blue-600" />
        <div className="text-center">
          <p className="text-xs text-blue-700/70 font-medium">Saldo</p>
          <p
            className={`text-sm font-bold ${
              totais.saldo >= 0 ? "text-blue-700" : "text-red-700"
            }`}
          >
            {formatarMoeda(totais.saldo)}
          </p>
        </div>
      </div>
    </div>
  );
}
