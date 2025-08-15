import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";
import {
  Descricao,
  Categoria,
  DescricaoECategoria,
  FormaPagamento,
  Cliente,
  Fornecedor,
  Setor,
  Cidade,
} from "@shared/types";
import {
  descricoesApi,
  formasPagamentoApi,
  funcionariosApi,
  setoresApi,
  clientesApi,
} from "../lib/apiService";
import { descricoesECategoriasApi } from "../lib/descricoes-e-categorias-api";
import { loadingManager } from "../lib/loadingManager";

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

  // Setores
  setores: Setor[];
  cidades: string[];
  adicionarSetor: (setor: Omit<Setor, "id" | "dataCriacao">) => Promise<void>;
  editarSetor: (id: string, setor: Partial<Setor>) => Promise<void>;
  excluirSetor: (id: string) => Promise<void>;
  adicionarCidade: (cidade: { nome: string }) => Promise<void>;

  // Clientes (API)
  clientes: Cliente[];
  adicionarCliente: (
    cliente: Omit<Cliente, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  excluirCliente: (id: string) => Promise<void>;

  // Fornecedores (mantém localStorage)
  fornecedores: Fornecedor[];
  adicionarFornecedor: (
    fornecedor: Omit<Fornecedor, "id" | "dataCriacao">,
  ) => void;
  editarFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => void;
  excluirFornecedor: (id: string) => void;

  carregarDados: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const EntidadesContext = createContext<EntidadesContextType | undefined>(
  undefined,
);

// Remover dados fictícios - usar apenas dados reais do banco

// Funções para localStorage (para entidades que ainda não migraram)
function carregarEntidadeDoStorage<T>(
  key: string,
  defaultValue: T[] = [],
): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        dataCriacao: new Date(item.dataCriacao),
      }));
    }
    return defaultValue;
  } catch (error) {
    console.warn(`Erro ao carregar ${key} do localStorage:`, error);
    return defaultValue;
  }
}

