import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import EmpresaLogo from "../EmpresaLogo";

import {
  Home,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  UserCheck,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  LogOut
} from "lucide-react";
import { cn } from "../../lib/cn";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  dataTour?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
    dataTour: "dashboard",
  },
  {
    title: "Caixa",
    href: "/caixa",
    icon: DollarSign,
    dataTour: "caixa",
  },
  {
    title: "Contas",
    href: "/contas",
    icon: FileText,
  },
  {
    title: "Agendamentos",
    href: "/agendamentos",
    icon: Calendar,
    dataTour: "agendamentos",
  },
  {
    title: "Controle de Ponto",
    href: "/ponto",
    icon: Clock,
    dataTour: "ponto",
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: UserCheck,
  },
  {
    title: "Funcionários",
    href: "/funcionarios",
    icon: Users,
    adminOnly: true,
    dataTour: "funcionarios",
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    adminOnly: true,
    dataTour: "configuracoes",
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredItems = sidebarItems.filter((item) => {
    // Filtro para itens que requerem admin
    if (item.adminOnly && user?.tipoAcesso !== "Administrador") {
      return false;
    }

    // Filtro específico para Controle de Ponto
    if (item.href === "/ponto") {
      return user?.tipoAcesso === "Administrador" || user?.registraPonto;
    }

    return true;
  });

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col h-full",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center min-w-0">
        {!collapsed && <EmpresaLogo variant="sidebar" size="md" />}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  data-tour={item.dataTour}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors touch-manipulation",
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "min-h-[44px]", // Ensure touch target is at least 44px
                    isActive
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
                      : "",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-sidebar-border flex flex-col gap-2">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.nomeCompleto}</p>
            <p className="text-xs text-sidebar-foreground/70">{user?.tipoAcesso}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            "text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground",
            "min-h-[44px] touch-manipulation",
            collapsed ? "w-full justify-center" : "w-full justify-start",
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex transition-all duration-300",
        sidebarCollapsed
          ? "w-16 min-w-[4rem] max-w-[4rem]"
          : "min-w-[16rem] max-w-[22rem] w-auto",
      )} style={{ width: sidebarCollapsed ? undefined : 'fit-content' }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header principal com botão de recolher */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 border-b bg-background sticky top-0 z-40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 sm:w-80">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </SheetContent>

          {/* Mobile Header */}
          <div className="md:hidden bg-background border-b px-3 py-2 flex items-center justify-between sticky top-0 z-50">
            <EmpresaLogo variant="default" size="sm" showSubtitle={false} />
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </div>
        </Sheet>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
