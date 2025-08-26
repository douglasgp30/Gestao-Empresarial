import React, { useState, useMemo, useEffect } from "react";
import { useEntidades } from "../../contexts/EntidadesContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  MapPin,
  Plus,
  Trash2,
  Building,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Save,
  X,
  List,
} from "lucide-react";
import { toast } from "sonner";

export default function ModalCidadesSimples() {
  const {
    localizacoesGeograficas,
    getCidades,
    getSetores,
    sincronizarLocalizacoes,
    isLoading,
  } = useEntidades();

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal de confirmação
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    tipo: "cidade" | "setor";
    nome: string;
  } | null>(null);

  const [formCidade, setFormCidade] = useState({
    nome: "",
  });

  const [formSetor, setFormSetor] = useState({
    nome: "",
    cidadeId: "",
  });

  // Estados para criação em massa
  const [cidadesTexto, setCidadesTexto] = useState("");
  const [setoresTexto, setSetoresTexto] = useState("");
  const [cidadeSelecionadaMassa, setCidadeSelecionadaMassa] = useState("");

  // Estados para edição
  const [itemEditando, setItemEditando] = useState<{
    id: number;
    nome: string;
    tipo: "cidade" | "setor";
  } | null>(null);
  const [nomeEditando, setNomeEditando] = useState("");

  // Carregar dados quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      console.log("[ModalCidadesSimples] Modal aberto, sincronizando dados...");
      sincronizarLocalizacoes();
    }
  }, [isOpen, sincronizarLocalizacoes]);

  // Filtrar dados usando memoização
  const cidades = useMemo(() => {
    return getCidades().filter((c) => c.ativo);
  }, [getCidades]);

  const setores = useMemo(() => {
    return getSetores().filter((s) => s.ativo);
  }, [getSetores]);

  // Função para contar quantos setores uma cidade possui
  const contarSetoresDaCidade = (nomeCidade: string) => {
    return setores.filter((s) => s.cidade === nomeCidade).length;
  };

  const handleAdicionarCidade = async () => {
    if (!formCidade.nome.trim()) {
      toast.error("Nome da cidade é obrigatório");
      return;
    }

    setIsSaving(true);
    try {
      console.log("➕ Adicionando nova cidade:", {
        nome: formCidade.nome.trim(),
        tipoItem: "cidade",
        ativo: true,
      });

      const response = await fetch("/api/localizacoes-geograficas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formCidade.nome.trim(),
          tipoItem: "cidade",
          ativo: true,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Erro ao adicionar cidade";
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
      console.log("✅ Cidade criada:", result);

      toast.success("Cidade adicionada com sucesso");
      setFormCidade({ nome: "" });

      // Sincronizar dados após criação
      await sincronizarLocalizacoes();
    } catch (error) {
      console.error("❌ Erro ao adicionar cidade:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao adicionar cidade. Tente novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdicionarSetor = async () => {
    if (!formSetor.nome.trim()) {
      toast.error("Nome do setor é obrigatório");
      return;
    }

    if (!formSetor.cidadeId) {
      toast.error("Cidade é obrigatória");
      return;
    }

    setIsSaving(true);
    try {
      // Buscar nome da cidade pelo ID
      const cidadeSelecionada = cidades.find(
        (c) => c.id.toString() === formSetor.cidadeId,
      );
      if (!cidadeSelecionada) {
        throw new Error("Cidade selecionada não encontrada");
      }

      console.log("➕ Adicionando novo setor:", {
        nome: formSetor.nome.trim(),
        tipoItem: "setor",
        cidade: cidadeSelecionada.nome,
        ativo: true,
      });

      const response = await fetch("/api/localizacoes-geograficas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formSetor.nome.trim(),
          tipoItem: "setor",
          cidade: cidadeSelecionada.nome,
          ativo: true,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Erro ao adicionar setor";
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
      console.log("✅ Setor criado:", result);

      toast.success("Setor adicionado com sucesso");
      setFormSetor({ nome: "", cidadeId: "" });

      // Sincronizar dados após criação
      await sincronizarLocalizacoes();
    } catch (error) {
      console.error("❌ Erro ao adicionar setor:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao adicionar setor. Tente novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Cadastrar cidades em massa
  const handleCadastrarCidadesMassa = async () => {
    if (!cidadesTexto.trim()) {
      toast.error("Digite pelo menos uma cidade");
      return;
    }

    const cidadesLista = cidadesTexto
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cidadesLista.length === 0) {
      toast.error("Nenhuma cidade válida encontrada");
      return;
    }

    setIsSaving(true);
    try {
      console.log("➕ Cadastrando cidades em massa:", cidadesLista);

      const response = await fetch("/api/localizacoes/cadastro-massa/cidades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cidades: cidadesLista,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro no cadastro");
      }

      const result = await response.json();
      console.log("✅ Cidades criadas:", result);

      toast.success(result.message);

      if (result.resultados.erros.length > 0) {
        console.warn("Erros no cadastro:", result.resultados.erros);
      }

      setCidadesTexto("");
      await sincronizarLocalizacoes();
    } catch (error) {
      console.error("❌ Erro ao cadastrar cidades:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao cadastrar cidades",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Cadastrar setores em massa
  const handleCadastrarSetoresMassa = async () => {
    if (!setoresTexto.trim() || !cidadeSelecionadaMassa) {
      toast.error("Selecione uma cidade e digite pelo menos um setor");
      return;
    }

    const setoresLista = setoresTexto
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (setoresLista.length === 0) {
      toast.error("Nenhum setor válido encontrado");
      return;
    }

    setIsSaving(true);
    try {
      console.log(
        "➕ Cadastrando setores em massa:",
        setoresLista,
        "para cidade ID:",
        cidadeSelecionadaMassa,
      );

      const response = await fetch("/api/localizacoes/cadastro-massa/setores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cidadeId: parseInt(cidadeSelecionadaMassa),
          setores: setoresLista,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro no cadastro");
      }

      const result = await response.json();
      console.log("✅ Setores criados:", result);

      toast.success(result.message);

      if (result.resultados.erros.length > 0) {
        console.warn("Erros no cadastro:", result.resultados.erros);
      }

      setSetoresTexto("");
      setCidadeSelecionadaMassa("");
      await sincronizarLocalizacoes();
    } catch (error) {
      console.error("❌ Erro ao cadastrar setores:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao cadastrar setores",
      );
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

      const response = await fetch(
        `/api/localizacoes-geograficas/${itemEditando.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: nomeEditando.trim(),
          }),
        },
      );

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
      await sincronizarLocalizacoes();

      setItemEditando(null);
      setNomeEditando("");
      toast.success(
        `${itemEditando.tipo === "cidade" ? "Cidade" : "Setor"} "${nomeEditando}" salvo com sucesso`,
      );
    } catch (error) {
      console.error("❌ Erro ao salvar edição:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar alterações",
      );
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      console.log("🟡 Excluindo:", itemToDelete.nome);

      const response = await fetch(
        `/api/localizacoes-geograficas/${itemToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        let errorMessage = "Não foi possível excluir o item.";

        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          } else {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (jsonError) {
          console.log("🔍 Erro ao processar resposta:", jsonError);
          if (response.status === 400) {
            errorMessage =
              "Não foi possível excluir o item. Verifique se não há dependências vinculadas.";
          }
        }

        setShowConfirm(false);
        setItemToDelete(null);
        toast.error(errorMessage);
        return;
      }

      console.log("✅ Excluído com sucesso");

      // Sincronizar dados após exclusão
      await sincronizarLocalizacoes();
      setShowConfirm(false);
      setItemToDelete(null);
      toast.success(
        `${itemToDelete.tipo === "cidade" ? "Cidade" : "Setor"} "${itemToDelete.nome}" excluído com sucesso`,
      );
    } catch (error) {
      console.error("❌ Erro inesperado no handleDelete:", error);
      setShowConfirm(false);
      setItemToDelete(null);
      toast.error(
        "Erro inesperado ao excluir item. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <MapPin className="h-4 w-4 mr-2" />
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
          <p className="text-sm text-gray-600 mt-2">
            Cadastre e gerencie cidades e setores
          </p>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="individual"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="massa" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Em Massa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-6 mt-6">
              {/* Cidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Cidades ({cidades.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Nome da cidade"
                      value={formCidade.nome}
                      onChange={(e) => setFormCidade({ nome: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isSaving) {
                          handleAdicionarCidade();
                        }
                      }}
                    />
                    <Button onClick={handleAdicionarCidade} disabled={isSaving}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {cidades.map((cidade) => (
                      <div
                        key={cidade.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {itemEditando?.id === cidade.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={nomeEditando}
                                onChange={(e) =>
                                  setNomeEditando(e.target.value)
                                }
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSalvarEdicao();
                                  } else if (e.key === "Escape") {
                                    handleCancelarEdicao();
                                  }
                                }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <>
                              <span className="font-medium">{cidade.nome}</span>
                              {(() => {
                                const numSetores = contarSetoresDaCidade(
                                  cidade.nome,
                                );
                                return (
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      numSetores > 0
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                    title={`${numSetores} setor(es) cadastrado(s)`}
                                  >
                                    {numSetores}
                                  </span>
                                );
                              })()}
                            </>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {itemEditando?.id === cidade.id ? (
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
                                onClick={() => handleIniciarEdicao(cidade)}
                                className="text-orange-600 hover:text-orange-700"
                                title="Editar nome da cidade"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConfirmDelete(cidade)}
                                className="text-red-600 hover:text-red-700"
                                title="Excluir cidade"
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

              {/* Setores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Setores ({setores.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-12 gap-2 mb-4">
                    <select
                      value={formSetor.cidadeId}
                      onChange={(e) =>
                        setFormSetor({
                          ...formSetor,
                          cidadeId: e.target.value,
                        })
                      }
                      className="col-span-4 p-2 border rounded text-sm"
                    >
                      <option value="">Selecione uma cidade</option>
                      {cidades.map((cidade) => (
                        <option key={cidade.id} value={cidade.id.toString()}>
                          {cidade.nome}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Nome do setor"
                      value={formSetor.nome}
                      onChange={(e) =>
                        setFormSetor({ ...formSetor, nome: e.target.value })
                      }
                      className="col-span-5 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isSaving) {
                          handleAdicionarSetor();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAdicionarSetor}
                      disabled={isSaving}
                      className="col-span-3 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {setores.map((setor) => (
                      <div
                        key={setor.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {itemEditando?.id === setor.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={nomeEditando}
                                onChange={(e) =>
                                  setNomeEditando(e.target.value)
                                }
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSalvarEdicao();
                                  } else if (e.key === "Escape") {
                                    handleCancelarEdicao();
                                  }
                                }}
                                autoFocus
                              />
                              <span className="text-sm text-gray-500">
                                ({setor.cidade})
                              </span>
                            </div>
                          ) : (
                            <>
                              <span className="font-medium">{setor.nome}</span>
                              <span className="ml-2 text-sm text-gray-500">
                                ({setor.cidade})
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {itemEditando?.id === setor.id ? (
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
                                onClick={() => handleIniciarEdicao(setor)}
                                className="text-orange-600 hover:text-orange-700"
                                title="Editar nome do setor"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConfirmDelete(setor)}
                                className="text-red-600 hover:text-red-700"
                                title="Excluir setor"
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
            </TabsContent>

            <TabsContent value="massa" className="space-y-6 mt-6">
              {/* Cidades em Massa */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Cadastro em Massa - Cidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cidadesTexto">
                        Digite as cidades (uma por linha)
                      </Label>
                      <Textarea
                        id="cidadesTexto"
                        placeholder={`Aparecida de Goiânia
Senador Canedo
Trindade
...`}
                        value={cidadesTexto}
                        onChange={(e) => setCidadesTexto(e.target.value)}
                        rows={6}
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Digite uma cidade por linha. Duplicatas serão ignoradas.
                      </p>
                    </div>
                    <Button
                      onClick={handleCadastrarCidadesMassa}
                      disabled={isSaving || !cidadesTexto.trim()}
                      className="w-full"
                    >
                      {isSaving ? "Cadastrando..." : "Cadastrar Cidades"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Setores em Massa */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Cadastro em Massa - Setores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cidadeSelecionadaMassa">
                        Selecione a cidade
                      </Label>
                      <select
                        id="cidadeSelecionadaMassa"
                        value={cidadeSelecionadaMassa}
                        onChange={(e) =>
                          setCidadeSelecionadaMassa(e.target.value)
                        }
                        className="w-full p-2 border rounded mt-2"
                      >
                        <option value="">Selecione uma cidade</option>
                        {cidades.map((cidade) => (
                          <option key={cidade.id} value={cidade.id.toString()}>
                            {cidade.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="setoresTexto">
                        Digite os setores (um por linha)
                      </Label>
                      <Textarea
                        id="setoresTexto"
                        placeholder={`Aeroporto
Bueno
Campinas
...`}
                        value={setoresTexto}
                        onChange={(e) => setSetoresTexto(e.target.value)}
                        rows={6}
                        className="mt-2"
                        disabled={!cidadeSelecionadaMassa}
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        {cidadeSelecionadaMassa
                          ? "Digite um setor por linha. Duplicatas serão ignoradas."
                          : "Selecione uma cidade primeiro."}
                      </p>
                    </div>
                    <Button
                      onClick={handleCadastrarSetoresMassa}
                      disabled={
                        isSaving ||
                        !setoresTexto.trim() ||
                        !cidadeSelecionadaMassa
                      }
                      className="w-full"
                    >
                      {isSaving ? "Cadastrando..." : "Cadastrar Setores"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal de confirmação */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
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
      </div>
    </div>
  );
}
