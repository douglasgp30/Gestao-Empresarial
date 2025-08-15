import React, { useState, useEffect } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Megaphone, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { campanhasApi } from "../../lib/apiService";
import { parseErrorResponse } from "../../lib/responseUtils";

export default function ModalCampanhasSimples() {
  const { campanhas, carregarDados } = useCaixa();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal de confirmação super simples
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    nome: string;
  } | null>(null);

  // Modal de edição
  const [showEdit, setShowEdit] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<{
    id: number;
    nome: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
  });

  // Carregar dados quando o modal é aberto
  useEffect(() => {
    console.log(`[ModalCampanhasSimples] Modal isOpen: ${isOpen}, campanhas.length: ${campanhas.length}`);
    if (isOpen) {
      if (campanhas.length === 0) {
        console.log("[ModalCampanhasSimples] Modal aberto sem dados, carregando...");
        carregarDados();
      } else {
        console.log("[ModalCampanhasSimples] Modal aberto com dados já carregados");
      }
    }
  }, [isOpen, campanhas.length, carregarDados]);

  const resetForm = () => {
    setFormData({ nome: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error("Nome da campanha é obrigatório");
      return;
    }

    setIsSaving(true);
    try {
      const response = await campanhasApi.criar({
        nome: formData.nome.trim(),
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Campanha criada com sucesso!");
      resetForm();
      await carregarDados();
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
      toast.error("Erro ao criar campanha. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !itemToEdit) {
      toast.error("Nome da campanha é obrigatório");
      return;
    }

    setIsSaving(true);
    try {
      const response = await campanhasApi.atualizar(itemToEdit.id, {
        nome: formData.nome.trim(),
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Campanha atualizada com sucesso!");
      resetForm();
      setShowEdit(false);
      setItemToEdit(null);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao editar campanha:", error);
      toast.error("Erro ao editar campanha. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = (item: any) => {
    setItemToDelete({
      id: item.id,
      nome: item.nome,
    });
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      console.log('🟡 Excluindo campanha:', itemToDelete.nome);

      const response = await fetch(`/api/campanhas/${itemToDelete.id}`, {
        method: "DELETE",
      });

      console.log('🟡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      console.log('✅ Excluído com sucesso');

      await carregarDados();
      setShowConfirm(false);
      setItemToDelete(null);
      toast.success("Campanha excluída com sucesso");

    } catch (error) {
      console.error('❌ Erro no handleDelete:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao excluir campanha";
      toast.error(`Falha na exclusão: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (item: any) => {
    setItemToEdit({
      id: item.id,
      nome: item.nome,
    });
    setFormData({
      nome: item.nome,
    });
    setShowEdit(true);
  };

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="gap-1 text-xs">
        <Megaphone className="h-3 w-3" />
        Campanhas
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
              <Megaphone className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Gerenciar Campanhas</h2>
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
            Visualize e gerencie todas as campanhas de marketing
          </p>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {/* Debug: Mostrar dados brutos */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Debug: Dados das Campanhas</h4>
            <div className="text-sm">
              <p><strong>Total campanhas:</strong> {campanhas.length}</p>
              {campanhas.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Ver dados brutos (clique para expandir)</summary>
                  <pre className="mt-2 text-xs bg-white p-2 border rounded overflow-auto max-h-32">
                    {JSON.stringify(campanhas, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {/* Formulário de criação */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Campanha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="Nome da campanha"
                  value={formData.nome}
                  onChange={(e) => setFormData({ nome: e.target.value })}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Adicionar"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de campanhas */}
          <Card>
            <CardHeader>
              <CardTitle>
                Campanhas Cadastradas ({campanhas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campanhas.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma campanha cadastrada
                </p>
              ) : (
                <div className="space-y-2">
                  {(Array.isArray(campanhas) ? campanhas : []).map((campanha) => (
                    <div key={campanha.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{campanha.nome}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(campanha)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar campanha"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConfirmDelete(campanha)}
                          className="text-red-600 hover:text-red-700"
                          title="Excluir campanha"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal de confirmação de exclusão */}
        {showConfirm && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja excluir a campanha "{itemToDelete?.nome}"?
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

        {/* Modal de edição */}
        {showEdit && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Editar Campanha</h3>
              <form onSubmit={handleEdit}>
                <Input
                  placeholder="Nome da campanha"
                  value={formData.nome}
                  onChange={(e) => setFormData({ nome: e.target.value })}
                  className="mb-4"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!isSaving) {
                        setShowEdit(false);
                        setItemToEdit(null);
                        resetForm();
                      }
                    }}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
