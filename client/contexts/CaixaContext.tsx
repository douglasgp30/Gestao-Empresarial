import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
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

      console.log("📊 [CaixaContext] Carregando campanhas...");

      // Fazer requisição com timeout simples
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 10000),
      );

      const fetchPromise = fetch("/api/campanhas", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;
      console.log("📊 [CaixaContext] Response status:", response.status);

      if (response.ok) {
        const campanhasServidor = await response.json();
        console.log(
          "���� [CaixaContext] Campanhas carregadas do servidor:",
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
            "�� [CaixaContext] Timeout ao carregar campanhas do servidor",
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

      console.log("��� [CaixaContext] Carregando dados do banco de dados...");

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
          console.log(
            "⚠️ [CaixaContext] Dados carregados do localStorage (migração pendente)",
          );
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

  // Função para carregar lançamentos do banco de dados
  const carregarLancamentosDoBanco = async () => {
    try {
      console.log(
        "📦 [CaixaContext] Carregando lançamentos do banco de dados...",
      );

      // Construir query params com filtros atuais
      const params = new URLSearchParams();

      if (filtros.dataInicio) {
        params.append(
          "dataInicio",
          filtros.dataInicio.toISOString().split("T")[0],
        );
      }
      if (filtros.dataFim) {
        params.append("dataFim", filtros.dataFim.toISOString().split("T")[0]);
      }
      if (filtros.tipo && filtros.tipo !== "todos") {
        params.append("tipo", filtros.tipo);
      }

      const url = `/api/caixa?${params.toString()}`;
      console.log("📦 [CaixaContext] URL da requisição:", url);

      const response = await fetch(url);

      console.log("📦 [CaixaContext] Status da resposta:", response.status);
      console.log("📦 [CaixaContext] Headers da resposta:", [
        ...response.headers.entries(),
      ]);

      // Verificar se o content-type é JSON antes de tentar ler
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error(
          "📦 [CaixaContext] Resposta não é JSON:",
          responseText.substring(0, 200),
        );
        throw new Error(
          `Resposta não é JSON. Content-Type: ${contentType}. Resposta: ${responseText.substring(0, 100)}...`,
        );
      }

      // Tentar fazer parse da resposta JSON
      let lancamentosDoBanco;
      try {
        lancamentosDoBanco = await response.json();
      } catch (parseError) {
        console.error(
          "📦 [CaixaContext] Erro ao fazer parse do JSON:",
          parseError,
        );
        throw new Error(`Erro ao fazer parse da resposta JSON: ${parseError}`);
      }

      // Verificar se a resposta foi bem sucedida após fazer o parse
      if (!response.ok) {
        console.error(
          "📦 [CaixaContext] Erro na resposta:",
          lancamentosDoBanco,
        );
        const errorMessage =
          lancamentosDoBanco?.message ||
          lancamentosDoBanco?.error ||
          "Erro desconhecido";
        throw new Error(
          `Erro ao carregar lançamentos: ${response.status} - ${errorMessage}`,
        );
      }

      // Converter datas para objetos Date
      const lancamentosFormatados = lancamentosDoBanco.map(
        (lancamento: any) => ({
          ...lancamento,
          data: new Date(lancamento.dataHora),
          dataHora: new Date(lancamento.dataHora),
          dataCriacao: new Date(lancamento.dataHora),
          // Mapear campos do banco para o formato esperado pelo frontend
          id: lancamento.id.toString(),

          // Técnico/Funcionário - mapear para ambos os campos
          funcionario: lancamento.funcionario
            ? {
                id: lancamento.funcionario.id?.toString(),
                nome: lancamento.funcionario.nome,
                percentualComissao:
                  lancamento.funcionario.percentualComissao ||
                  lancamento.funcionario.percentualServico,
              }
            : undefined,
          tecnicoResponsavel: lancamento.funcionario
            ? {
                id: lancamento.funcionario.id,
                nome: lancamento.funcionario.nome,
              }
            : undefined,

          // Forma de pagamento
          formaPagamento: lancamento.formaPagamento
            ? {
                id: lancamento.formaPagamento.id,
                nome: lancamento.formaPagamento.nome,
              }
            : undefined,

          // Cliente
          cliente: lancamento.cliente
            ? {
                id: lancamento.cliente.id,
                nome: lancamento.cliente.nome,
              }
            : undefined,

          // Campanha
          campanha: lancamento.campanha
            ? {
                id: lancamento.campanha.id,
                nome: lancamento.campanha.nome,
              }
            : undefined,

          // Localização/Setor - mapear para ambos os campos
          localizacao: lancamento.localizacao
            ? {
                id: lancamento.localizacao.id?.toString(),
                nome: lancamento.localizacao.nome,
                cidade: lancamento.localizacao.cidade,
              }
            : undefined,
          setor: lancamento.localizacao
            ? {
                id: lancamento.localizacao.id?.toString(),
                nome: lancamento.localizacao.nome,
                cidade: lancamento.localizacao.cidade,
              }
            : undefined,

          // Categoria e descrição com fallback melhorado
          categoria:
            lancamento.descricaoECategoria?.categoria ||
            lancamento.descricao?.categoria ||
            "Serviços",
          descricao: {
            nome:
              lancamento.descricaoECategoria?.nome ||
              lancamento.descricao?.nome ||
              "Serviço",
          },
        }),
      );

      // Debug: verificar dados processados
      console.log("🔍 [DEBUG] Lançamentos formatados:", lancamentosFormatados.map(l => ({
        id: l.id,
        descricao: l.descricao,
        categoria: l.categoria
      })));

      setLancamentos(lancamentosFormatados);
      console.log(
        `📦 [CaixaContext] ${lancamentosFormatados.length} lançamentos carregados do banco`,
      );
    } catch (error) {
      console.error("Erro ao carregar lançamentos do banco:", error);
      throw error;
    }
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
        console.log("���� [CaixaContext] Dados migrados com sucesso");
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

  // Carregar dados na inicialização - versão otimizada
  useEffect(() => {
    if (typeof window === "undefined") {
      console.log("[CaixaContext] Servidor - pulando carregamento inicial");
      return;
    }

    // Carregar apenas uma vez na inicialização
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log("[CaixaContext] Carregamento inicial executado");
        carregarDados();
      }
    }, 500); // Tempo reduzido para melhor experiência

    return () => {
      mounted = false;
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

  // Recarregar lançamentos quando os filtros mudarem - corrigido para evitar loop
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Debounce para evitar múltiplos lançamentos rápidos
    const timeoutId = setTimeout(() => {
      if (isFetchingRef.current) {
        console.log("[CaixaContext] fetch já em andamento, ignorando");
        return;
      }
      isFetchingRef.current = true;
      console.log("[CaixaContext] Recarregando por mudança de filtros");
      carregarDados()
        .catch((err) =>
          console.error("[CaixaContext] erro carregarDados:", err),
        )
        .finally(() => {
          isFetchingRef.current = false;
        });
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [filtrosDependencias]); // REMOVIDO isLoading e isCarregando das dependências

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

      console.log(
        "[CaixaContext] Adicionando lançamento via API:",
        novoLancamento,
      );

      // Preparar dados para a API
      const dadosParaAPI = {
        valor: novoLancamento.valor || 0,
        valorRecebido:
          novoLancamento.valorQueEntrou ||
          novoLancamento.valorLiquido ||
          novoLancamento.valor,
        valorLiquido: novoLancamento.valorLiquido || novoLancamento.valor,
        comissao: novoLancamento.comissao || 0,
        imposto: novoLancamento.imposto || 0,
        observacoes: novoLancamento.observacoes || "",
        numeroNota: novoLancamento.numeroNota || "",
        tipo: novoLancamento.tipo || "receita",
        data: novoLancamento.data
          ? new Date(novoLancamento.data).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],

        // Categoria e descrição
        categoria: novoLancamento.categoria || "Serviços",
        descricao:
          typeof novoLancamento.descricao === "object" &&
          novoLancamento.descricao?.nome
            ? novoLancamento.descricao.nome
            : typeof novoLancamento.descricao === "string"
              ? novoLancamento.descricao
              : "Serviço",

        // IDs dos relacionamentos
        formaPagamentoId: extrairIdParaAPI(
          novoLancamento.formaPagamento,
          novoLancamento.formaPagamentoId,
        ),
        funcionarioId: extrairIdParaAPI(
          novoLancamento.tecnicoResponsavel,
          novoLancamento.tecnicoResponsavelId,
        ),
        setorId: extrairIdParaAPI(novoLancamento.setor, novoLancamento.setorId),
        campanhaId: extrairIdParaAPI(
          novoLancamento.campanha,
          novoLancamento.campanhaId,
        ),
        clienteId: extrairIdParaAPI(
          novoLancamento.cliente,
          novoLancamento.clienteId,
        ),
      };

      console.log("[CaixaContext] Dados preparados para API:", dadosParaAPI);

      // Enviar para a API usando rota alternativa para evitar conflito de body stream
      const response = await fetch("/api/caixa/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosParaAPI),
      });

      // Verificar se a resposta está ok primeiro
      if (!response.ok) {
        let errorMessage = `Erro ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch {
            // Se não conseguir ler nada, usar mensagem padrão
          }
        }
        throw new Error(`Erro na API: ${errorMessage}`);
      }

      // Se resposta ok, tentar fazer parse do JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error(
          "[CaixaContext] Erro ao fazer parse do JSON:",
          parseError,
        );
        throw new Error(`Erro ao processar resposta da API`);
      }

      const lancamentoCriado = responseData;
      console.log(
        "[CaixaContext] Lançamento criado com sucesso:",
        lancamentoCriado.id,
      );

      // Recarregar dados após criação
      await carregarDados();
    } catch (error) {
      console.error("Erro ao adicionar lançamento:", error);
      throw error;
    }
  };

  // Função auxiliar para extrair ID para API
  const extrairIdParaAPI = (objeto: any, idFallback: any) => {
    if (!objeto && !idFallback) return undefined;

    // Se é objeto, tentar extrair o ID
    if (typeof objeto === "object" && objeto?.id) {
      const id = parseInt(objeto.id);
      return isNaN(id) ? undefined : id;
    }

    // Se é string/número, tentar converter
    if (objeto) {
      const id = parseInt(objeto);
      return isNaN(id) ? undefined : id;
    }

    // Fallback para o ID direto
    if (idFallback) {
      const id = parseInt(idFallback);
      return isNaN(id) ? undefined : id;
    }

    return undefined;
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

  // Memoizar funções para estabilizar referências e evitar re-renders
  const carregarDadosCb = useCallback(() => carregarDados(), []);
  const adicionarLancamentoCb = useCallback(
    (novo) => adicionarLancamento(novo),
    [],
  );
  const editarLancamentoCb = useCallback(
    (id, dados) => editarLancamento(id, dados),
    [],
  );
  const excluirLancamentoCb = useCallback((id) => excluirLancamento(id), []);
  const adicionarCampanhaCb = useCallback((c) => adicionarCampanha(c), []);

  // Memoizar value para evitar re-renderizações desnecessárias em todos os consumidores
  const value = useMemo(
    () => ({
      lancamentos,
      campanhas,
      filtros,
      totais,
      adicionarLancamento: adicionarLancamentoCb,
      editarLancamento: editarLancamentoCb,
      excluirLancamento: excluirLancamentoCb,
      adicionarCampanha: adicionarCampanhaCb,
      setFiltros,
      carregarDados: carregarDadosCb,
      isLoading,
      error,
      filtrosDependencias, // Expor para componentes filhos evitarem JSON.stringify
    }),
    [
      lancamentos,
      campanhas,
      filtrosDependencias, // Usar string memoizada em vez do objeto filtros
      totais,
      adicionarLancamentoCb,
      editarLancamentoCb,
      excluirLancamentoCb,
      adicionarCampanhaCb,
      carregarDadosCb,
      isLoading,
      error,
    ],
  );

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
