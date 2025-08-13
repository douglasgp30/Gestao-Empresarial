import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Conta } from "@shared/types";
import { useAuth } from "./AuthContext";
import { contasApi } from "../lib/apiService";

interface ContasContextType {
  contas: Conta[];
  filtros: {
    dataInicio: Date;
    dataFim: Date;
    tipo?: "pagar" | "receber" | "ambos";
    status?: string;
    fornecedorCliente?: string;
  };
  totais: {
    totalPagar: number;
    totalReceber: number;
    totalVencendoHoje: number;
    totalAtrasadas: number;
    totalPagas: number;
    totalContasRecebidas: number;
    totalContasPagas: number;
  };
  adicionarConta: (conta: Omit<Conta, "id" | "funcionarioId">) => Promise<void>;
  editarConta: (id: string, conta: Partial<Conta>) => void;
  excluirConta: (id: string) => void;
  marcarComoPaga: (id: string) => void;
  setFiltros: (filtros: any) => void;
  forcarRecarregamento: () => void;
  isLoading: boolean;
}

const ContasContext = createContext<ContasContextType | undefined>(undefined);

// Função para carregar contas reais do localStorage
function carregarContasReais(): Conta[] {
  try {
    const contas = localStorage.getItem("contas");
    if (contas) {
      const parsedContas = JSON.parse(contas);
      // Converter strings de data de volta para objetos Date
      return parsedContas.map((c: any) => ({
        ...c,
        dataVencimento: new Date(c.dataVencimento),
        dataPagamento: c.dataPagamento ? new Date(c.dataPagamento) : undefined,
      }));
    }
    return [];
  } catch (error) {
    console.warn("Erro ao carregar contas do localStorage:", error);
    return [];
  }
}

// Função para carregar contas do localStorage como fallback
function carregarContasDoLocalStorage(): Conta[] {
  try {
    const contasLocalStr = localStorage.getItem("contas_backup");
    if (contasLocalStr) {
      const contasLocal = JSON.parse(contasLocalStr);
      console.log('🔄 [CONTAS] Carregadas do localStorage:', contasLocal.length, 'contas');
      return contasLocal.map((c: any) => ({
        ...c,
        dataVencimento: new Date(c.dataVencimento),
        dataPagamento: c.dataPagamento ? new Date(c.dataPagamento) : undefined,
      }));
    }
    return [];
  } catch (error) {
    console.warn("Erro ao carregar contas do localStorage:", error);
    return [];
  }
}

// Função para salvar contas no localStorage como backup
function salvarContasNoLocalStorage(contas: Conta[]) {
  try {
    localStorage.setItem("contas_backup", JSON.stringify(contas));
    console.log('💾 [CONTAS] Backup salvo no localStorage:', contas.length, 'contas');
  } catch (error) {
    console.warn("Erro ao salvar contas no localStorage:", error);
  }
}

function getStatusConta(
  dataVencimento: Date,
  status: string,
): "paga" | "atrasada" | "vence_hoje" | "pendente" {
  if (status === "paga") return "paga";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);

  if (vencimento < hoje) return "atrasada";
  if (vencimento.getTime() === hoje.getTime()) return "vence_hoje";
  return "pendente";
}

