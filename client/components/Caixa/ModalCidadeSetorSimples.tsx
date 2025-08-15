import React, { useState, useMemo, useEffect } from "react";
import { useEntidades } from "../../contexts/EntidadesContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MapPin, Plus, Trash2, Building, Eye } from "lucide-react";
import { toast } from "sonner";

interface ModalDependenciasSetorProps {
  isOpen: boolean;
  onClose: () => void;
  cidade: {
    nome: string;
  } | null;
  todosSetores: any[];
}

function ModalDependenciasSetor({
  isOpen,
  onClose,
  cidade,
  todosSetores,
}: ModalDependenciasSetorProps) {
  const [setoresVinculados, setSetoresVinculados] = useState<any[]>([]);

  useEffect(() => {
    if (cidade && todosSetores) {
      const vinculados = todosSetores.filter(
        (setor) => setor.cidade === cidade.nome,
      );
      setSetoresVinculados(vinculados);
    }
  }, [cidade, todosSetores]);

  if (!isOpen || !cidade) return null;

  const temVinculados = setoresVinculados.length > 0;

  return (
    <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${temVinculados ? "bg-amber-100" : "bg-green-100"}`}
            >
              {temVinculados ? (
                <Building className="h-5 w-5 text-amber-600" />
              ) : (
                <Eye className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Dependências da Cidade</h3>
              <p className="text-sm text-gray-600">"{cidade.nome}"</p>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {temVinculados ? (
            <div>
              <div className="flex items-center gap-2 mb-4 text-amber-700">
                <Building className="h-4 w-4" />
                <span className="font-medium">
                  Não é possível excluir esta cidade
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Esta cidade possui <strong>{setoresVinculados.length}</strong>{" "}
                setor(es) vinculado(s):
              </p>

              <div className="space-y-2">
                {setoresVinculados.map((setor) => (
                  <div
                    key={setor.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{setor.nome}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="text-sm text-amber-800">
                  <strong>Para excluir esta cidade:</strong>
                  <br />
                  • Exclua primeiro todos os setores vinculados, ou
                  <br />• Mova os setores para outra cidade
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4 text-green-700">
                <Eye className="h-4 w-4" />
                <span className="font-medium">Cidade pode ser excluída</span>
              </div>

              <p className="text-sm text-gray-600">
                Esta cidade não possui setores vinculados e pode ser excluída
                com segurança.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <Button onClick={onClose} className="w-full">
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ModalCidadeSetorSimples() {
  const {
    setores,
    cidades,
    adicionarSetor,
    adicionarCidade,
    excluirSetor,
    recarregarTudo,
  } = useEntidades();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal de confirmação super simples
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id?: string;
    nome: string;
    tipo: "cidade" | "setor";
  } | null>(null);

  // Modal de dependências
  const [showDependencies, setShowDependencies] = useState(false);
  const [cidadeParaDependencias, setCidadeParaDependencias] = useState<{
    nome: string;
  } | null>(null);

  const [formCidade, setFormCidade] = useState({
    nome: "",
  });

  const [formSetor, setFormSetor] = useState({
    nome: "",
    cidade: "",
  });

  // Carregar dados quando o modal é aberto
  useEffect(() => {
    console.log(
      `[ModalCidadeSetorSimples] Modal isOpen: ${isOpen}, cidades.length: ${cidades.length}, setores.length: ${setores.length}`,
    );
    if (isOpen) {
      if (cidades.length === 0 || setores.length === 0) {
        console.log(
          "[ModalCidadeSetorSimples] Modal aberto sem dados, carregando...",
        );
        recarregarTudo();
      } else {
        console.log(
          "[ModalCidadeSetorSimples] Modal aberto com dados já carregados",
        );
      }
    }
  }, [isOpen, cidades.length, setores.length, recarregarTudo]);

  const resetFormCidade = () => {
    setFormCidade({ nome: "" });
  };

  const resetFormSetor = () => {
    setFormSetor({ nome: "", cidade: "" });
  };

  const handleAdicionarCidade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCidade.nome.trim()) {
      toast.error("Nome da cidade é obrigatório");
      return;
    }

    setIsSaving(true);
    try {
      const nomeCidade = formCidade.nome.trim();

      // Verificar se a cidade já existe
      if (cidades.includes(nomeCidade)) {
        toast.error("Esta cidade já existe");
        return;
      }

      // Usar a nova API de cidades
      await adicionarCidade({
        nome: nomeCidade,
      });

      // Recarregar dados para atualizar a lista de cidades
      await recarregarTudo();

      toast.success(`Cidade "${nomeCidade}" adicionada com sucesso!`);
      resetFormCidade();
    } catch (error) {
      console.error("Erro ao adicionar cidade:", error);
      toast.error("Erro ao adicionar cidade. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdicionarSetor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSetor.nome.trim()) {
      toast.error("Nome do setor é obrigatório");
      return;
    }

    if (!formSetor.cidade) {
      toast.error("Cidade é obrigatória");
      return;
    }

    setIsSaving(true);
    try {
      const nomeSetor = formSetor.nome.trim();
      const nomeCidade = formSetor.cidade;

      // Verificar se o setor já existe nesta cidade
      const setorExistente = setores.find(
        (s) =>
          s.nome.toLowerCase() === nomeSetor.toLowerCase() &&
          s.cidade === nomeCidade,
      );

      if (setorExistente) {
        toast.error(
          `O setor "${nomeSetor}" j�� existe na cidade "${nomeCidade}"`,
        );
        return;
      }

      await adicionarSetor({
        nome: nomeSetor,
        cidade: nomeCidade,
      });

      // Recarregar dados para garantir atualização
      await recarregarTudo();

      toast.success("Setor adicionado com sucesso");
      resetFormSetor();
    } catch (error) {
      console.error("Erro ao adicionar setor:", error);
      toast.error("Erro ao adicionar setor. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = (item: any, tipo: "cidade" | "setor") => {
    setItemToDelete({
      id: item.id,
      nome: item.nome || item,
      tipo,
    });
    setShowConfirm(true);
  };

  const handleShowDependencies = (cidade: string) => {
    setCidadeParaDependencias({ nome: cidade });
    setShowDependencies(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete || isDeleting) return;

    setIsDeleting(true);

    if (itemToDelete.tipo === "setor") {
      // Excluir setor - verificar se é o último da cidade
      console.log("🟡 Verificando exclusão de setor:", itemToDelete.nome);

      const setorParaExcluir = setores.find((s) => s.id === itemToDelete.id);
      if (setorParaExcluir) {
        const setoresDaMesmaCidade = setores.filter(
          (s) => {
            const nomeCidadeS = typeof s.cidade === 'object' ? s.cidade?.nome : s.cidade;
            const nomeCidadeParaExcluir = typeof setorParaExcluir.cidade === 'object'
              ? setorParaExcluir.cidade?.nome
              : setorParaExcluir.cidade;
            return nomeCidadeS === nomeCidadeParaExcluir;
          },
        );

        if (setoresDaMesmaCidade.length === 1) {
          // É o último setor da cidade
          toast.error(
            `⚠️ Não é possível excluir o setor "${itemToDelete.nome}" pois é o último setor da cidade "${typeof setorParaExcluir.cidade === 'object' ? setorParaExcluir.cidade?.nome : setorParaExcluir.cidade}". Isso faria a cidade desaparecer. Para remover a cidade, use o botão de excluir cidade.`,
            {
              duration: 10000,
              action: {
                label: "Entendi",
                onClick: () => {},
              },
            },
          );
          setIsDeleting(false);
          return;
        }
      }

      // Se chegou aqui, pode excluir
      try {
        console.log("🟡 Excluindo setor:", itemToDelete.nome);
        await excluirSetor(itemToDelete.id || itemToDelete.nome);

        toast.success("Setor excluído com sucesso");
        setShowConfirm(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("❌ Erro ao excluir setor:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao excluir setor";
        toast.error(errorMessage);
      }
    } else {
      // Excluir cidade - verificar dependências primeiro
      console.log("🟡 Excluindo cidade:", itemToDelete.nome);

      const setoresVinculados = setores.filter(
        (s) => s.cidade === itemToDelete.nome,
      );

      if (setoresVinculados.length > 0) {
        const nomesSetores = setoresVinculados.map((s) => s.nome).join(", ");
        console.log(
          "⚠️ Validação: cidade possui setores vinculados:",
          nomesSetores,
        );

        // Mostrar mensagem informativa sem lançar erro
        toast.error(
          `⚠️ Não �� possível excluir a cidade "${itemToDelete.nome}" pois existem ${setoresVinculados.length} setor(es) vinculado(s). Use o botão "👁️ Ver" para visualizar as dependências.`,
          {
            duration: 8000, // Toast mais longo para dar tempo de ler
            action: {
              label: "👁️ Ver Dependências",
              onClick: () => {
                handleShowDependencies(itemToDelete.nome);
              },
            },
          },
        );

        // Não fechar o modal - usuário pode tentar novamente após ver dependências
        setIsDeleting(false);
        return;
      }

      // Se chegou aqui, pode excluir usando a nova API
      try {
        // Primeiro, buscar o ID da cidade pelo nome
        const cidadesResponse = await fetch("/api/cidades");
        const cidadesData = await cidadesResponse.json();

        let cidadesArray = cidadesData.data || cidadesData;
        if (cidadesData.data && Array.isArray(cidadesData.data)) {
          cidadesArray = cidadesData.data;
        }

        const cidadeEncontrada = cidadesArray.find(
          (c: any) => c.nome === itemToDelete.nome,
        );

        if (!cidadeEncontrada) {
          throw new Error(`Cidade "${itemToDelete.nome}" não encontrada`);
        }

        const response = await fetch(`/api/cidades/${cidadeEncontrada.id}`, {
          method: "DELETE",
        });

        // Ler response uma única vez
        let responseData;
        try {
          responseData = await response.json();
        } catch (parseError) {
          responseData = null;
        }

        if (!response.ok) {
          const errorMessage =
            responseData?.error || `Erro HTTP ${response.status}`;
          throw new Error(errorMessage);
        }

        console.log("✅ Cidade excluída com sucesso");

        // Recarregar dados para atualizar a lista de cidades
        await recarregarTudo();

        toast.success("Cidade excluída com sucesso");
        setShowConfirm(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("❌ Erro ao excluir cidade:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao excluir cidade";
        toast.error(errorMessage);
      }
    }

    setIsDeleting(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1 text-xs"
      >
        <MapPin className="h-3 w-3" />
        Cidades/Setores
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
              <MapPin className="h-5 w-5" />
              <h2 className="text-xl font-semibold">
                Gerenciar Cidades e Setores
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
          <div className="text-sm text-gray-600 mt-2">
            <p>
              Para remover uma cidade, é necessário excluir todos os setores
              vinculados a ela.
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {/* Cidades */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Cidades ({cidades.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAdicionarCidade}
                className="flex gap-2 mb-4"
              >
                <Input
                  placeholder="Nome da cidade"
                  value={formCidade.nome}
                  onChange={(e) => setFormCidade({ nome: e.target.value })}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSaving}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </form>

              <div className="space-y-2">
                {(Array.isArray(cidades) ? cidades : [])
                  .filter(cidade => cidade != null && cidade !== '')
                  .map((cidade, index) => (
                    <div
                      key={`cidade-${index}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="font-medium">{
                        typeof cidade === 'object'
                          ? (cidade?.nome || String(cidade))
                          : String(cidade)
                      }</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowDependencies(
                            typeof cidade === 'object'
                              ? (cidade?.nome || String(cidade))
                              : String(cidade)
                          )}
                          className="text-blue-600 hover:text-blue-700"
                          title="Ver setores vinculados"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleConfirmDelete({
                              nome: typeof cidade === 'object'
                                ? (cidade?.nome || String(cidade))
                                : String(cidade)
                            }, "cidade")
                          }
                          className="text-red-600 hover:text-red-700"
                          title="Excluir cidade"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ),
                )}
                {cidades.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Nenhuma cidade cadastrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Setores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Setores ({setores.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAdicionarSetor}
                className="grid grid-cols-2 gap-2 mb-4"
              >
                <select
                  value={formSetor.cidade}
                  onChange={(e) =>
                    setFormSetor({ ...formSetor, cidade: e.target.value })
                  }
                  className="p-2 border rounded"
                >
                  <option value="">Selecione uma cidade</option>
                  {(Array.isArray(cidades) ? cidades : [])
                    .filter(cidade => cidade != null && cidade !== '')
                    .map((cidade, index) => (
                      <option key={`option-${index}`} value={
                        typeof cidade === 'object'
                          ? (cidade?.nome || String(cidade))
                          : String(cidade)
                      }>
                        {typeof cidade === 'object'
                          ? (cidade?.nome || String(cidade))
                          : String(cidade)}
                      </option>
                    ),
                  )}
                </select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do setor"
                    value={formSetor.nome}
                    onChange={(e) =>
                      setFormSetor({ ...formSetor, nome: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSaving}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </form>

              <div className="space-y-2">
                {(Array.isArray(setores) ? setores : []).map((setor) => (
                  <div
                    key={setor.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{setor.nome}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({setor.cidade})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConfirmDelete(setor, "setor")}
                      className="text-red-600 hover:text-red-700"
                      title="Excluir setor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {setores.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum setor cadastrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de confirmação de exclusão */}
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
        <ModalDependenciasSetor
          isOpen={showDependencies}
          onClose={() => {
            setShowDependencies(false);
            setCidadeParaDependencias(null);
          }}
          cidade={cidadeParaDependencias}
          todosSetores={setores}
        />
      </div>
    </div>
  );
}
