import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Funcionario } from "@shared/types";
import { useAuth } from "./AuthContext";
import { funcionariosApi } from "../lib/apiService";

interface FuncionariosContextType {
  funcionarios: Funcionario[];
  filtros: {
    busca?: string;
    tipoAcesso?: "Administrador" | "Operador" | "Técnico" | "todos";
    status?: "ativo" | "inativo" | "todos";
    permissaoAcesso?: boolean;
  };
  estatisticas: {
    totalFuncionarios: number;
    totalAtivos: number;
    totalAdministradores: number;
    totalOperadores: number;
  };
  adicionarFuncionario: (
    funcionario: Omit<Funcionario, "id" | "dataCadastro">,
  ) => Promise<void>;
  editarFuncionario: (id: string, funcionario: Partial<Funcionario>) => void;
  excluirFuncionario: (id: string) => Promise<void>;
  alterarStatusFuncionario: (id: string, ativo: boolean) => void;
  setFiltros: (filtros: any) => void;
  isLoading: boolean;
}

const FuncionariosContext = createContext<FuncionariosContextType | undefined>(
  undefined,
);

// Função para carregar funcionarios reais do localStorage
function carregarFuncionariosReais(): Funcionario[] {
  try {
    const funcionarios = localStorage.getItem("funcionarios");
    if (funcionarios) {
      const parsedFuncionarios = JSON.parse(funcionarios);
      // Converter strings de data de volta para objetos Date
      return parsedFuncionarios.map((f: any) => ({
        ...f,
        dataCadastro: new Date(f.dataCadastro),
      }));
    }
    // Se não houver funcionarios salvos, criar apenas o admin padrão
    return [
      {
        id: "1",
        nomeCompleto: "Administrador do Sistema",
        login: "admin",
        senha: "admin123",
        temAcessoSistema: true,
        tipoAcesso: "Administrador",
        permissoes: {
          acessarDashboard: true,
          verCaixa: true,
          lancarReceita: true,
          lancarDespesa: true,
          editarLancamentos: true,
          verContas: true,
          lancarContasPagar: true,
          lancarContasReceber: true,
          marcarContasPagas: true,
          acessarConfiguracoes: true,
          fazerBackupManual: true,
          gerarRelatorios: true,
          verCadastros: true,
          gerenciarFuncionarios: true,
          alterarPermissoes: true,
        },
        percentualComissao: 0,
        dataCadastro: new Date(),
        ativo: true,
      },
    ];
  } catch (error) {
    console.warn("Erro ao carregar funcionarios do localStorage:", error);
    // Retornar admin padrão em caso de erro
    return [
      {
        id: "1",
        nomeCompleto: "Administrador do Sistema",
        login: "admin",
        senha: "admin123",
        temAcessoSistema: true,
        tipoAcesso: "Administrador",
        permissoes: {
          acessarDashboard: true,
          verCaixa: true,
          lancarReceita: true,
          lancarDespesa: true,
          editarLancamentos: true,
          verContas: true,
          lancarContasPagar: true,
          lancarContasReceber: true,
          marcarContasPagas: true,
          acessarConfiguracoes: true,
          fazerBackupManual: true,
          gerarRelatorios: true,
          verCadastros: true,
          gerenciarFuncionarios: true,
          alterarPermissoes: true,
        },
        percentualComissao: 0,
        dataCadastro: new Date(),
        ativo: true,
      },
    ];
  }
}

