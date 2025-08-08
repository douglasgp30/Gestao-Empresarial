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

interface EntidadesContextType {
  // Descrições
  descricoes: Descricao[];
  adicionarDescricao: (
    descricao: Omit<Descricao, "id" | "dataCriacao">,
  ) => void;
  editarDescricao: (id: string, descricao: Partial<Descricao>) => void;
  excluirDescricao: (id: string) => void;

  // Categorias
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
  ) => void;
  editarFormaPagamento: (id: string, forma: Partial<FormaPagamento>) => void;
  excluirFormaPagamento: (id: string) => void;

  // Clientes
  clientes: Cliente[];
  adicionarCliente: (cliente: Omit<Cliente, "id" | "dataCriacao">) => void;
  editarCliente: (id: string, cliente: Partial<Cliente>) => void;
  excluirCliente: (id: string) => void;

  // Fornecedores
  fornecedores: Fornecedor[];
  adicionarFornecedor: (
    fornecedor: Omit<Fornecedor, "id" | "dataCriacao">,
  ) => void;
  editarFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => void;
  excluirFornecedor: (id: string) => void;

  // Setores
  setores: Setor[];
  adicionarSetor: (setor: Omit<Setor, "id" | "dataCriacao">) => void;
  editarSetor: (id: string, setor: Partial<Setor>) => void;
  excluirSetor: (id: string) => void;

  // Cidades
  cidades: Cidade[];
  adicionarCidade: (cidade: Omit<Cidade, "id" | "dataCriacao">) => void;
  editarCidade: (id: string, cidade: Partial<Cidade>) => void;
  excluirCidade: (id: string) => void;

  isLoading: boolean;
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
  formasPagamento: [
    {
      id: "1",
      nome: "Dinheiro",
      tipo: "ambos" as const,
      dataCriacao: new Date(),
    },
    { id: "2", nome: "Pix", tipo: "ambos" as const, dataCriacao: new Date() },
    {
      id: "3",
      nome: "Cartão",
      tipo: "ambos" as const,
      dataCriacao: new Date(),
    },
  ],
  setores: [
    { id: "1", nome: "Residencial", dataCriacao: new Date() },
    { id: "2", nome: "Comercial", dataCriacao: new Date() },
  ],
  cidades: [
    { id: "1", nome: "Goiânia", estado: "GO", dataCriacao: new Date() },
  ],
};

