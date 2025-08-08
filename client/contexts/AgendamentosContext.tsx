import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Agendamento,
  FiltrosAgendamento,
  LembreteAgendamento,
} from "../../shared/types";
import { useAuth } from "./AuthContext";
import { useEntidades } from "./EntidadesContext";

interface AgendamentosContextType {
  agendamentos: Agendamento[];
  filtros: FiltrosAgendamento;
  setFiltros: (filtros: FiltrosAgendamento) => void;
  lembretes: LembreteAgendamento[];
  isLoading: boolean;

  // CRUD Operations
  criarAgendamento: (
    agendamento: Omit<
      Agendamento,
      "id" | "dataCriacao" | "funcionarioId" | "status"
    >,
  ) => void;
  atualizarAgendamento: (id: string, agendamento: Partial<Agendamento>) => void;
  excluirAgendamento: (id: string) => void;
  concluirAgendamento: (id: string) => void;

  // Notificações
  marcarLembreteComoLido: (agendamentoId: string) => void;
  adiarLembrete: (agendamentoId: string, minutos: number) => void;

  // Filtros e busca
  agendamentosFiltrados: Agendamento[];
  agendamentosHoje: Agendamento[];
  proximosLembretes: LembreteAgendamento[];
}

const AgendamentosContext = createContext<AgendamentosContextType | undefined>(
  undefined,
);

