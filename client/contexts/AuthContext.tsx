import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { AuthUser, LoginCredentials, Funcionario } from "@shared/types";
import { BackupService } from "../lib/backupService";
import { configurarDadosBasicosIniciais } from "../lib/dadosBasicosIniciais";

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  precisaConfigurarPrimeiroAcesso: boolean;
  criarPrimeiroAdministrador: (admin: Funcionario) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para verificar se existe pelo menos um usuário com acesso ao sistema (localStorage)
const verificarSeExisteAdministradorLocal = (): boolean => {
  console.log("🔍 [AuthContext] Verificando administrador no localStorage...");

  try {
    const funcionariosStorage = localStorage.getItem("funcionarios");
    console.log("📋 [AuthContext] funcionariosStorage:", funcionariosStorage ? "EXISTE" : "NÃO EXISTE");

    if (!funcionariosStorage) {
      console.log("❌ [AuthContext] Nenhum funcionário encontrado no localStorage");
      return false;
    }

    const funcionarios = JSON.parse(funcionariosStorage);
    console.log("👥 [AuthContext] Total de funcionários encontrados:", funcionarios.length);

    // Log detalhado de cada funcionário
    funcionarios.forEach((f: Funcionario, index: number) => {
      console.log(`👤 [AuthContext] Funcionário ${index + 1}:`, {
        nome: f.nomeCompleto,
        login: f.login,
        ativo: f.ativo,
        permissaoAcesso: f.permissaoAcesso,
        tipoAcesso: f.tipoAcesso
      });
    });

    const administradores = funcionarios.filter(
      (f: Funcionario) =>
        f.permissaoAcesso && f.ativo && f.tipoAcesso === "Administrador"
    );

    console.log("👑 [AuthContext] Administradores válidos encontrados:", administradores.length);

    const existeAdmin = administradores.length > 0;
    console.log(`✅ [AuthContext] Resultado localStorage: ${existeAdmin ? "ADMIN ENCONTRADO" : "NENHUM ADMIN VÁLIDO"}`);

    return existeAdmin;
  } catch (error) {
    console.error("❌ [AuthContext] Erro ao verificar administradores no localStorage:", error);
    return false;
  }
};

// Função para verificar se existe administrador no servidor
const verificarSeExisteAdministradorServidor = async (): Promise<boolean> => {
  console.log("🌐 [AuthContext] Verificando administrador no servidor...");

  try {
    const response = await fetch('/api/auth/verificar-admin');
    if (!response.ok) {
      console.warn("⚠️ [AuthContext] Servidor retornou erro:", response.status);
      return false;
    }

    const data = await response.json();
    console.log("📡 [AuthContext] Resposta do servidor:", data);

    const existeAdmin = data.existeAdministrador || false;
    console.log(`✅ [AuthContext] Resultado servidor: ${existeAdmin ? "ADMIN ENCONTRADO" : "NENHUM ADMIN VÁLIDO"}`);

    return existeAdmin;
  } catch (error) {
    console.error("❌ [AuthContext] Erro ao verificar administradores no servidor:", error);
    return false;
  }
};

