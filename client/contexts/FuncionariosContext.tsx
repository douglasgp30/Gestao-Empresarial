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
  editarFuncionario: (
    id: string,
    funcionario: Partial<Funcionario>,
  ) => Promise<void>;
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
        permissaoAcesso: true,
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
          acessarAgendamentos: true,
          criarAgendamento: true,
          editarAgendamento: true,
          excluirAgendamento: true,
        },
        percentualComissao: 0,
        dataCadastro: new Date(),
        ativo: true,
        ehTecnico: false,
        telefone: "",
        email: "",
        cargo: "Administrador",
        salario: 0,
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
        permissaoAcesso: true,
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
          acessarAgendamentos: true,
          criarAgendamento: true,
          editarAgendamento: true,
          excluirAgendamento: true,
        },
        percentualComissao: 0,
        dataCadastro: new Date(),
        ativo: true,
        ehTecnico: false,
        telefone: "",
        email: "",
        cargo: "Administrador",
        salario: 0,
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
      console.log(
        "[FuncionariosContext] Iniciando carregamento de funcionários...",
      );
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
        percentualComissao: f.percentualComissao || 0,
        email: f.email,
        telefone: f.telefone,
        cargo: f.cargo,
        salario: f.salario,
        permissaoAcesso: f.temAcessoSistema || false,
        tipoAcesso: f.tipoAcesso || "Operador",
        login: f.login || "",
        permissoes: f.permissoes ? JSON.parse(f.permissoes) : undefined,
        ativo: true, // Assumir ativo por padrão
        dataCadastro: new Date(f.dataCriacao),
      }));

      setFuncionarios(funcionariosFormatados);
      console.log(
        `[FuncionariosContext] ${funcionariosFormatados.length} funcionários carregados`,
      );
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    } finally {
      setIsLoading(false);
      console.log("[FuncionariosContext] Carregamento finalizado");
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

  // Carregar funcionários priorizando API sobre localStorage
  useEffect(() => {
    const inicializarFuncionarios = async () => {
        try {
        console.log(
          "[FuncionariosContext] Iniciando carregamento de funcionários...",
        );
        setIsLoading(true);

        // 1. Primeiro tentar carregar da API (banco de dados)
        console.log("[FuncionariosContext] Tentando carregar da API...");
        const response = await funcionariosApi.listar();

        if (!response.error && response.data && response.data.length > 0) {
          console.log(`[FuncionariosContext] ${response.data.length} funcionários encontrados na API`);

          // Converter dados da API para o formato do contexto
          const funcionariosFormatados = response.data.map((f: any) => ({
            id: f.id.toString(),
            nomeCompleto: f.nome,
            ehTecnico: f.ehTecnico || false,
            percentualComissao: f.percentualComissao || 0,
            email: f.email,
            telefone: f.telefone,
            cargo: f.cargo,
            salario: f.salario,
            permissaoAcesso: f.temAcessoSistema || false,
            tipoAcesso: f.tipoAcesso || "Operador",
            login: f.login || "",
            permissoes: f.permissoes ? JSON.parse(f.permissoes) : undefined,
            ativo: true,
            dataCadastro: new Date(f.dataCriacao),
          }));

          setFuncionarios(funcionariosFormatados);
          console.log("[FuncionariosContext] ✅ Funcionários carregados da API com sucesso");
          return;
        }

        // 2. Se não há dados na API, tentar localStorage como fallback
        console.log("[FuncionariosContext] API vazia, tentando localStorage...");
        setIsLoading(true);

        let funcionariosCarregados = carregarFuncionariosReais();

        // Limpar duplicados se houver
        const funcionariosUnicos = funcionariosCarregados.filter(
          (func, index, arr) => {
            return arr.findIndex((f) => f.id === func.id) === index;
          },
        );

        if (funcionariosCarregados.length !== funcionariosUnicos.length) {
          console.log(
            `[FuncionariosContext] Removendo ${funcionariosCarregados.length - funcionariosUnicos.length} duplicados`,
          );
          funcionariosCarregados = funcionariosUnicos;
          salvarFuncionariosNoLocalStorage(funcionariosUnicos);
        }

        setFuncionarios(funcionariosCarregados);

        console.log(
          `[FuncionariosContext] ${funcionariosCarregados.length} funcionários carregados do localStorage`,
        );

        // Debug detalhado
        console.log("[FuncionariosContext] Funcionários carregados:");
        funcionariosCarregados.forEach((func, index) => {
          console.log(
            `  ${index + 1}. ${func.nomeCompleto} (ID: ${func.id}) - Ativo: ${func.ativo}`,
          );
        });
      } catch (error) {
        console.error("Erro ao carregar funcionários do localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    inicializarFuncionarios();

    // Durante hot reload, n��o carregar automaticamente
    if (
      typeof window !== "undefined" &&
      (window.location.href.includes("reload=") ||
        window.location.href.includes("?t="))
    ) {
      console.log(
        "[FuncionariosContext] Hot reload detectado, pulando carregamento automático",
      );
      return;
    }
  }, []);

  const [filtros, setFiltros] = useState({
    tipoAcesso: "todos" as "Administrador" | "Operador" | "Técnico" | "todos",
    status: "todos" as "ativo" | "inativo" | "todos",
  });

  const adicionarFuncionario = async (
    novoFuncionario: Omit<Funcionario, "id" | "dataCadastro">,
  ) => {
    try {
      console.log(
        "[FuncionariosContext] Adicionando novo funcionário:",
        novoFuncionario.nomeCompleto,
      );

      // Gerar ID único para o localStorage
      const novoId = Date.now().toString();

      const funcionarioCompleto: Funcionario = {
        ...novoFuncionario,
        id: novoId,
        dataCadastro: new Date(),
        ativo: true,
      };

      // Adicionar ao localStorage
      const funcionariosAtuais = carregarFuncionariosReais();
      const novosFuncionarios = [...funcionariosAtuais, funcionarioCompleto];

      salvarFuncionariosNoLocalStorage(novosFuncionarios);
      setFuncionarios(novosFuncionarios);

      console.log(
        "[FuncionariosContext] Funcionário adicionado com sucesso ao localStorage",
      );

      // Tentar salvar na API também (se disponível)
      try {
        const dadosApi = {
          nome: novoFuncionario.nomeCompleto,
          ehTecnico: novoFuncionario.ehTecnico || false,
          email: novoFuncionario.email,
          telefone: novoFuncionario.telefone,
          cargo: novoFuncionario.cargo,
          salario: novoFuncionario.salario,
          percentualComissao:
            typeof novoFuncionario.percentualComissao === "string"
              ? parseFloat(novoFuncionario.percentualComissao) || 0
              : novoFuncionario.percentualComissao || 0,
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
          console.warn(
            "Erro ao salvar na API, mas funcionário foi salvo localmente:",
            response.error,
          );
        } else {
          console.log("[FuncionariosContext] Funcionário também salvo na API");
        }
      } catch (apiError) {
        console.warn(
          "API não disponível, funcionário salvo apenas localmente:",
          apiError,
        );
      }
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error);
      throw error;
    }
  };

  const editarFuncionario = async (
    id: string,
    dadosAtualizados: Partial<Funcionario>,
  ) => {
    try {
      setIsLoading(true);

      // Fazer a requisição para o servidor
      const response = await funcionariosApi.atualizar(
        parseInt(id),
        dadosAtualizados,
      );
      if (response.error) {
        throw new Error(response.error);
      }

      // Atualizar o estado local apenas se o servidor confirmar
      setFuncionarios((prev) =>
        prev.map((funcionario) =>
          funcionario.id === id
            ? { ...funcionario, ...dadosAtualizados }
            : funcionario,
        ),
      );

      console.log("✅ Funcionário editado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao editar funcionário:", error);
      throw error; // Relançar erro para o componente tratar
    } finally {
      setIsLoading(false);
    }
  };

  const excluirFuncionario = async (id: string) => {
    // Não permitir excluir o próprio usuário logado
    const funcionarioParaExcluir = funcionarios.find(f => f.id === id);
    if (funcionarioParaExcluir?.nomeCompleto === user?.nome) {
      alert("Não é possível excluir seu próprio usuário.");
      return;
    }

    try {
      console.log(
        "[FuncionariosContext] Iniciando exclusão do funcionário:",
        id,
      );

      // Verificar se o ID é um timestamp (funcionário local) ou ID do banco
      const isLocalId = id.length > 10; // Timestamps são longos, IDs do banco são pequenos

      if (isLocalId) {
        console.log("[FuncionariosContext] Excluindo funcionário local (localStorage)");
        // Para funcionários locais, apenas remover do localStorage
        const funcionariosAtuais = carregarFuncionariosReais();
        const novosFuncionarios = funcionariosAtuais.filter((f) => f.id !== id);
        salvarFuncionariosNoLocalStorage(novosFuncionarios);
      } else {
        console.log("[FuncionariosContext] Excluindo funcionário do servidor");
        // Para funcionários do servidor, chamar a API
        const response = await funcionariosApi.excluir(parseInt(id));
        if (response.error) {
          throw new Error(response.error);
        }
      }

      console.log(
        "[FuncionariosContext] Funcionário excluído com sucesso, atualizando lista...",
      );

      // Atualizar a lista localmente
      setFuncionarios((prev) => prev.filter((func) => func.id !== id));
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
        (funcionario.login &&
          funcionario.login
            .toLowerCase()
            .includes(filtros.busca.toLowerCase()));
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
