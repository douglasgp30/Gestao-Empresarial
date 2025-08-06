import React from "react";
import { useAgendamentos } from "../../contexts/AgendamentosContext";
import { Badge } from "../ui/badge";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function TotaisAgendamentos() {
  const { agendamentos, agendamentosHoje } = useAgendamentos();

  const calcularTotais = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Agendamentos de hoje
    const agendamentosDeHoje = agendamentos.filter((ag) => {
      const dataAgendamento = new Date(ag.dataServico);
      dataAgendamento.setHours(0, 0, 0, 0);
      return dataAgendamento.getTime() === hoje.getTime();
    });

    // Totais gerais (todos os agendamentos)
    const totalGeral = agendamentos.length;
    const totalConcluidos = agendamentos.filter(
      (ag) => ag.status === "concluido",
    ).length;
    const totalPendentes = agendamentos.filter(
      (ag) => ag.status === "agendado",
    ).length;
    const totalCancelados = agendamentos.filter(
      (ag) => ag.status === "cancelado",
    ).length;

    // Totais do dia
    const totalHoje = agendamentosDeHoje.length;
    const concluidosHoje = agendamentosDeHoje.filter(
      (ag) => ag.status === "concluido",
    ).length;
    const pendentesHoje = agendamentosDeHoje.filter(
      (ag) => ag.status === "agendado",
    ).length;

    return {
      geral: {
        total: totalGeral,
        concluidos: totalConcluidos,
        pendentes: totalPendentes,
        cancelados: totalCancelados,
      },
      hoje: {
        total: totalHoje,
        concluidos: concluidosHoje,
        pendentes: pendentesHoje,
      },
    };
  };

  const totais = calcularTotais();

  return (
    <div className="bg-muted/30 rounded-lg p-4 border">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Resumo dos Agendamentos
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Totais do Dia */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Hoje ({new Date().toLocaleDateString("pt-BR")})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-background rounded-md">
              <div className="text-lg font-bold text-blue-600">
                {totais.hoje.total}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-2 bg-background rounded-md">
              <div className="text-lg font-bold text-green-600">
                {totais.hoje.concluidos}
              </div>
              <div className="text-xs text-muted-foreground">Concluídos</div>
            </div>
            <div className="text-center p-2 bg-background rounded-md">
              <div className="text-lg font-bold text-orange-600">
                {totais.hoje.pendentes}
              </div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
          </div>
        </div>

        {/* Totais Gerais */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Geral (Todos os Períodos)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-background rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Concluídos</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {totais.geral.concluidos}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-background rounded-md">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Pendentes</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800"
              >
                {totais.geral.pendentes}
              </Badge>
            </div>
            {totais.geral.cancelados > 0 && (
              <div className="flex items-center justify-between p-2 bg-background rounded-md col-span-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Cancelados</span>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {totais.geral.cancelados}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progresso do Dia */}
      {totais.hoje.total > 0 && (
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso do dia</span>
            <span>
              {Math.round((totais.hoje.concluidos / totais.hoje.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(totais.hoje.concluidos / totais.hoje.total) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