export function FuncionariosProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar funcionários da API
  const carregarFuncionarios = async () => {
    try {
      setIsLoading(true);
      const response = await funcionariosApi.listar();
      if (response.error) {
        console.error("Erro ao carregar funcionários:", response.error);
        return;
      }

      // Converter dados da API para o formato do contexto
      const funcionariosFormatados = (response.data || []).map((f: any) => ({
        id: f.id.toString(),
        nomeCompleto: f.nome,
        ehTecnico: f.ehTecnico || false,
        email: f.email,
        telefone: f.telefone,
        cargo: f.cargo,
        salario: f.salario,
        permissaoAcesso: f.temAcessoSistema || false,
        tipoAcesso: f.tipoAcesso || "Operador",
        login: f.login,
        permissoes: f.permissoes ? JSON.parse(f.permissoes) : undefined,
        ativo: true, // Assumir ativo por padrão
        dataCadastro: new Date(f.dataCriacao),
      }));

      setFuncionarios(funcionariosFormatados);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar funcionarios no localStorage
  const salvarFuncionariosNoLocalStorage = (funcionarios: Funcionario[]) => {
    try {
      localStorage.setItem("funcionarios", JSON.stringify(funcionarios));
    } catch (error) {
      console.warn("Erro ao salvar funcionarios no localStorage:", error);
    }
  };

  // Carregar funcionários da API na inicialização
  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const [filtros, setFiltros] = useState({
    tipoAcesso: "todos" as "Administrador" | "Operador" | "Técnico" | "todos",
    status: "todos" as "ativo" | "inativo" | "todos",
  });

  const adicionarFuncionario = async (
    novoFuncionario: Omit<Funcionario, "id" | "dataCadastro">,
  ) => {
    try {
      // Preparar dados para a API
      const dadosApi = {
        nome: novoFuncionario.nomeCompleto,
        ehTecnico: novoFuncionario.ehTecnico || false,
        email: novoFuncionario.email,
        telefone: novoFuncionario.telefone,
        cargo: novoFuncionario.cargo,
        salario: novoFuncionario.salario,
        temAcessoSistema: novoFuncionario.permissaoAcesso || false,
        tipoAcesso: novoFuncionario.tipoAcesso,
        login: novoFuncionario.login,
        senha: novoFuncionario.senha,
        permissoes: novoFuncionario.permissoes
          ? JSON.stringify(novoFuncionario.permissoes)
          : undefined,
      };

      const response = await funcionariosApi.criar(dadosApi);
      if (response.error) {
        throw new Error(response.error);
      }

      // Recarregar lista de funcionários
      await carregarFuncionarios();
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error);
      throw error;
    }
  };

  const editarFuncionario = (
    id: string,
    dadosAtualizados: Partial<Funcionario>,
  ) => {
    setFuncionarios((prev) =>
      prev.map((funcionario) =>
        funcionario.id === id
          ? { ...funcionario, ...dadosAtualizados }
          : funcionario,
      ),
    );
  };

  const excluirFuncionario = async (id: string) => {
    // Não permitir excluir o próprio usuário ou o admin principal
    if (id === user?.id || id === "1") {
      alert("Não é possível excluir este usuário.");
      return;
    }

    try {
      const response = await funcionariosApi.excluir(parseInt(id));
      if (response.error) {
        throw new Error(response.error);
      }

      // Recarregar lista de funcionários
      await carregarFuncionarios();
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      throw error;
    }
  };

  const alterarStatusFuncionario = (id: string, ativo: boolean) => {
    // Não permitir desativar o próprio usuário ou o admin principal
    if ((id === user?.id || id === "1") && !ativo) {
      alert("Não é possível desativar este usuário.");
      return;
    }

    editarFuncionario(id, { ativo });
  };

  // Calcular estatísticas baseadas nos filtros
  const estatisticas = React.useMemo(() => {
    const funcionariosFiltrados = funcionarios.filter((funcionario) => {
      const buscaCorreta =
        !filtros.busca ||
        funcionario.nomeCompleto
          .toLowerCase()
          .includes(filtros.busca.toLowerCase()) ||
        funcionario.login.toLowerCase().includes(filtros.busca.toLowerCase());
      const tipoCorreto =
        filtros.tipoAcesso === "todos" ||
        funcionario.tipoAcesso === filtros.tipoAcesso;
      const statusCorreto =
        filtros.status === "todos" ||
        (filtros.status === "ativo" && funcionario.ativo) ||
        (filtros.status === "inativo" && !funcionario.ativo);
      const permissaoCorreta =
        filtros.permissaoAcesso === undefined ||
        funcionario.permissaoAcesso === filtros.permissaoAcesso;

      return buscaCorreta && tipoCorreto && statusCorreto && permissaoCorreta;
    });

    return {
      totalFuncionarios: funcionariosFiltrados.length,
      totalAtivos: funcionarios.filter((f) => f.ativo).length,
      totalAdministradores: funcionarios.filter(
        (f) => f.tipoAcesso === "Administrador",
      ).length,
      totalOperadores: funcionarios.filter((f) => f.tipoAcesso === "Operador")
        .length,
    };
  }, [funcionarios, filtros]);

  const value = {
    funcionarios,
    filtros,
    estatisticas,
    adicionarFuncionario,
    editarFuncionario,
    excluirFuncionario,
    alterarStatusFuncionario,
    setFiltros,
    isLoading,
  };

  return (
    <FuncionariosContext.Provider value={value}>
      {children}
    </FuncionariosContext.Provider>
  );
}

export function useFuncionarios() {
  const context = useContext(FuncionariosContext);
  if (context === undefined) {
    throw new Error(
      "useFuncionarios must be used within a FuncionariosProvider",
    );
  }
  return context;
}
