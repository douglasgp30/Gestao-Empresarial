import React from "react";
import { useContas } from "../../contexts/ContasContext";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export function TotaisContas() {
  const { contas } = useContas();

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const calcularTotais = React.useMemo(() => {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    const contasReceber = contas.filter((c) => c.tipo === "receber");
    const contasPagar = contas.filter((c) => c.tipo === "pagar");

    return {
      aReceber: contasReceber
        .filter((c) => !c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      recebidas: contasReceber
        .filter((c) => c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      aPagar: contasPagar
        .filter((c) => !c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      pagas: contasPagar
        .filter((c) => c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      aReceberVencendoHoje: contasReceber
        .filter((c) => {
          if (c.pago) return false;
          const vencimento = new Date(c.dataVencimento);
          vencimento.setHours(23, 59, 59, 999);
          return hoje.toDateString() === vencimento.toDateString();
        })
        .reduce((sum, c) => sum + c.valor, 0),
      aPagarVencendoHoje: contasPagar
        .filter((c) => {
          if (c.pago) return false;
          const vencimento = new Date(c.dataVencimento);
          vencimento.setHours(23, 59, 59, 999);
          return hoje.toDateString() === vencimento.toDateString();
        })
        .reduce((sum, c) => sum + c.valor, 0),
    };
  }, [contas]);

  return (
    <div className="flex flex-wrap gap-2 lg:gap-3 justify-center lg:justify-end">
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <TrendingUp className="h-4 w-4 text-green-600" />
        <div className="text-center">
          <p className="text-xs text-green-700/70 font-medium">A Receber</p>
          <p className="text-sm font-bold text-green-700">
            {formatarMoeda(calcularTotais.aReceber)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        <CheckCircle className="h-4 w-4 text-emerald-600" />
        <div className="text-center">
          <p className="text-xs text-emerald-700/70 font-medium">Recebidas</p>
          <p className="text-sm font-bold text-emerald-700">
            {formatarMoeda(calcularTotais.recebidas)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        <TrendingDown className="h-4 w-4 text-red-600" />
        <div className="text-center">
          <p className="text-xs text-red-700/70 font-medium">A Pagar</p>
          <p className="text-sm font-bold text-red-700">
            {formatarMoeda(calcularTotais.aPagar)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <CheckCircle className="h-4 w-4 text-gray-600" />
        <div className="text-center">
          <p className="text-xs text-gray-700/70 font-medium">Pagas</p>
          <p className="text-sm font-bold text-gray-700">
            {formatarMoeda(calcularTotais.pagas)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <Clock className="h-4 w-4 text-amber-600" />
        <div className="text-center">
          <p className="text-xs text-amber-700/70 font-medium">Receber Hoje</p>
          <p className="text-sm font-bold text-amber-700">
            {formatarMoeda(calcularTotais.aReceberVencendoHoje)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <div className="text-center">
          <p className="text-xs text-orange-700/70 font-medium">Pagar Hoje</p>
          <p className="text-sm font-bold text-orange-700">
            {formatarMoeda(calcularTotais.aPagarVencendoHoje)}
          </p>
        </div>
      </div>
    </div>
  );
}
