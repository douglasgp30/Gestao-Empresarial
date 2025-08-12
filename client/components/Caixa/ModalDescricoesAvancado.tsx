import React, { useState } from "react";
import { useEntidades } from "../../contexts/EntidadesContext";
import { formatDate } from "../../lib/dateUtils";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
  FileText,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  Folder,
} from "lucide-react";


export default function ModalDescricoesAvancado() {
  const {
    descricoes,
    categorias,
    adicionarDescricao,
    excluirDescricao,
    adicionarCategoria,
    excluirCategoria,
  } = useEntidades();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewDescricaoOpen, setIsNewDescricaoOpen] = useState(false);
  const [isNewCategoriaOpen, setIsNewCategoriaOpen] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<{
    id: string;
    tipo: "descricao" | "categoria";
    nome: string;
  } | null>(null);

  const [tipoAtivo, setTipoAtivo] = useState<"receita" | "despesa">("receita");

  const [formDescricao, setFormDescricao] = useState({
    nome: "",
    tipo: "receita" as "receita" | "despesa",
    categoria: "",
  });

  const [formCategoria, setFormCategoria] = useState({
    nome: "",
    tipo: "receita" as "receita" | "despesa",
  });

  // Filtrar dados por tipo
  const descricoesReceitas = descricoes.filter((d) => d.tipo === "receita");
  const descriçoesDespesas = descricoes.filter((d) => d.tipo === "despesa");
  const categoriasReceitas = categorias.filter((c) => c.tipo === "receita");
  const categoriasDespesas = categorias.filter((c) => c.tipo === "despesa");

  const resetFormDescricao = () => {
    setFormDescricao({
      nome: "",
      tipo: tipoAtivo,
      categoria: "",
    });
  };

  const resetFormCategoria = () => {
    setFormCategoria({
      nome: "",
      tipo: tipoAtivo,
    });
  };

  const handleSubmitDescricao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescricao.nome.trim()) return;

    adicionarDescricao({
      nome: formDescricao.nome.trim(),
      tipo: formDescricao.tipo,
      categoria: formDescricao.categoria || undefined,
    });

    resetFormDescricao();
    setIsNewDescricaoOpen(false);
  };

  const handleSubmitCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoria.nome.trim()) return;

    adicionarCategoria({
      nome: formCategoria.nome.trim(),
      tipo: formCategoria.tipo,
    });

    resetFormCategoria();
    setIsNewCategoriaOpen(false);
  };

  const handleExcluir = () => {
    if (!itemParaExcluir) return;

    if (itemParaExcluir.tipo === "descricao") {
      excluirDescricao(itemParaExcluir.id);
    } else {
      excluirCategoria(itemParaExcluir.id);
    }

    setItemParaExcluir(null);
  };

  const abrirModalDescricao = (tipo: "receita" | "despesa") => {
    setFormDescricao({ ...formDescricao, tipo });
    setIsNewDescricaoOpen(true);
  };

  const abrirModalCategoria = (tipo: "receita" | "despesa") => {
    setFormCategoria({ ...formCategoria, tipo });
    setIsNewCategoriaOpen(true);
  };

  const renderTabReceitas = () => (
    <div className="space-y-6">
      {/* Seção Categorias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Folder className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-600">
                Categorias de Receitas
              </CardTitle>
            </div>
            <Button
              onClick={() => abrirModalCategoria("receita")}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categoriasReceitas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria cadastrada
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categoriasReceitas.map((categoria) => (
                <div key={categoria.id} className="flex items-center">
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    {categoria.nome}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                          setItemParaExcluir({
                            id: categoria.id,
                            tipo: "categoria",
                            nome: categoria.nome,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção Descrições */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-600">
                Descrições de Receitas
              </CardTitle>
            </div>
            <Button
              onClick={() => abrirModalDescricao("receita")}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Descrição
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {descricoesReceitas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma descrição cadastrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {descricoesReceitas.map((descricao) => (
                  <TableRow key={descricao.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{descricao.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {descricao.categoria ? (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          {descricao.categoria}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          Sem categoria
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(descricao.dataCriacao)}</span>
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
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              setItemParaExcluir({
                                id: descricao.id,
                                tipo: "descricao",
                                nome: descricao.nome,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTabDespesas = () => (
    <div className="space-y-6">
      {/* Seção Categorias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Folder className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">
                Categorias de Despesas
              </CardTitle>
            </div>
            <Button
              onClick={() => abrirModalCategoria("despesa")}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categoriasDespesas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria cadastrada
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categoriasDespesas.map((categoria) => (
                <div key={categoria.id} className="flex items-center">
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-200"
                  >
                    {categoria.nome}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                          setItemParaExcluir({
                            id: categoria.id,
                            tipo: "categoria",
                            nome: categoria.nome,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção Descrições */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">
                Descrições de Despesas
              </CardTitle>
            </div>
            <Button
              onClick={() => abrirModalDescricao("despesa")}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Descrição
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {descriçoesDespesas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma descrição cadastrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {descriçoesDespesas.map((descricao) => (
                  <TableRow key={descricao.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium">{descricao.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {descricao.categoria ? (
                        <Badge
                          variant="outline"
                          className="text-red-600 border-red-200"
                        >
                          {descricao.categoria}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          Sem categoria
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(descricao.dataCriacao)}</span>
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
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              setItemParaExcluir({
                                id: descricao.id,
                                tipo: "descricao",
                                nome: descricao.nome,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <FileText className="h-3 w-3" />
            Descrições
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Gerenciar Descrições e Categorias
            </DialogTitle>
            <DialogDescription>
              Organize suas descrições por categorias, separadas entre receitas
              e despesas
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="receitas" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="receitas"
                className="flex items-center gap-2"
                onClick={() => setTipoAtivo("receita")}
              >
                <CheckCircle className="h-4 w-4" />
                Receitas
              </TabsTrigger>
              <TabsTrigger
                value="despesas"
                className="flex items-center gap-2"
                onClick={() => setTipoAtivo("despesa")}
              >
                <XCircle className="h-4 w-4" />
                Despesas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="receitas" className="mt-6">
              {renderTabReceitas()}
            </TabsContent>

            <TabsContent value="despesas" className="mt-6">
              {renderTabDespesas()}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal para Nova Descrição */}
      <Dialog open={isNewDescricaoOpen} onOpenChange={setIsNewDescricaoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Nova Descrição de{" "}
              {formDescricao.tipo === "receita" ? "Receita" : "Despesa"}
            </DialogTitle>
            <DialogDescription>
              Adicione uma nova descrição padrão para{" "}
              {formDescricao.tipo === "receita" ? "serviços" : "despesas"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitDescricao} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Descrição *</Label>
              <Input
                id="nome"
                value={formDescricao.nome}
                onChange={(e) =>
                  setFormDescricao({ ...formDescricao, nome: e.target.value })
                }
                placeholder={
                  formDescricao.tipo === "receita"
                    ? "Ex: Desentupimento de pia"
                    : "Ex: Combustível"
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formDescricao.categoria}
                onValueChange={(value) =>
                  setFormDescricao({ ...formDescricao, categoria: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(formDescricao.tipo === "receita"
                    ? categoriasReceitas
                    : categoriasDespesas
                  ).map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.nome}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewDescricaoOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Criar Descrição
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Nova Categoria */}
      <Dialog open={isNewCategoriaOpen} onOpenChange={setIsNewCategoriaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Nova Categoria de{" "}
              {formCategoria.tipo === "receita" ? "Receita" : "Despesa"}
            </DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para organizar suas{" "}
              {formCategoria.tipo === "receita" ? "receitas" : "despesas"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCategoria} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCategoria">Nome da Categoria *</Label>
              <Input
                id="nomeCategoria"
                value={formCategoria.nome}
                onChange={(e) =>
                  setFormCategoria({ ...formCategoria, nome: e.target.value })
                }
                placeholder={
                  formCategoria.tipo === "receita"
                    ? "Ex: Serviços, Taxas"
                    : "Ex: Operacional, Administrativo"
                }
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewCategoriaOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Criar Categoria
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!itemParaExcluir}
        onOpenChange={() => setItemParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{itemParaExcluir?.nome}"? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
