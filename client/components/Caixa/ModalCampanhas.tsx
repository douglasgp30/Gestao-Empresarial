import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
  Megaphone,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Play,
  Pause,
} from "lucide-react";

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export default function ModalCampanhas() {
  const { campanhas, adicionarCampanha } = useCaixa();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewCampanhaOpen, setIsNewCampanhaOpen] = useState(false);
  const [campanhaParaExcluir, setCampanhaParaExcluir] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ativa: true,
    dataInicio: new Date().toISOString().split("T")[0],
    dataFim: "",
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      ativa: true,
      dataInicio: new Date().toISOString().split("T")[0],
      dataFim: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) return;

    adicionarCampanha({
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || undefined,
      ativa: formData.ativa,
      dataInicio: new Date(formData.dataInicio),
      dataFim: formData.dataFim ? new Date(formData.dataFim) : undefined,
    });

    resetForm();
    setIsNewCampanhaOpen(false);
  };

  const handleExcluir = (id: string) => {
    // Implementar exclusão
    setCampanhaParaExcluir(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Megaphone className="h-4 w-4" />
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
                      Preencha os dados da nova campanha de marketing
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
                        placeholder="Ex: Promoção Janeiro 2024"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descricao: e.target.value,
                          })
                        }
                        placeholder="Descreva os detalhes da campanha..."
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="dataInicio">Data de Início</Label>
                        <Input
                          id="dataInicio"
                          type="date"
                          value={formData.dataInicio}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dataInicio: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dataFim">Data de Fim (Opcional)</Label>
                        <Input
                          id="dataFim"
                          type="date"
                          value={formData.dataFim}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dataFim: e.target.value,
                            })
                          }
                          min={formData.dataInicio}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ativa"
                        checked={formData.ativa}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, ativa: checked })
                        }
                      />
                      <Label htmlFor="ativa">Campanha ativa</Label>
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
                      <TableHead>Período</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Descrição</TableHead>
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
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{formatDate(campanha.dataInicio)}</span>
                            </div>
                            {campanha.dataFim && (
                              <div className="text-muted-foreground">
                                até {formatDate(campanha.dataFim)}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={campanha.ativa ? "default" : "secondary"}
                            className="flex items-center space-x-1 w-fit"
                          >
                            {campanha.ativa ? (
                              <Play className="h-3 w-3" />
                            ) : (
                              <Pause className="h-3 w-3" />
                            )}
                            <span>{campanha.ativa ? "Ativa" : "Inativa"}</span>
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {campanha.descricao || "Sem descrição"}
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  setCampanhaParaExcluir(campanha.id)
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
        open={!!campanhaParaExcluir}
        onOpenChange={() => setCampanhaParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta campanha? Esta ação não pode
              ser desfeita.
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
