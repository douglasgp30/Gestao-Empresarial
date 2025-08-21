import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { LancamentoCaixa, Campanha } from "@shared/types";
import { useAuth } from "./AuthContext";
import { loadingManager } from "../lib/loadingManager";
import { contextThrottle } from "../lib/contextThrottle";
import {
  shouldSkipLoading,
  getLoadingDelay,
  isContextLoading,
  setContextLoading,
} from "../lib/globalLoadingControl";
import { migrarDadosAntigos } from "../lib/migrarDadosAntigos";

interface CaixaContextType {
  lancamentos: LancamentoCaixa[];
  campanhas: Campanha[];
  filtros: {
    dataInicio: Date;
    dataFim: Date;
    tipo?: "receita" | "despesa" | "todos";
    formaPagamento?: string;
    tecnico?: string;
    campanha?: string;
    setor?: string;
    categoria?: string;
    descricao?: string;
    cliente?: string;
    cidade?: string;
    numeroNota?: string;
    codigoServico?: string;
  };
  totais: {
    receitas: number;
    receitaBruta?: number;
    receitaLiquida?: number;
    receitasParaEmpresa?: number;
    boletos?: number;
    despesas: number;
    saldo: number;
    comissoes: number;
  };
  adicionarLancamento: (
    lancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => Promise<void>;
  editarLancamento: (
    id: string,
    lancamento: Partial<LancamentoCaixa>,
  ) => Promise<void>;
  excluirLancamento: (id: string) => Promise<void>;
  adicionarCampanha: (campanha: Omit<Campanha, "id">) => Promise<void>;
  setFiltros: (filtros: any) => void;
  carregarDados: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const CaixaContext = createContext<CaixaContextType | undefined>(undefined);

export function CaixaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCarregando, setIsCarregando] = useState(false);
  const [filtros, setFiltros] = useState(() => {
    // Usar data atual do sistema mas normalizando para o dia correto
    const agora = new Date();
    const inicioHoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
      0,
      0,
      0,
      0,
    );
    const fimHoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
      23,
      59,
      59,
      999,
    );

