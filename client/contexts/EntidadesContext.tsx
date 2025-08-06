import React, { createContext, useContext, useState, ReactNode } from "react";
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

// Mock data inicial - Categorias
const mockCategorias: Categoria[] = [
  // Categorias de Receitas
  {
    id: "1",
    nome: "Serviços",
    tipo: "receita",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "2",
    nome: "Taxas",
    tipo: "receita",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "3",
    nome: "Emergência",
    tipo: "receita",
    dataCriacao: new Date(2024, 10, 1),
  },
  // Categorias de Despesas
  {
    id: "4",
    nome: "Operacional",
    tipo: "despesa",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "5",
    nome: "Administrativo",
    tipo: "despesa",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "6",
    nome: "Manutenção",
    tipo: "despesa",
    dataCriacao: new Date(2024, 10, 1),
  },
];

// Mock data inicial - Descrições
const mockDescricoes: Descricao[] = [
  // Descrições de Receitas
  {
    id: "1",
    nome: "Desentupimento de pia",
    tipo: "receita",
    categoria: "Serviços",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "2",
    nome: "Desentupimento de vaso sanitário",
    tipo: "receita",
    categoria: "Serviços",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "3",
    nome: "Limpeza de caixa d'água",
    tipo: "receita",
    categoria: "Serviços",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "4",
    nome: "Dedetização",
    tipo: "receita",
    categoria: "Serviços",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "5",
    nome: "Taxa de urgência",
    tipo: "receita",
    categoria: "Taxas",
    dataCriacao: new Date(2024, 10, 1),
  },
  // Descrições de Despesas
  {
    id: "6",
    nome: "Combustível",
    tipo: "despesa",
    categoria: "Operacional",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "7",
    nome: "Almoço da equipe",
    tipo: "despesa",
    categoria: "Administrativo",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "8",
    nome: "Manutenção do equipamento",
    tipo: "despesa",
    categoria: "Manutenção",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "9",
    nome: "Material de limpeza",
    tipo: "despesa",
    categoria: "Operacional",
    dataCriacao: new Date(2024, 10, 1),
  },
];

const mockFormasPagamento: FormaPagamento[] = [
  {
    id: "1",
    nome: "Dinheiro",
    ativa: true,
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "2",
    nome: "Pix",
    ativa: true,
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "3",
    nome: "Cartão de Débito",
    ativa: true,
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "4",
    nome: "Cartão de Crédito",
    ativa: true,
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "5",
    nome: "Boleto",
    ativa: true,
    dataCriacao: new Date(2024, 10, 1),
  },
];

const mockClientes: Cliente[] = [
  {
    id: "1",
    nome: "Maria Silva Santos",
    cpf: "123.456.789-01",
    telefone1: "(11) 99999-1111",
    telefone2: "(11) 3333-1111",
    email: "maria@email.com",
    endereco: "Rua das Flores, 123 - São Paulo/SP",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "2",
    nome: "Empresa XYZ Ltda",
    telefone1: "(11) 99999-2222",
    email: "contato@empresaxyz.com",
    endereco: "Av. Paulista, 1000 - São Paulo/SP",
    dataCriacao: new Date(2024, 10, 2),
  },
  {
    id: "3",
    nome: "Condomínio Residencial Verde",
    telefone1: "(11) 99999-3333",
    endereco: "Rua Verde, 500 - São Paulo/SP",
    dataCriacao: new Date(2024, 10, 3),
  },
];

const mockFornecedores: Fornecedor[] = [
  {
    id: "1",
    nome: "Posto de Gasolina ABC",
    telefone: "(11) 99999-4444",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "2",
    nome: "Fornecedor de Materiais Silva",
    telefone: "(11) 99999-5555",
    dataCriacao: new Date(2024, 10, 2),
  },
  {
    id: "3",
    nome: "Oficina do João - Manutenção",
    telefone: "(11) 99999-6666",
    dataCriacao: new Date(2024, 10, 3),
  },
];

const mockSetores: Setor[] = [
  {
    id: "1",
    nome: "Residencial",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "2",
    nome: "Comercial",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "3",
    nome: "Industrial",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "4",
    nome: "Condomínio",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "5",
    nome: "Emergência",
    dataCriacao: new Date(2024, 10, 1),
  },
];

const mockCidades: Cidade[] = [
  {
    id: "1",
    nome: "São Paulo",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "2",
    nome: "Santos",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "3",
    nome: "São Bernardo do Campo",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "4",
    nome: "Santo André",
    dataCriacao: new Date(2024, 10, 1),
  },
  {
    id: "5",
    nome: "Diadema",
    dataCriacao: new Date(2024, 10, 1),
  },
];

