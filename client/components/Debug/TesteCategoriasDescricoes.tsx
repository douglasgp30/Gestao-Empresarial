import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { useEntidades } from "../../contexts/EntidadesContext";
import { toast } from "sonner";

export function TesteCategoriasDescricoes() {
  const { 
    descricoesECategorias, 
    recarregarDescricoesECategorias,
    getCategorias,
    getDescricoes
  } = useEntidades();

  const [novaCategoria, setNovaCategoria] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [categoriaParaDescricao, setCategoriaParaDescricao] = useState("");
  const [testando, setTestando] = useState(false);

  const categorias = getCategorias("receita");
  const descricoes = getDescricoes("receita");

  const testarCadastroCategoria = async () => {
    if (!novaCategoria.trim()) {
      toast.error("Digite o nome da categoria");
      return;
    }

    setTestando(true);
    try {
      console.log("🧪 Testando cadastro de categoria:", novaCategoria);
      
      const response = await fetch("/api/descricoes-e-categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: novaCategoria.trim(),
          tipo: "receita",
          tipoItem: "categoria",
          ativo: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar categoria");
      }

      const result = await response.json();
      console.log("✅ Categoria criada:", result);

      toast.success("Categoria criada com sucesso!");
      setNovaCategoria("");
      
      // Recarregar dados
      await recarregarDescricoesECategorias();
    } catch (error) {
      console.error("❌ Erro ao criar categoria:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar categoria");
    } finally {
      setTestando(false);
    }
  };

  const testarCadastroDescricao = async () => {
    if (!novaDescricao.trim() || !categoriaParaDescricao.trim()) {
      toast.error("Digite o nome da descrição e selecione uma categoria");
      return;
    }

    setTestando(true);
    try {
      console.log("🧪 Testando cadastro de descrição:", {
        nome: novaDescricao,
        categoria: categoriaParaDescricao
      });
      
      const response = await fetch("/api/descricoes-e-categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: novaDescricao.trim(),
          tipo: "receita",
          tipoItem: "descricao",
          categoria: categoriaParaDescricao,
          ativo: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar descrição");
      }

      const result = await response.json();
      console.log("✅ Descrição criada:", result);

      toast.success("Descrição criada com sucesso!");
      setNovaDescricao("");
      setCategoriaParaDescricao("");
      
      // Recarregar dados
      await recarregarDescricoesECategorias();
    } catch (error) {
      console.error("❌ Erro ao criar descrição:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar descrição");
    } finally {
      setTestando(false);
    }
  };

  const testarRecarregamento = async () => {
    setTestando(true);
    try {
      console.log("🔄 Testando recarregamento...");
      await recarregarDescricoesECategorias();
      toast.success("Dados recarregados com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao recarregar:", error);
      toast.error("Erro ao recarregar dados");
    } finally {
      setTestando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 Teste - Categorias e Descrições</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status dos dados */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">📊 Status dos Dados</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Total:</strong> {descricoesECategorias.length} itens
            </div>
            <div>
              <strong>Categorias:</strong> {categorias.length} receita
            </div>
            <div>
              <strong>Descrições:</strong> {descricoes.length} receita
            </div>
          </div>
          <Button 
            onClick={testarRecarregamento}
            variant="outline" 
            size="sm" 
            className="mt-2"
            disabled={testando}
          >
            🔄 Recarregar Dados
          </Button>
        </div>

        {/* Teste de cadastro de categoria */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">➕ Testar Cadastro de Categoria</h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="categoria">Nome da Categoria:</Label>
              <Input
                id="categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Ex: Categoria Teste"
              />
            </div>
            <Button 
              onClick={testarCadastroCategoria}
              disabled={testando || !novaCategoria.trim()}
              className="mt-6"
            >
              Criar Categoria
            </Button>
          </div>
        </div>

        {/* Teste de cadastro de descrição */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">➕ Testar Cadastro de Descrição</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="descricao">Nome da Descrição:</Label>
              <Input
                id="descricao"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Ex: Descrição Teste"
              />
            </div>
            <div>
              <Label htmlFor="catDesc">Categoria:</Label>
              <select
                id="catDesc"
                value={categoriaParaDescricao}
                onChange={(e) => setCategoriaParaDescricao(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nome}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
            <Button 
              onClick={testarCadastroDescricao}
              disabled={testando || !novaDescricao.trim() || !categoriaParaDescricao}
              className="mt-2"
            >
              Criar Descrição
            </Button>
          </div>
        </div>

        {/* Lista das categorias existentes */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">📋 Categorias Existentes ({categorias.length})</h3>
          <div className="flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <Badge key={categoria.id} variant="outline">
                {categoria.nome}
              </Badge>
            ))}
            {categorias.length === 0 && (
              <span className="text-muted-foreground">Nenhuma categoria encontrada</span>
            )}
          </div>
        </div>

        {/* Lista das descrições existentes */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">📋 Descrições Existentes ({descricoes.length})</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {descricoes.map((descricao) => (
              <div key={descricao.id} className="flex justify-between items-center text-sm">
                <span>{descricao.nome}</span>
                <Badge variant="secondary" className="text-xs">
                  {descricao.categoria}
                </Badge>
              </div>
            ))}
            {descricoes.length === 0 && (
              <span className="text-muted-foreground">Nenhuma descrição encontrada</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
