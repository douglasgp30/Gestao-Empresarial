import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
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
      return parsedFuncionarios.map((f: any) => ({
        ...f,
        dataCadastro: new Date(f.dataCadastro),
      }));
    }

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
  const [isLoading, setIsLoading] = useState(false);
  const inicializado = useRef(false);

  const [filtros, setFiltros] = useState({
    tipoAcesso: "todos" as "Administrador" | "Operador" | "Técnico" | "todos",
    status: "todos" as "ativo" | "inativo" | "todos",
  });

  // CARREGAMENTO MANUAL APENAS - SEM LOOPS
  const carregarFuncionarios = useCallback(async () => {
    try {
      console.log(
        "[FuncionariosContext] Carregamento MANUAL de funcionários...",
      );

      const response = await funcionariosApi.listar();
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data && response.data.length > 0) {
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
        console.log(
          `[FuncionariosContext] ${funcionariosFormatados.length} funcionários carregados MANUALMENTE`,
        );

        // Backup no localStorage
        try {
          localStorage.setItem(
            "funcionarios",
            JSON.stringify(funcionariosFormatados),
          );
        } catch {}

        return;
      }

      // Fallback para localStorage
      throw new Error("API retornou dados vazios");
    } catch (error) {
      console.warn(
        "[FuncionariosContext] Erro na API, usando localStorage:",
        error,
      );
      carregarFuncionariosLocalStorage();
    }
  }, []);

  const carregarFuncionariosLocalStorage = useCallback(() => {
    try {
      console.log("[FuncionariosContext] Carregando do localStorage...");

      let funcionariosCarregados = carregarFuncionariosReais();

      // Limpar duplicados se houver
      const funcionariosUnicos = funcionariosCarregados.filter(
        (func, index, arr) => arr.findIndex((f) => f.id === func.id) === index,
      );

      if (funcionariosCarregados.length !== funcionariosUnicos.length) {
        console.log(
          `[FuncionariosContext] Removendo ${funcionariosCarregados.length - funcionariosUnicos.length} duplicados`,
        );
        funcionariosCarregados = funcionariosUnicos;
        try {
          localStorage.setItem(
            "funcionarios",
            JSON.stringify(funcionariosUnicos),
          );
        } catch {}
      }

      setFuncionarios(funcionariosCarregados);
      console.log(
        `[FuncionariosContext] ${funcionariosCarregados.length} funcionários carregados do localStorage`,
      );
    } catch (error) {
      console.error("Erro ao carregar funcionários do localStorage:", error);
      setFuncionarios([]);
    }
  }, []);

  // CARREGAMENTO INICIAL ÚNICA VEZ - SEM LOOPS
  useEffect(() => {
    if (inicializado.current || typeof window === "undefined") return;
    inicializado.current = true;

    console.log(
      "🚨 [FuncionariosContext] CARREGAMENTO INICIAL ÚNICO E CONTROLADO",
    );

    const inicializarFuncionarios = async () => {
      setIsLoading(true);
      try {
        // Tentar carregar da API primeiro
        await carregarFuncionarios();
        console.log(
          "✅ [FuncionariosContext] Inicialização COM carregamento da API",
        );
      } catch (error) {
        console.error(
          "Erro ao inicializar funcionários da API, tentando localStorage:",
          error,
        );
        // Se falhar, carregar do localStorage como fallback
        carregarFuncionariosLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(inicializarFuncionarios, 100);
  }, []);

  const salvarFuncionariosNoLocalStorage = useCallback(
    (funcionarios: Funcionario[]) => {
      try {
        localStorage.setItem("funcionarios", JSON.stringify(funcionarios));
      } catch (error) {
        console.warn("Erro ao salvar funcionarios no localStorage:", error);
      }
    },
    [],
  );

  const adicionarFuncionario = async (
    novoFuncionario: Omit<Funcionario, "id" | "dataCadastro">,
  ) => {
    try {
      console.log(
        "[FuncionariosContext] Adicionando novo funcionário:",
        novoFuncionario.nomeCompleto,
      );

      const novoId = Date.now().toString();
      const funcionarioCompleto: Funcionario = {
        ...novoFuncionario,
        id: novoId,
        dataCadastro: new Date(),
        ativo: true,
      };

      const funcionariosAtuais = carregarFuncionariosReais();
      const novosFuncionarios = [...funcionariosAtuais, funcionarioCompleto];

      salvarFuncionariosNoLocalStorage(novosFuncionarios);
      setFuncionarios(novosFuncionarios);

      console.log(
        "[FuncionariosContext] Funcionário adicionado com sucesso ao localStorage",
      );

      // Tentar salvar na API também (sem bloquear o fluxo)
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

      const dadosApi: any = {};

      if (dadosAtualizados.nomeCompleto !== undefined) {
        dadosApi.nome = dadosAtualizados.nomeCompleto;
      }
      if (dadosAtualizados.ehTecnico !== undefined) {
        dadosApi.ehTecnico = dadosAtualizados.ehTecnico;
      }
      if (dadosAtualizados.email !== undefined) {
        dadosApi.email = dadosAtualizados.email;
      }
      if (dadosAtualizados.telefone !== undefined) {
        dadosApi.telefone = dadosAtualizados.telefone;
      }
      if (dadosAtualizados.cargo !== undefined) {
        dadosApi.cargo = dadosAtualizados.cargo;
      }
      if (dadosAtualizados.salario !== undefined) {
        dadosApi.salario = dadosAtualizados.salario;
      }
      if (dadosAtualizados.percentualComissao !== undefined) {
        dadosApi.percentualComissao =
          typeof dadosAtualizados.percentualComissao === "string"
            ? parseFloat(dadosAtualizados.percentualComissao) || 0
            : dadosAtualizados.percentualComissao || 0;
      }
      if (dadosAtualizados.permissaoAcesso !== undefined) {
        dadosApi.temAcessoSistema = dadosAtualizados.permissaoAcesso;
      }
      if (dadosAtualizados.tipoAcesso !== undefined) {
        dadosApi.tipoAcesso = dadosAtualizados.tipoAcesso;
      }
      if (dadosAtualizados.login !== undefined) {
        dadosApi.login = dadosAtualizados.login;
      }
      if (dadosAtualizados.senha !== undefined) {
        dadosApi.senha = dadosAtualizados.senha;
      }
      if (dadosAtualizados.permissoes !== undefined) {
        dadosApi.permissoes = dadosAtualizados.permissoes
          ? JSON.stringify(dadosAtualizados.permissoes)
          : undefined;
      }

      const response = await funcionariosApi.atualizar(parseInt(id), dadosApi);
      if (response.error) {
        throw new Error(response.error);
      }

      setFuncionarios((prev) => {
        const funcionariosAtualizados = prev.map((funcionario) =>
          funcionario.id === id
            ? { ...funcionario, ...dadosAtualizados }
            : funcionario,
        );

        // Atualizar localStorage com dados corretos
        try {
          localStorage.setItem(
            "funcionarios",
            JSON.stringify(funcionariosAtualizados),
          );
        } catch {}

        return funcionariosAtualizados;
      });

      console.log("✅ Funcionário editado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao editar funcionário:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const excluirFuncionario = async (id: string) => {
    const funcionarioParaExcluir = funcionarios.find((f) => f.id === id);
    if (funcionarioParaExcluir?.nomeCompleto === user?.nome) {
      alert("Não é possível excluir seu próprio usuário.");
      return;
    }

    try {
      console.log(
        "[FuncionariosContext] Iniciando exclusão do funcionário:",
        id,
      );

      // Sempre tentar excluir via API primeiro
      console.log("[FuncionariosContext] Tentando excluir funcionário via API");

      // Convert ID to number for API call
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        console.log(
          "[FuncionariosContext] ID não numérico, excluindo apenas do localStorage",
        );
        // Se o ID não é numérico, é um ID gerado localmente
        const funcionariosAtuais = carregarFuncionariosReais();
        const novosFuncionarios = funcionariosAtuais.filter((f) => f.id !== id);
        salvarFuncionariosNoLocalStorage(novosFuncionarios);
      } else {
        // Tentar excluir da API
        const response = await funcionariosApi.excluir(numericId);
        if (response.error) {
          console.warn(
            "[FuncionariosContext] Erro na API, tentando localStorage:",
            response.error,
          );
          // Se falhar na API, tentar remover do localStorage
          const funcionariosAtuais = carregarFuncionariosReais();
          const novosFuncionarios = funcionariosAtuais.filter(
            (f) => f.id !== id,
          );
          salvarFuncionariosNoLocalStorage(novosFuncionarios);
        } else {
          console.log(
            "[FuncionariosContext] Funcionário excluído via API com sucesso",
          );
        }
      }

      console.log(
        "[FuncionariosContext] Funcionário excluído com sucesso, atualizando lista...",
      );
      setFuncionarios((prev) => {
        const funcionariosAtualizados = prev.filter((func) => func.id !== id);

        // Atualizar localStorage com dados corretos
        try {
          localStorage.setItem(
            "funcionarios",
            JSON.stringify(funcionariosAtualizados),
          );
        } catch {}

        return funcionariosAtualizados;
      });
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      throw error;
    }
  };

  const alterarStatusFuncionario = (id: string, ativo: boolean) => {
    if ((id === user?.id || id === "1") && !ativo) {
      alert("Não é possível desativar este usuário.");
      return;
    }
    editarFuncionario(id, { ativo });
  };

  // Calcular estatísticas baseadas nos filtros
  const estatisticas = useMemo(() => {
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

  const value = useMemo(
    () => ({
      funcionarios,
      filtros,
      estatisticas,
      adicionarFuncionario,
      editarFuncionario,
      excluirFuncionario,
      alterarStatusFuncionario,
      setFiltros,
      isLoading,
    }),
    [funcionarios, filtros, estatisticas, isLoading],
  );

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
