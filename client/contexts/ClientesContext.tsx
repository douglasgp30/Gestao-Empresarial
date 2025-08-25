import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Cliente } from "@shared/types";

interface ClientesContextType {
  clientes: Cliente[];
  adicionarCliente: (
    cliente: Omit<Cliente, "id" | "dataCriacao">,
  ) => Promise<Cliente>;
  editarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  excluirCliente: (id: string) => Promise<void>;
  buscarCliente: (id: string) => Cliente | undefined;
  filtrarClientes: (termo: string) => Cliente[];
  recarregarClientes: () => Promise<void>;
  isLoading: boolean;
}

const ClientesContext = createContext<ClientesContextType | undefined>(
  undefined,
);

export function ClientesProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar clientes da API
  const carregarClientesAPI = useCallback(async () => {
    try {
      console.log("[ClientesContext] Carregando clientes da API...");
      const response = await fetch("/api/clientes");

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const clientesAPI = await response.json();
      console.log("[ClientesContext] Clientes carregados da API:", clientesAPI);

      // Converter dados da API para o formato esperado
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
      return clientesFormatados;
    } catch (error) {
      console.error(
        "[ClientesContext] Erro ao carregar clientes da API:",
        error,
      );
      // Em caso de erro, carregar do localStorage como fallback
      return carregarClientesLocalStorage();
    }
  }, []);

  // Função para carregar clientes do localStorage (fallback)
  const carregarClientesLocalStorage = useCallback((): Cliente[] => {
    try {
      console.log(
        "[ClientesContext] Carregando clientes do localStorage como fallback...",
      );
      const clientes = localStorage.getItem("clientes");
      if (clientes) {
        const parsedClientes = JSON.parse(clientes);
        return parsedClientes.map((c: any) => ({
          ...c,
          dataCriacao: new Date(c.dataCriacao),
        }));
      }
      return [];
    } catch (error) {
      console.warn(
        "[ClientesContext] Erro ao carregar clientes do localStorage:",
        error,
      );
      return [];
    }
  }, []);

  // Salvar no localStorage como backup
  const salvarClientesNoLocalStorage = useCallback((clientes: Cliente[]) => {
    try {
      localStorage.setItem("clientes", JSON.stringify(clientes));
    } catch (error) {
      console.warn(
        "[ClientesContext] Erro ao salvar clientes no localStorage:",
        error,
      );
    }
  }, []);

  // ATENÇÃO: NÃO ADICIONAR clientes.length como dependência aqui pois causa PISCAR na tela!
  // Isso criaria um ciclo: recarregar → atualizar clientes → length muda → recriar função → re-renderizar
  const recarregarClientes = useCallback(async () => {
    console.log("[ClientesContext] 🔄 Iniciando recarregamento manual dos clientes...");
    setIsLoading(true);
    try {
      await carregarClientesAPI();
      console.log("[ClientesContext] ✅ Recarregamento concluído");
    } catch (error) {
      console.error("[ClientesContext] ❌ Erro ao recarregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientesAPI]); // SOMENTE carregarClientesAPI como dependência

  // Carregar dados na inicialização
  useEffect(() => {
    const inicializar = async () => {
      setIsLoading(true);
      try {
        await carregarClientesAPI();
      } catch (error) {
        console.error("[ClientesContext] Erro ao inicializar:", error);
      } finally {
        setIsLoading(false);
      }
    };
    inicializar();
  }, [carregarClientesAPI]);

  // Listener para forçar recarregamento quando cliente é criado
  useEffect(() => {
    const handleClienteCriado = async (event: CustomEvent) => {
      console.log("[ClientesContext] Evento cliente-criado recebido:", event.detail);

      // Forçar recarregamento após um breve delay
      setTimeout(async () => {
        try {
          await recarregarClientes();
          console.log("[ClientesContext] Clientes recarregados após criação");
        } catch (error) {
          console.error("[ClientesContext] Erro ao recarregar após criação:", error);
        }
      }, 500);
    };

    window.addEventListener('cliente-criado', handleClienteCriado as EventListener);

    return () => {
      window.removeEventListener('cliente-criado', handleClienteCriado as EventListener);
    };
  }, [recarregarClientes]);

  // Salvar no localStorage sempre que clientes mudarem (backup)
  useEffect(() => {
    if (!isLoading && clientes.length > 0) {
      salvarClientesNoLocalStorage(clientes);
    }
  }, [clientes, isLoading, salvarClientesNoLocalStorage]);

  const adicionarCliente = async (
    novoCliente: Omit<Cliente, "id" | "dataCriacao">,
  ): Promise<Cliente> => {
    try {
      console.log("[ClientesContext] Adicionando cliente:", novoCliente);

      // Preparar dados para a API (mapeamento de campos)
      const dadosAPI = {
        nome: novoCliente.nome,
        telefone: novoCliente.telefonePrincipal, // API espera 'telefone'
        email: novoCliente.email || null,
        endereco: novoCliente.complemento || undefined, // API espera 'endereco'
        observacoes: undefined, // Campo opcional da API
      };

      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosAPI),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const clienteAPI = await response.json();
      console.log("[ClientesContext] ✅ Cliente criado na API:", clienteAPI);

      // Converter resposta da API para formato esperado
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

      // Atualizar estado local imediatamente
      setClientes((prev) => {
        const novosClientes = [...prev, cliente];
        console.log("[ClientesContext] 📝 Estado local atualizado, total de clientes:", novosClientes.length);
        return novosClientes;
      });

      // Forçar recarregamento após criar para garantir sincronização
      setTimeout(async () => {
        try {
          console.log("[ClientesContext] 🔄 Forçando recarregamento após criação...");
          await carregarClientesAPI();
        } catch (error) {
          console.warn("[ClientesContext] ⚠️ Erro no recarregamento pós-criação:", error);
        }
      }, 200);

      return cliente;
    } catch (error) {
      console.error("[ClientesContext] ❌ Erro ao adicionar cliente:", error);

      // Fallback: salvar apenas localmente
      const cliente: Cliente = {
        ...novoCliente,
        id: `temp_${Date.now()}`,
        dataCriacao: new Date(),
      };
      setClientes((prev) => [...prev, cliente]);

      throw error; // Re-throw para o componente lidar com o erro
    }
  };

  const editarCliente = async (
    id: string,
    dadosAtualizados: Partial<Cliente>,
  ): Promise<void> => {
    try {
      console.log("[ClientesContext] Editando cliente:", id, dadosAtualizados);

      // Preparar dados para a API
      const dadosAPI = {
        nome: dadosAtualizados.nome,
        telefone: dadosAtualizados.telefonePrincipal,
        email: dadosAtualizados.email || null,
        endereco: dadosAtualizados.complemento || undefined,
      };

      const response = await fetch(`/api/clientes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosAPI),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      // Atualizar estado local
      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === id ? { ...cliente, ...dadosAtualizados } : cliente,
        ),
      );
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

      // Atualizar estado local
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
    } catch (error) {
      console.error("[ClientesContext] Erro ao excluir cliente:", error);
      throw error;
    }
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
      if (cliente.telefonePrincipal.includes(termo)) return true;
      if (
        cliente.telefoneSecundario &&
        cliente.telefoneSecundario.includes(termo)
      )
        return true;

      // Pesquisar por email
      if (cliente.email && cliente.email.toLowerCase().includes(termoLower))
        return true;

      // Pesquisar por endereço
      if (
        cliente.complemento &&
        cliente.complemento.toLowerCase().includes(termoLower)
      )
        return true;
      if (
        cliente.logradouro &&
        cliente.logradouro.toLowerCase().includes(termoLower)
      )
        return true;
      if (cliente.cep && cliente.cep.includes(termo)) return true;

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
    recarregarClientes,
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
