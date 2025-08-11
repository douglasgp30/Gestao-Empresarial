import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Descricao,
  Categoria,
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
} from "../lib/apiService";

interface EntidadesContextType {
  // Descrições
  descricoes: Descricao[];
  adicionarDescricao: (
    descricao: Omit<Descricao, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarDescricao: (id: string, descricao: Partial<Descricao>) => Promise<void>;
  excluirDescricao: (id: string) => Promise<void>;

  // Categorias (mantém localStorage por enquanto)
  categorias: Categoria[];
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

  // Setores
  setores: Setor[];
  cidades: string[];
  adicionarSetor: (setor: Omit<Setor, "id" | "dataCriacao">) => Promise<void>;
  editarSetor: (id: string, setor: Partial<Setor>) => Promise<void>;
  excluirSetor: (id: string) => Promise<void>;
  adicionarCidade: (cidade: { nome: string }) => Promise<void>;

  // Clientes (mantém localStorage)
  clientes: Cliente[];
  adicionarCliente: (cliente: Omit<Cliente, "id" | "dataCriacao">) => void;
  editarCliente: (id: string, cliente: Partial<Cliente>) => void;
  excluirCliente: (id: string) => void;

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

// Entidades essenciais básicas - apenas o mínimo necessário para funcionamento
const entidadesEssenciais = {
  categorias: [
    {
      id: "1",
      nome: "Serviços",
      tipo: "receita" as const,
      dataCriacao: new Date(),
    },
    {
      id: "2",
      nome: "Operacional",
      tipo: "despesa" as const,
      dataCriacao: new Date(),
    },
  ],
};

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

  // Estados para entidades no banco
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
    try {
      setIsLoading(true);
      setError(null);

      // Carregar dados do banco
      const [
        descricoesResponse,
        formasPagamentoResponse,
        funcionariosResponse,
        tecnicosResponse,
        setoresResponse,
        cidadesResponse,
      ] = await Promise.all([
        descricoesApi.listar(),
        formasPagamentoApi.listar(),
        funcionariosApi.listar(),
        funcionariosApi.listarTecnicos(),
        setoresApi.listar(),
        setoresApi.listarCidades(),
      ]);

      // Atualizar estados com dados do banco
      if (descricoesResponse.data) setDescricoes(descricoesResponse.data);
      if (formasPagamentoResponse.data)
        setFormasPagamento(formasPagamentoResponse.data);
      if (funcionariosResponse.data) setFuncionarios(funcionariosResponse.data);
      if (tecnicosResponse.data) setTecnicos(tecnicosResponse.data);
      if (setoresResponse.data) setSetores(setoresResponse.data);
      if (cidadesResponse.data) setCidades(cidadesResponse.data);

      // Carregar dados do localStorage
      const categoriasStorage = carregarEntidadeDoStorage<Categoria>(
        "categorias",
        entidadesEssenciais.categorias,
      );
      const clientesStorage = carregarEntidadeDoStorage<Cliente>("clientes");
      const fornecedoresStorage =
        carregarEntidadeDoStorage<Fornecedor>("fornecedores");

      setCategorias(categoriasStorage);
      setClientes(clientesStorage);
      setFornecedores(fornecedoresStorage);
    } catch (error) {
      console.error("Erro ao carregar entidades:", error);
      setError("Erro ao carregar dados do servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDados();
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
      setError(null);
      const response = await descricoesApi.excluir(parseInt(id));
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar descrições
      const descricoesResponse = await descricoesApi.listar();
      if (descricoesResponse.data) setDescricoes(descricoesResponse.data);
    } catch (error) {
      console.error("Erro ao excluir descrição:", error);
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
      const novasCidades = [...cidades, novaCidade.nome];
      setCidades(novasCidades);
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
    const categoriasAtualizadas = categorias.filter(
      (categoria) => categoria.id !== id,
    );
    setCategorias(categoriasAtualizadas);
    salvarEntidadeNoStorage("categorias", categoriasAtualizadas);
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

    // Funções para Categorias (localStorage)
    adicionarCategoria,
    editarCategoria,
    excluirCategoria,

    // Funções para Descrições (API)
    adicionarDescricao,
    editarDescricao,
    excluirDescricao,

    // Funções para Formas de Pagamento (API)
    adicionarFormaPagamento,
    editarFormaPagamento,
    excluirFormaPagamento,

    // Funções para Funcionários (API)
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