export function AgendamentosProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { setores } = useEntidades();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [lembretes, setLembretes] = useState<LembreteAgendamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filtros padrão
  const [filtros, setFiltros] = useState<FiltrosAgendamento>({
    dataInicio: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    dataFim: new Date(),
    status: "todos",
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarAgendamentos();
    carregarLembretes();
  }, [user]);

  // Verificar lembretes periodicamente
  useEffect(() => {
    const intervalo = setInterval(() => {
      verificarLembretes();
    }, 2 * 60 * 1000); // Verifica a cada 2 minutos (melhor performance)

    return () => clearInterval(intervalo);
  }, [agendamentos]);

  const carregarAgendamentos = () => {
    setIsLoading(true);
    try {
      const agendamentosStorage = localStorage.getItem("agendamentos");
      if (agendamentosStorage) {
        const dados = JSON.parse(agendamentosStorage).map((ag: any) => ({
          ...ag,
          dataServico: new Date(ag.dataServico),
          dataCriacao: new Date(ag.dataCriacao),
        }));
        setAgendamentos(dados);
      } else {
        // Iniciar com lista vazia se não houver dados
        setAgendamentos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const carregarLembretes = () => {
    try {
      const lembretesStorage = localStorage.getItem("lembretes_agendamentos");
      if (lembretesStorage) {
        const dados = JSON.parse(lembretesStorage).map((l: any) => ({
          ...l,
          dataHoraLembrete: new Date(l.dataHoraLembrete),
        }));
        setLembretes(dados);
      }
    } catch (error) {
      console.error("Erro ao carregar lembretes:", error);
    }
  };

  const salvarAgendamentos = (novosAgendamentos: Agendamento[]) => {
    localStorage.setItem("agendamentos", JSON.stringify(novosAgendamentos));
    setAgendamentos(novosAgendamentos);
  };

  const salvarLembretes = (novosLembretes: LembreteAgendamento[]) => {
    localStorage.setItem(
      "lembretes_agendamentos",
      JSON.stringify(novosLembretes),
    );
    setLembretes(novosLembretes);
  };

  const criarAgendamento = (
    dadosAgendamento: Omit<
      Agendamento,
      "id" | "dataCriacao" | "funcionarioId" | "status"
    >,
  ) => {
    if (!user) return;

    const novoAgendamento: Agendamento = {
      id: Date.now().toString(),
      ...dadosAgendamento,
      status: "agendado",
      dataCriacao: new Date(),
      funcionarioId: user.id,
      lembreteEnviado: false,
    };

    const novosAgendamentos = [...agendamentos, novoAgendamento];
    salvarAgendamentos(novosAgendamentos);

    // Criar lembrete
    const dataHoraLembrete = new Date(novoAgendamento.dataServico);
    const [hora, minutos] = novoAgendamento.horaServico.split(":");
    dataHoraLembrete.setHours(parseInt(hora), parseInt(minutos));
    dataHoraLembrete.setMinutes(
      dataHoraLembrete.getMinutes() - dadosAgendamento.tempoLembrete,
    );

    const novoLembrete: LembreteAgendamento = {
      agendamentoId: novoAgendamento.id,
      dataHoraLembrete,
      lido: false,
      adiado: false,
    };

    const novosLembretes = [...lembretes, novoLembrete];
    salvarLembretes(novosLembretes);
  };

  const atualizarAgendamento = (
    id: string,
    dadosAtualizacao: Partial<Agendamento>,
  ) => {
    const novosAgendamentos = agendamentos.map((ag) =>
      ag.id === id ? { ...ag, ...dadosAtualizacao } : ag,
    );
    salvarAgendamentos(novosAgendamentos);

    // Atualizar lembrete se necessário
    if (
      dadosAtualizacao.dataServico ||
      dadosAtualizacao.horaServico ||
      dadosAtualizacao.tempoLembrete
    ) {
      const agendamento = novosAgendamentos.find((ag) => ag.id === id);
      if (agendamento) {
        const dataHoraLembrete = new Date(agendamento.dataServico);
        const [hora, minutos] = agendamento.horaServico.split(":");
        dataHoraLembrete.setHours(parseInt(hora), parseInt(minutos));
        dataHoraLembrete.setMinutes(
          dataHoraLembrete.getMinutes() - agendamento.tempoLembrete,
        );

        const novosLembretes = lembretes.map((l) =>
          l.agendamentoId === id
            ? { ...l, dataHoraLembrete, lido: false, adiado: false }
            : l,
        );
        salvarLembretes(novosLembretes);
      }
    }
  };

  const excluirAgendamento = (id: string) => {
    const novosAgendamentos = agendamentos.filter((ag) => ag.id !== id);
    salvarAgendamentos(novosAgendamentos);

    // Remover lembrete
    const novosLembretes = lembretes.filter((l) => l.agendamentoId !== id);
    salvarLembretes(novosLembretes);
  };

  const concluirAgendamento = (id: string) => {
    atualizarAgendamento(id, { status: "concluido" });

    // Marcar lembrete como lido para evitar notificações futuras
    marcarLembreteComoLido(id);
  };

  const marcarLembreteComoLido = (agendamentoId: string) => {
    const novosLembretes = lembretes.map((l) =>
      l.agendamentoId === agendamentoId ? { ...l, lido: true } : l,
    );
    salvarLembretes(novosLembretes);
  };

  const adiarLembrete = (agendamentoId: string, minutos: number) => {
    const novosLembretes = lembretes.map((l) => {
      if (l.agendamentoId === agendamentoId) {
        const novaDataHora = new Date(l.dataHoraLembrete);
        novaDataHora.setMinutes(novaDataHora.getMinutes() + minutos);
        return { ...l, dataHoraLembrete: novaDataHora, adiado: true };
      }
      return l;
    });
    salvarLembretes(novosLembretes);
  };

  const verificarLembretes = () => {
    const agora = new Date();

    lembretes.forEach((lembrete) => {
      if (!lembrete.lido && lembrete.dataHoraLembrete <= agora) {
        const agendamento = agendamentos.find(
          (ag) => ag.id === lembrete.agendamentoId,
        );
        if (
          agendamento &&
          agendamento.status === "agendado" &&
          !agendamento.lembreteEnviado
        ) {
          // Disparar notificação
          mostrarNotificacaoLembrete(agendamento);

          // Marcar como lembrete enviado para evitar repetição
          atualizarAgendamento(agendamento.id, { lembreteEnviado: true });
        }
      }
    });
  };

  const mostrarNotificacaoLembrete = (agendamento: Agendamento) => {
    // Tocar som de notificação
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYZBjuY3PDCeyw=",
    );
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignora erro se não conseguir tocar

    // Mostrar notificação do navegador se permitido
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Lembrete de Serviço", {
        body: `${agendamento.descricaoServico} às ${agendamento.horaServico}`,
        icon: "/favicon.ico",
      });
    }

    // Disparar evento customizado para mostrar modal
    window.dispatchEvent(
      new CustomEvent("mostrarLembreteAgendamento", {
        detail: agendamento,
      }),
    );
  };

  // Computadas
  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const dataServico = new Date(ag.dataServico);
    dataServico.setHours(0, 0, 0, 0);

    const dataInicio = new Date(filtros.dataInicio);
    dataInicio.setHours(0, 0, 0, 0);

    const dataFim = new Date(filtros.dataFim);
    dataFim.setHours(23, 59, 59, 999);

    const dentroPeríodo = dataServico >= dataInicio && dataServico <= dataFim;
    const statusMatch =
      filtros.status === "todos" || ag.status === filtros.status;
    const setorMatch = !filtros.setor || ag.setor === filtros.setor;
    const tecnicoMatch =
      !filtros.tecnico || ag.tecnicoResponsavel === filtros.tecnico;

    return dentroPeríodo && statusMatch && setorMatch && tecnicoMatch;
  });

  const agendamentosHoje = agendamentos.filter((ag) => {
    const hoje = new Date();
    const dataAgendamento = new Date(ag.dataServico);
    return (
      dataAgendamento.toDateString() === hoje.toDateString() &&
      ag.status === "agendado"
    );
  });

  const proximosLembretes = lembretes.filter(
    (l) => !l.lido && l.dataHoraLembrete <= new Date(),
  );

  const value: AgendamentosContextType = {
    agendamentos,
    filtros,
    setFiltros,
    lembretes,
    isLoading,
    criarAgendamento,
    atualizarAgendamento,
    excluirAgendamento,
    concluirAgendamento,
    marcarLembreteComoLido,
    adiarLembrete,
    agendamentosFiltrados,
    agendamentosHoje,
    proximosLembretes,
  };

  return (
    <AgendamentosContext.Provider value={value}>
      {children}
    </AgendamentosContext.Provider>
  );
}

export function useAgendamentos() {
  const context = useContext(AgendamentosContext);
  if (context === undefined) {
    throw new Error(
      "useAgendamentos deve ser usado dentro de um AgendamentosProvider",
    );
  }
  return context;
}
