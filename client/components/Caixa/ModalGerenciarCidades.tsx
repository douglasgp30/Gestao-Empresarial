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
import { useEntidades } from "../../contexts/EntidadesContext";

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
  const [pesquisaSetor, setPesquisaSetor] = useState("");

  const [formSetor, setFormSetor] = useState({
    nome: "",
    cidade: "",
  });

  const [formSetorMassa, setFormSetorMassa] = useState({
    cidade: "",
    setores: "",
  });

  // Filtrar cidades baseado na pesquisa
  const cidadesFiltradas = useMemo(() => {
    if (!pesquisaCidade.trim()) return cidades;

    return cidades.filter((cidade) =>
      cidade.nome.toLowerCase().includes(pesquisaCidade.toLowerCase()),
    );
  }, [cidades, pesquisaCidade]);

  // Filtrar setores baseado na pesquisa
  const setoresFiltrados = useMemo(() => {
    if (!pesquisaSetor.trim()) return setores;

    return setores.filter(
      (setor) =>
        setor.nome.toLowerCase().includes(pesquisaSetor.toLowerCase()) ||
        setor.cidade.toLowerCase().includes(pesquisaSetor.toLowerCase()),
    );
  }, [setores, pesquisaSetor]);

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
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  // Criar setor
  const handleSubmitSetor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSetor.nome.trim() || !formSetor.cidade) return;

    try {
      const response = await fetch(
        `/api/cidades-goias/${formSetor.cidade}/setores`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: formSetor.nome.trim() }),
        },
      );

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
        description:
          error instanceof Error ? error.message : "Erro ao criar setor",
        variant: "destructive",
      });
    }
  };

  // Cadastro em massa de setores
  const handleCadastroMassa = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSetorMassa.cidade || !formSetorMassa.setores.trim()) {
      toast({
        title: "Erro",
        description: "Selecione uma cidade e informe os setores",
        variant: "destructive",
      });
      return;
    }

    try {
      // Processar lista de setores (quebrar por linha e limpar)
      const listaSetores = formSetorMassa.setores
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (listaSetores.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum setor válido encontrado na lista",
          variant: "destructive",
        });
        return;
      }

      let sucessos = 0;
      let erros = 0;
      const setoresComErro: string[] = [];

      // Criar cada setor individualmente
      for (const nomeSetor of listaSetores) {
        try {
          const response = await fetch(
            `/api/cidades-goias/${formSetorMassa.cidade}/setores`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nome: nomeSetor }),
            },
          );

          if (response.ok) {
            sucessos++;
          } else {
            erros++;
            setoresComErro.push(nomeSetor);
          }
        } catch {
          erros++;
          setoresComErro.push(nomeSetor);
        }
      }

      // Recarregar dados
      await carregarDados();

      // Mostrar resultado
      if (sucessos > 0 && erros === 0) {
        toast({
          title: "Sucesso",
          description: `${sucessos} setores criados com sucesso!`,
          variant: "default",
        });
      } else if (sucessos > 0 && erros > 0) {
        toast({
          title: "Parcialmente concluído",
          description: `${sucessos} setores criados, ${erros} com erro (possivelmente duplicados)`,
          variant: "default",
        });
      } else {
        toast({
          title: "Erro",
          description: `Não foi possível criar nenhum setor. Verifique se já existem.`,
          variant: "destructive",
        });
      }

      // Limpar formulário se houve sucesso
      if (sucessos > 0) {
        setFormSetorMassa({ cidade: "", setores: "" });
        setIsCadastroMassaOpen(false);
      }
    } catch (error) {
      console.error("Erro no cadastro em massa:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado no cadastro em massa",
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
        description:
          error instanceof Error ? error.message : "Erro ao excluir setor",
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
            Gerenciar Cidades e Setores
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Gerenciar Cidades e Setores
            </DialogTitle>
            <DialogDescription>
              Ative as cidades que você atende e gerencie os setores de cada
              cidade
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Botões de ação para criar setores */}
            <div className="flex gap-2 justify-end">
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

              <Dialog
                open={isCadastroMassaOpen}
                onOpenChange={setIsCadastroMassaOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Cadastro em Massa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastro em Massa de Setores</DialogTitle>
                    <DialogDescription>
                      Cole uma lista de setores separados por linha para
                      cadastrar todos de uma vez
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCadastroMassa} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cidade *</Label>
                      <Select
                        value={formSetorMassa.cidade}
                        onValueChange={(value) =>
                          setFormSetorMassa({
                            ...formSetorMassa,
                            cidade: value,
                          })
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="listaSetores">Lista de Setores *</Label>
                      <Textarea
                        id="listaSetores"
                        value={formSetorMassa.setores}
                        onChange={(e) =>
                          setFormSetorMassa({
                            ...formSetorMassa,
                            setores: e.target.value,
                          })
                        }
                        placeholder="Cole aqui os nomes dos setores, um por linha:&#10;&#10;Centro&#10;Setor Bueno&#10;Campinas&#10;Oeste&#10;..."
                        className="h-40 font-mono text-sm"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Exemplo: Digite ou cole cada setor em uma linha
                        separada. Setores duplicados serão ignorados.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCadastroMassaOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={cidadesAtivas.length === 0}
                      >
                        Cadastrar Setores
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
                  Cidades
                </CardTitle>
                <CardDescription>
                  {cidades.length} cidades cadastradas • {cidadesAtivas.length}{" "}
                  ativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Campo de pesquisa */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar cidade..."
                      value={pesquisaCidade}
                      onChange={(e) => setPesquisaCidade(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {pesquisaCidade && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {cidadesFiltradas.length} cidade(s) encontrada(s)
                    </p>
                  )}
                </div>
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
                        {cidadesFiltradas.map((cidade) => (
                          <TableRow key={cidade.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {cidade.nome}
                                </span>
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
                                <span>
                                  {cidade.ativo ? "Ativa" : "Inativa"}
                                </span>
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
                {/* Campo de pesquisa de setores */}
                {setores.length > 0 && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar setor ou cidade..."
                        value={pesquisaSetor}
                        onChange={(e) => setPesquisaSetor(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {pesquisaSetor && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {setoresFiltrados.length} setor(es) encontrado(s)
                      </p>
                    )}
                  </div>
                )}

                {setores.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      Nenhum setor cadastrado
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Novo Setor" para adicionar setores às cidades
                      ativas.
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
                        {setoresFiltrados.map((setor) => (
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
                                    onClick={() =>
                                      setSetorParaExcluir(setor.id)
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