// Função híbrida que verifica servidor primeiro, depois localStorage
const verificarSeExisteAdministrador = async (): Promise<boolean> => {
  console.log("🔍 [AuthContext] Iniciando verificação híbrida de administradores...");

  // Primeira tentativa: verificar no servidor
  try {
    const existeAdminServidor = await verificarSeExisteAdministradorServidor();
    if (existeAdminServidor) {
      console.log("✅ [AuthContext] Admin confirmado pelo servidor");
      return true;
    }
    console.log("ℹ️ [AuthContext] Servidor não encontrou admin, verificando localStorage...");
  } catch (error) {
    console.warn("⚠️ [AuthContext] Falha na verificação do servidor, usando localStorage como fallback:", error);
  }

  // Fallback: verificar no localStorage
  const existeAdminLocal = verificarSeExisteAdministradorLocal();

  console.log(`🏁 [AuthContext] Resultado final: ${existeAdminLocal ? "ADMIN ENCONTRADO" : "NENHUM ADMIN VÁLIDO"}`);
  return existeAdminLocal;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [precisaConfigurarPrimeiroAcesso, setPrecisaConfigurarPrimeiroAcesso] =
    useState(false);

  useEffect(() => {
    const inicializarSistema = async () => {
      console.log("🚀 [AuthContext] Iniciando sistema...");

      try {
        // Verificar se existe pelo menos um administrador
        console.log("🔍 [AuthContext] Etapa 1: Verificando administradores...");
        const existeAdmin = await verificarSeExisteAdministrador();

        if (!existeAdmin) {
          console.log("⚠️ [AuthContext] Nenhum admin encontrado - ativando tela de primeiro acesso");
          setPrecisaConfigurarPrimeiroAcesso(true);
          setIsLoading(false);
          return;
        }

        console.log("✅ [AuthContext] Admin encontrado - continuando inicialização...");

        // Verificar se os dados básicos já foram configurados
        console.log("🔍 [AuthContext] Etapa 2: Verificando dados básicos...");
        const primeiroAcessoCompleto = localStorage.getItem("primeiro_acesso_completo");
        const dadosBasicosExistem = localStorage.getItem("descricoes_e_categorias");

        console.log("📋 [AuthContext] primeiro_acesso_completo:", primeiroAcessoCompleto);
        console.log("📋 [AuthContext] descricoes_e_categorias:", dadosBasicosExistem ? "EXISTE" : "NÃO EXISTE");

        // Se existe admin mas não há dados básicos, configurar
        if (!dadosBasicosExistem || primeiroAcessoCompleto !== "true") {
          console.log("🔧 [AuthContext] Configurando dados básicos iniciais...");
          await configurarDadosBasicosIniciais();
          localStorage.setItem("primeiro_acesso_completo", "true");
          console.log("✅ [AuthContext] Dados básicos configurados");
        } else {
          console.log("✅ [AuthContext] Dados básicos já configurados");
        }

        // Check if user is already logged in (localStorage)
        console.log("🔍 [AuthContext] Etapa 3: Verificando usuário logado...");
        const savedUser = localStorage.getItem("auth_user");
        console.log("📋 [AuthContext] auth_user:", savedUser ? "EXISTE" : "NÃO EXISTE");

        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            console.log("👤 [AuthContext] Usuário logado encontrado:", parsedUser.nomeCompleto);
            setUser(parsedUser);

            // Verificar backup automático para usuários já logados (refresh da página)
            performAutomaticBackupIfNeeded();
          } catch (error) {
            console.error("❌ [AuthContext] Erro ao parsear usuário logado:", error);
            localStorage.removeItem("auth_user");
          }
        } else {
          console.log("ℹ️ [AuthContext] Nenhum usuário logado encontrado");
        }

        console.log("✅ [AuthContext] Inicialização concluída com sucesso");
      } catch (error) {
        console.error("❌ [AuthContext] Erro na inicialização do sistema:", error);
      } finally {
        setIsLoading(false);
      }
    };

    inicializarSistema();
  }, []);

  // Sistema de logout automático por tempo de sessão
  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetTimer = () => {
      clearTimeout(timeoutId);
      lastActivity = Date.now();

      // Obter tempo de sessão das configurações (padrão 60 minutos)
      const userConfigs = localStorage.getItem("userConfigs");
      let tempoSessao = 60;
      if (userConfigs) {
        try {
          const configs = JSON.parse(userConfigs);
          tempoSessao = configs.tempoSessao || 60;
        } catch (error) {
          console.error("Erro ao carregar configurações de sessão:", error);
        }
      }

      timeoutId = setTimeout(
        () => {
          if (Date.now() - lastActivity >= tempoSessao * 60 * 1000) {
            logout();
            alert(
              `Sessão expirada após ${tempoSessao} minutos de inatividade. Por favor, faça login novamente.`,
            );
          }
        },
        tempoSessao * 60 * 1000,
      );
    };

    const handleActivity = () => {
      resetTimer();
    };

    // Monitorar atividade do usuário
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Buscar funcionários do localStorage
    let funcionarios: Funcionario[] = [];
    try {
      const funcionariosStorage = localStorage.getItem("funcionarios");
      if (funcionariosStorage) {
        funcionarios = JSON.parse(funcionariosStorage);
      }
    } catch (error) {
      console.warn("Erro ao carregar funcionários para login:", error);
    }

    const funcionario = funcionarios.find(
      (f) =>
        f.login === credentials.login &&
        f.senha === credentials.senha &&
        f.permissaoAcesso &&
        f.ativo,
    );

    if (funcionario) {
      const authUser: AuthUser = {
        id: funcionario.id,
        nomeCompleto: funcionario.nomeCompleto,
        login: funcionario.login,
        tipoAcesso: funcionario.tipoAcesso,
        permissaoAcesso: funcionario.permissaoAcesso,
      };

      setUser(authUser);
      localStorage.setItem("auth_user", JSON.stringify(authUser));

      // Verificar se deve fazer backup automático
      await performAutomaticBackupIfNeeded();

      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const performAutomaticBackupIfNeeded = async () => {
    try {
      if (BackupService.shouldPerformAutomaticBackup()) {
        const config = BackupService.getBackupConfig();

        if (!config.localBackup.trim()) {
          // Local não configurado - mostrar alerta
          BackupService.showConfigurationAlert();
          BackupService.markLoginToday(); // Marcar para não mostrar novamente hoje
          return;
        }

        // Executar backup automático em background
        setTimeout(async () => {
          try {
            const result = await BackupService.performBackup();

            if (result.sucesso) {
              const hora = result.dataBackup.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              BackupService.showBackupAlert(
                `✅ Backup automático realizado com sucesso em ${hora}`,
              );
            } else {
              BackupService.showBackupAlert(
                `Erro no backup automático: ${result.erro}`,
                true,
              );
            }
          } catch (error) {
            console.error("Erro no backup automático:", error);
            BackupService.showBackupAlert(
              "Erro inesperado durante o backup automático",
              true,
            );
          }
        }, 2000); // Aguardar 2 segundos após login para não impactar UX

        // Marcar login de hoje independente do resultado do backup
        BackupService.markLoginToday();
      } else {
        // Apenas marcar login se não precisar fazer backup
        BackupService.markLoginToday();
      }
    } catch (error) {
      console.error("Erro ao verificar backup automático:", error);
      BackupService.markLoginToday(); // Marcar para não tentar novamente hoje
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("auth_user");
  }, []);

  const criarPrimeiroAdministrador = async (admin: Funcionario) => {
    console.log("🚀 [AuthContext] Iniciando criação do primeiro administrador...");
    console.log("👤 [AuthContext] Dados do admin:", {
      nome: admin.nomeCompleto,
      login: admin.login,
      ativo: admin.ativo,
      permissaoAcesso: admin.permissaoAcesso,
      tipoAcesso: admin.tipoAcesso
    });

    try {
      // Salvar o administrador no localStorage
      console.log("💾 [AuthContext] Salvando funcionário no localStorage...");
      const funcionarios = [admin];
      localStorage.setItem("funcionarios", JSON.stringify(funcionarios));
      console.log("✅ [AuthContext] Funcionário salvo com sucesso");

      // Configurar dados básicos iniciais do sistema
      console.log("🔧 [AuthContext] Configurando dados básicos iniciais...");
      await configurarDadosBasicosIniciais();
      console.log("✅ [AuthContext] Dados básicos configurados");

      // Atualizar o estado
      console.log("🔄 [AuthContext] Atualizando estado do componente...");
      setPrecisaConfigurarPrimeiroAcesso(false);
      console.log("✅ [AuthContext] Estado atualizado - primeiro acesso finalizado");

      // Fazer login automático
      console.log("🔑 [AuthContext] Fazendo login automático...");
      const authUser: AuthUser = {
        id: admin.id,
        nomeCompleto: admin.nomeCompleto,
        login: admin.login,
        tipoAcesso: admin.tipoAcesso,
        permissaoAcesso: admin.permissaoAcesso,
      };

      setUser(authUser);
      localStorage.setItem("auth_user", JSON.stringify(authUser));
      console.log("✅ [AuthContext] Login automático realizado");

      // Marcar que o primeiro acesso foi concluído
      console.log("🏁 [AuthContext] Marcando primeiro acesso como concluído...");
      localStorage.setItem("primeiro_acesso_completo", "true");
      console.log("✅ [AuthContext] Flag de primeiro acesso definida");

      console.log("🎉 [AuthContext] Primeiro administrador criado e sistema configurado com sucesso!");

      // Verificar se tudo foi salvo corretamente
      const verificacao = verificarSeExisteAdministrador();
      console.log("🔍 [AuthContext] Verificação pós-criação:", verificacao ? "SUCESSO" : "FALHA");

    } catch (error) {
      console.error("❌ [AuthContext] Erro ao criar primeiro administrador:", error);
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoading,
      isAuthenticated: !!user,
      precisaConfigurarPrimeiroAcesso,
      criarPrimeiroAdministrador,
    }),
    [
      user,
      login,
      logout,
      isLoading,
      precisaConfigurarPrimeiroAcesso,
      criarPrimeiroAdministrador,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