export function EntidadesProvider({ children }: { children: ReactNode }) {
  const [descricoes, setDescricoes] = useState<Descricao[]>(mockDescricoes);
  const [formasPagamento, setFormasPagamento] =
    useState<FormaPagamento[]>(mockFormasPagamento);
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [fornecedores, setFornecedores] =
    useState<Fornecedor[]>(mockFornecedores);
  const [setores, setSetores] = useState<Setor[]>(mockSetores);
  const [cidades, setCidades] = useState<Cidade[]>(mockCidades);
  const [isLoading, setIsLoading] = useState(false);

  // Descrições
  const adicionarDescricao = (
    novaDescricao: Omit<Descricao, "id" | "dataCriacao">,
  ) => {
    const id = Date.now().toString();
    const descricao: Descricao = {
      ...novaDescricao,
      id,
      dataCriacao: new Date(),
    };
    setDescricoes((prev) => [...prev, descricao]);
  };

  const editarDescricao = (
    id: string,
    dadosAtualizados: Partial<Descricao>,
  ) => {
    setDescricoes((prev) =>
      prev.map((descricao) =>
        descricao.id === id ? { ...descricao, ...dadosAtualizados } : descricao,
      ),
    );
  };

  const excluirDescricao = (id: string) => {
    setDescricoes((prev) => prev.filter((descricao) => descricao.id !== id));
  };

  // Formas de Pagamento
  const adicionarFormaPagamento = (
    novaForma: Omit<FormaPagamento, "id" | "dataCriacao">,
  ) => {
    const id = Date.now().toString();
    const forma: FormaPagamento = {
      ...novaForma,
      id,
      dataCriacao: new Date(),
    };
    setFormasPagamento((prev) => [...prev, forma]);
  };

  const editarFormaPagamento = (
    id: string,
    dadosAtualizados: Partial<FormaPagamento>,
  ) => {
    setFormasPagamento((prev) =>
      prev.map((forma) =>
        forma.id === id ? { ...forma, ...dadosAtualizados } : forma,
      ),
    );
  };

  const excluirFormaPagamento = (id: string) => {
    setFormasPagamento((prev) => prev.filter((forma) => forma.id !== id));
  };

  // Clientes
  const adicionarCliente = (
    novoCliente: Omit<Cliente, "id" | "dataCriacao">,
  ) => {
    const id = Date.now().toString();
    const cliente: Cliente = {
      ...novoCliente,
      id,
      dataCriacao: new Date(),
    };
    setClientes((prev) => [...prev, cliente]);
  };

  const editarCliente = (id: string, dadosAtualizados: Partial<Cliente>) => {
    setClientes((prev) =>
      prev.map((cliente) =>
        cliente.id === id ? { ...cliente, ...dadosAtualizados } : cliente,
      ),
    );
  };

  const excluirCliente = (id: string) => {
    setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
  };

  // Fornecedores
  const adicionarFornecedor = (
    novoFornecedor: Omit<Fornecedor, "id" | "dataCriacao">,
  ) => {
    const id = Date.now().toString();
    const fornecedor: Fornecedor = {
      ...novoFornecedor,
      id,
      dataCriacao: new Date(),
    };
    setFornecedores((prev) => [...prev, fornecedor]);
  };

  const editarFornecedor = (
    id: string,
    dadosAtualizados: Partial<Fornecedor>,
  ) => {
    setFornecedores((prev) =>
      prev.map((fornecedor) =>
        fornecedor.id === id
          ? { ...fornecedor, ...dadosAtualizados }
          : fornecedor,
      ),
    );
  };

  const excluirFornecedor = (id: string) => {
    setFornecedores((prev) =>
      prev.filter((fornecedor) => fornecedor.id !== id),
    );
  };

  // Setores
  const adicionarSetor = (novoSetor: Omit<Setor, "id" | "dataCriacao">) => {
    const id = Date.now().toString();
    const setor: Setor = {
      ...novoSetor,
      id,
      dataCriacao: new Date(),
    };
    setSetores((prev) => [...prev, setor]);
  };

  const editarSetor = (id: string, dadosAtualizados: Partial<Setor>) => {
    setSetores((prev) =>
      prev.map((setor) =>
        setor.id === id ? { ...setor, ...dadosAtualizados } : setor,
      ),
    );
  };

  const excluirSetor = (id: string) => {
    setSetores((prev) => prev.filter((setor) => setor.id !== id));
  };

  // Cidades
  const adicionarCidade = (novaCidade: Omit<Cidade, "id" | "dataCriacao">) => {
    const id = Date.now().toString();
    const cidade: Cidade = {
      ...novaCidade,
      id,
      dataCriacao: new Date(),
    };
    setCidades((prev) => [...prev, cidade]);
  };

  const editarCidade = (id: string, dadosAtualizados: Partial<Cidade>) => {
    setCidades((prev) =>
      prev.map((cidade) =>
        cidade.id === id ? { ...cidade, ...dadosAtualizados } : cidade,
      ),
    );
  };

  const excluirCidade = (id: string) => {
    setCidades((prev) => prev.filter((cidade) => cidade.id !== id));
  };

  const value = {
    // Descrições
    descricoes,
    adicionarDescricao,
    editarDescricao,
    excluirDescricao,

    // Formas de Pagamento
    formasPagamento,
    adicionarFormaPagamento,
    editarFormaPagamento,
    excluirFormaPagamento,

    // Clientes
    clientes,
    adicionarCliente,
    editarCliente,
    excluirCliente,

    // Fornecedores
    fornecedores,
    adicionarFornecedor,
    editarFornecedor,
    excluirFornecedor,

    // Setores
    setores,
    adicionarSetor,
    editarSetor,
    excluirSetor,

    // Cidades
    cidades,
    adicionarCidade,
    editarCidade,
    excluirCidade,

    isLoading,
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
    throw new Error("useEntidades must be used within an EntidadesProvider");
  }
  return context;
}
