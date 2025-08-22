import "./global.css";

// Suprimir erros benignos do ResizeObserver
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

console.error = (...args: any[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes(
      "ResizeObserver loop completed with undelivered notifications",
    ) ||
      args[0].includes("ResizeObserver loop limit exceeded") ||
      args[0].includes("ResizeObserver loop"))
  ) {
    return;
  }
  // Verificar se é um Error object
  if (
    args[0] instanceof Error &&
    args[0].message.includes("ResizeObserver loop")
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes(
      "ResizeObserver loop completed with undelivered notifications",
    ) ||
      args[0].includes("ResizeObserver loop"))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

console.info = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].includes("ResizeObserver loop")) {
    return;
  }
  originalInfo.apply(console, args);
};

// import { Toaster } from "@/components/ui/toaster"; // Removido - usando apenas Sonner
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import "./lib/clearOldFilters"; // Executar limpeza de filtros antigos
import { executarAjusteAutomatico } from "./lib/ajustarPermissoesAdmin";
import "./lib/testePermissoesPonto"; // Teste automático em desenvolvimento
import "./lib/debugFuncionarios"; // Debug de funcionários em desenvolvimento
import "./lib/limparLocalStorageCaixa"; // Disponibilizar função de limpeza globalmente
import "./lib/migrateLancamentosCaixa"; // Disponibilizar funções de migração globalmente
import "./lib/debugCaixa"; // Funções de debug do caixa
import "./lib/migrarDadosAntigos"; // Migração automática de dados antigos
import "./lib/migrarCaixaParaBanco"; // Migração para banco de dados
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { CaixaProvider } from "./contexts/CaixaContext";
import { ContasProvider } from "./contexts/ContasContext";
import { FuncionariosProvider } from "./contexts/FuncionariosContext";
import { RelatoriosProvider } from "./contexts/RelatoriosContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { EntidadesProvider } from "./contexts/EntidadesContext";
import { AgendamentosProvider } from "./contexts/AgendamentosContext";
import { ClientesProvider } from "./contexts/ClientesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/Layout/MainLayout";
import { GerenciadorLembretes } from "./components/Agendamentos/ModalLembrete";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Caixa from "./pages/Caixa";
import Contas from "./pages/Contas";
import Funcionarios from "./pages/Funcionarios";
import Relatorios from "./pages/Relatorios";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Clientes";
import Ponto from "./pages/Ponto";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import PrimeiroAcesso from "./components/Auth/PrimeiroAcesso";
import TestePage from "./pages/TestePage";
import TourGuiado, { useTourGuiado } from "./components/ui/tour-guiado";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => {
  // Configurar handler de erro global para suprimir erros benignos
  useEffect(() => {
    // Executar ajuste automático de permissões de administradores
    executarAjusteAutomatico();
    const handleError = (event: ErrorEvent) => {
      if (
        event.message &&
        (event.message.includes("ResizeObserver loop") ||
          event.message.includes(
            "ResizeObserver loop completed with undelivered notifications",
          ) ||
          event.message.includes("ResizeObserver loop limit exceeded") ||
          (event.message.includes("Failed to fetch") &&
            (event.filename?.includes("fullstory.com") ||
              event.filename?.includes("fs.js"))))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        ((typeof event.reason === "string" &&
          event.reason.includes("ResizeObserver loop")) ||
          (event.reason instanceof Error &&
            event.reason.message.includes("ResizeObserver loop")))
      ) {
        event.preventDefault();
        return false;
      }
    };

    // Suprimir ResizeObserver em nível de window com proteção mais robusta
    const originalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends originalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
          // Usar requestAnimationFrame para evitar loops
          window.requestAnimationFrame(() => {
            try {
              callback(entries, observer);
            } catch (error) {
              if (
                error instanceof Error &&
                error.message.includes("ResizeObserver loop")
              ) {
                // Suprimir completamente erros do ResizeObserver
                return;
              }
              // Para outros erros, silenciar sem re-throw
            }
          });
        };
        super(wrappedCallback);
      }
    };

    // Interceptar também no nível do document
    const handleDocumentError = (event: any) => {
      if (
        event.error &&
        event.error.message &&
        event.error.message.includes("ResizeObserver loop")
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener(
      "unhandledrejection",
      handleUnhandledRejection,
      true,
    );
    document.addEventListener("error", handleDocumentError, true);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
        true,
      );
      document.removeEventListener("error", handleDocumentError, true);
      window.ResizeObserver = originalResizeObserver;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <ConfigProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ConfigProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

function AppContent() {
  const { precisaConfigurarPrimeiroAcesso, criarPrimeiroAdministrador, user } =
    useAuth();
  const {
    mostrarTour,
    iniciarTour,
    fecharTour,
    completarTour,
    verificarSeDeveExibirTour,
  } = useTourGuiado();

  // Verificar se deve mostrar o tour após login
  useEffect(() => {
    if (user && verificarSeDeveExibirTour()) {
      // Aguardar um pouco para garantir que a interface foi renderizada
      setTimeout(() => {
        iniciarTour();
      }, 1000);
    }
  }, [user, verificarSeDeveExibirTour, iniciarTour]);

  // Se precisa configurar o primeiro acesso, mostrar a tela de boas-vindas
  if (precisaConfigurarPrimeiroAcesso) {
    return <PrimeiroAcesso onAdminCriado={criarPrimeiroAdministrador} />;
  }

  // Caso contrário, mostrar o app normal
  return (
    <EntidadesProvider>
      <ClientesProvider>
        <FuncionariosProvider>
          <AgendamentosProvider>
            <CaixaProvider>
              <ContasProvider>
                <RelatoriosProvider>
                  <DashboardProvider>
                    <BrowserRouter>
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                          path="/"
                          element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<Dashboard />} />
                          <Route path="caixa" element={<Caixa />} />
                          <Route path="contas" element={<Contas />} />
                          <Route
                            path="agendamentos"
                            element={<Agendamentos />}
                          />
                          <Route path="clientes" element={<Clientes />} />
                          <Route path="ponto" element={<Ponto />} />
                          <Route
                            path="funcionarios"
                            element={
                              <ProtectedRoute requireAdmin>
                                <Funcionarios />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="relatorios" element={<Relatorios />} />
                          <Route
                            path="configuracoes"
                            element={
                              <ProtectedRoute requireAdmin>
                                <Configuracoes />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="teste" element={<TestePage />} />
                          <Route path="*" element={<NotFound />} />
                        </Route>
                      </Routes>
                      <GerenciadorLembretes />
                    </BrowserRouter>

                    {/* Tour Guiado */}
                    {mostrarTour && (
                      <TourGuiado
                        onClose={fecharTour}
                        onComplete={completarTour}
                      />
                    )}
                  </DashboardProvider>
                </RelatoriosProvider>
              </ContasProvider>
            </CaixaProvider>
          </AgendamentosProvider>
        </FuncionariosProvider>
      </ClientesProvider>
    </EntidadesProvider>
  );
}

// Evitar múltiplas inicializações do React
const rootElement = document.getElementById("root")!;
let root: ReturnType<typeof createRoot>;

if (!(rootElement as any)._reactRoot) {
  root = createRoot(rootElement);
  (rootElement as any)._reactRoot = root;
  root.render(<App />);
}
