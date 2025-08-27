import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  useRef,
} from "react";
import { toast } from "sonner";
import {
  Descricao,
  Categoria,
  DescricaoECategoria,
  FormaPagamento,
  Cliente,
  Fornecedor,
  LocalizacaoGeografica,
} from "@shared/types";
// 🚫 REMOVIDO: Importação de dados padrão removida conforme solicitação do usuário
import { normalizeString } from "../lib/stringUtils";
import { useFuncionarios } from "./FuncionariosContext";

interface EntidadesContextType {
  // Tabela unificada de descrições e categorias
  descricoesECategorias: DescricaoECategoria[];
  adicionarDescricaoECategoria: (
    item: Omit<DescricaoECategoria, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarDescricaoECategoria: (
    id: string,
    item: Partial<DescricaoECategoria>,
  ) => Promise<void>;
  excluirDescricaoECategoria: (id: string) => Promise<void>;

  // Funções de conveniência para filtrar a tabela unificada
  getCategorias: (tipo?: "receita" | "despesa") => DescricaoECategoria[];
  getDescricoes: (
    tipo?: "receita" | "despesa",
    categoria?: string,
  ) => DescricaoECategoria[];

  // Localização geográfica
  localizacoesGeograficas: LocalizacaoGeografica[];
  getCidades: () => LocalizacaoGeografica[];
  getSetores: (cidade?: string) => LocalizacaoGeografica[];
  criarLocalizacaoGeografica: (
    localizacao: Omit<LocalizacaoGeografica, "id" | "dataCriacao">,
  ) => Promise<void>;
  atualizarLocalizacaoGeografica: (
    id: number,
    localizacao: Partial<LocalizacaoGeografica>,
  ) => Promise<void>;
  excluirLocalizacaoGeografica: (id: number) => Promise<void>;
  sincronizarLocalizacoes: () => Promise<void>;

  // Formas de pagamento
  formasPagamento: FormaPagamento[];
  criarFormaPagamento: (forma: Omit<FormaPagamento, "id">) => Promise<void>;
  atualizarFormaPagamento: (
    id: string,
    forma: Partial<FormaPagamento>,
  ) => Promise<void>;
  excluirFormaPagamento: (id: string) => Promise<void>;

  // Dados para compatibilidade com componentes antigos
  descricoes: Descricao[];
  categorias: Categoria[];
  funcionarios: any[];
  tecnicos: any[];
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  cidades: string[];
  setores: LocalizacaoGeografica[];

  // Função para obter técnicos combinados
  getTecnicos: () => any[];

  // Estados de carregamento
  isLoading: boolean;
  error: string | null;
  carregarDados: () => Promise<void>;
  recarregarDescricoesECategorias: () => Promise<void>;
}

const EntidadesContext = createContext<EntidadesContextType | undefined>(
  undefined,
);

// === FUNÇÕES UTILITÁRIAS ===
function salvarEntidadeNoStorage<T>(chave: string, dados: T[]): void {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
  } catch (error) {
    console.error(`Erro ao salvar ${chave} no localStorage:`, error);
  }
}

function carregarEntidadeDoStorage<T>(
  chave: string,
  dadosPadrao: T[] = [],
): T[] {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : dadosPadrao;
  } catch (error) {
    console.error(`Erro ao carregar ${chave} do localStorage:`, error);
    return dadosPadrao;
  }
}

