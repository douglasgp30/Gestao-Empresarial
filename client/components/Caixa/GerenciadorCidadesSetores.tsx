import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  Plus, 
  Trash2, 
  MapPin, 
  Building, 
  AlertTriangle,
  Loader2 
} from "lucide-react";
import { toast } from "sonner";

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

export function GerenciadorCidadesSetores() {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para cadastro em massa
  const [cidadesTexto, setCidadesTexto] = useState("");
  const [setoresTexto, setSetoresTexto] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  
  // Estados para exclusão
  const [itemParaExcluir, setItemParaExcluir] = useState<{
    id: number;
    nome: string;
    tipo: "cidade" | "setor";
  } | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Estados para debug
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Carregar dados
  const carregarDados = async () => {
    setLoading(true);
    try {
      const [cidadesResponse, setoresResponse] = await Promise.all([
        fetch("/api/localizacoes-geograficas?tipoItem=cidade"),
        fetch("/api/localizacoes-geograficas?tipoItem=setor")
      ]);

      if (cidadesResponse.ok && setoresResponse.ok) {
        const cidadesData = await cidadesResponse.json();
        const setoresData = await setoresResponse.json();
        
        setCidades(cidadesData.data || []);
        setSetores(setoresData.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar cidades e setores");
    } finally {
      setLoading(false);
    }
  };

  // Verificar dados fictícios
  const verificarDadosFicticios = async () => {
    try {
      const response = await fetch("/api/debug/localizacoes");
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data);
      }
    } catch (error) {
      console.error("Erro ao verificar dados:", error);
    }
  };

  // Limpar todos os dados
  const limparTodosDados = async () => {
    if (!window.confirm("⚠️ ATENÇÃO: Isso vai apagar TODAS as cidades e setores! Tem certeza?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/debug/localizacoes", {
        method: "DELETE"
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Todos os dados foram limpos com sucesso!");
        console.log("Resultado da limpeza:", result);
        await carregarDados();
      } else {
        throw new Error("Erro na limpeza");
      }
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      toast.error("Erro ao limpar dados");
    } finally {
      setLoading(false);
    }
  };

  // Cadastrar cidades em massa
  const cadastrarCidades = async () => {
    if (!cidadesTexto.trim()) {
      toast.error("Digite pelo menos uma cidade");
      return;
    }

    const cidadesLista = cidadesTexto
      .split("\n")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (cidadesLista.length === 0) {
      toast.error("Nenhuma cidade válida encontrada");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/localizacoes/cadastro-massa/cidades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cidades: cidadesLista
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        
        if (result.resultados.erros.length > 0) {
          console.warn("Erros no cadastro:", result.resultados.erros);
        }

        setCidadesTexto("");
        await carregarDados();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Erro no cadastro");
      }
    } catch (error) {
      console.error("Erro ao cadastrar cidades:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar cidades");
    } finally {
      setLoading(false);
    }
  };

  // Cadastrar setores em massa
  const cadastrarSetores = async () => {
    if (!setoresTexto.trim() || !cidadeSelecionada) {
      toast.error("Selecione uma cidade e digite pelo menos um setor");
      return;
    }

    const setoresLista = setoresTexto
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (setoresLista.length === 0) {
      toast.error("Nenhum setor válido encontrado");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/localizacoes/cadastro-massa/setores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cidadeId: parseInt(cidadeSelecionada),
          setores: setoresLista
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        
        if (result.resultados.erros.length > 0) {
          console.warn("Erros no cadastro:", result.resultados.erros);
        }

        setSetoresTexto("");
        setCidadeSelecionada("");
        await carregarDados();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Erro no cadastro");
      }
    } catch (error) {
      console.error("Erro ao cadastrar setores:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar setores");
    } finally {
      setLoading(false);
    }
  };

  // Excluir item com proteção
  const excluirItem = async () => {
    if (!itemParaExcluir) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/localizacoes/${itemParaExcluir.id}/com-protecao`, {
        method: "DELETE"
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        await carregarDados();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao excluir");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir item");
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
      setItemParaExcluir(null);
    }
  };

  useEffect(() => {
    carregarDados();
    verificarDadosFicticios();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header com debug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Gerenciar Cidades e Setores
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
              >
                {showDebug ? "Ocultar" : "Debug"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={carregarDados}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {showDebug && debugInfo && (
          <CardContent className="border-t">
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">⚠️ Debug - Dados Existentes</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Cidades:</strong> {cidades.length}
                </div>
                <div>
                  <strong>Setores:</strong> {setores.length}
                </div>
                <div>
                  <strong>Lançamentos com localização:</strong> {debugInfo.lancamentosComLocalizacao}
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={limparTodosDados}
                disabled={loading}
              >
                🗑️ Limpar TODOS os Dados
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="cadastro" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cadastro">Cadastro em Massa</TabsTrigger>
          <TabsTrigger value="cidades">Cidades ({cidades.length})</TabsTrigger>
          <TabsTrigger value="setores">Setores ({setores.length})</TabsTrigger>
        </TabsList>

        {/* Tab Cadastro em Massa */}
        <TabsContent value="cadastro" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cadastro de Cidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Cadastrar Cidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cidades">Digite as cidades (uma por linha):</Label>
                  <Textarea
                    id="cidades"
                    placeholder="São Paulo&#10;Rio de Janeiro&#10;Belo Horizonte"
                    value={cidadesTexto}
                    onChange={(e) => setCidadesTexto(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={cadastrarCidades}
                  disabled={loading || !cidadesTexto.trim()}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Cidades
                </Button>
              </CardContent>
            </Card>

            {/* Cadastro de Setores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Cadastrar Setores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cidade-setor">Selecione a cidade:</Label>
                  <Select value={cidadeSelecionada} onValueChange={setCidadeSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cidades.filter(c => c.ativo).map((cidade) => (
                        <SelectItem key={cidade.id} value={cidade.id.toString()}>
                          {cidade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="setores">Digite os setores (um por linha):</Label>
                  <Textarea
                    id="setores"
                    placeholder="Centro&#10;Vila Nova&#10;Jardim América"
                    value={setoresTexto}
                    onChange={(e) => setSetoresTexto(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={cadastrarSetores}
                  disabled={loading || !setoresTexto.trim() || !cidadeSelecionada}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Setores
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Cidades */}
        <TabsContent value="cidades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Cidades</CardTitle>
            </CardHeader>
            <CardContent>
              {cidades.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma cidade cadastrada
                </p>
              ) : (
                <div className="space-y-2">
                  {cidades.map((cidade) => (
                    <div key={cidade.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Building className="w-4 h-4" />
                        <div>
                          <span className="font-medium">{cidade.nome}</span>
                          <div className="text-xs text-muted-foreground">
                            ID: {cidade.id} • {cidade.ativo ? "Ativa" : "Inativa"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={cidade.ativo ? "default" : "secondary"}>
                          {cidade.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setItemParaExcluir({
                              id: cidade.id,
                              nome: cidade.nome,
                              tipo: "cidade"
                            });
                            setShowConfirmDelete(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Setores */}
        <TabsContent value="setores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Setores</CardTitle>
            </CardHeader>
            <CardContent>
              {setores.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum setor cadastrado
                </p>
              ) : (
                <div className="space-y-2">
                  {setores.map((setor) => (
                    <div key={setor.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4" />
                        <div>
                          <span className="font-medium">{setor.nome}</span>
                          <div className="text-xs text-muted-foreground">
                            ID: {setor.id} • {setor.cidade} • {setor.ativo ? "Ativo" : "Inativo"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{setor.cidade}</Badge>
                        <Badge variant={setor.ativo ? "default" : "secondary"}>
                          {setor.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setItemParaExcluir({
                              id: setor.id,
                              nome: setor.nome,
                              tipo: "setor"
                            });
                            setShowConfirmDelete(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {itemParaExcluir?.tipo === "cidade" ? "a cidade" : "o setor"} "{itemParaExcluir?.nome}"?
              <br />
              <strong className="text-red-600">Esta ação não pode ser desfeita.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemParaExcluir(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={excluirItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
