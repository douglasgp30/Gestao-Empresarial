import React, { useState, useEffect } from "react";
import { useAgendamentos } from "../../contexts/AgendamentosContext";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import {
  Bell,
  Clock,
  User,
  Calendar,
  Phone,
  AlarmClock,
  CheckCircle,
} from "lucide-react";
import { Agendamento } from "../../../shared/types";

interface ModalLembreteProps {
  aberto: boolean;
  agendamento: Agendamento | null;
  onFechar: () => void;
}

export default function ModalLembrete({
  aberto,
  agendamento,
  onFechar,
}: ModalLembreteProps) {
  const { marcarLembreteComoLido, adiarLembrete, concluirAgendamento } =
    useAgendamentos();
  const [animacao, setAnimacao] = useState(false);

  useEffect(() => {
    if (aberto) {
      setAnimacao(true);
      // Parar animaç��o após alguns segundos
      const timer = setTimeout(() => setAnimacao(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [aberto]);

  if (!agendamento) return null;

  const handleMarcarComoLido = () => {
    marcarLembreteComoLido(agendamento.id);
    onFechar();
  };

  const handleAdiar = (minutos: number) => {
    adiarLembrete(agendamento.id, minutos);
    onFechar();
  };

  const handleConcluir = () => {
    concluirAgendamento(agendamento.id);
    onFechar();
  };

  const formatarDataHora = () => {
    const data = new Date(agendamento.dataServico);
    const dataFormatada = data.toLocaleDateString("pt-BR");
    return `${dataFormatada} às ${agendamento.horaServico}`;
  };

  const tempoRestante = () => {
    const agora = new Date();
    const dataServico = new Date(agendamento.dataServico);
    const [hora, minutos] = agendamento.horaServico.split(":");
    dataServico.setHours(parseInt(hora), parseInt(minutos));

    const diferenca = dataServico.getTime() - agora.getTime();
    const minutosRestantes = Math.floor(diferenca / (1000 * 60));

    if (minutosRestantes <= 0) {
      return "Agora";
    } else if (minutosRestantes < 60) {
      return `em ${minutosRestantes} minuto${minutosRestantes === 1 ? "" : "s"}`;
    } else {
      const horas = Math.floor(minutosRestantes / 60);
      const mins = minutosRestantes % 60;
      return `em ${horas}h${mins > 0 ? ` ${mins}min` : ""}`;
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="sm:max-w-[500px] border-yellow-200 bg-yellow-50/95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-800">
            <div
              className={`p-2 rounded-full bg-yellow-200 ${animacao ? "animate-pulse" : ""}`}
            >
              <Bell className="h-5 w-5 text-yellow-700" />
            </div>
            Lembrete de Serviço
          </DialogTitle>
          <DialogDescription className="text-yellow-700">
            Chegou a hora do serviço agendado!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Agendamento */}
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="space-y-3">
              {/* Data e Hora */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{formatarDataHora()}</p>
                  <p className="text-sm text-muted-foreground">
                    Horário {tempoRestante()}
                  </p>
                </div>
              </div>

              {/* Descrição do Serviço */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium mb-1">Serviço:</h4>
                <p className="text-gray-700">{agendamento.descricaoServico}</p>
              </div>

              {/* Informações Adicionais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Setor:</span>
                  <Badge variant="secondary">{agendamento.setor}</Badge>
                </div>

                {agendamento.tecnicoResponsavel && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {agendamento.tecnicoResponsavel}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">
                    ***{agendamento.finalTelefoneCliente}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Lembrete: {agendamento.tempoLembrete} min antes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ações de Resposta */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3 text-gray-700">
              O que você gostaria de fazer?
            </h4>
            <div className="space-y-2">
              <Button
                onClick={handleConcluir}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Concluído
              </Button>

              <Button
                onClick={handleMarcarComoLido}
                variant="outline"
                className="w-full"
              >
                Marcar como Lido
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAdiar(5)}
                  className="flex-1"
                >
                  <AlarmClock className="h-4 w-4 mr-1" />
                  Adiar 5min
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAdiar(10)}
                  className="flex-1"
                >
                  <AlarmClock className="h-4 w-4 mr-1" />
                  Adiar 10min
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <p className="text-xs text-muted-foreground">
            Este lembrete foi configurado para {agendamento.tempoLembrete}{" "}
            minutos antes do serviço.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente para gerenciar lembretes globalmente
export function GerenciadorLembretes() {
  const [lembreteAtivo, setLembreteAtivo] = useState<Agendamento | null>(null);

  useEffect(() => {
    const handleLembrete = (event: CustomEvent) => {
      setLembreteAtivo(event.detail);
    };

    // Solicitar permissão para notificações
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    window.addEventListener(
      "mostrarLembreteAgendamento",
      handleLembrete as any,
    );

    return () => {
      window.removeEventListener(
        "mostrarLembreteAgendamento",
        handleLembrete as any,
      );
    };
  }, []);

  return (
    <ModalLembrete
      aberto={!!lembreteAtivo}
      agendamento={lembreteAtivo}
      onFechar={() => setLembreteAtivo(null)}
    />
  );
}
