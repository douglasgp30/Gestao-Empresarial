import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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

// Função para verificar se existe pelo menos um usuário com acesso ao sistema
const verificarSeExisteAdministrador = (): boolean => {
  try {
    const funcionariosStorage = localStorage.getItem("funcionarios");
    if (!funcionariosStorage) return false;

    const funcionarios = JSON.parse(funcionariosStorage);
    return funcionarios.some(
      (f: Funcionario) =>
        f.permissaoAcesso && f.ativo && f.tipoAcesso === "Administrador",
    );
  } catch (error) {
    console.warn("Erro ao verificar administradores:", error);
    return false;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [precisaConfigurarPrimeiroAcesso, setPrecisaConfigurarPrimeiroAcesso] =
    useState(false);

  useEffect(() => {
    // Verificar se existe pelo menos um administrador
    const existeAdmin = verificarSeExisteAdministrador();

    if (!existeAdmin) {
      setPrecisaConfigurarPrimeiroAcesso(true);
      setIsLoading(false);
      return;
    }

    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Verificar backup automático para usuários já logados (refresh da página)
        performAutomaticBackupIfNeeded();
      } catch (error) {
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const criarPrimeiroAdministrador = async (admin: Funcionario) => {
    try {
      // Salvar o administrador no localStorage
      const funcionarios = [admin];
      localStorage.setItem("funcionarios", JSON.stringify(funcionarios));

      // Configurar dados básicos iniciais do sistema
      await configurarDadosBasicosIniciais();

      // Atualizar o estado
      setPrecisaConfigurarPrimeiroAcesso(false);

      // Fazer login automático
      const authUser: AuthUser = {
        id: admin.id,
        nomeCompleto: admin.nomeCompleto,
        login: admin.login,
        tipoAcesso: admin.tipoAcesso,
        permissaoAcesso: admin.permissaoAcesso,
      };

      setUser(authUser);
      localStorage.setItem("auth_user", JSON.stringify(authUser));

      // Marcar que o primeiro acesso foi concluído
      localStorage.setItem("primeiro_acesso_completo", "true");

      console.log("🎉 Primeiro administrador criado e sistema configurado!");
    } catch (error) {
      console.error("Erro ao criar primeiro administrador:", error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    precisaConfigurarPrimeiroAcesso,
    criarPrimeiroAdministrador,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