function salvarEntidadeNoStorage<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Erro ao salvar ${key} no localStorage:`, error);
  }
}

export function EntidadesProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCarregando, setIsCarregando] = useState(false);

  // Estados para entidades no banco
  const [descricoesECategorias, setDescricoesECategorias] = useState<
    DescricaoECategoria[]
  >([]);
  const [descricoes, setDescricoes] = useState<Descricao[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);

  // Estados para entidades no localStorage (temporário)
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  // Função para carregar todos os dados
  const carregarDados = async () => {
    // Evitar múltiplos carregamentos simultâneos
    if (isCarregando) {
      console.log("Carregamento já em andamento, ignorando...");
      return;
    }

    try {
      setIsCarregando(true);
      setIsLoading(true);
      setError(null);

      // Carregar dados do banco
      const [
        descricoesECategoriasResponse,
        descricoesResponse,
        formasPagamentoResponse,
        funcionariosResponse,
        tecnicosResponse,
        setoresResponse,
        cidadesResponse,
      ] = await Promise.all([
        descricoesECategoriasApi.listar(),
        descricoesApi.listar(),
        formasPagamentoApi.listar(),
        funcionariosApi.listar(),
        funcionariosApi.listarTecnicos(),
        setoresApi.listar(),
        setoresApi.listarCidades(),
      ]);

      // Atualizar estados com dados do banco
      if (descricoesECategoriasResponse.data)
        setDescricoesECategorias(descricoesECategoriasResponse.data);
      if (descricoesResponse.data) setDescricoes(descricoesResponse.data);
      if (formasPagamentoResponse.data)
        setFormasPagamento(formasPagamentoResponse.data);
      if (funcionariosResponse.data) setFuncionarios(funcionariosResponse.data);
      if (tecnicosResponse.data) setTecnicos(tecnicosResponse.data);
      if (setoresResponse.data) setSetores(setoresResponse.data);
      if (cidadesResponse.data) setCidades(cidadesResponse.data);

      // Carregar dados do localStorage sem dados fictícios
      const categoriasStorage = carregarEntidadeDoStorage<Categoria>(
        "categorias",
        [], // Usar array vazio ao invés de dados fictícios
      );
      const clientesStorage = carregarEntidadeDoStorage<Cliente>("clientes");
      const fornecedoresStorage =
        carregarEntidadeDoStorage<Fornecedor>("fornecedores");

      setCategorias(categoriasStorage);
      setClientes(clientesStorage);
      setFornecedores(fornecedoresStorage);
    } catch (error) {
      console.error("Erro ao carregar entidades:", error);

      // Verificar se é erro de rede
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        setError("Erro de conexão. Verificando servidor...");
        console.log("Tentando reconectar em 2s...");

        // Tentar reconectar após 2 segundos
        setTimeout(() => {
          if (!isCarregando) { // Só tentar se não estiver carregando
            carregarDados();
          }
        }, 2000);
      } else {
        setError("Erro ao carregar dados do servidor");
      }

      // Definir dados padrão em caso de erro para evitar crashes
      setDescricoesECategorias([]);
      setDescricoes([]);
      setFormasPagamento([]);
      setFuncionarios([]);
      setTecnicos([]);
      setSetores([]);
      setCidades([]);
    } finally {
      setIsLoading(false);
      setIsCarregando(false);
    }
  };

  // Função de recarregamento otimizada com debounce para reduzir piscar
  const recarregarDescricoesECategorias = useCallback(async () => {
    try {
      const response = await descricoesECategoriasApi.listar();
      if (response.data) {
        setDescricoesECategorias(response.data);
      }
    } catch (error) {
      console.error("Erro ao recarregar descrições e categorias:", error);
    }
  }, []);

  // === FUNÇÕES PARA TABELA UNIFICADA ===
  const getCategorias = (tipo?: "receita" | "despesa") => {
    return descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "categoria" &&
        item.ativo &&
        (tipo ? item.tipo === tipo : true),
    );
  };

  const getDescricoes = (tipo?: "receita" | "despesa", categoria?: string) => {
    return descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "descricao" &&
        item.ativo &&
        (tipo ? item.tipo === tipo : true) &&
        (categoria ? item.categoria === categoria : true),
    );
  };

  const adicionarDescricaoECategoria = async (
    novoItem: Omit<DescricaoECategoria, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);
      const response = await descricoesECategoriasApi.criar(novoItem);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar dados de forma otimizada
      await recarregarDescricoesECategorias();
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
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

      // Recarregar dados de forma otimizada
      await recarregarDescricoesECategorias();
    } catch (error) {
      console.error("Erro ao editar item:", error);
      throw error;
    }
  };

  const excluirDescricaoECategoria = async (id: string) => {
    try {
      console.log("🗑️ [Descrições e Categorias] Excluindo item:", id);
      setError(null);

      const response = await descricoesECategoriasApi.excluir(parseInt(id));
      if (response.error) {
        setError(response.error);
        toast.error("Erro ao excluir item: " + response.error);
        throw new Error(response.error);
      }

      // Recarregar dados de forma otimizada
      await recarregarDescricoesECategorias();

      console.log("✅ [Descrições e Categorias] Item excluído com sucesso");
      toast.success("Item excluído com sucesso!");
    } catch (error) {
      console.error(
        "❌ [Descrições e Categorias] Erro ao excluir item:",
        error,
      );
      if (!error.message?.includes("Erro ao excluir item:")) {
        toast.error("Erro ao excluir item");
      }
      throw error;
    }
  };

  // Carregar dados na inicialização com debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      carregarDados();
    }, 100); // Pequeno delay para evitar chamadas múltiplas no hot reload

    return () => clearTimeout(timeout);
  }, []);

  // === FUNÇÕES PARA DESCRIÇÕES (API) ===
  const adicionarDescricao = async (
    novaDescricao: Omit<Descricao, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);
      const response = await descricoesApi.criar(novaDescricao);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar descrições
      const descricoesResponse = await descricoesApi.listar();
      if (descricoesResponse.data) setDescricoes(descricoesResponse.data);
    } catch (error) {
      console.error("Erro ao adicionar descrição:", error);
      throw error;
    }
  };

  const editarDescricao = async (
    id: string,
    dadosAtualizados: Partial<Descricao>,
  ) => {
    try {
      setError(null);
      const response = await descricoesApi.atualizar(
        parseInt(id),
        dadosAtualizados,
      );
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar descrições
      const descricoesResponse = await descricoesApi.listar();
      if (descricoesResponse.data) setDescricoes(descricoesResponse.data);
    } catch (error) {
      console.error("Erro ao editar descrição:", error);
      throw error;
    }
  };

  const excluirDescricao = async (id: string) => {
    try {
      console.log("🗑️ [Descrições] Excluindo descrição:", id);
      setError(null);

      const response = await descricoesApi.excluir(parseInt(id));
      if (response.error) {
        setError(response.error);
        toast.error("Erro ao excluir descrição: " + response.error);
        throw new Error(response.error);
      }

      // Recarregar descrições
      const descricoesResponse = await descricoesApi.listar();
      if (descricoesResponse.data) setDescricoes(descricoesResponse.data);

      console.log("✅ [Descrições] Descrição excluída com sucesso");
      toast.success("Descrição excluída com sucesso!");
    } catch (error) {
      console.error("❌ [Descrições] Erro ao excluir descrição:", error);
      if (!error.message?.includes("Erro ao excluir descrição:")) {
        toast.error("Erro ao excluir descrição");
      }
      throw error;
    }
  };

  // === FUNÇÕES PARA FORMAS DE PAGAMENTO (API) ===
  const adicionarFormaPagamento = async (
    novaForma: Omit<FormaPagamento, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);
      const response = await formasPagamentoApi.criar(novaForma);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar formas de pagamento
      const formasResponse = await formasPagamentoApi.listar();
      if (formasResponse.data) setFormasPagamento(formasResponse.data);
    } catch (error) {
      console.error("Erro ao adicionar forma de pagamento:", error);
      throw error;
    }
  };

  const editarFormaPagamento = async (
    id: string,
    dadosAtualizados: Partial<FormaPagamento>,
  ) => {
    try {
      setError(null);
      const response = await formasPagamentoApi.atualizar(
        parseInt(id),
        dadosAtualizados,
      );
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar formas de pagamento
      const formasResponse = await formasPagamentoApi.listar();
      if (formasResponse.data) setFormasPagamento(formasResponse.data);
    } catch (error) {
      console.error("Erro ao editar forma de pagamento:", error);
      throw error;
    }
  };

  const excluirFormaPagamento = async (id: string) => {
    try {
      setError(null);
      const response = await formasPagamentoApi.excluir(parseInt(id));
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar formas de pagamento
      const formasResponse = await formasPagamentoApi.listar();
      if (formasResponse.data) setFormasPagamento(formasResponse.data);
    } catch (error) {
      console.error("Erro ao excluir forma de pagamento:", error);
      throw error;
    }
  };

  // === FUNÇÕES PARA FUNCIONÁRIOS (API) ===
  const getTecnicos = () => {
    console.log("[EntidadesContext] getTecnicos chamado");
    console.log("[EntidadesContext] Técnicos da API:", tecnicos.length);
    console.log(
      "[EntidadesContext] Funcionários carregados:",
      funcionarios.length,
    );

    // Usar apenas dados da API (banco de dados) para evitar conflitos de ID
    // Filtrar funcionários que estejam marcados como técnicos
    const funcionariosTecnicos = funcionarios.filter(
      (f) => f.ehTecnico === true,
    );

    console.log(
      "[EntidadesContext] Funcionários técnicos encontrados:",
      funcionariosTecnicos.length,
    );

    // Combinar técnicos específicos da API com funcionários marcados como técnicos
    const todosTecnicos = [...tecnicos, ...funcionariosTecnicos];

    // Remover duplicatas baseado no ID
    const tecnicosUnicos = todosTecnicos.filter(
      (tecnico, index, array) =>
        array.findIndex((t) => t.id === tecnico.id) === index,
    );

    console.log(
      "[EntidadesContext] Total de técnicos únicos:",
      tecnicosUnicos.length,
    );
    console.log(
      "[EntidadesContext] IDs dos técnicos:",
      tecnicosUnicos.map((t) => t.id),
    );

    return tecnicosUnicos;
  };

  const adicionarFuncionario = async (novoFuncionario: any) => {
    try {
      setError(null);
      const response = await funcionariosApi.criar(novoFuncionario);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar funcionários e técnicos
      const [funcionariosResponse, tecnicosResponse] = await Promise.all([
        funcionariosApi.listar(),
        funcionariosApi.listarTecnicos(),
      ]);
      if (funcionariosResponse.data) setFuncionarios(funcionariosResponse.data);
      if (tecnicosResponse.data) setTecnicos(tecnicosResponse.data);
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error);
      throw error;
    }
  };

  const editarFuncionario = async (id: string, dadosAtualizados: any) => {
    try {
      setError(null);
      const response = await funcionariosApi.atualizar(
        parseInt(id),
        dadosAtualizados,
      );
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar funcionários e técnicos
      const [funcionariosResponse, tecnicosResponse] = await Promise.all([
        funcionariosApi.listar(),
        funcionariosApi.listarTecnicos(),
      ]);
      if (funcionariosResponse.data) setFuncionarios(funcionariosResponse.data);
      if (tecnicosResponse.data) setTecnicos(tecnicosResponse.data);
    } catch (error) {
      console.error("Erro ao editar funcionário:", error);
      throw error;
    }
  };

  const excluirFuncionario = async (id: string) => {
    try {
      setError(null);
      const response = await funcionariosApi.excluir(parseInt(id));
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar funcionários e técnicos
      const [funcionariosResponse, tecnicosResponse] = await Promise.all([
        funcionariosApi.listar(),
        funcionariosApi.listarTecnicos(),
      ]);
      if (funcionariosResponse.data) setFuncionarios(funcionariosResponse.data);
      if (tecnicosResponse.data) setTecnicos(tecnicosResponse.data);
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      throw error;
    }
  };

  // === FUNÇÕES PARA SETORES (API) ===
  const adicionarSetor = async (
    novoSetor: Omit<Setor, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);
      const response = await setoresApi.criar(novoSetor);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar setores e cidades
      const [setoresResponse, cidadesResponse] = await Promise.all([
        setoresApi.listar(),
        setoresApi.listarCidades(),
      ]);
      if (setoresResponse.data) setSetores(setoresResponse.data);
      if (cidadesResponse.data) setCidades(cidadesResponse.data);
    } catch (error) {
      console.error("Erro ao adicionar setor:", error);
      throw error;
    }
  };

  const editarSetor = async (id: string, dadosAtualizados: Partial<Setor>) => {
    try {
      setError(null);
      const response = await setoresApi.atualizar(
        parseInt(id),
        dadosAtualizados,
      );
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar setores e cidades
      const [setoresResponse, cidadesResponse] = await Promise.all([
        setoresApi.listar(),
        setoresApi.listarCidades(),
      ]);
      if (setoresResponse.data) setSetores(setoresResponse.data);
      if (cidadesResponse.data) setCidades(cidadesResponse.data);
    } catch (error) {
      console.error("Erro ao editar setor:", error);
      throw error;
    }
  };

  const excluirSetor = async (id: string) => {
    try {
      setError(null);
      const response = await setoresApi.excluir(parseInt(id));
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar setores e cidades
      const [setoresResponse, cidadesResponse] = await Promise.all([
        setoresApi.listar(),
        setoresApi.listarCidades(),
      ]);
      if (setoresResponse.data) setSetores(setoresResponse.data);
      if (cidadesResponse.data) setCidades(cidadesResponse.data);
    } catch (error) {
      console.error("Erro ao excluir setor:", error);
      throw error;
    }
  };

  // === FUNÇÃO PARA CIDADES ===
  const adicionarCidade = async (novaCidade: { nome: string }) => {
    if (!cidades.includes(novaCidade.nome)) {
      const novasCidades = [...cidades, novaCidade.nome].sort();
      setCidades(novasCidades);

      // Recarregar cidades do banco para manter sincronizado
      try {
        const cidadesResponse = await setoresApi.listarCidades();
        if (cidadesResponse.data) setCidades(cidadesResponse.data);
      } catch (error) {
        console.error("Erro ao recarregar cidades:", error);
      }
    }
  };

  // === FUNÇÕES PARA CATEGORIAS (localStorage - temporário) ===
  const adicionarCategoria = (
    novaCategoria: Omit<Categoria, "id" | "dataCriacao">,
  ) => {
    const categoria: Categoria = {
      ...novaCategoria,
      id: Date.now().toString(),
      dataCriacao: new Date(),
    };
    const novasCategorias = [...categorias, categoria];
    setCategorias(novasCategorias);
    salvarEntidadeNoStorage("categorias", novasCategorias);
  };

  const editarCategoria = (
    id: string,
    dadosAtualizados: Partial<Categoria>,
  ) => {
    const categoriasAtualizadas = categorias.map((categoria) =>
      categoria.id === id ? { ...categoria, ...dadosAtualizados } : categoria,
    );
    setCategorias(categoriasAtualizadas);
    salvarEntidadeNoStorage("categorias", categoriasAtualizadas);
  };

  const excluirCategoria = (id: string) => {
    try {
      console.log("🗑️ [Categorias] Excluindo categoria:", id);

      const categoriasAtualizadas = categorias.filter(
        (categoria) => categoria.id !== id,
      );

      console.log(
        "🗑️ [Categorias] Categorias após exclusão:",
        categoriasAtualizadas.length,
      );

      setCategorias(categoriasAtualizadas);
      salvarEntidadeNoStorage("categorias", categoriasAtualizadas);

      toast.success("Categoria excluída com sucesso!");
    } catch (error) {
      console.error("��� [Categorias] Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria");
    }
  };

  // === FUNÇÕES PARA CLIENTES (localStorage - temporário) ===
  const adicionarCliente = (
    novoCliente: Omit<Cliente, "id" | "dataCriacao">,
  ) => {
    const cliente: Cliente = {
      ...novoCliente,
      id: Date.now().toString(),
      dataCriacao: new Date(),
    };
    const novosClientes = [...clientes, cliente];
    setClientes(novosClientes);
    salvarEntidadeNoStorage("clientes", novosClientes);
    return cliente;
  };

  const editarCliente = (id: string, dadosAtualizados: Partial<Cliente>) => {
    const clientesAtualizados = clientes.map((cliente) =>
      cliente.id === id ? { ...cliente, ...dadosAtualizados } : cliente,
    );
    setClientes(clientesAtualizados);
    salvarEntidadeNoStorage("clientes", clientesAtualizados);
  };

  const excluirCliente = (id: string) => {
    const clientesAtualizados = clientes.filter((cliente) => cliente.id !== id);
    setClientes(clientesAtualizados);
    salvarEntidadeNoStorage("clientes", clientesAtualizados);
  };

  // === FUNÇÕES PARA FORNECEDORES (localStorage - temporário) ===
  const adicionarFornecedor = (
    novoFornecedor: Omit<Fornecedor, "id" | "dataCriacao">,
  ) => {
    const fornecedor: Fornecedor = {
      ...novoFornecedor,
      id: Date.now().toString(),
      dataCriacao: new Date(),
    };
    const novosFornecedores = [...fornecedores, fornecedor];
    setFornecedores(novosFornecedores);
    salvarEntidadeNoStorage("fornecedores", novosFornecedores);
  };

  const editarFornecedor = (
    id: string,
    dadosAtualizados: Partial<Fornecedor>,
  ) => {
    const fornecedoresAtualizados = fornecedores.map((fornecedor) =>
      fornecedor.id === id
        ? { ...fornecedor, ...dadosAtualizados }
        : fornecedor,
    );
    setFornecedores(fornecedoresAtualizados);
    salvarEntidadeNoStorage("fornecedores", fornecedoresAtualizados);
  };

  const excluirFornecedor = (id: string) => {
    const fornecedoresAtualizados = fornecedores.filter(
      (fornecedor) => fornecedor.id !== id,
    );
    setFornecedores(fornecedoresAtualizados);
    salvarEntidadeNoStorage("fornecedores", fornecedoresAtualizados);
  };

  const value = {
    // Estados
    descricoesECategorias,
    categorias,
    descricoes,
    formasPagamento,
    funcionarios,
    tecnicos,
    clientes,
    fornecedores,
    setores,
    cidades,
    isLoading,
    error,

    // Funç��es para tabela unificada
    getCategorias,
    getDescricoes,
    adicionarDescricaoECategoria,
    editarDescricaoECategoria,
    excluirDescricaoECategoria,

    // Funções para Categorias (localStorage - compatibilidade)
    adicionarCategoria,
    editarCategoria,
    excluirCategoria,

    // Funções para Descrições (API - compatibilidade)
    adicionarDescricao,
    editarDescricao,
    excluirDescricao,

    // Funções para Formas de Pagamento (API)
    adicionarFormaPagamento,
    editarFormaPagamento,
    excluirFormaPagamento,

    // Funções para Funcionários (API)
    getTecnicos,
    adicionarFuncionario,
    editarFuncionario,
    excluirFuncionario,

    // Funções para Setores (API)
    adicionarSetor,
    editarSetor,
    excluirSetor,

    // Funções para Cidades
    adicionarCidade,

    // Funções para Clientes (localStorage)
    adicionarCliente,
    editarCliente,
    excluirCliente,

    // Funções para Fornecedores (localStorage)
    adicionarFornecedor,
    editarFornecedor,
    excluirFornecedor,

    // Funções utilitárias
    carregarDados,
  };

  return (
    <EntidadesContext.Provider value={value}>
      {children}
    </EntidadesContext.Provider>
  );
}

export function useEntidades() {
  const context = useContext(EntidadesContext);
  if (context === undefined) {
    throw new Error("useEntidades must be used within a EntidadesProvider");
  }
  return context;
}
