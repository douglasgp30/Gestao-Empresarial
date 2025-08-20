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

  // Debug (apenas desenvolvimento)
  testarLembrete?: (agendamentoId?: string) => void;
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
  const [filtros, setFiltros] = useState<FiltrosAgendamento>(() => {
    // Usar data atual real do sistema
    const hoje = new Date();
    const inicioHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      0,
      0,
      0,
      0,
    );
    const fimHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      23,
      59,
      59,
      999,
    );

    return {
      dataInicio: inicioHoje,
      dataFim: fimHoje,
      status: "todos",
    };
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      carregarAgendamentos();
      carregarLembretes();
    }
  }, [user]);

  // Verificar lembretes periodicamente - mais frequente para testes
  useEffect(() => {
    // Verificação inicial imediata
    verificarLembretes();

    // Verificar a cada 10 segundos (mais responsivo)
    const intervalo = setInterval(() => {
      verificarLembretes();
    }, 10000);

    return () => clearInterval(intervalo);
  }, [agendamentos, lembretes]);

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

    // Criar lembrete com data/hora correta
    const dataServico = new Date(dadosAgendamento.dataServico);
    const [hora, minutos] = dadosAgendamento.horaServico.split(":");

    // Criar data/hora exata do serviço
    const dataHoraServico = new Date(
      dataServico.getFullYear(),
      dataServico.getMonth(),
      dataServico.getDate(),
      parseInt(hora),
      parseInt(minutos),
      0,
      0,
    );

    // Calcular hora do lembrete (subtraindo minutos)
    const dataHoraLembrete = new Date(
      dataHoraServico.getTime() - dadosAgendamento.tempoLembrete * 60 * 1000,
    );

    console.log("[NOVO AGENDAMENTO]", {
      dataServico: dataServico.toLocaleString("pt-BR"),
      horaServico: dadosAgendamento.horaServico,
      dataHoraServico: dataHoraServico.toLocaleString("pt-BR"),
      tempoLembrete: dadosAgendamento.tempoLembrete + " minutos",
      dataHoraLembrete: dataHoraLembrete.toLocaleString("pt-BR"),
    });

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
        const dataServico = new Date(agendamento.dataServico);
        const [hora, minutos] = agendamento.horaServico.split(":");

        // Criar data/hora exata do serviço
        const dataHoraServico = new Date(
          dataServico.getFullYear(),
          dataServico.getMonth(),
          dataServico.getDate(),
          parseInt(hora),
          parseInt(minutos),
          0,
          0,
        );

        // Calcular hora do lembrete
        const dataHoraLembrete = new Date(
          dataHoraServico.getTime() - agendamento.tempoLembrete * 60 * 1000,
        );

        const novosLembretes = lembretes.map((l) =>
          l.agendamentoId === id
            ? { ...l, dataHoraLembrete, lido: false, adiado: false }
            : l,
        );
        salvarLembretes(novosLembretes);

        // Resetar flag de lembrete enviado
        const agendamentosAtualizados = novosAgendamentos.map((ag) =>
          ag.id === id ? { ...ag, lembreteEnviado: false } : ag,
        );
        salvarAgendamentos(agendamentosAtualizados);
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
    console.log("[LEMBRETES] Verificando lembretes...", {
      horaAtual: agora.toLocaleString("pt-BR"),
      totalLembretes: lembretes.length,
    });

    lembretes.forEach((lembrete) => {
      const dataLembrete = new Date(lembrete.dataHoraLembrete);
      const agendamento = agendamentos.find(
        (ag) => ag.id === lembrete.agendamentoId,
      );

      console.log("[LEMBRETE]", {
        agendamentoId: lembrete.agendamentoId,
        dataHoraLembrete: dataLembrete.toLocaleString("pt-BR"),
        lido: lembrete.lido,
        lembreteEnviado: agendamento?.lembreteEnviado,
        status: agendamento?.status,
        deveDisparar:
          !lembrete.lido &&
          dataLembrete <= agora &&
          agendamento?.status === "agendado" &&
          !agendamento?.lembreteEnviado,
      });

      if (!lembrete.lido && dataLembrete <= agora) {
        if (
          agendamento &&
          agendamento.status === "agendado" &&
          !agendamento.lembreteEnviado
        ) {
          console.log(
            "[LEMBRETE] Disparando notificação para:",
            agendamento.descricaoServico,
          );
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

  // Função de debug para testar lembretes (apenas para desenvolvimento)
  const testarLembrete = (agendamentoId?: string) => {
    const agendamentoTeste = agendamentoId
      ? agendamentos.find((ag) => ag.id === agendamentoId)
      : agendamentos.find((ag) => ag.status === "agendado");

    if (agendamentoTeste) {
      console.log(
        "[DEBUG] Testando lembrete para:",
        agendamentoTeste.descricaoServico,
      );
      mostrarNotificacaoLembrete(agendamentoTeste);
    } else {
      console.log("[DEBUG] Nenhum agendamento encontrado para teste");
    }
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
    // Função de debug (desenvolvimento)
    testarLembrete:
      process.env.NODE_ENV === "development" ? testarLembrete : undefined,
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
