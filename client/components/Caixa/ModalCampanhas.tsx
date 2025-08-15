import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { formatDate } from "../../lib/dateUtils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent } from "../ui/card";
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
import { Megaphone, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { campanhasApi } from "../../lib/apiService";
import { toast } from "sonner";

export default function ModalCampanhas() {
  const { campanhas, carregarDados } = useCaixa();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewCampanhaOpen, setIsNewCampanhaOpen] = useState(false);
  const [isEditCampanhaOpen, setIsEditCampanhaOpen] = useState(false);
  const [campanhaParaExcluir, setCampanhaParaExcluir] = useState<any>(null);
  const [campanhaParaEditar, setCampanhaParaEditar] = useState<any>(null);

  const [formData, setFormData] = useState({
    nome: "",
  });

  const resetForm = () => {
    setFormData({
      nome: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da campanha é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await campanhasApi.criar({
        nome: formData.nome.trim(),
      });

      if (response.error) {
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Campanha criada com sucesso!",
      });

      resetForm();
      setIsNewCampanhaOpen(false);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar campanha. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !campanhaParaEditar) {
      toast({
        title: "Erro",
        description: "Nome da campanha é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await campanhasApi.atualizar(campanhaParaEditar.id, {
        nome: formData.nome.trim(),
      });

      if (response.error) {
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Campanha atualizada com sucesso!",
      });

      resetForm();
      setIsEditCampanhaOpen(false);
      setCampanhaParaEditar(null);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao editar campanha:", error);
      toast({
        title: "Erro",
        description: "Erro ao editar campanha. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExcluir = async (campanha: any) => {
    try {
      const response = await campanhasApi.excluir(campanha.id);

      if (response.error) {
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Campanha excluída com sucesso!",
      });

      setCampanhaParaExcluir(null);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao excluir campanha:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir campanha. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const abrirEdicao = (campanha: any) => {
    setCampanhaParaEditar(campanha);
    setFormData({
      nome: campanha.nome,
    });
    setIsEditCampanhaOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Megaphone className="h-3 w-3" />
            Campanhas
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Gerenciar Campanhas
            </DialogTitle>
            <DialogDescription>
              Visualize e gerencie todas as campanhas de marketing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header com botão de criar */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Campanhas Cadastradas</h3>
                <p className="text-sm text-muted-foreground">
                  {campanhas.length} campanha(s) cadastrada(s)
                </p>
              </div>
              <Dialog
                open={isNewCampanhaOpen}
                onOpenChange={setIsNewCampanhaOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Campanha
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Campanha</DialogTitle>
                    <DialogDescription>
                      Preencha o nome da nova campanha de marketing
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome da Campanha *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) =>
                          setFormData({ ...formData, nome: e.target.value })
                        }
                        placeholder="Ex: Google Ads, Facebook, Instagram"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsNewCampanhaOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1">
                        Criar Campanha
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de campanhas */}
            {campanhas.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Nenhuma campanha cadastrada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Clique em "Nova Campanha" para criar sua primeira campanha.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campanhas.map((campanha) => (
                      <TableRow key={campanha.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Megaphone className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{campanha.nome}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(campanha.dataCriacao)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => abrirEdicao(campanha)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setCampanhaParaExcluir(campanha)}
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
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição */}
      <Dialog open={isEditCampanhaOpen} onOpenChange={setIsEditCampanhaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Campanha</DialogTitle>
            <DialogDescription>Altere o nome da campanha</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeEdit">Nome da Campanha *</Label>
              <Input
                id="nomeEdit"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Ex: Google Ads, Facebook, Instagram"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditCampanhaOpen(false);
                  setCampanhaParaEditar(null);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!campanhaParaExcluir}
        onOpenChange={() => setCampanhaParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a campanha "
              {campanhaParaExcluir?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                campanhaParaExcluir && handleExcluir(campanhaParaExcluir)
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
