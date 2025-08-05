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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
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
import {
  FileText,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Tag,
} from "lucide-react";

const categorias = [
  "Residencial",
  "Comercial",
  "Industrial",
  "Condomínio",
  "Emergência",
  "Outros",
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export default function ModalDescricoes() {
  const { descricoes, adicionarDescricao, excluirDescricao } = useEntidades();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewDescricaoOpen, setIsNewDescricaoOpen] = useState(false);
  const [descricaoParaExcluir, setDescricaoParaExcluir] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      categoria: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) return;

    adicionarDescricao({
      nome: formData.nome.trim(),
      categoria: formData.categoria || undefined,
    });

    resetForm();
    setIsNewDescricaoOpen(false);
  };

  const handleExcluir = (id: string) => {
    excluirDescricao(id);
    setDescricaoParaExcluir(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Descrições
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Gerenciar Descrições
            </DialogTitle>
            <DialogDescription>
              Gerencie as descrições padrão para lançamentos de serviços
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header com botão de criar */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  Descrições Cadastradas
                </h3>
                <p className="text-sm text-muted-foreground">
                  {descricoes.length} descrição(ões) cadastrada(s)
                </p>
              </div>
              <Dialog
                open={isNewDescricaoOpen}
                onOpenChange={setIsNewDescricaoOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Descrição
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Descrição</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova descrição padrão para serviços
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome da Descrição *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) =>
                          setFormData({ ...formData, nome: e.target.value })
                        }
                        placeholder="Ex: Desentupimento de pia"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={formData.categoria}
                        onValueChange={(value) =>
                          setFormData({ ...formData, categoria: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
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
            </div>

            {/* Lista de descrições */}
            {descricoes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Nenhuma descrição cadastrada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Clique em "Nova Descrição" para criar sua primeira descrição
                    padrão.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
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
                    {descricoes.map((descricao) => (
                      <TableRow key={descricao.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">
                              {descricao.nome}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {descricao.categoria ? (
                            <Badge
                              variant="outline"
                              className="flex items-center space-x-1 w-fit"
                            >
                              <Tag className="h-3 w-3" />
                              <span>{descricao.categoria}</span>
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
                                  setDescricaoParaExcluir(descricao.id)
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
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!descricaoParaExcluir}
        onOpenChange={() => setDescricaoParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta descrição? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                descricaoParaExcluir && handleExcluir(descricaoParaExcluir)
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
