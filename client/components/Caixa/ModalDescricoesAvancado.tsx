import React, { useState, useMemo } from "react";
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
import ModalConfirmacaoExclusao from "./ModalConfirmacaoExclusao";
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
import { toast } from "sonner";

export default function ModalDescricoesAvancado() {
  const {
    descricoesECategorias,
    getCategorias,
    getDescricoes,
    adicionarDescricaoECategoria,
    excluirDescricaoECategoria,
    recarregarDescricoesECategorias,
    isLoading,
  } = useEntidades();

  const [isOpen, setIsOpen] = useState(false);
  const [isNewDescricaoOpen, setIsNewDescricaoOpen] = useState(false);
  const [isNewCategoriaOpen, setIsNewCategoriaOpen] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<{
    id: number;
    tipo: "descricao" | "categoria";
    nome: string;
  } | null>(null);

  const [tipoAtivo, setTipoAtivo] = useState<"receita" | "despesa">("receita");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formDescricao, setFormDescricao] = useState({
    nome: "",
    tipo: "receita" as "receita" | "despesa",
    categoria: "",
  });

  const [formCategoria, setFormCategoria] = useState({
    nome: "",
    tipo: "receita" as "receita" | "despesa",
  });

  // Filtrar dados usando o sistema unificado com memoização otimizada
  const categoriasReceitas = useMemo(() => {
    return descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "categoria" && item.ativo && item.tipo === "receita",
    );
  }, [descricoesECategorias]);

  const categoriasDespesas = useMemo(() => {
    return descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "categoria" && item.ativo && item.tipo === "despesa",
    );
  }, [descricoesECategorias]);

  const descricoesReceitas = useMemo(() => {
    return descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "descricao" && item.ativo && item.tipo === "receita",
    );
  }, [descricoesECategorias]);

  const descricoesDespesas = useMemo(() => {
    return descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "descricao" && item.ativo && item.tipo === "despesa",
    );
  }, [descricoesECategorias]);

  const resetFormDescricao = () => {
    setFormDescricao({
      nome: "",
      tipo: "receita",
      categoria: "",
    });
  };

  const resetFormCategoria = () => {
    setFormCategoria({
      nome: "",
      tipo: "receita",
    });
  };

  const handleAdicionarDescricao = async () => {
    if (!formDescricao.nome.trim()) {
      toast.error("Nome da descrição é obrigatório");
      return;
    }

    if (!formDescricao.categoria) {
      toast.error("Categoria é obrigatória");
      return;
    }

    setIsSaving(true);
    try {
      await adicionarDescricaoECategoria({
        nome: formDescricao.nome.trim(),
        tipo: formDescricao.tipo,
        categoria: formDescricao.categoria,
        tipoItem: "descricao",
        ativo: true,
      });

      toast.success("Descrição adicionada com sucesso");

      resetFormDescricao();
      setIsNewDescricaoOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar descrição:", error);
      toast.error("Erro ao adicionar descrição. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdicionarCategoria = async () => {
    if (!formCategoria.nome.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    setIsSaving(true);
    try {
      await adicionarDescricaoECategoria({
        nome: formCategoria.nome.trim(),
        tipo: formCategoria.tipo,
        tipoItem: "categoria",
        ativo: true,
      });

      toast.success("Categoria adicionada com sucesso");

      resetFormCategoria();
      setIsNewCategoriaOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast.error("Erro ao adicionar categoria. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // SOLUÇÃO SUPER SIMPLES: API + Estado mínimo
  const handleExcluir = async () => {
    if (!itemParaExcluir || isDeleting) return;

    const itemBackup = itemParaExcluir; // Backup para não perder referência
    setIsDeleting(true);

    try {
      console.log("🟡 Excluindo:", itemBackup.nome);

      // API call direta
      const response = await fetch(
        `/api/descricoes-e-categorias/${itemBackup.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      console.log("✅ Excluído com sucesso");

      // Recarregar dados primeiro
      await recarregarDescricoesECategorias();

      // Só depois fechar modal e mostrar sucesso
      setItemParaExcluir(null);
      toast.success(
        `${itemBackup.tipo === "categoria" ? "Categoria" : "Descrição"} excluída com sucesso`,
      );
    } catch (error) {
      console.error("❌ Erro:", error);
      toast.error("Erro ao excluir item");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          // Bloquear fechamento se estiver deletando
          if (!open && isDeleting) {
            return;
          }
          setIsOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Categorias/Descrições
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Gerenciar Categorias e Descrições
            </DialogTitle>
            <DialogDescription>
              Gerencie as categorias e descrições para receitas e despesas
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={tipoAtivo}
            onValueChange={(value) =>
              setTipoAtivo(value as "receita" | "despesa")
            }
            className="flex-1"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="receita" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Receitas
              </TabsTrigger>
              <TabsTrigger value="despesa" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Despesas
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="receita"
              className="space-y-4 overflow-auto max-h-[60vh]"
            >
              {/* Categorias de Receita */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categorias de Receita ({categoriasReceitas.length})
                  </CardTitle>
                  <Dialog
                    open={isNewCategoriaOpen}
                    onOpenChange={setIsNewCategoriaOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() =>
                          setFormCategoria({
                            ...formCategoria,
                            tipo: "receita",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nova
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Categoria de Receita</DialogTitle>
                        <DialogDescription>
                          Adicione uma nova categoria para receitas
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nome-categoria">
                            Nome da Categoria *
                          </Label>
                          <Input
                            id="nome-categoria"
                            value={formCategoria.nome}
                            onChange={(e) =>
                              setFormCategoria({
                                ...formCategoria,
                                nome: e.target.value,
                              })
                            }
                            placeholder="Ex: Serviços, Vendas..."
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsNewCategoriaOpen(false);
                              resetFormCategoria();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleAdicionarCategoria}
                            disabled={isSaving}
                          >
                            {isSaving ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {categoriasReceitas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma categoria de receita cadastrada
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {categoriasReceitas.map((categoria) => (
                        <div
                          key={categoria.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <span className="font-medium">
                              {categoria.nome}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              {categoria.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  setItemParaExcluir({
                                    id: categoria.id,
                                    tipo: "categoria",
                                    nome: categoria.nome,
                                  })
                                }
                                className="text-red-600"
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

              {/* Descrições de Receita */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descrições de Receita ({descricoesReceitas.length})
                  </CardTitle>
                  <Dialog
                    open={isNewDescricaoOpen}
                    onOpenChange={setIsNewDescricaoOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() =>
                          setFormDescricao({
                            ...formDescricao,
                            tipo: "receita",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nova
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Descrição de Receita</DialogTitle>
                        <DialogDescription>
                          Adicione uma nova descrição para receitas
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="categoria-select">Categoria *</Label>
                          <Select
                            value={formDescricao.categoria}
                            onValueChange={(value) =>
                              setFormDescricao({
                                ...formDescricao,
                                categoria: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriasReceitas.map((cat) => (
                                <SelectItem key={cat.id} value={cat.nome}>
                                  {cat.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="nome-descricao">
                            Nome da Descrição *
                          </Label>
                          <Input
                            id="nome-descricao"
                            value={formDescricao.nome}
                            onChange={(e) =>
                              setFormDescricao({
                                ...formDescricao,
                                nome: e.target.value,
                              })
                            }
                            placeholder="Ex: Conserto de Celular, Venda de Produto..."
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsNewDescricaoOpen(false);
                              resetFormDescricao();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleAdicionarDescricao}
                            disabled={isSaving}
                          >
                            {isSaving ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {descricoesReceitas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma descrição de receita cadastrada
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {descricoesReceitas.map((descricao) => (
                        <div
                          key={descricao.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <span className="font-medium">
                              {descricao.nome}
                            </span>
                            <Badge variant="secondary" className="ml-2">
                              {descricao.categoria || "Sem categoria"}
                            </Badge>
                            <Badge variant="outline" className="ml-2">
                              {descricao.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  setItemParaExcluir({
                                    id: descricao.id,
                                    tipo: "descricao",
                                    nome: descricao.nome,
                                  })
                                }
                                className="text-red-600"
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
            </TabsContent>

            <TabsContent
              value="despesa"
              className="space-y-4 overflow-auto max-h-[60vh]"
            >
              {/* Categorias de Despesa */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categorias de Despesa ({categoriasDespesas.length})
                  </CardTitle>
                  <Dialog
                    open={isNewCategoriaOpen}
                    onOpenChange={setIsNewCategoriaOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() =>
                          setFormCategoria({
                            ...formCategoria,
                            tipo: "despesa",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nova
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {categoriasDespesas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma categoria de despesa cadastrada
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {categoriasDespesas.map((categoria) => (
                        <div
                          key={categoria.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <span className="font-medium">
                              {categoria.nome}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              {categoria.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  setItemParaExcluir({
                                    id: categoria.id,
                                    tipo: "categoria",
                                    nome: categoria.nome,
                                  })
                                }
                                className="text-red-600"
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

              {/* Descrições de Despesa */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descrições de Despesa ({descricoesDespesas.length})
                  </CardTitle>
                  <Dialog
                    open={isNewDescricaoOpen}
                    onOpenChange={setIsNewDescricaoOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() =>
                          setFormDescricao({
                            ...formDescricao,
                            tipo: "despesa",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nova
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {descricoesDespesas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma descrição de despesa cadastrada
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {descricoesDespesas.map((descricao) => (
                        <div
                          key={descricao.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <span className="font-medium">
                              {descricao.nome}
                            </span>
                            <Badge variant="secondary" className="ml-2">
                              {descricao.categoria || "Sem categoria"}
                            </Badge>
                            <Badge variant="outline" className="ml-2">
                              {descricao.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  setItemParaExcluir({
                                    id: descricao.id,
                                    tipo: "descricao",
                                    nome: descricao.nome,
                                  })
                                }
                                className="text-red-600"
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
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* MODAL PERSONALIZADO SEM ALERT DIALOG PARA EVITAR TRAVAMENTOS */}
      <ModalConfirmacaoExclusao
        isOpen={!!itemParaExcluir}
        onClose={() => setItemParaExcluir(null)}
        onConfirm={handleExcluir}
        isDeleting={isDeleting}
        titulo="Confirmar Exclusão"
        descricao={
          itemParaExcluir?.tipo === "categoria" ? "a categoria" : "a descrição"
        }
        nomeItem={itemParaExcluir?.nome || ""}
      />
    </>
  );
}
