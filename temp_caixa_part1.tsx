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

