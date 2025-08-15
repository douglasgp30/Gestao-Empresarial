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

// Função para carregar clientes reais do localStorage
function carregarClientesReais(): Cliente[] {
  try {
    const clientes = localStorage.getItem("clientes");
    if (clientes) {
      const parsedClientes = JSON.parse(clientes);
      // Converter strings de data de volta para objetos Date
      return parsedClientes.map((c: any) => ({
        ...c,
        dataCriacao: new Date(c.dataCriacao),
      }));
    }
    return [];
  } catch (error) {
    console.warn("Erro ao carregar clientes do localStorage:", error);
    return [];
  }
}

export function ClientesProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCarregando, setIsCarregando] = useState(false);

  // Função para salvar clientes no localStorage
  const salvarClientesNoLocalStorage = useCallback((clientes: Cliente[]) => {
    try {
      localStorage.setItem("clientes", JSON.stringify(clientes));
    } catch (error) {
      console.warn("Erro ao salvar clientes no localStorage:", error);
    }
  }, []);

  // Carregar dados reais do localStorage
  useEffect(() => {
    if (isCarregando) return;

    setIsCarregando(true);
    // Usar timeout para evitar bloqueio
    const timeout = setTimeout(() => {
      try {
        const clientesReais = carregarClientesReais();
        setClientes(clientesReais);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setIsLoading(false);
        setIsCarregando(false);
      }
    }, 100); // Delay mínimo para não bloquear render

    return () => clearTimeout(timeout);
  }, [isCarregando]);

  // Salvar no localStorage sempre que clientes mudarem
  useEffect(() => {
    if (!isLoading) {
      salvarClientesNoLocalStorage(clientes);
    }
  }, [clientes, isLoading]);

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
        if (
          endereco.bairro &&
          endereco.bairro.toLowerCase().includes(termoLower)
        )
          return true;
        if (
          endereco.cidade &&
          endereco.cidade.toLowerCase().includes(termoLower)
        )
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