    return {
      dataInicio: inicioHoje,
      dataFim: fimHoje,
      tipo: "todos" as "receita" | "despesa" | "todos",
      formaPagamento: "todas",
      tecnico: "todos",
      campanha: "todas",
      setor: "todos",
      cidade: "todas",
      categoria: "todas",
      descricao: "todas",
      cliente: "todos",
      numeroNota: "",
    };
  });

  // Função para carregar campanhas com fallback seguro
  const carregarCampanhasSafe = async () => {
    try {
      // Verificar se estamos em um ambiente onde fetch deve funcionar
      if (typeof window === "undefined") {
        console.log("📊 [CaixaContext] Executando no servidor, pulando fetch");
        return;
      }

      // Primeiro, fazer um health check do servidor
      try {
        const healthController = new AbortController();
        const healthTimeoutId = setTimeout(
          () => healthController.abort(),
          2000,
        );

        const healthResponse = await fetch("/api/health", {
          signal: healthController.signal,
        });

        clearTimeout(healthTimeoutId);

        if (!healthResponse.ok) {
          throw new Error(`Health check falhou: ${healthResponse.status}`);
        }

        console.log(
          "📊 [CaixaContext] Servidor disponível, carregando campanhas...",
        );
      } catch (healthError) {
        console.warn(
          "📊 [CaixaContext] Servidor não está disponível:",
          healthError,
        );
        throw new Error("Servidor indisponível");
      }

      // Agora tentar carregar campanhas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout maior após health check

      const response = await fetch("/api/campanhas", {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const campanhasServidor = await response.json();
        console.log(
          "📊 [CaixaContext] Campanhas carregadas do servidor:",
          campanhasServidor.length,
        );
        setCampanhas(campanhasServidor || []);

        // Sincronizar com localStorage para cache
        try {
          localStorage.setItem(
            "campanhas",
            JSON.stringify(campanhasServidor || []),
          );
        } catch (storageError) {
          console.warn(
            "Erro ao salvar campanhas no localStorage:",
            storageError,
          );
        }
        return;
      } else {
        console.warn(
          `📊 [CaixaContext] Resposta não OK: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      // Tratar diferentes tipos de erro
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.warn(
            "📊 [CaixaContext] Timeout ao carregar campanhas do servidor",
          );
        } else if (error.message.includes("Failed to fetch")) {
          console.warn(
            "📊 [CaixaContext] Falha na conexão com servidor, usando localStorage",
          );
        } else {
          console.warn(
            "📊 [CaixaContext] Erro ao carregar campanhas:",
            error.message,
          );
        }
      } else {
        console.warn(
          "�� [CaixaContext] Erro desconhecido ao carregar campanhas:",
          error,
        );
      }
    }

    // Fallback para localStorage
    try {
      const campanhasStorage = localStorage.getItem("campanhas");
      if (campanhasStorage) {
        const campanhasParsed = JSON.parse(campanhasStorage);
        setCampanhas(campanhasParsed || []);
      } else {
        setCampanhas([]);
      }
    } catch (localError) {
      console.warn("Erro ao carregar campanhas do localStorage:", localError);
      setCampanhas([]);
    }
  };

  // Função para carregar dados do banco de dados
  const carregarDados = async () => {
    // Evitar múltiplos carregamentos simultâneos
    if (isCarregando) {
      console.log("CaixaContext: Carregamento já em andamento, ignorando...");
      return;
    }

    try {
      setIsCarregando(true);
      setIsLoading(true);
      setError(null);

      console.log("📦 [CaixaContext] Carregando dados do banco de dados...");

      // Carregar campanhas do servidor
      try {
        await carregarCampanhasSafe();
      } catch (campanhasError) {
        console.warn(
          "Erro ao carregar campanhas, usando fallback:",
          campanhasError,
        );
        setCampanhas([]);
      }

      // Carregar lançamentos do banco de dados
      try {
        await carregarLancamentosDoBanco();
      } catch (lancamentosError) {
        console.warn(
          "Erro ao carregar lançamentos do banco, tentando localStorage:",
          lancamentosError,
        );

        // Fallback para localStorage (temporário durante migração)
        try {
          await carregarLancamentosLocalStorage();
          console.log("⚠️ [CaixaContext] Dados carregados do localStorage (migração pendente)");
        } catch (localError) {
          console.warn("Erro no fallback localStorage:", localError);
          setLancamentos([]);
        }
      }

      console.log("✅ [CaixaContext] Dados carregados com sucesso");
    } catch (error) {
      console.error("Erro geral ao carregar dados:", error);
      setError("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
      setIsCarregando(false);
    }
  };

  // Função para migrar lançamento antigo para novo formato
  const migrarLancamentoAntigo = (lancamento: any): any => {
    const migrado = { ...lancamento };

    // Migrar descrição: string -> objeto com nome
    if (
      typeof migrado.descricao === "string" &&
      migrado.descricao.trim() !== ""
    ) {
      migrado.descricao = { nome: migrado.descricao };
    }

    // Migrar formaPagamento: string -> objeto com nome
    if (typeof migrado.formaPagamento === "string") {
      migrado.formaPagamento = {
        id: migrado.formaPagamento,
        nome: migrado.formaPagamento,
      };
    }

    // Garantir campo funcionario a partir de tecnicoResponsavel
    if (!migrado.funcionario && migrado.tecnicoResponsavel) {
      if (typeof migrado.tecnicoResponsavel === "object") {
        migrado.funcionario = {
          id:
            migrado.tecnicoResponsavel.id?.toString?.() ||
            migrado.tecnicoResponsavelId,
          nome:
            migrado.tecnicoResponsavel.nome ||
            migrado.tecnicoResponsavel.nomeCompleto,
        };
      } else if (typeof migrado.tecnicoResponsavel === "string") {
        migrado.funcionario = {
          id: migrado.tecnicoResponsavel,
          nome: migrado.tecnicoResponsavel,
        };
      }
    }

    // Migrar cliente: string -> objeto
    if (typeof migrado.cliente === "string" && migrado.cliente.trim() !== "") {
      migrado.cliente = { id: migrado.cliente, nome: migrado.cliente };
    }

    // Migrar setor: string -> objeto
    if (typeof migrado.setor === "string" && migrado.setor.trim() !== "") {
      migrado.setor = { id: migrado.setor, nome: migrado.setor };
    }

    // Migrar campanha: string -> objeto
    if (
      typeof migrado.campanha === "string" &&
      migrado.campanha.trim() !== ""
    ) {
      migrado.campanha = { id: migrado.campanha, nome: migrado.campanha };
    }

    return migrado;
  };

  // Função para carregar lançamentos do localStorage
  const carregarLancamentosLocalStorage = async () => {
    try {
      console.log(
        "📦 [CaixaContext] Carregando lançamentos do localStorage...",
      );

      // Migrar dados antigos antes de carregar
      const foiMigrado = migrarDadosAntigos();
      if (foiMigrado) {
        console.log("🔄 [CaixaContext] Dados migrados com sucesso");
      }

      const lancamentosStorage = localStorage.getItem("lancamentos_caixa");
      if (lancamentosStorage) {
        const lancamentosParsed = JSON.parse(lancamentosStorage);

        // Migrar dados antigos e converter strings de data de volta para objetos Date
        const lancamentosFormatados = lancamentosParsed.map(
          (lancamento: any) => {
            // Primeiro migrar formato antigo
            const lancamentoMigrado = migrarLancamentoAntigo(lancamento);

            // Depois converter datas
            return {
              ...lancamentoMigrado,
              data: new Date(lancamentoMigrado.data),
              dataHora: new Date(lancamentoMigrado.dataHora),
              dataCriacao: new Date(lancamentoMigrado.dataCriacao),
            };
          },
        );

        setLancamentos(lancamentosFormatados);
        console.log(
          `📦 [CaixaContext] ${lancamentosFormatados.length} lançamentos carregados e migrados do localStorage`,
        );

        // Se houve migração, salvar dados migrados de volta no localStorage
        const dadosMigrados = lancamentosFormatados.map(normalizarLancamento);
        localStorage.setItem(
          "lancamentos_caixa",
          JSON.stringify(dadosMigrados),
        );
        console.log(
          "📦 [CaixaContext] Dados migrados salvos de volta no localStorage",
        );
      } else {
        setLancamentos([]);
        console.log(
          "📦 [CaixaContext] Nenhum lançamento encontrado no localStorage",
        );
      }
    } catch (error) {
      console.error("Erro ao carregar lançamentos do localStorage:", error);
      setLancamentos([]);
    }
  };

  // Função utilitária para conversão segura de string para número
  const parseIntSafe = (value: string): number | undefined => {
    if (!value || value === "todos" || value === "todas") return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  };

  // Função para formatar data para o servidor (YYYY-MM-DD)
  const formatarDataParaServidor = (data: Date): string => {
    return data.toISOString().split("T")[0];
  };

  // Função para carregar lançamentos com base nos filtros (localStorage)
  const carregarLancamentos = useCallback(
    async (forceLoad = false) => {
      try {
        // Evitar múltiplas chamadas simultâneas, exceto quando forçado
        if (isCarregando && !forceLoad) {
          console.log(
            "[CaixaContext] Carregamento de lançamentos já em andamento, ignorando...",
          );
          return;
        }

        console.log(
          "📦 [CaixaContext] Recarregando lançamentos do localStorage...",
        );

        // Simplesmente recarregar do localStorage
        await carregarLancamentosLocalStorage();
      } catch (error) {
        console.error("Erro ao carregar lançamentos do localStorage:", error);
        setError("Erro ao carregar lançamentos locais");
      }
    },
    [filtros, isCarregando],
  );

  // Carregar dados na inicialização com controle global e throttling
  useEffect(() => {
    // Verificar se estamos em um ambiente válido para carregamento
    if (typeof window === "undefined") {
      console.log(
        "[CaixaContext] Executando no servidor, pulando carregamento inicial",
      );
      return;
    }

    // Verificar se é hot reload (comum durante desenvolvimento)
    const isHotReload =
      window.location.href.includes("reload=") ||
      window.location.href.includes("?t=") ||
      document.readyState !== "complete";

    // Sempre usar um debounce para evitar múltiplas execuções
    const debounceTime = isHotReload ? 3000 : 1000; // Mais tempo durante hot reload

    console.log(
      `[CaixaContext] Agendando carregamento em ${debounceTime}ms...`,
    );
    const timeout = setTimeout(() => {
      console.log("[CaixaContext] Executando carregamento de dados");
      carregarDados();
    }, debounceTime);

    return () => {
      console.log("[CaixaContext] Cancelando carregamento agendado");
      clearTimeout(timeout);
    };
  }, []);

  // Memoizar string das dependências para evitar loops
  const filtrosDependencias = useMemo(() => {
    return JSON.stringify({
      dataInicio: filtros.dataInicio.toISOString().split("T")[0],
      dataFim: filtros.dataFim.toISOString().split("T")[0],
      tipo: filtros.tipo,
      formaPagamento: filtros.formaPagamento,
      tecnico: filtros.tecnico,
      campanha: filtros.campanha,
      setor: filtros.setor,
      categoria: filtros.categoria,
      descricao: filtros.descricao,
      cliente: filtros.cliente,
      cidade: filtros.cidade,
      numeroNota: filtros.numeroNota,
    });
  }, [
    filtros.dataInicio,
    filtros.dataFim,
    filtros.tipo,
    filtros.formaPagamento,
    filtros.tecnico,
    filtros.campanha,
    filtros.setor,
    filtros.categoria,
    filtros.descricao,
    filtros.cliente,
    filtros.cidade,
    filtros.numeroNota,
  ]);

  // Recarregar lançamentos quando os filtros mudarem
  useEffect(() => {
    // Usar throttling para evitar múltiplas chamadas
    if (contextThrottle.isThrottled("CaixaContext-filtros", 2000)) {
      console.log("[CaixaContext] Filtros throttled, ignorando...");
      return;
    }

    const timeoutId = setTimeout(() => {
      contextThrottle.execute(
        "CaixaContext-filtros",
        () => carregarLancamentos(true),
        2000, // 2 segundos de throttle
      );
    }, 800); // Debounce ainda maior

    return () => clearTimeout(timeoutId);
  }, [filtrosDependencias]); // Remover carregarLancamentos das dependências

  // Função para normalizar lançamento antes de salvar
  const normalizarLancamento = (lancamento: any): any => {
    // Converter datas para ISO strings para serialização
    const normalized = {
      ...lancamento,
      data:
        lancamento.data instanceof Date
          ? lancamento.data.toISOString()
          : lancamento.data,
      dataHora:
        lancamento.dataHora instanceof Date
          ? lancamento.dataHora.toISOString()
          : lancamento.dataHora,
      dataCriacao:
        lancamento.dataCriacao instanceof Date
          ? lancamento.dataCriacao.toISOString()
          : lancamento.dataCriacao,
    };

    // NORMALIZAÇÃO DE CAMPOS PARA COMPATIBILIDADE DA UI

    // 1. Descrição: garantir que seja objeto com 'nome' para a UI
    if (
      typeof normalized.descricao === "string" &&
      normalized.descricao.trim() !== ""
    ) {
      normalized.descricao = { nome: normalized.descricao };
    }

    // 2. Forma de Pagamento: garantir objeto com nome
    if (typeof normalized.formaPagamento === "string") {
      normalized.formaPagamento = {
        id: normalized.formaPagamento,
        nome: normalized.formaPagamento,
      };
    }

    // 3. Técnico: popular campo 'funcionario' a partir de 'tecnicoResponsavel' (compatibilidade com UI)
    if (!normalized.funcionario && normalized.tecnicoResponsavel) {
      if (typeof normalized.tecnicoResponsavel === "object") {
        normalized.funcionario = {
          id:
            normalized.tecnicoResponsavel.id?.toString?.() ||
            normalized.tecnicoResponsavelId,
          nome:
            normalized.tecnicoResponsavel.nome ||
            normalized.tecnicoResponsavel.nomeCompleto,
          percentualComissao: normalized.tecnicoResponsavel.percentualComissao,
        };
      } else if (typeof normalized.tecnicoResponsavel === "string") {
        normalized.funcionario = {
          id: normalized.tecnicoResponsavel,
          nome: normalized.tecnicoResponsavel,
        };
      }
    }

    // 4. Cliente: garantir formato consistente
    if (
      typeof normalized.cliente === "string" &&
      normalized.cliente.trim() !== ""
    ) {
      normalized.cliente = { id: normalized.cliente, nome: normalized.cliente };
    }

    // 5. Setor: garantir formato consistente
    if (
      typeof normalized.setor === "string" &&
      normalized.setor.trim() !== ""
    ) {
      normalized.setor = { id: normalized.setor, nome: normalized.setor };
    }

    // 6. Campanha: garantir formato consistente
    if (
      typeof normalized.campanha === "string" &&
      normalized.campanha.trim() !== ""
    ) {
      normalized.campanha = {
        id: normalized.campanha,
        nome: normalized.campanha,
      };
    }

    // 7. Garantir IDs como strings coerentes
    if (!normalized.formaPagamentoId && normalized.formaPagamento?.id) {
      normalized.formaPagamentoId = normalized.formaPagamento.id?.toString();
    }
    if (!normalized.tecnicoResponsavelId && normalized.tecnicoResponsavel?.id) {
      normalized.tecnicoResponsavelId =
        normalized.tecnicoResponsavel.id?.toString();
    }
    if (!normalized.clienteId && normalized.cliente?.id) {
      normalized.clienteId = normalized.cliente.id?.toString();
    }
    if (!normalized.setorId && normalized.setor?.id) {
      normalized.setorId = normalized.setor.id?.toString();
    }
    if (!normalized.campanhaId && normalized.campanha?.id) {
      normalized.campanhaId = normalized.campanha.id?.toString();
    }

    // Log detalhado para debug
    console.log("[CaixaContext] Lançamento normalizado:", {
      id: normalized.id,
      categoria: normalized.categoria,
      descricao: normalized.descricao,
      formaPagamento: normalized.formaPagamento,
      formaPagamentoId: normalized.formaPagamentoId,
      tecnicoResponsavel: normalized.tecnicoResponsavel,
      funcionario: normalized.funcionario,
      setor: normalized.setor,
      campanha: normalized.campanha,
      cliente: normalized.cliente,
      valor: normalized.valor,
      valorLiquido: normalized.valorLiquido,
      comissao: normalized.comissao,
    });

    return normalized;
  };

  const adicionarLancamento = async (
    novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => {
    try {
      setError(null);

      // Criar o lançamento com ID único
      const lancamento: LancamentoCaixa = {
        ...novoLancamento,
        id: `lancamento-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dataCriacao: new Date(),
        data: novoLancamento.data || new Date(),
        dataHora: novoLancamento.dataHora || new Date(),
      };

      console.log(
        "[CaixaContext] Adicionando lançamento ao localStorage:",
        lancamento,
      );

      // Carregar lançamentos existentes
      const lancamentosExistentes = JSON.parse(
        localStorage.getItem("lancamentos_caixa") || "[]",
      );

      // Normalizar o lançamento antes de salvar
      const lancamentoNormalizado = normalizarLancamento(lancamento);

      // Adicionar o novo lançamento normalizado
      const novosLancamentos = [
        ...lancamentosExistentes,
        lancamentoNormalizado,
      ];

      // Salvar no localStorage
      localStorage.setItem(
        "lancamentos_caixa",
        JSON.stringify(novosLancamentos),
      );

      // Recarregar lançamentos
      await carregarLancamentosLocalStorage();

      console.log(
        "[CaixaContext] Lançamento adicionado com sucesso:",
        lancamento.id,
      );
    } catch (error) {
      console.error("Erro ao adicionar lançamento:", error);
      throw error;
    }
  };

  const editarLancamento = async (
    id: string,
    dadosAtualizados: Partial<LancamentoCaixa>,
  ) => {
    try {
      setError(null);

      console.log("[CaixaContext] Editando lançamento:", id, dadosAtualizados);

      // Carregar lançamentos existentes
      const lancamentosExistentes = JSON.parse(
        localStorage.getItem("lancamentos_caixa") || "[]",
      );

      // Encontrar e atualizar o lançamento
      const lancamentosAtualizados = lancamentosExistentes.map(
        (lancamento: any) => {
          if (lancamento.id === id) {
            return {
              ...lancamento,
              ...dadosAtualizados,
              // Preservar campos que não devem ser sobrescritos
              id: lancamento.id,
              dataCriacao: lancamento.dataCriacao,
            };
          }
          return lancamento;
        },
      );

      // Salvar no localStorage
      localStorage.setItem(
        "lancamentos_caixa",
        JSON.stringify(lancamentosAtualizados),
      );

      // Recarregar lançamentos
      await carregarLancamentosLocalStorage();

      console.log("[CaixaContext] Lançamento editado com sucesso:", id);
    } catch (error) {
      console.error("Erro ao editar lançamento:", error);
      setError("Erro ao editar lançamento");
      throw error;
    }
  };

  const excluirLancamento = async (id: string) => {
    try {
      setError(null);

      console.log("[CaixaContext] Excluindo lançamento:", id);

      // Carregar lançamentos existentes
      const lancamentosExistentes = JSON.parse(
        localStorage.getItem("lancamentos_caixa") || "[]",
      );

      // Filtrar para remover o lançamento
      const lancamentosFiltrados = lancamentosExistentes.filter(
        (lancamento: any) => lancamento.id !== id,
      );

      // Salvar no localStorage
      localStorage.setItem(
        "lancamentos_caixa",
        JSON.stringify(lancamentosFiltrados),
      );

      // Recarregar lançamentos
      await carregarLancamentosLocalStorage();

      console.log("[CaixaContext] Lançamento excluído com sucesso:", id);
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      setError("Erro ao excluir lançamento");
      throw error;
    }
  };

  const adicionarCampanha = async (novaCampanha: Omit<Campanha, "id">) => {
    try {
      setError(null);

      console.log("[CaixaContext] Adicionando campanha:", novaCampanha);

      // Tentar criar no servidor primeiro
      try {
        const response = await fetch("/api/campanhas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(novaCampanha),
        });

        if (response.ok) {
          const campanhaServidor = await response.json();
          console.log(
            "✅ [CaixaContext] Campanha criada no servidor:",
            campanhaServidor,
          );

          // Recarregar campanhas do servidor para sincronizar
          await carregarDados();
          return;
        } else {
          throw new Error("Erro ao salvar no servidor");
        }
      } catch (serverError) {
        console.warn(
          "Servidor indisponível, salvando campanha localmente:",
          serverError,
        );

        // Fallback: salvar apenas no localStorage
        const campanha: Campanha = {
          ...novaCampanha,
          id: `campanha-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        // Carregar campanhas existentes
        const campanhasExistentes = JSON.parse(
          localStorage.getItem("campanhas") || "[]",
        );

        // Adicionar a nova campanha
        const novasCampanhas = [...campanhasExistentes, campanha];

        // Salvar no localStorage
        localStorage.setItem("campanhas", JSON.stringify(novasCampanhas));

        // Atualizar estado
        setCampanhas(novasCampanhas);

        console.log("[CaixaContext] Campanha salva localmente:", campanha.id);
      }
    } catch (error) {
      console.error("Erro ao adicionar campanha:", error);
      throw error;
    }
  };

  // Função helper para verificar se é boleto
  const isBoleto = (lancamento: any) => {
    // Se formaPagamento é um objeto com nome
    if (
      typeof lancamento.formaPagamento === "object" &&
      lancamento.formaPagamento?.nome
    ) {
      const nome = lancamento.formaPagamento.nome.toLowerCase();
      return nome.includes("boleto") || nome.includes("bancário");
    }

    // Se formaPagamento é string, assumir que é nome direto
    if (typeof lancamento.formaPagamento === "string") {
      const nome = lancamento.formaPagamento.toLowerCase();
      return nome.includes("boleto") || nome.includes("bancário");
    }

    return false;
  };

  // Calcular totais baseados nos lançamentos carregados
  const totais = React.useMemo(() => {
    const receitasCompletas = lancamentos.filter((l) => l.tipo === "receita");

    // Separar boletos usando função helper
    const receitasBoleto = receitasCompletas.filter(isBoleto);
    const receitasNaoBoleto = receitasCompletas.filter((l) => !isBoleto(l));

    // Calcular totais
    const receitaBruta = receitasCompletas.reduce(
      (total, l) => total + l.valor,
      0,
    );

    // Receitas líquidas (para compatibilidade com versão anterior)
    const receitaLiquida = receitasNaoBoleto.reduce(
      (total, l) => total + (l.valorLiquido || l.valor),
      0,
    );

    // Receitas efetivamente para a empresa (principal mudança)
    const receitasParaEmpresa = receitasNaoBoleto.reduce((total, l) => {
      // Se tem valorParaEmpresa definido, use
      if (l.valorParaEmpresa !== undefined) {
        return total + l.valorParaEmpresa;
      }

      // Fallback para lançamentos antigos: calcular valor para empresa
      const valorLiquido = l.valorLiquido || l.valor;
      const comissao = l.comissao || 0;
      const valorParaEmpresaCalculado = valorLiquido - comissao;

      return total + valorParaEmpresaCalculado;
    }, 0);

    const boletos = receitasBoleto.reduce((total, l) => total + l.valor, 0);

    const despesas = lancamentos
      .filter((l) => l.tipo === "despesa")
      .reduce((total, l) => total + l.valor, 0);

    const comissoes = receitasNaoBoleto
      .filter((l) => l.comissao)
      .reduce((total, l) => total + (l.comissao || 0), 0);

    return {
      receitas: receitasParaEmpresa, // Agora usa valor para empresa
      receitaBruta,
      receitaLiquida,
      receitasParaEmpresa, // Novo campo
      boletos,
      despesas,
      saldo: receitasParaEmpresa - despesas, // Saldo baseado no valor para empresa
      comissoes,
    };
  }, [lancamentos]);

  const value = {
    lancamentos,
    campanhas,
    filtros,
    totais,
    adicionarLancamento,
    editarLancamento,
    excluirLancamento,
    adicionarCampanha,
    setFiltros,
    carregarDados,
    isLoading,
    error,
  };

  return (
    <CaixaContext.Provider value={value}>{children}</CaixaContext.Provider>
  );
}

export function useCaixa() {
  const context = useContext(CaixaContext);
  if (context === undefined) {
    throw new Error("useCaixa must be used within a CaixaProvider");
  }
  return context;
}
