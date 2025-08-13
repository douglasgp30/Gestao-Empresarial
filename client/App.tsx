import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./lib/clearOldFilters"; // Executar limpeza de filtros antigos
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
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ConfigProvider>
        <AuthProvider>
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
                                <Route
                                  path="funcionarios"
                                  element={
                                    <ProtectedRoute requireAdmin>
                                      <Funcionarios />
                                    </ProtectedRoute>
                                  }
                                />
                                <Route
                                  path="relatorios"
                                  element={<Relatorios />}
                                />
                                <Route
                                  path="configuracoes"
                                  element={
                                    <ProtectedRoute requireAdmin>
                                      <Configuracoes />
                                    </ProtectedRoute>
                                  }
                                />
                                <Route path="*" element={<NotFound />} />
                              </Route>
                            </Routes>
                            <GerenciadorLembretes />
                          </BrowserRouter>
                        </DashboardProvider>
                      </RelatoriosProvider>
                    </ContasProvider>
                  </CaixaProvider>
                </AgendamentosProvider>
              </FuncionariosProvider>
            </ClientesProvider>
          </EntidadesProvider>
        </AuthProvider>
      </ConfigProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Evitar múltiplas inicializações do React
const rootElement = document.getElementById("root")!;
let root: ReturnType<typeof createRoot>;

if (!(rootElement as any)._reactRoot) {
  root = createRoot(rootElement);
  (rootElement as any)._reactRoot = root;
  root.render(<App />);
}
