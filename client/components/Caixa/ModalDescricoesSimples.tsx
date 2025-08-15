import React, { useState, useMemo, useEffect } from "react";
import { useEntidades } from "../../contexts/EntidadesContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FileText, Plus, Trash2, Tag, CheckCircle, XCircle, Folder, Eye } from "lucide-react";
import { toast } from "sonner";
import ModalDependenciasCategoria from "./ModalDependenciasCategoria";
import TestDeleteApi from "../Debug/TestDeleteApi";
import TestApiEndpoints from "../Debug/TestApiEndpoints";
import { parseErrorResponse } from "../../lib/responseUtils";

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

  // Carregar dados quando o modal é aberto
  useEffect(() => {
    console.log(`[ModalDescricoesSimples] Modal isOpen: ${isOpen}, descricoesECategorias.length: ${descricoesECategorias.length}`);
    if (isOpen) {
      if (descricoesECategorias.length === 0) {
        console.log("[ModalDescricoesSimples] Modal aberto sem dados, carregando...");
        recarregarDescricoesECategorias();
      } else {
        console.log("[ModalDescricoesSimples] Modal aberto com dados já carregados");
      }
    }
  }, [isOpen, descricoesECategorias.length, recarregarDescricoesECategorias]);

  // Filtrar dados usando o sistema unificado com memoização otimizada
  const categoriasReceitas = useMemo(() => {
    const filtered = descricoesECategorias.filter(
      (item) => item.tipoItem === "categoria" && item.ativo && item.tipo === "receita"
    );
    console.log(`[ModalDescricoesSimples] Categorias de receita filtradas: ${filtered.length}`, filtered);
    return filtered;
  }, [descricoesECategorias]);

  const categoriasDespesas = useMemo(() => {
    return descricoesECategorias.filter(
      (item) => item.tipoItem === "categoria" && item.ativo && item.tipo === "despesa"
    );
  }, [descricoesECategorias]);

  const descricoesReceitas = useMemo(() => {
    const filtered = descricoesECategorias.filter(
      (item) => item.tipoItem === "descricao" && item.ativo && item.tipo === "receita"
    );
    console.log(`[ModalDescricoesSimples] Descrições de receita filtradas: ${filtered.length}`, filtered);
    return filtered;
  }, [descricoesECategorias]);

  const descricoesDespesas = useMemo(() => {
    return descricoesECategorias.filter(
      (item) => item.tipoItem === "descricao" && item.ativo && item.tipo === "despesa"
    );
  }, [descricoesECategorias]);

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
        tipo: tipoAtivo,
        categoria: formDescricao.categoria,
        tipoItem: "descricao",
        ativo: true,
      });

      toast.success("Descrição adicionada com sucesso");
      setFormDescricao({ nome: "", categoria: "" });
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
        tipo: tipoAtivo,
        tipoItem: "categoria",
        ativo: true,
      });

      toast.success("Categoria adicionada com sucesso");
      setFormCategoria({ nome: "" });
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

  const handleDelete = async () => {
    if (!itemToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      console.log('🟡 Excluindo:', {
        id: itemToDelete.id,
        nome: itemToDelete.nome,
        tipo: itemToDelete.tipo
      });

      const response = await fetch(`/api/descricoes-e-categorias/${itemToDelete.id}`, {
        method: "DELETE",
      });

      console.log('🟡 Response status:', response.status, response.statusText);
      console.log('🟡 Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      });

      if (!response.ok) {
        console.log('🔴 Erro HTTP detectado - status:', response.status);

        // Tentar ler o corpo da resposta para debug
        try {
          const responseClone = response.clone();
          const errorText = await responseClone.text();
          console.log('🔴 Corpo da resposta de erro:', errorText);
        } catch (readError) {
          console.log('🔴 Erro ao ler corpo da resposta:', readError);
        }

        const errorMessage = await parseErrorResponse(response);
        console.log('🔴 Mensagem de erro parseada:', errorMessage);
        throw new Error(errorMessage);
      }

      // Status 204 (No Content) indica sucesso na exclusão
      if (response.status === 204) {
        console.log('✅ Excluído com sucesso (status 204)');
      } else {
        console.log('✅ Excluído com sucesso (status ' + response.status + ')');
      }

      await recarregarDescricoesECategorias();
      setShowConfirm(false);
      setItemToDelete(null);
      toast.success("Item excluído com sucesso");

    } catch (error) {
      console.error('❌ Erro no handleDelete:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Stack:', error instanceof Error ? error.stack : 'N/A');

      const errorMessage = error instanceof Error ? error.message : "Erro ao excluir item";
      toast.error(`Falha na exclusão: ${errorMessage}`);
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
              <h2 className="text-xl font-semibold">Gerenciar Categorias e Descrições</h2>
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
          {/* Debug component - pode remover em produção quando estável */}

          {/* Debug: Mostrar dados brutos */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Debug: Dados do Contexto</h4>
            <div className="text-sm">
              <p><strong>Total descrições/categorias:</strong> {descricoesECategorias.length}</p>
              <p><strong>Carregando:</strong> {isLoading ? "Sim" : "Não"}</p>
              {descricoesECategorias.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Ver dados brutos (clique para expandir)</summary>
                  <pre className="mt-2 text-xs bg-white p-2 border rounded overflow-auto max-h-32">
                    {JSON.stringify(descricoesECategorias, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

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
                  Categorias de {tipoAtivo === "receita" ? "Receita" : "Despesa"} 
                  ({tipoAtivo === "receita" ? categoriasReceitas.length : categoriasDespesas.length})
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
                {(tipoAtivo === "receita" ? categoriasReceitas : categoriasDespesas).map((categoria) => (
                  <div key={categoria.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{categoria.nome}</span>
                    <div className="flex gap-1">
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
                        onClick={() => handleConfirmDelete(categoria)}
                        className="text-red-600 hover:text-red-700"
                        title="Excluir categoria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                  Descrições de {tipoAtivo === "receita" ? "Receita" : "Despesa"}
                  ({tipoAtivo === "receita" ? descricoesReceitas.length : descricoesDespesas.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <select
                  value={formDescricao.categoria}
                  onChange={(e) => setFormDescricao({...formDescricao, categoria: e.target.value})}
                  className="p-2 border rounded"
                >
                  <option value="">Selecione uma categoria</option>
                  {(tipoAtivo === "receita" ? categoriasReceitas : categoriasDespesas).map((cat) => (
                    <option key={cat.id} value={cat.nome}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Nome da descrição"
                  value={formDescricao.nome}
                  onChange={(e) => setFormDescricao({...formDescricao, nome: e.target.value})}
                />
              </div>
              <Button onClick={handleAdicionarDescricao} disabled={isSaving} className="mb-4">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Descrição
              </Button>

              <div className="space-y-2">
                {(tipoAtivo === "receita" ? descricoesReceitas : descricoesDespesas).map((descricao) => (
                  <div key={descricao.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{descricao.nome}</span>
                      <span className="ml-2 text-sm text-gray-500">({descricao.categoria})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConfirmDelete(descricao)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de confirmação super simples */}
        {showConfirm && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja excluir {itemToDelete?.tipo} "{itemToDelete?.nome}"?
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