export function ContasProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [contas, setContas] = useState<Conta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [filtros, setFiltros] = useState(() => {
    // Usar data atual do sistema
    const agora = new Date();
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    const fimHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999);

    return {
      dataInicio: inicioHoje,
      dataFim: fimHoje,
      tipo: "ambos" as "pagar" | "receber" | "ambos",
    };
  });

  // Função para carregar contas da API com retry e fallback
  const carregarContas = async (tentativa = 1) => {
    try {
      setIsLoading(true);

      // Preparar filtros para a API
      const filtrosApi = {
        dataInicio: filtros.dataInicio.toISOString().split('T')[0],
        dataFim: filtros.dataFim.toISOString().split('T')[0],
        tipo: filtros.tipo !== 'ambos' ? filtros.tipo : undefined,
        status: filtros.status !== 'todos' ? filtros.status : undefined,
      };

      console.log(`🔍 [CONTAS] Tentativa ${tentativa} - Enviando filtros para API:`, filtrosApi);
      console.log(`🔍 [CONTAS] URL que será chamada: /api/contas?${new URLSearchParams(filtrosApi).toString()}`);

      const response = await contasApi.listar(filtrosApi);
      console.log('🔍 [CONTAS] Resposta da API recebida:', response);

      if (response.error) {
        console.error("Erro ao carregar contas:", response.error);

        // Se for erro de rede e não é a primeira tentativa, tentar fallback
        if (response.error.includes("não disponível") && tentativa === 1) {
          console.log('🔄 [CONTAS] Tentando novamente em 2 segundos...');
          setTimeout(() => carregarContas(2), 2000);
          return;
        }

        // Se falhar, usar dados do localStorage como fallback
        console.log('🔄 [CONTAS] Tentando carregar do localStorage...');
        const contasLocal = carregarContasDoLocalStorage();
        setContas(contasLocal);
        return;
      }

      // Verificar se response.data é um array
      const contasData = Array.isArray(response.data) ? response.data : [];

      // Converter dados da API para o formato do contexto
      const contasFormatadas = contasData.map((c: any) => ({
        id: c.id.toString(),
        tipo: c.tipo,
        descricao: c.descricao || "Sem descrição",
        valor: c.valor || 0,
        dataVencimento: new Date(c.dataVencimento),
        dataPagamento: c.dataPagamento ? new Date(c.dataPagamento) : undefined,
        // Mapear status do servidor para o cliente
        status: c.status === "pago" ? "paga" :
                c.status === "atrasado" ? "atrasada" :
                c.status || "pendente",
        observacoes: c.observacoes || "",
        categoria: c.categoria || "",
        dataCriacao: new Date(c.dataCriacao || new Date()),
        // Campos de compatibilidade
        fornecedorCliente: c.descricao || "Sem descrição", // Usar descrição como nome do fornecedor/cliente
        tipoPagamento: c.categoria || "",
        funcionarioId: user?.id || "1",
        clienteId: c.clienteId || undefined,
      }));

      setContas(contasFormatadas);
      console.log(`✅ [CONTAS] ${contasFormatadas.length} contas carregadas com sucesso`);

      // Salvar backup no localStorage
      salvarContasNoLocalStorage(contasFormatadas);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);

      // Em caso de erro, tentar carregar do localStorage
      const contasLocal = carregarContasDoLocalStorage();
      if (contasLocal.length > 0) {
        console.log('🔄 [CONTAS] Usando dados do localStorage como fallback');
        setContas(contasLocal);
      } else {
        setContas([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função para carregar com debounce usando useRef
  const carregarContasDebounced = useCallback(() => {
    // Cancelar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Criar novo timeout com debounce de 300ms
    timeoutRef.current = setTimeout(() => {
      carregarContas();
    }, 300);
  }, []);

  // Carregar contas na inicialização - híbrido (localStorage + API)
  useEffect(() => {
    // Primeiro, carregar dados do localStorage para exibição imediata
    const contasLocal = carregarContasDoLocalStorage();
    if (contasLocal.length > 0) {
      console.log('🔄 [CONTAS] Carregando dados locais primeiro para exibição imediata');
      setContas(contasLocal);
    }

    // Depois tentar carregar da API
    carregarContasDebounced();
  }, [carregarContasDebounced]);

  // Função para atualizar filtros
  const setFiltrosComLog = (novosFiltros: any) => {
    setFiltros(novosFiltros);
  };

  // Recarregar quando filtros importantes mudarem
  useEffect(() => {
    console.log('🔄 [CONTAS] useEffect disparado - filtros mudaram:');
    console.log('🔄 [CONTAS] dataInicio:', filtros.dataInicio);
    console.log('🔄 [CONTAS] dataFim:', filtros.dataFim);
    console.log('🔄 [CONTAS] tipo:', filtros.tipo);
    console.log('🔄 [CONTAS] status:', filtros.status);

    if (filtros.dataInicio && filtros.dataFim) {
      console.log('🔄 [CONTAS] Chamando carregarContasDebounced...');
      carregarContasDebounced();
    } else {
      console.log('❌ [CONTAS] Filtros incompletos - não carregando');
    }
  }, [filtros.dataInicio, filtros.dataFim, filtros.tipo, filtros.status, carregarContasDebounced]);

  const adicionarConta = async (novaConta: Omit<Conta, "id" | "funcionarioId">) => {
    try {
      setIsLoading(true);

      console.log('🔍 [CONTAS] Adicionando nova conta:', novaConta);

      // Preparar dados para a API
      const dadosApi = {
        tipo: novaConta.tipo,
        descricao: novaConta.descricao || `Conta ${novaConta.tipo === "receber" ? "a receber" : "a pagar"}`,
        valor: novaConta.valor,
        dataVencimento: novaConta.dataVencimento.toISOString().split("T")[0],
        status: "pendente",
        observacoes: novaConta.observacoes,
        categoria: novaConta.tipoPagamento || novaConta.categoria,
      };

      console.log('🔍 [CONTAS] Dados preparados para a API:', dadosApi);

      const response = await contasApi.criar(dadosApi);
      console.log('🔍 [CONTAS] Resposta da criação:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      console.log('🔍 [CONTAS] Conta criada com sucesso, recarregando lista...');
      // Recarregar contas - forçar sem debounce
      await carregarContas(1);
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const editarConta = (id: string, dadosAtualizados: Partial<Conta>) => {
    setContas((prev) => {
      const contasAtualizadas = prev.map((conta) =>
        conta.id === id
          ? {
              ...conta,
              ...dadosAtualizados,
              status: dadosAtualizados.dataVencimento
                ? getStatusConta(
                    dadosAtualizados.dataVencimento,
                    dadosAtualizados.status || conta.status,
                  )
                : conta.status,
            }
          : conta,
      );

      // Salvar no localStorage
      try {
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas));
      } catch (error) {
        console.warn("Erro ao salvar contas no localStorage:", error);
      }
      return contasAtualizadas;
    });
  };

  const excluirConta = (id: string) => {
    setContas((prev) => {
      const contasAtualizadas = prev.filter((conta) => conta.id !== id);

      // Salvar no localStorage
      try {
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas));
      } catch (error) {
        console.warn("Erro ao salvar contas no localStorage:", error);
      }
      return contasAtualizadas;
    });
  };

  const marcarComoPaga = (id: string) => {
    setContas((prev) => {
      const contasAtualizadas = prev.map((conta) =>
        conta.id === id
          ? {
              ...conta,
              status: "paga",
              dataPagamento: new Date(),
            }
          : conta,
      );

      // Salvar no localStorage
      try {
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas));
      } catch (error) {
        console.warn("Erro ao salvar contas no localStorage:", error);
      }
      return contasAtualizadas;
    });
  };

  // Atualizar status das contas automaticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setContas((prev) =>
        prev.map((conta) => ({
          ...conta,
          status:
            conta.status === "paga"
              ? "paga"
              : getStatusConta(conta.dataVencimento, conta.status),
        })),
      );
    }, 60000); // Atualizar a cada minuto

    return () => {
      clearInterval(interval);
      // Limpar timeout de carregamento se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calcular totais baseados nas contas já filtradas pela API
  const totais = React.useMemo(() => {
    // Aplicar filtros adicionais apenas no frontend (fornecedor/cliente)
    const contasFiltradas = contas.filter((conta) => {
      const fornecedorCorreto =
        !filtros.fornecedorCliente ||
        filtros.fornecedorCliente === "todos" ||
        conta.fornecedorCliente
          .toLowerCase()
          .includes(filtros.fornecedorCliente.toLowerCase());

      return fornecedorCorreto;
    });

    const totalPagar = contasFiltradas
      .filter((c) => c.tipo === "pagar" && c.status !== "paga")
      .reduce((total, c) => total + c.valor, 0);

    const totalReceber = contasFiltradas
      .filter((c) => c.tipo === "receber" && c.status !== "paga")
      .reduce((total, c) => total + c.valor, 0);

    const totalVencendoHoje = contasFiltradas
      .filter((c) => c.status === "vence_hoje")
      .reduce((total, c) => total + c.valor, 0);

    const totalAtrasadas = contasFiltradas
      .filter((c) => c.status === "atrasada")
      .reduce((total, c) => total + c.valor, 0);

    const totalPagas = contasFiltradas
      .filter((c) => c.status === "paga")
      .reduce((total, c) => total + c.valor, 0);

    // Totais específicos para contas recebidas e pagas separadamente
    const totalContasRecebidas = contasFiltradas
      .filter((c) => c.tipo === "receber" && c.status === "paga")
      .reduce((total, c) => total + c.valor, 0);

    const totalContasPagas = contasFiltradas
      .filter((c) => c.tipo === "pagar" && c.status === "paga")
      .reduce((total, c) => total + c.valor, 0);

    return {
      totalPagar,
      totalReceber,
      totalVencendoHoje,
      totalAtrasadas,
      totalPagas,
      totalContasRecebidas,
      totalContasPagas,
    };
  }, [contas, filtros]);

  // Função pública para forçar recarregamento
  const forcarRecarregamento = () => {
    console.log('🔄 [CONTAS] Forçando recarregamento manual...');
    carregarContas(1); // Chama diretamente sem debounce
  };

  const value = {
    contas,
    filtros,
    totais,
    adicionarConta,
    editarConta,
    excluirConta,
    marcarComoPaga,
    setFiltros: setFiltrosComLog,
    forcarRecarregamento,
    isLoading,
  };

  return (
    <ContasContext.Provider value={value}>{children}</ContasContext.Provider>
  );
}

export function useContas() {
  const context = useContext(ContasContext);
  if (context === undefined) {
    throw new Error("useContas must be used within a ContasProvider");
  }
  return context;
}
