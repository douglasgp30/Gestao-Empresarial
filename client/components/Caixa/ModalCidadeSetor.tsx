import React, { useState } from "react";
import { useEntidades } from "../../contexts/EntidadesContext";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
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
  MapPin,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Building,
  Calendar,
} from "lucide-react";
import { toast } from "../ui/use-toast";
import { formatDate } from "../../lib/dateUtils";

export default function ModalCidadeSetor() {
  const { setores, cidades, adicionarSetor, adicionarCidade, excluirSetor } =
    useEntidades();

  const [isMainOpen, setIsMainOpen] = useState(false);
  const [isNovaCidadeOpen, setIsNovaCidadeOpen] = useState(false);
  const [isNovoSetorOpen, setIsNovoSetorOpen] = useState(false);
  const [setorParaExcluir, setSetorParaExcluir] = useState<string | null>(null);

  const [formCidade, setFormCidade] = useState({
    nome: "",
  });

  const [formSetor, setFormSetor] = useState({
    nome: "",
    cidade: "",
  });

  const resetFormCidade = () => {
    setFormCidade({ nome: "" });
  };

  const resetFormSetor = () => {
    setFormSetor({ nome: "", cidade: "" });
  };

  const handleSubmitCidade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCidade.nome.trim()) return;

    try {
      await adicionarCidade({ nome: formCidade.nome.trim() });
      toast({
        title: "Sucesso",
        description: "Cidade adicionada com sucesso!",
        variant: "default",
      });
      resetFormCidade();
      setIsNovaCidadeOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar cidade:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar cidade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitSetor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSetor.nome.trim() || !formSetor.cidade) return;

    try {
      await adicionarSetor({
        nome: formSetor.nome.trim(),
        cidade: formSetor.cidade,
      });
      toast({
        title: "Sucesso",
        description: "Setor adicionado com sucesso!",
        variant: "default",
      });
      resetFormSetor();
      setIsNovoSetorOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar setor:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar setor. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExcluirSetor = async (id: string) => {
    try {
      await excluirSetor(id);
      toast({
        title: "Sucesso",
        description: "Setor excluído com sucesso!",
        variant: "default",
      });
      setSetorParaExcluir(null);
    } catch (error) {
      console.error("Erro ao excluir setor:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir setor. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isMainOpen} onOpenChange={setIsMainOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            Cidade / Setores
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Gerenciar Cidades e Setores
            </DialogTitle>
            <DialogDescription>
              Gerencie as cidades e setores utilizados nos lançamentos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Botões de ação */}
            <div className="flex gap-3">
              <Dialog
                open={isNovaCidadeOpen}
                onOpenChange={setIsNovaCidadeOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Cidade
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Cidade</DialogTitle>
                    <DialogDescription>
                      Cadastre uma nova cidade para ser usada nos setores
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmitCidade} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeCidade">Nome da Cidade *</Label>
                      <Input
                        id="nomeCidade"
                        value={formCidade.nome}
                        onChange={(e) =>
                          setFormCidade({ ...formCidade, nome: e.target.value })
                        }
                        placeholder="Ex: Goiânia"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsNovaCidadeOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1">
                        Adicionar Cidade
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isNovoSetorOpen} onOpenChange={setIsNovoSetorOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Setor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Setor</DialogTitle>
                    <DialogDescription>
                      Cadastre um novo setor vinculado a uma cidade existente
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmitSetor} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeSetor">Nome do Setor *</Label>
                      <Input
                        id="nomeSetor"
                        value={formSetor.nome}
                        onChange={(e) =>
                          setFormSetor({ ...formSetor, nome: e.target.value })
                        }
                        placeholder="Ex: Centro, Setor Bueno"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cidade *</Label>
                      <Select
                        value={formSetor.cidade}
                        onValueChange={(value) =>
                          setFormSetor({ ...formSetor, cidade: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Array.isArray(cidades) ? cidades : []).map(
                            (cidade, index) => (
                              <SelectItem
                                key={`cidade-${index}-${cidade}`}
                                value={cidade}
                              >
                                {cidade}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      {cidades.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Cadastre uma cidade primeiro para poder criar setores
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsNovoSetorOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={cidades.length === 0}
                      >
                        Adicionar Setor
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Cidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Cidades Cadastradas
                </CardTitle>
                <CardDescription>
                  {cidades.length} cidade(s) cadastrada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cidades.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      Nenhuma cidade cadastrada
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Nova Cidade" para adicionar sua primeira
                      cidade.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(cidades) ? cidades : []).map(
                      (cidade, index) => (
                        <Badge
                          key={`cidade-badge-${index}-${cidade}`}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {cidade}
                        </Badge>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Setores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Setores Cadastrados
                </CardTitle>
                <CardDescription>
                  {setores.length} setor(es) cadastrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {setores.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      Nenhum setor cadastrado
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Novo Setor" para adicionar seu primeiro setor.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Setor</TableHead>
                          <TableHead>Cidade</TableHead>
                          <TableHead>Data Criação</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(Array.isArray(setores) ? setores : []).map(
                          (setor) => (
                            <TableRow key={setor.id}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <MapPin className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="font-medium">
                                    {setor.nome}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="flex items-center space-x-1 w-fit"
                                >
                                  <Building className="h-3 w-3" />
                                  <span>
                                    {typeof setor.cidade === "object"
                                      ? setor.cidade?.nome
                                      : setor.cidade}
                                  </span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(setor.dataCriacao)}</span>
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
                                        setSetorParaExcluir(setor.id.toString())
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirma��ão de exclusão */}
      <AlertDialog
        open={!!setorParaExcluir}
        onOpenChange={() => setSetorParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este setor? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                setorParaExcluir && handleExcluirSetor(setorParaExcluir)
              }
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
