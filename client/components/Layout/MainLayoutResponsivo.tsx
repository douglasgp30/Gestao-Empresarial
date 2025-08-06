import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EmpresaLogo from "../EmpresaLogo";
import {
  Menu,
  Home,
  DollarSign,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User,
  Bell,
  Search,
  Calendar,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Caixa",
    href: "/caixa",
    icon: DollarSign,
  },
  {
    title: "Contas",
    href: "/contas",
    icon: FileText,
    badge: "3", // Exemplo: contas vencendo
  },
  {
    title: "Agendamentos",
    href: "/agendamentos",
    icon: Calendar,
  },
  {
    title: "Funcionários",
    href: "/funcionarios",
    icon: Users,
    adminOnly: true,
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
  },
];

function NavItem({
  item,
  isActive,
  isMobile = false,
}: {
  item: SidebarItem;
  isActive: boolean;
  isMobile?: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground",
        isMobile && "py-3",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.title}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

function MobileNav({
  filteredItems,
  currentPath,
}: {
  filteredItems: SidebarItem[];
  currentPath: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full">
          {/* Header Mobile */}
          <div className="p-6 border-b">
            <EmpresaLogo size="md" />
          </div>

          {/* Navigation Mobile */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={currentPath === item.href}
                isMobile={true}
              />
            ))}
          </nav>

          {/* Footer Mobile */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => {}}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DesktopSidebar({
  filteredItems,
  currentPath,
}: {
  filteredItems: SidebarItem[];
  currentPath: string;
}) {
  return (
    <div className="hidden md:flex flex-col w-64 bg-background border-r">
      {/* Header Desktop */}
      <div className="p-6 border-b">
        <EmpresaLogo size="lg" />
      </div>

      {/* Navigation Desktop */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={currentPath === item.href}
          />
        ))}
      </nav>

      {/* Footer Desktop */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => {}}
        >
          <LogOut className="h-4 w-4" />
          Sair do Sistema
        </Button>
      </div>
    </div>
  );
}

export default function MainLayoutResponsivo() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredItems = sidebarItems.filter(
    (item) => !item.adminOnly || user?.tipoAcesso === "Administrador",
  );

  const currentPath = location.pathname;

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar filteredItems={filteredItems} currentPath={currentPath} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header */}
        <header className="h-14 border-b bg-background px-4 flex items-center justify-between">
          {/* Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            <MobileNav
              filteredItems={filteredItems}
              currentPath={currentPath}
            />
            <div className="md:hidden">
              <EmpresaLogo size="sm" variant="compact" />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Hidden on mobile */}
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Buscar...</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-32 truncate">
                    {user?.nomeCompleto}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user?.nomeCompleto}</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.tipoAcesso}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
