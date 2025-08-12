import React from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import {
  Card,
  CardContent,
} from "../ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

export function TotaisCaixa() {
  const { totais } = useCaixa();

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 lg:min-w-[400px]">
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Receitas</p>
              <p className="text-sm sm:text-lg font-bold text-green-600">
                {formatarMoeda(totais.receitas)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-sm sm:text-lg font-bold text-red-600">
                {formatarMoeda(totais.despesas)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`border-l-4 ${totais.saldo >= 0 ? "border-l-blue-500" : "border-l-red-500"}`}
      >
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p
                className={`text-sm sm:text-lg font-bold ${
                  totais.saldo >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {formatarMoeda(totais.saldo)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
