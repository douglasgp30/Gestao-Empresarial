import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import EmpresaLogo from "../EmpresaLogo";
import {
  Menu,
  Home,
  DollarSign,
  FileText,
  Calendar,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { cn } from "../../lib/utils";

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

  const filteredItems = sidebarItems.filter(
    (item) => !item.adminOnly || user?.tipoAcesso === "Administrador",
  );

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col h-full",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!collapsed && <EmpresaLogo variant="sidebar" size="md" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
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
                    isActive &&
                      "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
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
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-sidebar-foreground">
              {user?.nomeCompleto}
            </p>
            <p className="text-xs text-sidebar-foreground/70">
              {user?.tipoAcesso}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            "text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground",
            "min-h-[44px] touch-manipulation", // Ensure touch target size
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
      <div
        className={cn(
          "hidden md:flex transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full"
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 sm:w-80">
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileMenuOpen(false)}
          />
        </SheetContent>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden bg-background border-b px-3 py-2 flex items-center justify-between sticky top-0 z-50">
            <EmpresaLogo variant="default" size="sm" showSubtitle={false} />
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </Sheet>
    </div>
  );
}
