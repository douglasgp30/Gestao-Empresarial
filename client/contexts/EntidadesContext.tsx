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
import {
  descricoesApi,
  formasPagamentoApi,
  funcionariosApi,
  clientesApi,
  localizacoesGeograficasApi,
} from "../lib/apiService";
import { descricoesECategoriasApi } from "../lib/descricoes-e-categorias-api";
import { loadingManager } from "../lib/loadingManager";
import { apiCache } from "../lib/apiCache";
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
    return cidadesAtivas.map(cidade => cidade.nome);
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
        console.log("[EntidadesContext] TIMEOUT SEGURANÇA: Forçando loading=false após 5 segundos");
        setIsLoading(false);
        setIsCarregando(false);
        setContextLoading("EntidadesContext", false);
        setDadosCarregados(true);
      }
    }, 5000); // 5 segundos máximo

    return () => clearTimeout(timeoutSeguranca);
  }, [isLoading]);

  // === CARREGAMENTO DE DADOS SIMPLIFICADO ===
  const carregarDados = useCallback(async () => {
    // Verificação simples para evitar duplo carregamento
    if (isCarregando || dadosCarregados) {
      console.log("[EntidadesContext] Carregamento já realizado ou em andamento, ignorando...");
      return;
    }

    console.log("[EntidadesContext] Iniciando carregamento de dados...");
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

      // Buscar dados sem cache para debug
      const [
        descricoesECategoriasResponse,
        formasPagamentoResponse,
        funcionariosResponse,
        tecnicosResponse,
        localizacoesResponse,
      ] = await Promise.all([
        descricoesECategoriasApi.listar(),
        formasPagamentoApi.listar(),
        funcionariosApi.listar(),
        funcionariosApi.listarTecnicos(),
        localizacoesGeograficasApi.listar(),
      ]);

      // Atualizar estados com dados do banco
      if (descricoesECategoriasResponse.data) {
        setDescricoesECategorias(descricoesECategoriasResponse.data);
        console.log(
          `[EntidadesContext] Carregadas ${descricoesECategoriasResponse.data.length} descrições/categorias unificadas`,
        );
      }

      if (formasPagamentoResponse.data) {
        setFormasPagamento(formasPagamentoResponse.data);
      }

      if (funcionariosResponse.data) {
        setFuncionarios(funcionariosResponse.data);
      }

      if (tecnicosResponse.data) {
        setTecnicos(tecnicosResponse.data);
      }

      if (localizacoesResponse.data) {
        setLocalizacoesGeograficas(localizacoesResponse.data);
        console.log(
          `[EntidadesContext] Carregadas ${localizacoesResponse.data.length} localizações geográficas`,
        );
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
      console.error("Erro ao carregar entidades:", error);
      setError("Erro ao carregar dados do servidor");

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
      console.log("[EntidadesContext] Recarregando descrições e categorias...");
      const response = await descricoesECategoriasApi.listar();
      if (response.data) {
        setDescricoesECategorias(response.data);
        console.log(
          `[EntidadesContext] Recarregadas ${response.data.length} descrições/categorias`,
        );
      }
    } catch (error) {
      console.error("Erro ao recarregar descrições e categorias:", error);
    }
  }, []);

  // === CARREGAMENTO INICIAL ÚNICO (SEM DEPENDÊNCIA CIRCULAR) ===
  useEffect(() => {
    if (shouldSkipLoading("EntidadesContext")) {
      console.log("[EntidadesContext] Carregamento ignorado (skip loading)");
      return;
    }

    // Carregar dados apenas uma vez no mount
    console.log("[EntidadesContext] Iniciando carregamento único...");
    carregarDados();
  }, []); // Array vazio - executa apenas no mount

  // === FUNÇÕES CRUD PARA SISTEMA UNIFICADO ===
  const adicionarDescricaoECategoria = async (
    novoItem: Omit<DescricaoECategoria, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);
      console.log("[EntidadesContext] Adicionando item:", novoItem);

      const response = await descricoesECategoriasApi.criar(novoItem);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar apenas a tabela unificada (otimizado)
      await recarregarDescricoesECategorias();

      console.log(
        "[EntidadesContext] Item adicionado com sucesso:",
        response.data?.id,
      );
      toast.success("Item adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item");
      throw error;
    }
  };

  const editarDescricaoECategoria = async (
    id: string,
    dadosAtualizados: Partial<DescricaoECategoria>,
  ) => {
    try {
      setError(null);
      const response = await descricoesECategoriasApi.atualizar(
        parseInt(id),
        dadosAtualizados,
      );
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      await recarregarDescricoesECategorias();
      toast.success("Item atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar item:", error);
      toast.error("Erro ao editar item");
      throw error;
    }
  };

  const excluirDescricaoECategoria = async (id: string) => {
    try {
      setError(null);
      const response = await descricoesECategoriasApi.excluir(parseInt(id));

      // Verificar se a API retornou erro antes de prosseguir
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      await recarregarDescricoesECategorias();
      // Removendo toast do context - deixar componente gerenciar
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      setError("Erro ao excluir item");
      throw error;
    }
  };

  // === FUNÇÕES CRUD PARA FORMAS DE PAGAMENTO ===
  const adicionarFormaPagamento = async (
    novaForma: Omit<FormaPagamento, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);
      await formasPagamentoApi.criar(novaForma);
      const response = await formasPagamentoApi.listar();
      if (response.data) setFormasPagamento(response.data);
      toast.success("Forma de pagamento adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar forma de pagamento:", error);
      toast.error("Erro ao adicionar forma de pagamento");
      throw error;
    }
  };

  const editarFormaPagamento = async (
    id: string,
    dadosAtualizados: Partial<FormaPagamento>,
  ) => {
    try {
      setError(null);
      await formasPagamentoApi.atualizar(parseInt(id), dadosAtualizados);
      const response = await formasPagamentoApi.listar();
      if (response.data) setFormasPagamento(response.data);
      toast.success("Forma de pagamento atualizada!");
    } catch (error) {
      console.error("Erro ao editar forma de pagamento:", error);
      toast.error("Erro ao editar forma de pagamento");
      throw error;
    }
  };

  const excluirFormaPagamento = async (id: string) => {
    try {
      setError(null);
      await formasPagamentoApi.excluir(parseInt(id));
      const response = await formasPagamentoApi.listar();
      if (response.data) setFormasPagamento(response.data);
      toast.success("Forma de pagamento excluída!");
    } catch (error) {
      console.error("Erro ao excluir forma de pagamento:", error);
      toast.error("Erro ao excluir forma de pagamento");
      throw error;
    }
  };

  // === FUNÇÕES CRUD PARA LOCALIZAÇÃO GEOGRÁFICA ===
  // REMOVIDAS: As funções de adicionar/editar cidades foram removidas
  // As cidades agora são pré-cadastradas e gerenciadas via ativação/desativação

  // === FUNÇÕES NOVAS DE LOCALIZAÇÃO GEOGRÁFICA ===
  const adicionarLocalizacaoGeografica = async (
    novaLocalizacao: Omit<LocalizacaoGeografica, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);
      console.log(
        "[EntidadesContext] Adicionando localização:",
        novaLocalizacao,
      );

      await localizacoesGeograficasApi.criar(novaLocalizacao);

      // Recarregar dados
      const response = await localizacoesGeograficasApi.listar();
      if (response.data) {
        setLocalizacoesGeograficas(response.data);
        console.log(
          `[EntidadesContext] ${novaLocalizacao.tipoItem} criado com sucesso`,
        );
      }

      // Invalidar cache
      apiCache.invalidate("entidades-localizacoes");

      toast.success(
        `${novaLocalizacao.tipoItem === "cidade" ? "Cidade" : "Setor"} adicionado com sucesso!`,
      );
    } catch (error: any) {
      console.error("Erro ao adicionar localização:", error);
      const errorMessage =
        error.response?.data?.error ||
        `Erro ao adicionar ${novaLocalizacao.tipoItem}`;
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const editarLocalizacaoGeografica = async (
    id: number,
    dadosAtualizados: Partial<LocalizacaoGeografica>,
  ) => {
    try {
      setError(null);

      await localizacoesGeograficasApi.atualizar(id, dadosAtualizados);

      // Recarregar dados
      const response = await localizacoesGeograficasApi.listar();
      if (response.data) {
        setLocalizacoesGeograficas(response.data);
      }

      // Invalidar cache
      apiCache.invalidate("entidades-localizacoes");

      toast.success("Localização atualizada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao editar localização:", error);
      const errorMessage =
        error.response?.data?.error || "Erro ao editar localização";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const excluirLocalizacaoGeografica = async (id: number) => {
    try {
      setError(null);

      await localizacoesGeograficasApi.excluir(id);

      // Recarregar dados
      const response = await localizacoesGeograficasApi.listar();
      if (response.data) {
        setLocalizacoesGeograficas(response.data);
      }

      // Invalidar cache
      apiCache.invalidate("entidades-localizacoes");

      toast.success("Localização excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir localização:", error);
      const errorMessage =
        error.response?.data?.error || "Erro ao excluir localização";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

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