// Funções para carregar dados do localStorage
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

  // Estados para todas as entidades
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [descricoes, setDescricoes] = useState<Descricao[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const categoriasStorage = carregarEntidadeDoStorage<Categoria>(
      "categorias",
      entidadesEssenciais.categorias,
    );
    const descricoesStorage =
      carregarEntidadeDoStorage<Descricao>("descricoes");
    const formasStorage = carregarEntidadeDoStorage<FormaPagamento>(
      "formasPagamento",
      entidadesEssenciais.formasPagamento,
    );
    const clientesStorage = carregarEntidadeDoStorage<Cliente>("clientes");
    const fornecedoresStorage =
      carregarEntidadeDoStorage<Fornecedor>("fornecedores");
    const setoresStorage = carregarEntidadeDoStorage<Setor>(
      "setores",
      entidadesEssenciais.setores,
    );
    const cidadesStorage = carregarEntidadeDoStorage<Cidade>(
      "cidades",
      entidadesEssenciais.cidades,
    );

    setCategorias(categoriasStorage);
    setDescricoes(descricoesStorage);
    setFormasPagamento(formasStorage);
    setClientes(clientesStorage);
    setFornecedores(fornecedoresStorage);
    setSetores(setoresStorage);
    setCidades(cidadesStorage);

    setIsLoading(false);
  }, []);

  // Funções para Categorias
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

  // Funções para Descrições
  const adicionarDescricao = (
    novaDescricao: Omit<Descricao, "id" | "dataCriacao">,
  ) => {
    const descricao: Descricao = {
      ...novaDescricao,
      id: Date.now().toString(),
      dataCriacao: new Date(),
    };
    const novasDescricoes = [...descricoes, descricao];
    setDescricoes(novasDescricoes);
    salvarEntidadeNoStorage("descricoes", novasDescricoes);
  };

  const editarDescricao = (
    id: string,
    dadosAtualizados: Partial<Descricao>,
  ) => {
    const descricoesAtualizadas = descricoes.map((descricao) =>
      descricao.id === id ? { ...descricao, ...dadosAtualizados } : descricao,
    );
    setDescricoes(descricoesAtualizadas);
    salvarEntidadeNoStorage("descricoes", descricoesAtualizadas);
  };

  const excluirDescricao = (id: string) => {
    const descricoesAtualizadas = descricoes.filter(
      (descricao) => descricao.id !== id,
    );
    setDescricoes(descricoesAtualizadas);
    salvarEntidadeNoStorage("descricoes", descricoesAtualizadas);
  };

  // Funções para Formas de Pagamento
  const adicionarFormaPagamento = (
    novaForma: Omit<FormaPagamento, "id" | "dataCriacao">,
  ) => {
    const forma: FormaPagamento = {
      ...novaForma,
      id: Date.now().toString(),
      dataCriacao: new Date(),
    };
    const novasFormas = [...formasPagamento, forma];
    setFormasPagamento(novasFormas);
    salvarEntidadeNoStorage("formasPagamento", novasFormas);
  };

  const editarFormaPagamento = (
    id: string,
    dadosAtualizados: Partial<FormaPagamento>,
  ) => {
    const formasAtualizadas = formasPagamento.map((forma) =>
      forma.id === id ? { ...forma, ...dadosAtualizados } : forma,
    );
    setFormasPagamento(formasAtualizadas);
    salvarEntidadeNoStorage("formasPagamento", formasAtualizadas);
  };

  const excluirFormaPagamento = (id: string) => {
    const formasAtualizadas = formasPagamento.filter(
      (forma) => forma.id !== id,
    );
    setFormasPagamento(formasAtualizadas);
    salvarEntidadeNoStorage("formasPagamento", formasAtualizadas);
  };

  // Funções para Clientes
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

  // Funções para Fornecedores
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

  // Funções para Setores
  const adicionarSetor = (novoSetor: Omit<Setor, "id" | "dataCriacao">) => {
    const setor: Setor = {
      ...novoSetor,
      id: Date.now().toString(),
      dataCriacao: new Date(),
    };
    const novosSetores = [...setores, setor];
    setSetores(novosSetores);
    salvarEntidadeNoStorage("setores", novosSetores);
  };

  const editarSetor = (id: string, dadosAtualizados: Partial<Setor>) => {
    const setoresAtualizados = setores.map((setor) =>
      setor.id === id ? { ...setor, ...dadosAtualizados } : setor,
    );
    setSetores(setoresAtualizados);
    salvarEntidadeNoStorage("setores", setoresAtualizados);
  };

  const excluirSetor = (id: string) => {
    const setoresAtualizados = setores.filter((setor) => setor.id !== id);
    setSetores(setoresAtualizados);
    salvarEntidadeNoStorage("setores", setoresAtualizados);
  };

  // Funç��es para Cidades
  const adicionarCidade = (novaCidade: Omit<Cidade, "id" | "dataCriacao">) => {
    const cidade: Cidade = {
      ...novaCidade,
      id: Date.now().toString(),
      dataCriacao: new Date(),
    };
    const novasCidades = [...cidades, cidade];
    setCidades(novasCidades);
    salvarEntidadeNoStorage("cidades", novasCidades);
  };

  const editarCidade = (id: string, dadosAtualizados: Partial<Cidade>) => {
    const cidadesAtualizadas = cidades.map((cidade) =>
      cidade.id === id ? { ...cidade, ...dadosAtualizados } : cidade,
    );
    setCidades(cidadesAtualizadas);
    salvarEntidadeNoStorage("cidades", cidadesAtualizadas);
  };

  const excluirCidade = (id: string) => {
    const cidadesAtualizadas = cidades.filter((cidade) => cidade.id !== id);
    setCidades(cidadesAtualizadas);
    salvarEntidadeNoStorage("cidades", cidadesAtualizadas);
  };

  const value = {
    // Estados
    categorias,
    descricoes,
    formasPagamento,
    clientes,
    fornecedores,
    setores,
    cidades,
    isLoading,

    // Funções para Categorias
    adicionarCategoria,
    editarCategoria,
    excluirCategoria,

    // Funções para Descrições
    adicionarDescricao,
    editarDescricao,
    excluirDescricao,

    // Funções para Formas de Pagamento
    adicionarFormaPagamento,
    editarFormaPagamento,
    excluirFormaPagamento,

    // Funções para Clientes
    adicionarCliente,
    editarCliente,
    excluirCliente,

    // Funções para Fornecedores
    adicionarFornecedor,
    editarFornecedor,
    excluirFornecedor,

    // Funções para Setores
    adicionarSetor,
    editarSetor,
    excluirSetor,

    // Funções para Cidades
    adicionarCidade,
    editarCidade,
    excluirCidade,
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
