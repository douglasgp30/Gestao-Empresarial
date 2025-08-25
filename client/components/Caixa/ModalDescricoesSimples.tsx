import React, { useState, useMemo, useEffect } from "react";
import { useEntidades } from "../../contexts/EntidadesContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  FileText,
  Plus,
  Trash2,
  Tag,
  CheckCircle,
  XCircle,
  Folder,
  Eye,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import ModalDependenciasCategoria from "./ModalDependenciasCategoria";

export default function ModalDescricoesSimples() {
  const {
    descricoesECategorias,
    adicionarDescricaoECategoria,
    recarregarDescricoesECategorias,
    isLoading,
  } = useEntidades();

  const [isOpen, setIsOpen] = useState(false);
  const [tipoAtivo, setTipoAtivo] = useState<"receita" | "despesa">("receita");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal de confirmação super simples
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    tipo: "descricao" | "categoria";
    nome: string;
  } | null>(null);

  // Modal de dependências
  const [showDependencies, setShowDependencies] = useState(false);
  const [categoriaParaDependencias, setCategoriaParaDependencias] = useState<{
    id: number;
    nome: string;
    tipo: "receita" | "despesa";
  } | null>(null);

  const [formDescricao, setFormDescricao] = useState({
    nome: "",
    categoria: "",
  });

  const [formCategoria, setFormCategoria] = useState({
    nome: "",
  });

  // Estados para edição
  const [itemEditando, setItemEditando] = useState<{
    id: number;
    nome: string;
    tipo: "categoria" | "descricao";
  } | null>(null);
  const [nomeEditando, setNomeEditando] = useState("");

  // Carregar dados quando o modal é aberto
  useEffect(() => {
    const length = Array.isArray(descricoesECategorias)
      ? descricoesECategorias.length
      : 0;
    console.log(
      `[ModalDescricoesSimples] Modal isOpen: ${isOpen}, descricoesECategorias.length: ${length}`,
    );
    if (isOpen) {
      if (length === 0) {
        console.log(
          "[ModalDescricoesSimples] Modal aberto sem dados, carregando...",
        );
        recarregarDescricoesECategorias();
      } else {
        console.log(
          "[ModalDescricoesSimples] Modal aberto com dados já carregados",
        );
      }
    }
  }, [isOpen, descricoesECategorias, recarregarDescricoesECategorias]);

  // Filtrar dados usando o sistema unificado com memoização otimizada
  const categoriasReceitas = useMemo(() => {
    if (!Array.isArray(descricoesECategorias)) {
      return [];
    }
    const filtered = descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "categoria" && item.ativo && item.tipo === "receita",
    );
    console.log(
      `[ModalDescricoesSimples] Categorias de receita filtradas: ${filtered.length}`,
      filtered,
    );
    return filtered;
  }, [descricoesECategorias]);

  const categoriasDespesas = useMemo(() => {
    if (!Array.isArray(descricoesECategorias)) {
      return [];
    }
    return descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "categoria" && item.ativo && item.tipo === "despesa",
    );
  }, [descricoesECategorias]);

  const descricoesReceitas = useMemo(() => {
    if (!Array.isArray(descricoesECategorias)) {
      return [];
    }
    const filtered = descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "descricao" && item.ativo && item.tipo === "receita",
    );
    console.log(
      `[ModalDescricoesSimples] Descriç��es de receita filtradas: ${filtered.length}`,
      filtered,
    );
    return filtered;
  }, [descricoesECategorias]);

  const descricoesDespesas = useMemo(() => {
    if (!Array.isArray(descricoesECategorias)) {
      return [];
    }
    return descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "descricao" && item.ativo && item.tipo === "despesa",
    );
  }, [descricoesECategorias]);

  // Função para contar quantas descrições uma categoria possui
  const contarDescricoesDaCategoria = (nomeCategoria: string, tipo: string) => {
    if (!Array.isArray(descricoesECategorias)) {
      return 0;
    }
    return descricoesECategorias.filter(
      (item) =>
        item.tipoItem === "descricao" &&
        item.ativo &&
        item.tipo === tipo &&
        item.categoria === nomeCategoria,
    ).length;
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
      console.log("➕ Adicionando nova descrição:", {
        nome: formDescricao.nome.trim(),
        tipo: tipoAtivo,
        categoria: formDescricao.categoria,
        tipoItem: "descricao",
        ativo: true,
      });

      // Usar API diretamente em vez do contexto para melhor controle
      const response = await fetch('/api/descricoes-e-categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formDescricao.nome.trim(),
          tipo: tipoAtivo,
          categoria: formDescricao.categoria,
          tipoItem: "descricao",
          ativo: true,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Erro ao adicionar descrição";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.warn("Erro ao ler resposta de erro:", e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ Descrição criada:", result);

      toast.success("Descrição adicionada com sucesso");
      setFormDescricao({ nome: "", categoria: "" });

      // Sincronizar dados após criação
      console.log("🔄 Sincronizando dados após criação de descrição...");
      await recarregarDescricoesECategorias();
    } catch (error) {
      console.error("❌ Erro ao adicionar descrição:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao adicionar descrição. Tente novamente.");
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
        tipo: tipoAtivo,
        tipoItem: "categoria",
        ativo: true,
      });

      toast.success("Categoria adicionada com sucesso");
      setFormCategoria({ nome: "" });

      // Sincronizar dados após criação
      console.log("🔄 Sincronizando dados após criação de categoria...");
      await recarregarDescricoesECategorias();
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast.error("Erro ao adicionar categoria. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = (item: any) => {
    setItemToDelete({
      id: item.id,
      tipo: item.tipoItem,
      nome: item.nome,
    });
    setShowConfirm(true);
  };

  const handleShowDependencies = (categoria: any) => {
    setCategoriaParaDependencias({
      id: categoria.id,
      nome: categoria.nome,
      tipo: tipoAtivo,
    });
    setShowDependencies(true);
  };

  const handleIniciarEdicao = (item: any) => {
    setItemEditando({
      id: item.id,
      nome: item.nome,
      tipo: item.tipoItem,
    });
    setNomeEditando(item.nome);
  };

  const handleCancelarEdicao = () => {
    setItemEditando(null);
    setNomeEditando("");
  };

  const handleSalvarEdicao = async () => {
    if (!itemEditando || !nomeEditando.trim()) {
      toast.error("Nome não pode estar vazio");
      return;
    }

    try {
      console.log("✏️ Salvando edição:", itemEditando.id, nomeEditando);

      const response = await fetch(`/api/descricoes-e-categorias/${itemEditando.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nomeEditando.trim(),
        }),
      });

      if (!response.ok) {
        let errorMessage = "Erro ao salvar alterações";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.warn("Erro ao ler resposta de erro:", e);
        }
        throw new Error(errorMessage);
      }

      // Sincronizar dados após edição
      console.log("🔄 Sincronizando dados após edição...");
      await recarregarDescricoesECategorias();

      setItemEditando(null);
      setNomeEditando("");
      toast.success(`${itemEditando.tipo === 'categoria' ? 'Categoria' : 'Descrição'} "${nomeEditando}" salva com sucesso`);
    } catch (error) {
      console.error("❌ Erro ao salvar edição:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao salvar alterações");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      console.log("🟡 Excluindo:", itemToDelete.nome);

      const response = await fetch(
        `/api/descricoes-e-categorias/${itemToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        let errorMessage = "Não foi possível excluir o item.";
        let isDependencyError = false;

        // Tentar extrair a mensagem de erro do servidor
        try {
          const contentType = response.headers.get("content-type");
          console.log("🔍 Response status:", response.status);
          console.log("🔍 Content-Type:", contentType);

          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            console.log("🔍 Error data from server:", errorData);

            // Preservar a mensagem original do servidor que contém detalhes importantes
            if (
              errorData &&
              errorData.error &&
              typeof errorData.error === "string"
            ) {
              errorMessage = errorData.error;
              // Detectar se é um erro de dependência
              if (errorMessage.includes("vinculada") || errorMessage.includes("lançamento")) {
                isDependencyError = true;
              }
            }
          } else {
            // Resposta não é JSON, tentar ler como texto
            const errorText = await response.text();
            console.log("🔍 Error text from server:", errorText);
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (jsonError) {
          console.log("🔍 Erro ao processar resposta:", jsonError);
          // Se não conseguir ler a resposta, usar mensagem padrão baseada no status
          if (response.status === 400) {
            errorMessage =
              "Não foi possível excluir o item. Verifique se não há descrições ou dependências vinculadas.";
            isDependencyError = true;
          } else if (response.status === 404) {
            errorMessage = "Item não encontrado.";
          } else {
            errorMessage = `Erro ${response.status}: Não foi possível excluir o item.`;
          }
        }

        console.log("🔍 Final error message:", errorMessage);
        console.log("🔍 Is dependency error:", isDependencyError);

        // Fechar modal de confirmação
        setShowConfirm(false);
        setItemToDelete(null);

        // Mostrar erro de forma adequada baseado no tipo
        if (isDependencyError) {
          // Para erros de dependência de categoria, permitir visualizar dependências
          if (itemToDelete.tipo === "categoria") {
            toast.error("Não é possível excluir esta categoria", {
              duration: 12000,
              description: errorMessage,
              action: {
                label: "Ver Dependências",
                onClick: () => {
                  // Encontrar a categoria no array para passar os dados corretos
                  const categoria = descricoesECategorias.find(
                    (item) => item.id === itemToDelete.id
                  );
                  if (categoria) {
                    setCategoriaParaDependencias({
                      id: categoria.id,
                      nome: categoria.nome,
                      tipo: categoria.tipo,
                    });
                    setShowDependencies(true);
                  }
                },
              },
            });
          } else {
            // Para descrições, apenas mostrar o erro detalhado
            toast.error("Não é possível excluir esta descrição", {
              duration: 10000,
              description: errorMessage,
              action: {
                label: "Entendi",
                onClick: () => console.log("Toast dismissed"),
              },
            });
          }
        } else {
          // Para outros erros, mostrar mensagem simples
          toast.error(errorMessage);
        }

        return; // Não lançar erro, já tratamos aqui
      }

      // Status 204 (No Content) indica sucesso na exclusão
      console.log("✅ Excluído com sucesso");

      // Recarregar dados da API para sincronizar
      try {
        console.log("🔄 Sincronizando dados após exclusão...");
        const response = await fetch('/api/descricoes-e-categorias');
        if (response.ok) {
          const data = await response.json();
          console.log("📦 Dados atualizados recebidos da API:", data.data?.length || 0);

          // Atualizar localStorage com dados atualizados
          if (data.data) {
            localStorage.setItem('descricoes_e_categorias', JSON.stringify(data.data));
          }
        }
      } catch (syncError) {
        console.warn("⚠️ Erro ao sincronizar dados, usando recarregamento local:", syncError);
      }

      // Recarregar do contexto (agora com dados atualizados)
      await recarregarDescricoesECategorias();
      setShowConfirm(false);
      setItemToDelete(null);
      toast.success(`${itemToDelete.tipo === 'categoria' ? 'Categoria' : 'Descrição'} "${itemToDelete.nome}" excluída com sucesso`);
    } catch (error) {
      console.error("❌ Erro inesperado no handleDelete:", error);

      // Fechar modal de confirmação
      setShowConfirm(false);
      setItemToDelete(null);

      // Mostrar erro genérico para problemas de rede ou outros erros inesperados
      toast.error("Erro inesperado ao excluir item. Verifique sua conexão e tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <FileText className="h-4 w-4 mr-2" />
        Categorias/Descrições
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              <h2 className="text-xl font-semibold">
                Gerenciar Categorias e Descrições
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              ✕
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Gerencie as categorias e descrições para receitas e despesas
          </p>
        </div>

        {/* Tabs */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          <div className="flex mb-6 mt-6">
            <Button
              variant={tipoAtivo === "receita" ? "default" : "ghost"}
              onClick={() => setTipoAtivo("receita")}
              className="mr-2"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Receitas
            </Button>
            <Button
              variant={tipoAtivo === "despesa" ? "default" : "ghost"}
              onClick={() => setTipoAtivo("despesa")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Despesas
            </Button>
          </div>

          {/* Categorias */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categorias de{" "}
                  {tipoAtivo === "receita" ? "Receita" : "Despesa"}(
                  {tipoAtivo === "receita"
                    ? categoriasReceitas.length
                    : categoriasDespesas.length}
                  )
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nome da categoria"
                  value={formCategoria.nome}
                  onChange={(e) => setFormCategoria({ nome: e.target.value })}
                />
                <Button onClick={handleAdicionarCategoria} disabled={isSaving}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-2">
                {(tipoAtivo === "receita"
                  ? categoriasReceitas
                  : categoriasDespesas
                ).map((categoria) => (
                  <div
                    key={categoria.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {itemEditando?.id === categoria.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={nomeEditando}
                            onChange={(e) => setNomeEditando(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSalvarEdicao();
                              } else if (e.key === 'Escape') {
                                handleCancelarEdicao();
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{categoria.nome}</span>
                          {(() => {
                            const numDescricoes = contarDescricoesDaCategoria(categoria.nome, categoria.tipo);
                            return (
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  numDescricoes > 0
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                                title={`${numDescricoes} descrição(ões) vinculada(s)`}
                              >
                                {numDescricoes}
                              </span>
                            );
                          })()}
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {itemEditando?.id === categoria.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSalvarEdicao}
                            className="text-green-600 hover:text-green-700"
                            title="Salvar alterações"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelarEdicao}
                            className="text-gray-600 hover:text-gray-700"
                            title="Cancelar edição"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowDependencies(categoria)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Ver descrições vinculadas"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleIniciarEdicao(categoria)}
                            className="text-orange-600 hover:text-orange-700"
                            title="Editar nome da categoria"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfirmDelete(categoria)}
                            className="text-red-600 hover:text-red-700"
                            title="Excluir categoria"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Descrições */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descrições de{" "}
                  {tipoAtivo === "receita" ? "Receita" : "Despesa"}(
                  {tipoAtivo === "receita"
                    ? descricoesReceitas.length
                    : descricoesDespesas.length}
                  )
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <select
                  value={formDescricao.categoria}
                  onChange={(e) =>
                    setFormDescricao({
                      ...formDescricao,
                      categoria: e.target.value,
                    })
                  }
                  className="p-2 border rounded"
                >
                  <option value="">Selecione uma categoria</option>
                  {(tipoAtivo === "receita"
                    ? categoriasReceitas
                    : categoriasDespesas
                  ).map((cat) => (
                    <option key={cat.id} value={cat.nome}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Nome da descrição"
                  value={formDescricao.nome}
                  onChange={(e) =>
                    setFormDescricao({ ...formDescricao, nome: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleAdicionarDescricao}
                disabled={isSaving}
                className="mb-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Descrição
              </Button>

              <div className="space-y-2">
                {(tipoAtivo === "receita"
                  ? descricoesReceitas
                  : descricoesDespesas
                ).map((descricao) => (
                  <div
                    key={descricao.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {itemEditando?.id === descricao.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={nomeEditando}
                            onChange={(e) => setNomeEditando(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSalvarEdicao();
                              } else if (e.key === 'Escape') {
                                handleCancelarEdicao();
                              }
                            }}
                            autoFocus
                          />
                          <span className="text-sm text-gray-500">
                            ({descricao.categoria})
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{descricao.nome}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            ({descricao.categoria})
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {itemEditando?.id === descricao.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSalvarEdicao}
                            className="text-green-600 hover:text-green-700"
                            title="Salvar alterações"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelarEdicao}
                            className="text-gray-600 hover:text-gray-700"
                            title="Cancelar edição"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleIniciarEdicao(descricao)}
                            className="text-orange-600 hover:text-orange-700"
                            title="Editar nome da descrição"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfirmDelete(descricao)}
                            className="text-red-600 hover:text-red-700"
                            title="Excluir descrição"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de confirma��ão super simples */}
        {showConfirm && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja excluir {itemToDelete?.tipo} "
                {itemToDelete?.nome}"?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!isDeleting) {
                      setShowConfirm(false);
                      setItemToDelete(null);
                    }
                  }}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de dependências */}
        <ModalDependenciasCategoria
          isOpen={showDependencies}
          onClose={() => {
            setShowDependencies(false);
            setCategoriaParaDependencias(null);
          }}
          categoria={categoriaParaDependencias}
          todasDescricoes={descricoesECategorias}
        />
      </div>
    </div>
  );
}
