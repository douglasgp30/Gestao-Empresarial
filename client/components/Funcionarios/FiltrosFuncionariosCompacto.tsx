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
import { Card, CardContent } from "../ui/card";
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
      {/* Estatísticas */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-3">
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
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Linha Principal: Tudo em uma linha compacta */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              {/* Busca - 4 colunas */}
              <div className="lg:col-span-4">
                <label className="text-xs font-medium mb-1 block text-gray-600">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Nome ou login..."
                    value={filtros.busca || ""}
                    onChange={(e) =>
                      setFiltros({ ...filtros, busca: e.target.value })
                    }
                    className="pl-7 h-8 text-xs"
                  />
                </div>
              </div>

              {/* Status - 2 colunas */}
              <div className="lg:col-span-2">
                <label className="text-xs font-medium mb-1 block text-gray-600">
                  Status
                </label>
                <Select
                  value={filtros.status || "todos"}
                  onValueChange={(value) =>
                    setFiltros({ ...filtros, status: value as any })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros Avançados - 2 colunas */}
              <div className="lg:col-span-2">
                <Collapsible
                  open={filtrosAvancadosAbertos}
                  onOpenChange={setFiltrosAvancadosAbertos}
                >
                  <CollapsibleTrigger asChild>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Mais Filtros
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs justify-between"
                      >
                        <span className="flex items-center gap-1">
                          <Filter className="h-3 w-3" />
                          Avançados
                          {filtrosAtivos > 0 && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 text-xs"
                            >
                              {filtrosAtivos}
                            </Badge>
                          )}
                        </span>
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${
                            filtrosAvancadosAbertos ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>

              {/* Botões de Ação - 2 colunas */}
              <div className="lg:col-span-2 flex gap-1">
                <Button
                  onClick={() => {}} // Aplicação automática
                  size="sm"
                  className="h-8 text-xs flex-1"
                  disabled={isLoading}
                >
                  <Search className="h-3 w-3 mr-1" />
                  Aplicado
                </Button>
                <Button
                  onClick={limparFiltros}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Filtros Avançados Colapsáveis */}
            <Collapsible
              open={filtrosAvancadosAbertos}
              onOpenChange={setFiltrosAvancadosAbertos}
            >
              <CollapsibleContent>
                <div className="bg-gray-50 rounded p-3 mt-2 border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Tipo de Acesso */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
                        Tipo de Acesso
                      </label>
                      <Select
                        value={filtros.tipoAcesso || "todos"}
                        onValueChange={(value) =>
                          setFiltros({ ...filtros, tipoAcesso: value as any })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os tipos</SelectItem>
                          <SelectItem value="Administrador">
                            Administrador
                          </SelectItem>
                          <SelectItem value="Operador">Operador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Acesso ao Sistema */}
                    <div>
                      <label className="text-xs font-medium mb-1 block text-gray-600">
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
                            setFiltros({
                              ...filtros,
                              permissaoAcesso: undefined,
                            });
                          } else {
                            setFiltros({
                              ...filtros,
                              permissaoAcesso: value === "sim",
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="sim">Com acesso</SelectItem>
                          <SelectItem value="nao">Sem acesso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