export function EntidadesProvider({ children }: { children: ReactNode }) {
  // === INTEGRAÇÃO COM FUNCIONARIOS CONTEXT ===
  const { funcionarios: funcionariosDoContexto } = useFuncionarios();

  // === ESTADOS PRINCIPAIS ===
  const [descricoesECategorias, setDescricoesECategorias] = useState<
    DescricaoECategoria[]
  >([]);
  const [descricoes, setDescricoes] = useState<Descricao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [localizacoesGeograficas, setLocalizacoesGeograficas] = useState<
    LocalizacaoGeografica[]
  >([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inicializado = useRef(false);

  // �� REMOVIDO: Criação automática de dados fictícios conforme solicitado pelo usuário
  const criarDadosBasicos = useCallback(() => {
    console.log(
      "✅ [EntidadesContext] Sistema vazio - Nenhum dado fictício será criado",
    );

    // Apenas inicializar arrays vazios - usuário deve criar seus próprios dados
    setDescricoesECategorias([]);
    setLocalizacoesGeograficas([]);
    setFormasPagamento([]);
  }, []);

  // === CARREGAMENTO DOS DADOS ===
  const carregarDados = useCallback(async () => {
    try {
      console.log("📂 [EntidadesContext] Carregando dados do localStorage...");
      setIsLoading(true);
      setError(null);

      // Carregar descrições e categorias
      const descricoesStorage = localStorage.getItem("descricoes_e_categorias");
      if (descricoesStorage) {
        const parsed = JSON.parse(descricoesStorage);
        const arrayParsed = Array.isArray(parsed) ? parsed : [];
        setDescricoesECategorias(arrayParsed);
        console.log(
          `📂 [EntidadesContext] ${arrayParsed.length} descrições/categorias carregadas`,
        );
      } else {
        console.log(
          "���� [EntidadesContext] Descrições não encontradas, criando dados básicos",
        );
        criarDadosBasicos();
        return; // Sair aqui pois criarDadosBasicos já carrega tudo
      }

      // Carregar formas de pagamento
      await carregarFormasPagamentoDaAPI();

      // Carregar localizações geográficas
      const localizacoesStorage = localStorage.getItem(
        "localizacoes_geograficas",
      );
      if (localizacoesStorage) {
        const localizacoesParsed = JSON.parse(localizacoesStorage);
        setLocalizacoesGeograficas(localizacoesParsed);
        console.log(
          `📂 [EntidadesContext] ${localizacoesParsed.length} localizações carregadas`,
        );
      } else {
        setLocalizacoesGeograficas([]);
      }

      console.log("✅ [EntidadesContext] Carregamento concluído");
    } catch (error) {
      console.error("Erro ao carregar dados do EntidadesContext:", error);
      setError("Erro ao carregar dados");
      // Em caso de erro, criar dados básicos
      criarDadosBasicos();
    } finally {
      setIsLoading(false);
    }
  }, [criarDadosBasicos]);

  // === FUNÇÃO ESPECÍFICA PARA CARREGAR FORMAS DE PAGAMENTO DA API ===
  const carregarFormasPagamentoDaAPI = useCallback(async () => {
    try {
      console.log(
        "🔄 [EntidadesContext] Carregando formas de pagamento da API...",
      );

      try {
        // Primeiro tentar buscar do servidor
        const response = await fetch("/api/formas-pagamento");
        if (response.ok) {
          const formasServidor = await response.json();

          // Dedupliar formas de pagamento por nome (case insensitive) - extra safety
          const formasUnicas = formasServidor.reduce((acc, forma) => {
            const existing = acc.find(f => f.nome.toLowerCase() === forma.nome.toLowerCase());
            if (!existing || forma.id < existing.id) {
              // Remove o existente se houver e adiciona o atual (menor ID = mais antigo)
              const filtered = acc.filter(f => f.nome.toLowerCase() !== forma.nome.toLowerCase());
              filtered.push(forma);
              return filtered;
            }
            return acc;
          }, []);

          console.log(
            `🌐 [EntidadesContext] ${formasServidor.length} formas da API, ${formasUnicas.length} únicas após deduplicação`,
          );

          setFormasPagamento(formasUnicas);

          // Salvar no localStorage para cache
          try {
            localStorage.setItem(
              "formas_pagamento",
              JSON.stringify(formasServidor),
            );
            console.log(
              "💾 [EntidadesContext] Formas de pagamento sincronizadas no localStorage",
            );
          } catch (storageError) {
            console.warn(
              "⚠️ [EntidadesContext] Erro ao salvar formas de pagamento no localStorage:",
              storageError,
            );
          }

          return;
        } else {
          console.warn(
            "⚠️ [EntidadesContext] Servidor retornou erro para formas de pagamento, usando localStorage como fallback",
          );
        }
      } catch (fetchError) {
        console.warn(
          "⚠️ [EntidadesContext] Erro ao conectar com servidor para formas de pagamento, usando localStorage como fallback:",
          fetchError,
        );
      }

      // Fallback: carregar do localStorage se servidor falhar
      const formasStorage = localStorage.getItem("formas_pagamento");
      if (formasStorage) {
        const formasParsed = JSON.parse(formasStorage);

        // Dedupliar formas de pagamento por nome (case insensitive)
        const formasUnicas = formasParsed.reduce((acc, forma) => {
          const existing = acc.find(f => f.nome.toLowerCase() === forma.nome.toLowerCase());
          if (!existing || forma.id < existing.id) {
            // Remove o existente se houver e adiciona o atual (menor ID = mais antigo)
            const filtered = acc.filter(f => f.nome.toLowerCase() !== forma.nome.toLowerCase());
            filtered.push(forma);
            return filtered;
          }
          return acc;
        }, []);

        setFormasPagamento(formasUnicas);
        console.log(
          `💾 [EntidadesContext] ${formasParsed.length} formas no localStorage, ${formasUnicas.length} únicas após deduplicação`,
        );
      } else {
        console.log(
          "📭 [EntidadesContext] Nenhuma forma de pagamento encontrada no localStorage",
        );
        setFormasPagamento([]);
      }
    } catch (error) {
      console.error(
        "❌ [EntidadesContext] Erro ao carregar formas de pagamento:",
        error,
      );
      setFormasPagamento([]);
    }
  }, []);

  // === FUNÇÃO ESPECÍFICA PARA RECARREGAR DESCRIÇÕES E CATEGORIAS ===
  const recarregarDescricoesECategorias = useCallback(async () => {
    try {
      console.log(
        "🔄 [EntidadesContext] Recarregando descrições e categorias do servidor...",
      );
      setError(null);

      try {
        // Primeiro tentar buscar do servidor
        const response = await fetch("/api/descricoes-e-categorias");
        if (response.ok) {
          const result = await response.json();
          const dadosServidor = result.data || result || [];

          console.log(
            `🌐 [EntidadesContext] ${dadosServidor.length} descrições/categorias carregadas do servidor`,
          );

          setDescricoesECategorias(dadosServidor);

          // Salvar no localStorage para cache
          try {
            localStorage.setItem(
              "descricoes_e_categorias",
              JSON.stringify(dadosServidor),
            );
            console.log(
              "💾 [EntidadesContext] Dados sincronizados no localStorage",
            );
          } catch (storageError) {
            console.warn(
              "⚠️ [EntidadesContext] Erro ao salvar no localStorage:",
              storageError,
            );
          }

          return;
        } else {
          console.warn(
            "⚠️ [EntidadesContext] Servidor retornou erro, usando localStorage como fallback",
          );
        }
      } catch (fetchError) {
        console.warn(
          "⚠️ [EntidadesContext] Erro ao conectar com servidor, usando localStorage como fallback:",
          fetchError,
        );
      }

      // Fallback: carregar do localStorage se servidor falhar
      const descricoesStorage = localStorage.getItem("descricoes_e_categorias");
      if (descricoesStorage) {
        const parsed = JSON.parse(descricoesStorage);
        const arrayParsed = Array.isArray(parsed) ? parsed : [];
        setDescricoesECategorias(arrayParsed);
        console.log(
          `💾 [EntidadesContext] ${arrayParsed.length} descrições/categorias recarregadas do localStorage (fallback)`,
        );
      } else {
        console.log(
          "📭 [EntidadesContext] Nenhuma descrição encontrada no localStorage",
        );
        setDescricoesECategorias([]);
      }
    } catch (error) {
      console.error(
        "❌ [EntidadesContext] Erro ao recarregar descrições e categorias:",
        error,
      );
      setError("Erro ao recarregar descrições e categorias");
      throw error;
    }
  }, []);

  // === FUNÇÕES PARA TABELA UNIFICADA (MEMOIZADAS) ===
  const getCategorias = useCallback(
    (tipo?: "receita" | "despesa") => {
      if (!Array.isArray(descricoesECategorias)) {
        return [];
      }
      return descricoesECategorias.filter(
        (item) =>
          item.tipoItem === "categoria" &&
          item.ativo &&
          (tipo ? item.tipo === tipo : true),
      );
    },
    [descricoesECategorias],
  );

  const getDescricoes = useCallback(
    (tipo?: "receita" | "despesa", categoria?: string) => {
      if (!Array.isArray(descricoesECategorias)) {
        return [];
      }
      return descricoesECategorias.filter(
        (item) =>
          item.tipoItem === "descricao" &&
          item.ativo &&
          (tipo ? item.tipo === tipo : true) &&
          (categoria ? item.categoria === categoria : true),
      );
    },
    [descricoesECategorias],
  );

  // === FUNÇÕES PARA LOCALIZAÇÃO GEOGRÁFICA (MEMOIZADAS) ===
  const getCidades = useCallback(() => {
    return localizacoesGeograficas.filter(
      (item) => item.tipoItem === "cidade" && item.ativo,
    );
  }, [localizacoesGeograficas]);

  const getSetores = useCallback(
    (cidade?: string) => {
      return localizacoesGeograficas.filter(
        (item) =>
          item.tipoItem === "setor" &&
          item.ativo === true &&
          (cidade ? item.cidade === cidade : true),
      );
    },
    [localizacoesGeograficas],
  );

  // === FUNÇÕES PARA COMPATIBILIDADE COM COMPONENTES ANTIGOS ===
  const cidades = useMemo(() => {
    const cidadesAtivas = getCidades();
    return cidadesAtivas.map((cidade) => cidade.nome);
  }, [getCidades]);

  const setores = useMemo(() => {
    return getSetores();
  }, [getSetores]);

  const getTecnicos = useCallback(() => {
    console.log("🔍 [EntidadesContext] getTecnicos called");
    console.log("  - tecnicos state:", tecnicos?.length || 0, tecnicos);
    console.log("  - funcionarios state:", funcionarios?.length || 0, funcionarios);
    console.log("  - funcionariosDoContexto:", funcionariosDoContexto?.length || 0, funcionariosDoContexto);

    // Use funcionariosDoContexto directly if it has data, fallback to local funcionarios
    const sourceData = (funcionariosDoContexto && funcionariosDoContexto.length > 0)
      ? funcionariosDoContexto
      : funcionarios;

    console.log("  - Using source data:", sourceData?.length || 0);

    const tecnicosEspecificos = tecnicos || [];
    const funcionariosTecnicos = (sourceData || []).filter((func) => {
      if (func.ehTecnico) return true;
      const tipo = (func.tipoAcesso || "").toString();
      const tipoNormalized =
        tipo
          .normalize?.("NFD")
          ?.replace(/[\u0300-\u036f]/g, "")
          ?.toLowerCase() || tipo.toLowerCase();
      return tipoNormalized === "tecnico";
    });

    console.log("  - funcionariosTecnicos found:", funcionariosTecnicos?.length || 0, funcionariosTecnicos);

    const tecnicosCombinados = [...tecnicosEspecificos];
    funcionariosTecnicos.forEach((funcTecnico) => {
      if (!tecnicosCombinados.find((t) => t.id === funcTecnico.id)) {
        tecnicosCombinados.push(funcTecnico);
      }
    });

    const result = tecnicosCombinados.filter((t) => t.id && t.id !== 0);
    console.log("  - final result:", result?.length || 0, result);

    return result;
  }, [funcionarios, tecnicos, funcionariosDoContexto]);

  // === SINCRONIZAÇÃO DOS ESTADOS LEGADOS ===
  // Sincronizar descrições e categorias legadas com a estrutura unificada
  useEffect(() => {
    if (Array.isArray(descricoesECategorias)) {
      // Extrair descrições (tipoItem === "descricao")
      const descricoesLegadas = descricoesECategorias
        .filter((item) => item.tipoItem === "descricao" && item.ativo)
        .map((item) => ({
          id: item.id,
          nome: item.nome,
          tipo: item.tipo,
          categoria: item.categoria,
          ativo: item.ativo,
          dataCriacao: item.dataCriacao,
        }));

      // Extrair categorias (tipoItem === "categoria")
      const categoriasLegadas = descricoesECategorias
        .filter((item) => item.tipoItem === "categoria" && item.ativo)
        .map((item) => ({
          id: item.id,
          nome: item.nome,
          tipo: item.tipo,
          ativo: item.ativo,
          dataCriacao: item.dataCriacao,
        }));

      setDescricoes(descricoesLegadas);
      setCategorias(categoriasLegadas);

      console.log(
        `🔄 [EntidadesContext] Estados legados sincronizados: ${descricoesLegadas.length} descrições, ${categoriasLegadas.length} categorias`,
      );
    }
  }, [descricoesECategorias]);

  // === SINCRONIZAÇÃO COM FUNCIONARIOS CONTEXT ===
  useEffect(() => {
    console.log("🔄 [EntidadesContext] Sync effect triggered, funcionariosDoContexto:", funcionariosDoContexto?.length || 0);

    if (funcionariosDoContexto && funcionariosDoContexto.length > 0) {
      console.log("📋 [EntidadesContext] Funcionários do contexto:", funcionariosDoContexto);
      setFuncionarios(funcionariosDoContexto);

      const tecnicosFiltrados = funcionariosDoContexto.filter((f) => {
        const isTechnician = f.ehTecnico || f.tipoAcesso === "Técnico";
        console.log(`  - ${f.nomeCompleto}: ehTecnico=${f.ehTecnico}, tipoAcesso=${f.tipoAcesso}, isTechnician=${isTechnician}`);
        return isTechnician;
      });
      setTecnicos(tecnicosFiltrados);

      console.log(
        `🔄 [EntidadesContext] Funcionários sincronizados: ${funcionariosDoContexto.length} total, ${tecnicosFiltrados.length} técnicos`,
      );
      console.log("👥 [EntidadesContext] Técnicos encontrados:", tecnicosFiltrados.map(t => `${t.nomeCompleto} (ID: ${t.id})`));

      // Backup no localStorage
      try {
        localStorage.setItem(
          "funcionarios",
          JSON.stringify(funcionariosDoContexto),
        );
      } catch (error) {
        console.warn("Erro ao salvar funcionários no localStorage:", error);
      }
    } else {
      console.log("⚠️ [EntidadesContext] Nenhum funcionário para sincronizar");
    }
  }, [funcionariosDoContexto]);

  // === CARREGAMENTO INICIAL IMEDIATO E ÚNICO ===
  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    console.log("🚀 [EntidadesContext] INICIALIZAÇÃO IMEDIATA");

    // FORÇAR carregamento SÍNCRONO e imediato, mas também buscar do banco
    const carregamentoCompleto = async () => {
      try {
        console.log("📂 [EntidadesContext] Carregando dados...");

        // Carregar descrições e categorias
        const descricoesStorage = localStorage.getItem(
          "descricoes_e_categorias",
        );
        if (descricoesStorage) {
          const parsed = JSON.parse(descricoesStorage);
          const arrayParsed = Array.isArray(parsed) ? parsed : [];
          setDescricoesECategorias(arrayParsed);
          console.log(
            `📂 [EntidadesContext] ${arrayParsed.length} descrições/categorias carregadas`,
          );
        } else {
          console.log(
            "📂 [EntidadesContext] Descrições não encontradas, sistema vazio",
          );
          setDescricoesECategorias([]);
        }

        // Carregar descrições e categorias DA API
        await recarregarDescricoesECategorias();

        // Carregar formas de pagamento DA API
        await carregarFormasPagamentoDaAPI();

        // Carregar localizações geográficas DO BANCO
        try {
          const response = await fetch("/api/localizacoes-geograficas");
          if (response.ok) {
            const localizacoes = await response.json();
            setLocalizacoesGeograficas(localizacoes);
            console.log(
              `🌐 [EntidadesContext] ${localizacoes.length} localizações carregadas do banco`,
            );
          } else {
            console.warn(
              "⚠️ [EntidadesContext] Erro ao buscar localizações do banco",
            );
            setLocalizacoesGeograficas([]);
          }
        } catch (fetchError) {
          console.warn(
            "���️ [EntidadesContext] Erro de conexão ao buscar localizações:",
            fetchError,
          );
          setLocalizacoesGeograficas([]);
        }

        console.log("✅ [EntidadesContext] Carregamento imediato concluído");
      } catch (error) {
        console.error("Erro ao carregar dados do EntidadesContext:", error);
        setError("Erro ao carregar dados");
        // Sistema vazio em caso de erro
        setDescricoesECategorias([]);
        setLocalizacoesGeograficas([]);
        setFormasPagamento([]);
      }
    };

    carregamentoCompleto();
  }, []);

  // === FUNÇÕES PARA DESCRIÇÕES E CATEGORIAS ===
  const criarDescricaoOuCategoria = useCallback(async (novoItem: any) => {
    try {
      console.log(
        "📦 [EntidadesContext] Criando descrição ou categoria:",
        novoItem,
      );

      const novoId = Date.now().toString();
      const itemCompleto = {
        ...novoItem,
        id: novoId,
        dataCriacao: new Date().toISOString(),
      };

      setDescricoesECategorias((prev) => {
        const novaLista = [...prev, itemCompleto];
        try {
          localStorage.setItem(
            "descricoes_e_categorias",
            JSON.stringify(novaLista),
          );
        } catch (error) {
          console.error("Erro ao salvar no localStorage:", error);
        }
        return novaLista;
      });

      return Promise.resolve();
    } catch (error) {
      console.error("❌ [EntidadesContext] Erro ao criar item:", error);
      throw error;
    }
  }, []);

  const atualizarDescricaoOuCategoria = useCallback(
    async (id: string, dadosAtualizados: any) => {
      try {
        console.log(
          "📦 [EntidadesContext] Atualizando descrição ou categoria:",
          id,
          dadosAtualizados,
        );

        setDescricoesECategorias((prev) => {
          const novaLista = prev.map((item) =>
            item.id === id ? { ...item, ...dadosAtualizados } : item,
          );

          try {
            localStorage.setItem(
              "descricoes_e_categorias",
              JSON.stringify(novaLista),
            );
          } catch (error) {
            console.error("Erro ao salvar no localStorage:", error);
          }

          return novaLista;
        });

        return Promise.resolve();
      } catch (error) {
        console.error("❌ [EntidadesContext] Erro ao atualizar item:", error);
        throw error;
      }
    },
    [],
  );

  const excluirDescricaoOuCategoria = useCallback(async (id: string) => {
    try {
      console.log(
        "📦 [EntidadesContext] Excluindo descrição ou categoria:",
        id,
      );

      setDescricoesECategorias((prev) => {
        const novaLista = prev.filter((item) => item.id !== id);

        try {
          localStorage.setItem(
            "descricoes_e_categorias",
            JSON.stringify(novaLista),
          );
        } catch (error) {
          console.error("Erro ao salvar no localStorage:", error);
        }

        return novaLista;
      });

      return Promise.resolve();
    } catch (error) {
      console.error("❌ [EntidadesContext] Erro ao excluir item:", error);
      throw error;
    }
  }, []);

  // === FUNÇÕES STUB PARA FORMAS DE PAGAMENTO ===
  const criarFormaPagamento = useCallback(async (novaForma: any) => {
    console.log("📦 [EntidadesContext] STUB: criarFormaPagamento", novaForma);
    return Promise.resolve();
  }, []);

  const atualizarFormaPagamento = useCallback(
    async (id: string, dadosAtualizados: any) => {
      console.log(
        "📦 [EntidadesContext] STUB: atualizarFormaPagamento",
        id,
        dadosAtualizados,
      );
      return Promise.resolve();
    },
    [],
  );

  const excluirFormaPagamento = useCallback(async (id: string) => {
    console.log("��� [EntidadesContext] STUB: excluirFormaPagamento", id);
    return Promise.resolve();
  }, []);

  // === FUNÇÕES PARA LOCALIZAÇÃO GEOGRÁFICA ===
  const criarLocalizacaoGeografica = useCallback(
    async (
      novaLocalizacao: Omit<LocalizacaoGeografica, "id" | "dataCriacao">,
    ) => {
      console.log(
        "📦 [EntidadesContext] Criando localização geográfica:",
        novaLocalizacao,
      );

      try {
        const novoId =
          Math.max(...localizacoesGeograficas.map((l) => l.id), 0) + 1;
        const localizacaoCompleta: LocalizacaoGeografica = {
          ...novaLocalizacao,
          id: novoId,
          dataCriacao: new Date(),
        };

        const novasLocalizacoes = [
          ...localizacoesGeograficas,
          localizacaoCompleta,
        ];
        setLocalizacoesGeograficas(novasLocalizacoes);

        localStorage.setItem(
          "localizacoes_geograficas",
          JSON.stringify(novasLocalizacoes),
        );

        return Promise.resolve();
      } catch (error) {
        console.error("Erro ao criar localização geográfica:", error);
        return Promise.reject(error);
      }
    },
    [localizacoesGeograficas],
  );

  const sincronizarLocalizacoes = useCallback(async () => {
    console.log("📦 [EntidadesContext] Sincronizando localizações do banco...");
    try {
      const response = await fetch("/api/localizacoes-geograficas");
      if (response.ok) {
        const localizacoes = await response.json();
        setLocalizacoesGeograficas(localizacoes);
        console.log(
          `🔄 [EntidadesContext] ${localizacoes.length} localizações sincronizadas`,
        );
      }
    } catch (error) {
      console.error("Erro ao sincronizar localizações:", error);
    }
  }, []);

  const atualizarLocalizacaoGeografica = useCallback(
    async (id: number, dadosAtualizados: any) => {
      console.log(
        "📦 [EntidadesContext] STUB: atualizarLocalizacaoGeografica",
        id,
        dadosAtualizados,
      );
      return Promise.resolve();
    },
    [],
  );

  const excluirLocalizacaoGeografica = useCallback(async (id: number) => {
    console.log("📦 [EntidadesContext] STUB: excluirLocalizacaoGeografica", id);
    return Promise.resolve();
  }, []);

  // === VALUE DO CONTEXTO ===
  const value = useMemo(
    () => ({
      descricoesECategorias,
      adicionarDescricaoECategoria: criarDescricaoOuCategoria,
      editarDescricaoECategoria: atualizarDescricaoOuCategoria,
      excluirDescricaoECategoria: excluirDescricaoOuCategoria,
      getCategorias,
      getDescricoes,
      localizacoesGeograficas,
      getCidades,
      getSetores,
      criarLocalizacaoGeografica,
      atualizarLocalizacaoGeografica,
      excluirLocalizacaoGeografica,
      sincronizarLocalizacoes,
      formasPagamento,
      criarFormaPagamento,
      atualizarFormaPagamento,
      excluirFormaPagamento,
      descricoes,
      categorias,
      funcionarios,
      tecnicos,
      clientes,
      fornecedores,
      cidades,
      setores,
      getTecnicos,
      isLoading,
      error,
      carregarDados,
      recarregarDescricoesECategorias,
    }),
    [
      descricoesECategorias,
      localizacoesGeograficas,
      formasPagamento,
      descricoes,
      categorias,
      funcionarios,
      tecnicos,
      clientes,
      fornecedores,
      cidades,
      setores,
      isLoading,
      error,
      carregarDados,
      recarregarDescricoesECategorias,
    ],
  );

  return (
    <EntidadesContext.Provider value={value}>
      {children}
    </EntidadesContext.Provider>
  );
}

export function useEntidades() {
  const context = useContext(EntidadesContext);
  if (context === undefined) {
    throw new Error("useEntidades must be used within an EntidadesProvider");
  }
  return context;
}
