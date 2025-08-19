import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
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
// APIs removidas para usar localStorage
import { loadingManager } from "../lib/loadingManager";
import { contextThrottle } from "../lib/contextThrottle";
import {
  shouldSkipLoading,
  getLoadingDelay,
  isContextLoading,
  setContextLoading,
} from "../lib/globalLoadingControl";

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

  // Mantém interfaces originais para compatibilidade
  descricoes: Descricao[];
  categorias: Categoria[];
  adicionarDescricao: (
    descricao: Omit<Descricao, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarDescricao: (id: string, descricao: Partial<Descricao>) => Promise<void>;
  excluirDescricao: (id: string) => Promise<void>;
  adicionarCategoria: (
    categoria: Omit<Categoria, "id" | "dataCriacao">,
  ) => void;
  editarCategoria: (id: string, categoria: Partial<Categoria>) => void;
  excluirCategoria: (id: string) => void;

  // Formas de Pagamento
  formasPagamento: FormaPagamento[];
  adicionarFormaPagamento: (
    forma: Omit<FormaPagamento, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarFormaPagamento: (
    id: string,
    forma: Partial<FormaPagamento>,
  ) => Promise<void>;
  excluirFormaPagamento: (id: string) => Promise<void>;

  // Funcionários/Técnicos
  funcionarios: any[];
  tecnicos: any[];
  adicionarFuncionario: (funcionario: any) => Promise<void>;
  editarFuncionario: (id: string, funcionario: any) => Promise<void>;
  excluirFuncionario: (id: string) => Promise<void>;
  getTecnicos: () => any[];

  // Localização Geográfica (Cidades e Setores unificados)
  localizacoesGeograficas: LocalizacaoGeografica[];
  adicionarLocalizacaoGeografica: (
    localizacao: Omit<LocalizacaoGeografica, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarLocalizacaoGeografica: (
    id: number,
    localizacao: Partial<LocalizacaoGeografica>,
  ) => Promise<void>;
  excluirLocalizacaoGeografica: (id: number) => Promise<void>;

  // Funções de conveniência para filtrar localizações
  getCidades: () => LocalizacaoGeografica[];
  getSetores: (cidade?: string) => LocalizacaoGeografica[];

  // Arrays de compatibilidade para componentes antigos
  cidades: string[];
  setores: LocalizacaoGeografica[];

  // Clientes (API)
  clientes: Cliente[];
  adicionarCliente: (
    cliente: Omit<Cliente, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  excluirCliente: (id: string) => Promise<void>;

  // Fornecedores (localStorage temporário)
  fornecedores: Fornecedor[];
  adicionarFornecedor: (
    fornecedor: Omit<Fornecedor, "id" | "dataCriacao">,
  ) => void;
  editarFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => void;
  excluirFornecedor: (id: string) => void;

  // Controles gerais
  isLoading: boolean;
  error: string | null;
  recarregarTudo: () => Promise<void>;
}

const EntidadesContext = createContext<EntidadesContextType | undefined>(
  undefined,
);

// Funç��o para salvar entidade no localStorage com validação
function salvarEntidadeNoStorage<T>(
  chave: string,
  dados: T[],
  filtrarDadosFicticios = true,
) {
  try {
    // Filtrar dados fictícios se solicitado
    const dadosParaSalvar = filtrarDadosFicticios
      ? dados.filter(
          (item: any) =>
            !item.nome?.includes("Fictício") &&
            !item.nome?.includes("Teste") &&
            !item.nome?.startsWith("fake_"),
        )
      : dados;

    localStorage.setItem(chave, JSON.stringify(dadosParaSalvar));
  } catch (error) {
    console.error(`Erro ao salvar ${chave} no localStorage:`, error);
  }
}

// Função para carregar entidade do localStorage com fallback
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
  const [isLoading, setIsLoading] = useState(true);
  const [isCarregando, setIsCarregando] = useState(false);
  const [dadosCarregados, setDadosCarregados] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === FUNÇÕES PARA TABELA UNIFICADA (MEMOIZADAS) ===
  const getCategorias = useCallback(
    (tipo?: "receita" | "despesa") => {
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
          item.ativo &&
          (cidade ? item.cidade === cidade : true),
      );
    },
    [localizacoesGeograficas],
  );

  // === FUNÇÕES PARA COMPATIBILIDADE AVEC COMPONENTES ANTIGOS ===
  const cidades = useMemo(() => {
    const cidadesAtivas = getCidades();
    return cidadesAtivas.map((cidade) => cidade.nome);
  }, [getCidades]);

  const setores = useMemo(() => {
    return getSetores();
  }, [getSetores]);

  const getTecnicos = useCallback(() => {
    // Combinar técnicos específicos + funcionários que são técnicos
    const tecnicosEspecificos = tecnicos || [];
    const funcionariosTecnicos = (funcionarios || []).filter(
      (func) => func.ehTecnico || func.tipoAcesso === "tecnico",
    );

    // Deduplicar por ID
    const tecnicosCombinados = [...tecnicosEspecificos];
    funcionariosTecnicos.forEach((funcTecnico) => {
      if (!tecnicosCombinados.find((t) => t.id === funcTecnico.id)) {
        tecnicosCombinados.push(funcTecnico);
      }
    });

    return tecnicosCombinados.filter((t) => t.id && t.id !== 0);
  }, [funcionarios, tecnicos]);

  // === TIMEOUT DE SEGURANÇA PARA FORÇAR LOADING=FALSE ===
  useEffect(() => {
    const timeoutSeguranca = setTimeout(() => {
      if (isLoading) {
        console.log(
          "[EntidadesContext] TIMEOUT SEGURANÇA: Forçando loading=false após 5 segundos",
        );
        setIsLoading(false);
        setIsCarregando(false);
        setContextLoading("EntidadesContext", false);
        setDadosCarregados(true);
      }
    }, 5000); // 5 segundos máximo

    return () => clearTimeout(timeoutSeguranca);
  }, [isLoading]);

  // === CARREGAMENTO DE DADOS FORÇADO ===
  const carregarDados = useCallback(async () => {
    console.log("[EntidadesContext] FORÇANDO carregamento de dados...");
    setIsCarregando(true);
    setIsLoading(true);
    setError(null);

    try {
      // Invalidar cache para garantir dados atualizados
      apiCache.invalidate("entidades-descricoes");
      apiCache.invalidate("entidades-formas-pagamento");
      apiCache.invalidate("entidades-funcionarios");
      apiCache.invalidate("entidades-tecnicos");
      apiCache.invalidate("entidades-localizacoes");

      console.log(
        "[EntidadesContext] Cache invalidado - forçando recarregamento...",
      );

      // Carregar dados do localStorage em vez da API
      console.log("📦 [EntidadesContext] Carregando dados do localStorage...");

      try {
        // Carregar descrições e categorias
        const descricoesStorage = localStorage.getItem("descricoes_e_categorias") || localStorage.getItem("categorias_receita");
        if (descricoesStorage) {
          setDescricoesECategorias(JSON.parse(descricoesStorage));
        }

        // Carregar formas de pagamento
        const formasStorage = localStorage.getItem("formas_pagamento");
        if (formasStorage) {
          setFormasPagamento(JSON.parse(formasStorage));
        } else {
          // Valores padrão
          setFormasPagamento([
            { id: 1, nome: "Dinheiro", descricao: "Pagamento em dinheiro" },
            { id: 2, nome: "PIX", descricao: "Pagamento via PIX" },
            { id: 3, nome: "Cartão de Débito", descricao: "Pagamento com cartão de débito" },
            { id: 4, nome: "Cartão de Crédito", descricao: "Pagamento com cartão de crédito" },
          ]);
        }

        // Carregar funcionários
        const funcionariosStorage = localStorage.getItem("funcionarios");
        if (funcionariosStorage) {
          const funcionariosParsed = JSON.parse(funcionariosStorage);
          setFuncionarios(funcionariosParsed);
          // Filtrar técnicos
          const tecnicosFiltrados = funcionariosParsed.filter((f: any) => f.ehTecnico || f.tipoAcesso === "Técnico");
          setTecnicos(tecnicosFiltrados);
        }

        // Carregar localizações (cidades)
        const localizacoesStorage = localStorage.getItem("cidades_goias");
        if (localizacoesStorage) {
          setLocalizacoesGeograficas(JSON.parse(localizacoesStorage));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
      }

      // Carregar dados do localStorage (compatibilidade)
      const categoriasStorage = carregarEntidadeDoStorage<Categoria>(
        "categorias",
        [],
      );
      const clientesStorage = carregarEntidadeDoStorage<Cliente>(
        "clientes",
        [],
      );
      const fornecedoresStorage = carregarEntidadeDoStorage<Fornecedor>(
        "fornecedores",
        [],
      );

      setCategorias(categoriasStorage);
      setClientes(clientesStorage);
      setFornecedores(fornecedoresStorage);

      console.log("[EntidadesContext] Carregamento concluído com sucesso");
      setDadosCarregados(true);
    } catch (error) {
      console.error("Erro ao carregar entidades do localStorage:", error);
      setError("Erro ao carregar dados locais");

      // Dados padrão em caso de erro
      setDescricoesECategorias([]);
      setFormasPagamento([]);
      setFuncionarios([]);
      setTecnicos([]);
      setLocalizacoesGeograficas([]);
    } finally {
      setIsLoading(false);
      setIsCarregando(false);
      setDadosCarregados(true);
      console.log("[EntidadesContext] Carregamento finalizado - loading=false");
    }
  }, [isCarregando]);

  // === RECARREGAMENTO OTIMIZADO ===
  const recarregarDescricoesECategorias = useCallback(async () => {
    try {
      console.log("📦 [EntidadesContext] Recarregando descrições e categorias do localStorage...");

      const descricoesStorage = localStorage.getItem("descricoes_e_categorias") || localStorage.getItem("categorias_receita");
      if (descricoesStorage) {
        const parsed = JSON.parse(descricoesStorage);
        setDescricoesECategorias(parsed);
        console.log(`📦 [EntidadesContext] Recarregadas ${parsed.length} descrições/categorias`);
      }
    } catch (error) {
      console.error("Erro ao recarregar descrições e categorias do localStorage:", error);
    }
  }, []);

  // === FUNÇÕES STUB PARA EVITAR ERROS DE API ===
  const criarDescricaoOuCategoria = useCallback(async (novoItem: any) => {
    console.log("📦 [EntidadesContext] STUB: criarDescricaoOuCategoria", novoItem);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  const atualizarDescricaoOuCategoria = useCallback(async (id: string, dadosAtualizados: any) => {
    console.log("📦 [EntidadesContext] STUB: atualizarDescricaoOuCategoria", id, dadosAtualizados);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  const excluirDescricaoOuCategoria = useCallback(async (id: string) => {
    console.log("📦 [EntidadesContext] STUB: excluirDescricaoOuCategoria", id);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  const criarFormaPagamento = useCallback(async (novaForma: any) => {
    console.log("📦 [EntidadesContext] STUB: criarFormaPagamento", novaForma);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  const atualizarFormaPagamento = useCallback(async (id: string, dadosAtualizados: any) => {
    console.log("�� [EntidadesContext] STUB: atualizarFormaPagamento", id, dadosAtualizados);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  const excluirFormaPagamento = useCallback(async (id: string) => {
    console.log("📦 [EntidadesContext] STUB: excluirFormaPagamento", id);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  const criarLocalizacaoGeografica = useCallback(async (novaLocalizacao: any) => {
    console.log("📦 [EntidadesContext] STUB: criarLocalizacaoGeografica", novaLocalizacao);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  const atualizarLocalizacaoGeografica = useCallback(async (id: number, dadosAtualizados: any) => {
    console.log("📦 [EntidadesContext] STUB: atualizarLocalizacaoGeografica", id, dadosAtualizados);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  const excluirLocalizacaoGeografica = useCallback(async (id: number) => {
    console.log("📦 [EntidadesContext] STUB: excluirLocalizacaoGeografica", id);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  // === CARREGAMENTO INICIAL FORÇADO ===
  useEffect(() => {
    // Carregar dados sempre no mount, sem verificações
    console.log("[EntidadesContext] FORÇANDO carregamento inicial...");

    // Invalidar cache das formas de pagamento para garantir dados atualizados
    apiCache.invalidate("entidades-formas-pagamento");

    carregarDados();
  }, []); // Array vazio - executa apenas no mount

  // === FUNÇÕES CRUD PARA SISTEMA UNIFICADO ===
  // Funções removidas - usando versões stub acima para evitar chamadas de API

  // === FUNÇÕES CRUD PARA FORMAS DE PAGAMENTO ===
  // Funções removidas - usando versões stub acima para evitar chamadas de API

  // === FUNÇÕES CRUD PARA LOCALIZAÇÃO GEOGRÁFICA ===
  // REMOVIDAS: As funções de adicionar/editar cidades foram removidas
  // As cidades agora são pré-cadastradas e gerenciadas via ativação/desativação

  // === FUNÇÕES NOVAS DE LOCALIZAÇÃO GEOGRÁFICA ===
  // Funções removidas - usando versões stub acima para evitar chamadas de API

  // === FUNÇÕES LEGADAS (COMPATIBILIDADE) ===
  const adicionarDescricao = async () => {
    console.warn("adicionarDescricao: Use adicionarDescricaoECategoria");
  };

  const editarDescricao = async () => {
    console.warn("editarDescricao: Use editarDescricaoECategoria");
  };

  const excluirDescricao = async () => {
    console.warn("excluirDescricao: Use excluirDescricaoECategoria");
  };

  const adicionarCategoria = () => {
    console.warn("adicionarCategoria: Use adicionarDescricaoECategoria");
  };

  const editarCategoria = () => {
    console.warn("editarCategoria: Use editarDescricaoECategoria");
  };

  const excluirCategoria = () => {
    console.warn("excluirCategoria: Use excluirDescricaoECategoria");
  };

  const adicionarFuncionario = async () => {
    console.warn("adicionarFuncionario: Funcionalidade não implementada");
  };

  const editarFuncionario = async () => {
    console.warn("editarFuncionario: Funcionalidade não implementada");
  };

  const excluirFuncionario = async () => {
    console.warn("excluirFuncionario: Funcionalidade não implementada");
  };

  const adicionarCliente = async () => {
    console.warn("adicionarCliente: Funcionalidade não implementada");
  };

  const editarCliente = async () => {
    console.warn("editarCliente: Funcionalidade não implementada");
  };

  const excluirCliente = async () => {
    console.warn("excluirCliente: Funcionalidade não implementada");
  };

  const adicionarFornecedor = () => {
    console.warn("adicionarFornecedor: Funcionalidade não implementada");
  };

  const editarFornecedor = () => {
    console.warn("editarFornecedor: Funcionalidade não implementada");
  };

  const excluirFornecedor = () => {
    console.warn("excluirFornecedor: Funcionalidade não implementada");
  };

  const recarregarTudo = carregarDados;

  // === VALUE DO CONTEXTO ===
  const value = useMemo(
    () => ({
      // Sistema unificado
      descricoesECategorias,
      getCategorias,
      getDescricoes,
      adicionarDescricaoECategoria,
      editarDescricaoECategoria,
      excluirDescricaoECategoria,

      // Entidades principais
      formasPagamento,
      adicionarFormaPagamento,
      editarFormaPagamento,
      excluirFormaPagamento,

      funcionarios,
      tecnicos,
      getTecnicos,
      adicionarFuncionario,
      editarFuncionario,
      excluirFuncionario,

      localizacoesGeograficas,
      getCidades,
      getSetores,
      adicionarLocalizacaoGeografica,
      editarLocalizacaoGeografica,
      excluirLocalizacaoGeografica,

      // Arrays de compatibilidade para componentes antigos
      cidades,
      setores,

      // Compatibilidade
      descricoes,
      categorias,
      adicionarDescricao,
      editarDescricao,
      excluirDescricao,
      adicionarCategoria,
      editarCategoria,
      excluirCategoria,

      clientes,
      adicionarCliente,
      editarCliente,
      excluirCliente,

      fornecedores,
      adicionarFornecedor,
      editarFornecedor,
      excluirFornecedor,

      // Estados
      isLoading,
      error,
      recarregarTudo,
      recarregarDescricoesECategorias,
    }),
    [
      descricoesECategorias,
      getCategorias,
      getDescricoes,
      formasPagamento,
      funcionarios,
      tecnicos,
      getTecnicos,
      localizacoesGeograficas,
      cidades,
      setores,
      descricoes,
      categorias,
      clientes,
      fornecedores,
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
    throw new Error(
      "useEntidades deve ser usado dentro de um EntidadesProvider",
    );
  }
  return context;
}
