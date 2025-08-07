import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Cliente } from "@shared/types";

interface ClientesContextType {
  clientes: Cliente[];
  adicionarCliente: (cliente: Omit<Cliente, "id" | "dataCriacao">) => Cliente;
  editarCliente: (id: string, cliente: Partial<Cliente>) => void;
  excluirCliente: (id: string) => void;
  buscarCliente: (id: string) => Cliente | undefined;
  filtrarClientes: (termo: string) => Cliente[];
  isLoading: boolean;
}

const ClientesContext = createContext<ClientesContextType | undefined>(
  undefined,
);

// Mock data inicial
const mockClientes: Cliente[] = [
  {
    id: "1",
    nome: "João Silva Santos",
    cpf: "123.456.789-00",
    telefone1: "(62) 99999-1234",
    telefone2: "(62) 3333-5678",
    email: "joao.silva@email.com",
    endereco: {
      cep: "74000-000",
      rua: "Rua das Flores",
      numero: "123",
      complemento: "Apto 45",
      bairro: "Centro",
      cidade: "Goiânia",
      estado: "GO",
    },
    dataCriacao: new Date("2024-01-15"),
  },
  {
    id: "2",
    nome: "Maria Oliveira Costa",
    cpf: "987.654.321-00",
    telefone1: "(62) 88888-5678",
    email: "maria.oliveira@email.com",
    endereco: {
      cep: "74100-100",
      rua: "Avenida Central",
      numero: "456",
      bairro: "Setor Norte",
      cidade: "Goiânia",
      estado: "GO",
    },
    dataCriacao: new Date("2024-02-20"),
  },
  {
    id: "3",
    nome: "Carlos Ferreira Lima",
    telefone1: "(62) 77777-9012",
    dataCriacao: new Date("2024-03-10"),
  },
  {
    id: "4",
    nome: "Ana Paula Rodrigues",
    cpf: "456.789.123-00",
    telefone1: "(62) 66666-3456",
    telefone2: "(62) 2222-8765",
    email: "ana.rodrigues@email.com",
    endereco: {
      cep: "74200-200",
      rua: "Rua São João",
      numero: "789",
      complemento: "Casa",
      bairro: "Jardim América",
      cidade: "Goiânia",
      estado: "GO",
    },
    dataCriacao: new Date("2024-03-25"),
  },
];

export function ClientesProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [isLoading, setIsLoading] = useState(false);

  const adicionarCliente = (
    novoCliente: Omit<Cliente, "id" | "dataCriacao">,
  ): Cliente => {
    const cliente: Cliente = {
      ...novoCliente,
      id: Date.now().toString(),
      dataCriacao: new Date(),
    };
    setClientes((prev) => [...prev, cliente]);
    return cliente;
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

  const buscarCliente = (id: string): Cliente | undefined => {
    return clientes.find((cliente) => cliente.id === id);
  };

  const filtrarClientes = (termo: string): Cliente[] => {
    if (!termo.trim()) return clientes;

    const termoLower = termo.toLowerCase();
    return clientes.filter((cliente) => {
      // Pesquisar por nome
      if (cliente.nome.toLowerCase().includes(termoLower)) return true;

      // Pesquisar por CPF
      if (cliente.cpf && cliente.cpf.includes(termo)) return true;

      // Pesquisar por telefone
      if (cliente.telefone1.includes(termo)) return true;
      if (cliente.telefone2 && cliente.telefone2.includes(termo)) return true;

      // Pesquisar por email
      if (cliente.email && cliente.email.toLowerCase().includes(termoLower))
        return true;

      // Pesquisar por endereço
      if (cliente.endereco) {
        const endereco = cliente.endereco;
        if (endereco.rua && endereco.rua.toLowerCase().includes(termoLower))
          return true;
        if (
          endereco.complemento &&
          endereco.complemento.toLowerCase().includes(termoLower)
        )
          return true;
        if (endereco.bairro && endereco.bairro.toLowerCase().includes(termoLower))
          return true;
        if (endereco.cidade && endereco.cidade.toLowerCase().includes(termoLower))
          return true;
        if (endereco.cep && endereco.cep.includes(termo)) return true;
      }

      return false;
    });
  };

  const value = {
    clientes,
    adicionarCliente,
    editarCliente,
    excluirCliente,
    buscarCliente,
    filtrarClientes,
    isLoading,
  };

  return (
    <ClientesContext.Provider value={value}>
      {children}
    </ClientesContext.Provider>
  );
}

export function useClientes() {
  const context = useContext(ClientesContext);
  if (context === undefined) {
    throw new Error("useClientes must be used within a ClientesProvider");
  }
  return context;
}
