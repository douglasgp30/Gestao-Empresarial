import React, { useState } from "react";
import { useFuncionarios } from "../../contexts/FuncionariosContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Badge } from "../ui/badge";
import {
  Filter,
  ChevronDown,
  X,
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";

export default function FiltrosFuncionariosCompacto() {
  const { filtros, setFiltros, estatisticas, isLoading } = useFuncionarios();
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false);

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      tipoAcesso: "todos",
      status: "todos",
      permissaoAcesso: undefined,
    });
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.busca) count++;
    if (filtros.tipoAcesso && filtros.tipoAcesso !== "todos") count++;
    if (filtros.status && filtros.status !== "todos") count++;
    if (filtros.permissaoAcesso !== undefined) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <div className="space-y-3">
      {/* Busca e Filtros Básicos */}
      <div className="bg-muted/30 rounded-lg p-2 border">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou login..."
              value={filtros.busca || ""}
              onChange={(e) =>
                setFiltros({ ...filtros, busca: e.target.value })
              }
              className="pl-7 h-8 text-xs"
            />
          </div>

          {/* Filtros Rápidos */}
          <div className="flex gap-2">
            <Select
              value={filtros.status || "todos"}
              onValueChange={(value) =>
                setFiltros({ ...filtros, status: value as any })
              }
            >
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.tipoAcesso || "todos"}
              onValueChange={(value) =>
                setFiltros({ ...filtros, tipoAcesso: value as any })
              }
            >
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Operador">Operador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="bg-background border rounded-lg p-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {estatisticas.totalFuncionarios}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              Total
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {estatisticas.totalAtivos}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <UserCheck className="h-3 w-3" />
              Ativos
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {estatisticas.totalAdministradores}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Admins
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {estatisticas.totalOperadores}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              Operadores
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Avançados */}
      <Collapsible
        open={filtrosAvancadosAbertos}
        onOpenChange={setFiltrosAvancadosAbertos}
      >
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avançados
              {filtrosAtivos > 0 && (
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {filtrosAtivos}
                </Badge>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${filtrosAvancadosAbertos ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>

          {filtrosAtivos > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Limpar
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-3">
          <div className="bg-muted/30 rounded-lg p-3 border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Acesso ao Sistema */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Acesso ao Sistema
                </label>
                <Select
                  value={
                    filtros.permissaoAcesso === undefined
                      ? "todos"
                      : filtros.permissaoAcesso
                        ? "sim"
                        : "nao"
                  }
                  onValueChange={(value) => {
                    if (value === "todos") {
                      setFiltros({ ...filtros, permissaoAcesso: undefined });
                    } else {
                      setFiltros({
                        ...filtros,
                        permissaoAcesso: value === "sim",
                      });
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="sim">Com acesso</SelectItem>
                    <SelectItem value="nao">Sem acesso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Data de Cadastro */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Período de Cadastro
                </label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    // TODO: Implementar filtro por período de cadastro
                    console.log("Filtrar por período:", value);
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos os períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ultimo_mes">Último mês</SelectItem>
                    <SelectItem value="ultimos_3_meses">
                      Últimos 3 meses
                    </SelectItem>
                    <SelectItem value="este_ano">Este ano</SelectItem>
                    <SelectItem value="personalizado">
                      Período personalizado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
