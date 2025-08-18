import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
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
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  MapPin,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Building,
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  Search,
  Upload,
  List,
} from "lucide-react";
import { toast } from "../ui/use-toast";
import { formatDate } from "../../lib/dateUtils";

interface Cidade {
  id: number;
  nome: string;
  ativo: boolean;
  dataCriacao: string;
}

interface Setor {
  id: number;
  nome: string;
  cidade: string;
  ativo: boolean;
  dataCriacao: string;
}

export default function ModalGerenciarCidades() {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [isNovoSetorOpen, setIsNovoSetorOpen] = useState(false);
  const [isCadastroMassaOpen, setIsCadastroMassaOpen] = useState(false);
  const [setorParaExcluir, setSetorParaExcluir] = useState<number | null>(null);

  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [cidadesAtivas, setCidadesAtivas] = useState<Cidade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pesquisaCidade, setPesquisaCidade] = useState("");

  const [formSetor, setFormSetor] = useState({
    nome: "",
    cidade: "",
  });

  const [formSetorMassa, setFormSetorMassa] = useState({
    cidade: "",
    setores: "",
  });

  // Carregar dados
  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Carregar todas as cidades
      const resCidades = await fetch("/api/cidades-goias");
      const dadosCidades = await resCidades.json();
      setCidades(dadosCidades);

      // Filtrar cidades ativas
      const ativas = dadosCidades.filter((c: Cidade) => c.ativo);
      setCidadesAtivas(ativas);

      // Carregar setores ativos
      const resSetores = await fetch("/api/setores");
      const dadosSetores = await resSetores.json();
      setSetores(dadosSetores);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMainOpen) {
      carregarDados();
    }
  }, [isMainOpen]);

  // Ativar/desativar cidade
  const toggleCidade = async (nome: string, ativo: boolean) => {
    try {
      const response = await fetch("/api/cidades-goias/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, ativo }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar cidade");
      }

      toast({
        title: "Sucesso",
        description: `Cidade "${nome}" ${ativo ? "ativada" : "desativada"} com sucesso!`,
        variant: "default",
      });

      // Recarregar dados
      await carregarDados();
    } catch (error) {
      console.error("Erro ao toggle cidade:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  // Criar setor
  const handleSubmitSetor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSetor.nome.trim() || !formSetor.cidade) return;

    try {
      const response = await fetch(`/api/cidades-goias/${formSetor.cidade}/setores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: formSetor.nome.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar setor");
      }

      toast({
        title: "Sucesso",
        description: "Setor criado com sucesso!",
        variant: "default",
      });

      setFormSetor({ nome: "", cidade: "" });
      setIsNovoSetorOpen(false);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao criar setor:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar setor",
        variant: "destructive",
      });
    }
  };

  // Excluir setor
  const handleExcluirSetor = async (id: number) => {
    try {
      const response = await fetch(`/api/cidades-goias/setores/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir setor");
      }

      toast({
        title: "Sucesso",
        description: "Setor excluído com sucesso!",
        variant: "default",
      });

      setSetorParaExcluir(null);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao excluir setor:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir setor",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isMainOpen} onOpenChange={setIsMainOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Settings className="h-3 w-3" />
            Gerenciar Cidades
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Gerenciar Cidades e Setores de Goiás
            </DialogTitle>
            <DialogDescription>
              Ative as cidades que você atende e gerencie os setores de cada cidade
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Botão de ação para criar setor */}
            <div className="flex justify-end">
              <Dialog open={isNovoSetorOpen} onOpenChange={setIsNovoSetorOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Setor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Setor</DialogTitle>
                    <DialogDescription>
                      Cadastre um novo setor vinculado a uma cidade ativa
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
                          <SelectValue placeholder="Selecione uma cidade ativa" />
                        </SelectTrigger>
                        <SelectContent>
                          {cidadesAtivas.map((cidade) => (
                            <SelectItem key={cidade.id} value={cidade.nome}>
                              {cidade.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {cidadesAtivas.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Active pelo menos uma cidade para poder criar setores
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
                        disabled={cidadesAtivas.length === 0}
                      >
                        Criar Setor
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
                  Cidades de Goiás
                </CardTitle>
                <CardDescription>
                  {cidades.length} cidades cadastradas • {cidadesAtivas.length} ativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-4">Carregando...</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cidade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cidades.map((cidade) => (
                          <TableRow key={cidade.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{cidade.nome}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={cidade.ativo ? "default" : "secondary"}
                                className="flex items-center space-x-1 w-fit"
                              >
                                {cidade.ativo ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                <span>{cidade.ativo ? "Ativa" : "Inativa"}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={cidade.ativo}
                                  onCheckedChange={(checked) =>
                                    toggleCidade(cidade.nome, checked)
                                  }
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                      Clique em "Novo Setor" para adicionar setores às cidades ativas.
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
                        {setores.map((setor) => (
                          <TableRow key={setor.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="bg-primary/10 p-2 rounded-full">
                                  <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">{setor.nome}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="flex items-center space-x-1 w-fit"
                              >
                                <Building className="h-3 w-3" />
                                <span>{setor.cidade}</span>
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
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => setSetorParaExcluir(setor.id)}
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
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!setorParaExcluir}
        onOpenChange={() => setSetorParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este setor? Esta ação não pode ser
              desfeita e só é possível se não houver lançamentos vinculados.
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
