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

  // 🚨 CRIAR DADOS BÁSICOS SE NÃO EXISTIREM
  const criarClientesBasicos = useCallback(() => {
    console.log("🔧 [ClientesContext] Criando clientes básicos...");
    
    const clientesPadrao: Cliente[] = [
      {
        id: "1",
        nome: "Cliente Exemplo",
        telefonePrincipal: "(62) 99999-9999",
        email: "cliente@exemplo.com",
        complemento: "Centro, Goiânia",
        dataCriacao: new Date(),
      },
      {
        id: "2", 
        nome: "Empresa ABC",
        telefonePrincipal: "(62) 88888-8888",
        email: "contato@abc.com",
        complemento: "Setor Oeste, Goiânia",
        dataCriacao: new Date(),
      }
    ];

    // Verificar se clientes existem
    const clientesExistentes = localStorage.getItem("clientes");
    if (!clientesExistentes) {
      localStorage.setItem("clientes", JSON.stringify(clientesPadrao));
      console.log("✅ [ClientesContext] Clientes básicos criados");
    }

    setClientes(clientesPadrao);
  }, []);

  // 🚨 CARREGAR APENAS DO LOCALSTORAGE - ZERO APIS
  const carregarClientesLocalStorage = useCallback(() => {
    try {
      console.log("📂 [ClientesContext] Carregando clientes APENAS do localStorage");
      const clientesStorage = localStorage.getItem("clientes");
      
      if (clientesStorage) {
        const parsedClientes = JSON.parse(clientesStorage);
        const clientesFormatados = parsedClientes.map((c: any) => ({
          ...c,
          dataCriacao: new Date(c.dataCriacao),
        }));
        setClientes(clientesFormatados);
        console.log(`📂 [ClientesContext] ${clientesFormatados.length} clientes carregados do localStorage`);
      } else {
        console.log("📂 [ClientesContext] Clientes não encontrados, criando dados básicos");
        criarClientesBasicos();
      }
    } catch (error) {
      console.warn("[ClientesContext] Erro ao carregar clientes do localStorage:", error);
      // Em caso de erro, criar dados básicos
      criarClientesBasicos();
    }
  }, [criarClientesBasicos]);

  // 🚨 CARREGAMENTO INICIAL FORÇADO E ÚNICO - SEM LOOPS
  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    console.log("🚀 [ClientesContext] INICIALIZAÇÃO ÚNICA E FORÇADA");
    
    const inicializar = () => {
      setIsLoading(true);
      try {
        // FORÇAR carregamento dos dados
        carregarClientesLocalStorage();
        console.log("✅ [ClientesContext] Dados carregados na inicialização");
      } catch (error) {
        console.error("[ClientesContext] Erro ao inicializar:", error);
        criarClientesBasicos();
      } finally {
        setIsLoading(false);
      }
    };

    // Executar IMEDIATAMENTE
    inicializar();
  }, [carregarClientesLocalStorage, criarClientesBasicos]);

  // 🚨 ADICIONAR CLIENTE - APENAS LOCALSTORAGE
  const adicionarCliente = async (novoCliente: Omit<Cliente, "id" | "dataCriacao">): Promise<Cliente> => {
    try {
      console.log("➕ [ClientesContext] Adicionando cliente APENAS no localStorage:", novoCliente);

      // Gerar ID único
      const novoId = Date.now().toString();
      
      const cliente: Cliente = {
        ...novoCliente,
        id: novoId,
        dataCriacao: new Date(),
      };

      // Carregar clientes existentes
      const clientesExistentes = JSON.parse(localStorage.getItem("clientes") || "[]");
      const novosClientes = [...clientesExistentes, cliente];
      
      // Salvar no localStorage
      localStorage.setItem("clientes", JSON.stringify(novosClientes));
      
      // Atualizar estado
      setClientes((prev) => [...prev, cliente]);

      console.log("✅ [ClientesContext] Cliente adicionado com sucesso:", novoId);
      return cliente;
    } catch (error) {
      console.error("[ClientesContext] Erro ao adicionar cliente:", error);
      throw error;
    }
  };

  // 🚨 EDITAR CLIENTE - APENAS LOCALSTORAGE
  const editarCliente = async (id: string, dadosAtualizados: Partial<Cliente>): Promise<void> => {
    try {
      console.log("✏️ [ClientesContext] Editando cliente no localStorage:", id, dadosAtualizados);

      // Carregar clientes existentes
      const clientesExistentes = JSON.parse(localStorage.getItem("clientes") || "[]");
      const clientesAtualizados = clientesExistentes.map((cliente: any) =>
        cliente.id === id ? { ...cliente, ...dadosAtualizados } : cliente,
      );

      // Salvar no localStorage
      localStorage.setItem("clientes", JSON.stringify(clientesAtualizados));
      
      // Atualizar estado
      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === id ? { ...cliente, ...dadosAtualizados } : cliente,
        ),
      );

      console.log("✅ [ClientesContext] Cliente editado com sucesso:", id);
    } catch (error) {
      console.error("[ClientesContext] Erro ao editar cliente:", error);
      throw error;
    }
  };

  // 🚨 EXCLUIR CLIENTE - APENAS LOCALSTORAGE
  const excluirCliente = async (id: string): Promise<void> => {
    try {
      console.log("🗑️ [ClientesContext] Excluindo cliente do localStorage:", id);

      // Carregar clientes existentes
      const clientesExistentes = JSON.parse(localStorage.getItem("clientes") || "[]");
      const clientesAtualizados = clientesExistentes.filter((cliente: any) => cliente.id !== id);
      
      // Salvar no localStorage
      localStorage.setItem("clientes", JSON.stringify(clientesAtualizados));
      
      // Atualizar estado
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));

      console.log("✅ [ClientesContext] Cliente excluído com sucesso:", id);
    } catch (error) {
      console.error("[ClientesContext] Erro ao excluir cliente:", error);
      throw error;
    }
  };

  // 🚨 RECARREGAR CLIENTES - APENAS LOCALSTORAGE
  const recarregarClientes = useCallback(async () => {
    setIsLoading(true);
    try {
      carregarClientesLocalStorage();
      console.log("🔄 [ClientesContext] Clientes recarregados do localStorage");
    } catch (error) {
      console.error("[ClientesContext] Erro ao recarregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientesLocalStorage]);

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
