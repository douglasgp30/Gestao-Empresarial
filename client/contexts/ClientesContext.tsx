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
import { Cliente } from "@shared/types";

interface ClientesContextType {
  clientes: Cliente[];
  adicionarCliente: (cliente: Omit<Cliente, "id" | "dataCriacao">) => Promise<Cliente>;
  editarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  excluirCliente: (id: string) => Promise<void>;
  buscarCliente: (id: string) => Cliente | undefined;
  filtrarClientes: (termo: string) => Cliente[];
  recarregarClientes: () => Promise<void>;
  isLoading: boolean;
}

const ClientesContext = createContext<ClientesContextType | undefined>(undefined);

export function ClientesProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inicializado = useRef(false);

  // CARREGAMENTO MANUAL APENAS - SEM LOOPS
  const carregarClientesAPI = useCallback(async () => {
    try {
      console.log("[ClientesContext] Carregamento MANUAL de clientes...");
      
      const response = await fetch("/api/clientes", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const clientesAPI = await response.json();
      console.log("[ClientesContext] Clientes carregados MANUALMENTE:", clientesAPI.length);

      const clientesFormatados: Cliente[] = clientesAPI.map((c: any) => ({
        id: c.id.toString(),
        nome: c.nome,
        cpf: c.cpf || undefined,
        telefonePrincipal: c.telefonePrincipal,
        telefoneSecundario: c.telefoneSecundario || undefined,
        email: c.email || undefined,
        cep: c.cep || undefined,
        logradouro: c.logradouro || undefined,
        complemento: c.complemento || undefined,
        dataCriacao: new Date(c.dataCriacao),
      }));

      setClientes(clientesFormatados);
      
      // Backup no localStorage
      try {
        localStorage.setItem("clientes", JSON.stringify(clientesFormatados));
      } catch (storageError) {
        console.warn("[ClientesContext] Erro ao salvar no localStorage:", storageError);
      }

      return clientesFormatados;
    } catch (error) {
      console.error("[ClientesContext] Erro ao carregar clientes da API:", error);
      return carregarClientesLocalStorage();
    }
  }, []);

  const carregarClientesLocalStorage = useCallback((): Cliente[] => {
    try {
      console.log("[ClientesContext] Carregando clientes do localStorage como fallback...");
      const clientes = localStorage.getItem("clientes");
      if (clientes) {
        const parsedClientes = JSON.parse(clientes);
        const clientesFormatados = parsedClientes.map((c: any) => ({
          ...c,
          dataCriacao: new Date(c.dataCriacao),
        }));
        setClientes(clientesFormatados);
        return clientesFormatados;
      }
      setClientes([]);
      return [];
    } catch (error) {
      console.warn("[ClientesContext] Erro ao carregar clientes do localStorage:", error);
      setClientes([]);
      return [];
    }
  }, []);

  // CARREGAMENTO INICIAL ÚNICA VEZ - SEM LOOPS
  useEffect(() => {
    if (inicializado.current || typeof window === "undefined") return;
    inicializado.current = true;

    console.log("🚨 [ClientesContext] CARREGAMENTO INICIAL ÚNICO E CONTROLADO");
    
    const inicializar = async () => {
      setIsLoading(true);
      try {
        // NÃO carregar na inicialização para evitar piscar
        console.log("✅ [ClientesContext] Inicialização SEM carregamento automático");
      } catch (error) {
        console.error("[ClientesContext] Erro ao inicializar:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(inicializar, 100);
  }, []);

  const adicionarCliente = async (novoCliente: Omit<Cliente, "id" | "dataCriacao">): Promise<Cliente> => {
    try {
      console.log("[ClientesContext] Adicionando cliente:", novoCliente);

      const dadosAPI = {
        nome: novoCliente.nome,
        telefone: novoCliente.telefonePrincipal,
        email: novoCliente.email || null,
        endereco: novoCliente.complemento || undefined,
        observacoes: undefined,
      };

      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAPI),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const clienteAPI = await response.json();
      console.log("[ClientesContext] Cliente criado na API:", clienteAPI);

      const cliente: Cliente = {
        id: clienteAPI.id.toString(),
        nome: clienteAPI.nome,
        cpf: clienteAPI.cpf || undefined,
        telefonePrincipal: clienteAPI.telefone,
        telefoneSecundario: undefined,
        email: clienteAPI.email || undefined,
        cep: undefined,
        logradouro: undefined,
        complemento: clienteAPI.endereco || undefined,
        dataCriacao: new Date(clienteAPI.dataCriacao),
      };

      setClientes((prev) => [...prev, cliente]);

      // Atualizar localStorage
      try {
        const clientesAtuais = [...clientes, cliente];
        localStorage.setItem("clientes", JSON.stringify(clientesAtuais));
      } catch {}

      return cliente;
    } catch (error) {
      console.error("[ClientesContext] Erro ao adicionar cliente:", error);

      // Fallback: salvar apenas localmente
      const cliente: Cliente = {
        ...novoCliente,
        id: `temp_${Date.now()}`,
        dataCriacao: new Date(),
      };
      setClientes((prev) => [...prev, cliente]);

      throw error;
    }
  };

  const editarCliente = async (id: string, dadosAtualizados: Partial<Cliente>): Promise<void> => {
    try {
      console.log("[ClientesContext] Editando cliente:", id, dadosAtualizados);

      const dadosAPI = {
        nome: dadosAtualizados.nome,
        telefone: dadosAtualizados.telefonePrincipal,
        email: dadosAtualizados.email || null,
        endereco: dadosAtualizados.complemento || undefined,
      };

      const response = await fetch(`/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAPI),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === id ? { ...cliente, ...dadosAtualizados } : cliente,
        ),
      );

      // Atualizar localStorage
      try {
        const clientesAtualizados = clientes.map((cliente) =>
          cliente.id === id ? { ...cliente, ...dadosAtualizados } : cliente,
        );
        localStorage.setItem("clientes", JSON.stringify(clientesAtualizados));
      } catch {}
    } catch (error) {
      console.error("[ClientesContext] Erro ao editar cliente:", error);
      throw error;
    }
  };

  const excluirCliente = async (id: string): Promise<void> => {
    try {
      console.log("[ClientesContext] Excluindo cliente:", id);

      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));

      // Atualizar localStorage
      try {
        const clientesAtualizados = clientes.filter((cliente) => cliente.id !== id);
        localStorage.setItem("clientes", JSON.stringify(clientesAtualizados));
      } catch {}
    } catch (error) {
      console.error("[ClientesContext] Erro ao excluir cliente:", error);
      throw error;
    }
  };

  const recarregarClientes = useCallback(async () => {
    setIsLoading(true);
    try {
      await carregarClientesAPI();
    } catch (error) {
      console.error("[ClientesContext] Erro ao recarregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientesAPI]);

  const buscarCliente = useCallback((id: string): Cliente | undefined => {
    return clientes.find((cliente) => cliente.id === id);
  }, [clientes]);

  const filtrarClientes = useCallback((termo: string): Cliente[] => {
    if (!termo.trim()) return clientes;

    const termoLower = termo.toLowerCase();
    return clientes.filter((cliente) => {
      if (cliente.nome.toLowerCase().includes(termoLower)) return true;
      if (cliente.cpf && cliente.cpf.includes(termo)) return true;
      if (cliente.telefonePrincipal.includes(termo)) return true;
      if (cliente.telefoneSecundario && cliente.telefoneSecundario.includes(termo)) return true;
      if (cliente.email && cliente.email.toLowerCase().includes(termoLower)) return true;
      if (cliente.complemento && cliente.complemento.toLowerCase().includes(termoLower)) return true;
      if (cliente.logradouro && cliente.logradouro.toLowerCase().includes(termoLower)) return true;
      if (cliente.cep && cliente.cep.includes(termo)) return true;
      return false;
    });
  }, [clientes]);

  const value = useMemo(() => ({
    clientes,
    adicionarCliente,
    editarCliente,
    excluirCliente,
    buscarCliente,
    filtrarClientes,
    recarregarClientes,
    isLoading,
  }), [clientes, buscarCliente, filtrarClientes, recarregarClientes, isLoading]);

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
