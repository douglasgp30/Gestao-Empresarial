import React, { useState } from "react";
import { useFuncionarios } from "../../contexts/FuncionariosContext";
import { formatDate } from "../../lib/dateUtils";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  User,
  Calendar,
  Percent,
  Search,
  Filter,
  UserCheck,
  UserX,
} from "lucide-react";


export default function ListaFuncionarios() {
  const { user } = useAuth();
  const {
    funcionarios,
    filtros,
    setFiltros,
    estatisticas,
    excluirFuncionario,
    alterarStatusFuncionario,
  } = useFuncionarios();
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState<
    string | null
  >(null);

  // Filtrar funcionários
  const funcionariosFiltrados = funcionarios
    .filter((funcionario) => {
      const buscaCorreta =
        !filtros.busca ||
        funcionario.nomeCompleto
          .toLowerCase()
          .includes(filtros.busca.toLowerCase()) ||
        funcionario.login.toLowerCase().includes(filtros.busca.toLowerCase());
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
    })
    .sort((a, b) => {
      // Admin primeiro, depois por nome
      if (a.tipoAcesso === "Administrador" && b.tipoAcesso !== "Administrador")
        return -1;
      if (b.tipoAcesso === "Administrador" && a.tipoAcesso !== "Administrador")
        return 1;
      return a.nomeCompleto.localeCompare(b.nomeCompleto);
    });

  const handleExcluir = async (id: string) => {
    try {
      await excluirFuncionario(id);
      setFuncionarioParaExcluir(null);
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      // TODO: Mostrar erro para o usuário
    }
  };

  const handleAlterarStatus = (id: string, ativo: boolean) => {
    alterarStatusFuncionario(id, ativo);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou login..."
                  value={filtros.busca || ""}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      busca: e.target.value || undefined,
                    })
                  }
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Acesso</Label>
              <Select
                value={filtros.tipoAcesso}
                onValueChange={(value: any) =>
                  setFiltros({ ...filtros, tipoAcesso: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filtros.status}
                onValueChange={(value: any) =>
                  setFiltros({ ...filtros, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Permissão</Label>
              <Select
                value={
                  filtros.permissaoAcesso === undefined
                    ? "todos"
                    : filtros.permissaoAcesso
                      ? "sim"
                      : "nao"
                }
                onValueChange={(value) =>
                  setFiltros({
                    ...filtros,
                    permissaoAcesso:
                      value === "todos" ? undefined : value === "sim",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="sim">Com Acesso</SelectItem>
                  <SelectItem value="nao">Sem Acesso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Funcionários */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionários</CardTitle>
          <CardDescription>
            {funcionariosFiltrados.length} funcionário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {funcionariosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhum funcionário encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Ajuste os filtros ou cadastre novos funcionários.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionariosFiltrados.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {funcionario.nomeCompleto}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {funcionario.permissaoAcesso ? (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  Com Acesso
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-red-50 text-red-700 border-red-200"
                                >
                                  Sem Acesso
                                </Badge>
                              )}
                              {funcionario.id === user?.id && (
                                <Badge variant="secondary" className="text-xs">
                                  Você
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {funcionario.login}
                        </code>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            funcionario.tipoAcesso === "Administrador"
                              ? "default"
                              : "secondary"
                          }
                          className="flex items-center space-x-1 w-fit"
                        >
                          {funcionario.tipoAcesso === "Administrador" ? (
                            <ShieldCheck className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          <span>{funcionario.tipoAcesso}</span>
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <span>{funcionario.percentualComissao}%</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(funcionario.dataCadastro)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={funcionario.ativo}
                            onCheckedChange={(checked) =>
                              handleAlterarStatus(funcionario.id, checked)
                            }
                            disabled={
                              funcionario.id === user?.id ||
                              funcionario.id === "1"
                            }
                          />
                          <span className="text-sm">
                            {funcionario.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {funcionario.id !== user?.id &&
                              funcionario.id !== "1" && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    setFuncionarioParaExcluir(funcionario.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!funcionarioParaExcluir}
        onOpenChange={() => setFuncionarioParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este funcionário? Esta ação não
              pode ser desfeita e removerá todos os dados relacionados ao
              funcionário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                funcionarioParaExcluir && handleExcluir(funcionarioParaExcluir)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Funcionário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
