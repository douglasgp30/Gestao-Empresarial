import React, { useState, useCallback } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
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
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "../ui/use-toast";
import SelectWithAdd from "../ui/select-with-add";
import { TrendingDown } from "lucide-react";

export function ModalDespesa() {
  const { adicionarLancamento, isLoading: caixaLoading } = useCaixa();
  const {
    descricoes,
    formasPagamento,
    setores,
    cidades,
    adicionarDescricao,
    adicionarFormaPagamento,
    isLoading: entidadesLoading,
    // Unified data source
    getCategorias,
    getDescricoes,
    adicionarDescricaoECategoria,
  } = useEntidades();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    valor: "",
    categoria: "",
    descricao: "",
    formaPagamento: "",
    cidade: "",
    setor: "",
    observacoes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar descrições de despesa usando tabela unificada - usando useCallback para evitar re-renderizações
  const categoriasDespesa = useCallback(() => {
    const categorias = getCategorias("despesa");
    return categorias.map((cat) => cat.nome).sort();
  }, [getCategorias]);

  const descricoesDespesa = useCallback(() => {
    return getDescricoes("despesa");
  }, [getDescricoes]);

  // Filtrar descrições pela categoria selecionada
  const descricoesFiltradas = useCallback(() => {
    if (!formData.categoria) return [];
    return getDescricoes("despesa", formData.categoria);
  }, [formData.categoria, getDescricoes]);

  // Filtrar setores pela cidade selecionada
  const setoresFiltrados = React.useMemo(() => {
    if (!formData.cidade) return [];
    return (Array.isArray(setores) ? setores : []).filter(setor => setor.cidade === formData.cidade);
  }, [formData.cidade, setores]);

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split("T")[0],
      valor: "",
      categoria: "",
      descricao: "",
      formaPagamento: "",
      cidade: "",
      setor: "",
      observacoes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações robustas
    const erros = [];

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      erros.push("Valor deve ser maior que zero");
    }

    if (!formData.categoria) {
      erros.push("Categoria é obrigatória");
    }

    if (!formData.descricao) {
      erros.push("Descrição é obrigatória");
    }

    if (!formData.formaPagamento) {
      erros.push("Forma de pagamento é obrigatória");
    }

    if (erros.length > 0) {
      toast({
        title: "Erro de Validação",
        description: erros.join(". "),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await adicionarLancamento({
        data: new Date(formData.data),
        tipo: "despesa",
        valor: parseFloat(formData.valor),
        descricao: formData.descricao,
        formaPagamento: formData.formaPagamento,
        setor: formData.setor || undefined,
        observacoes: formData.observacoes || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Despesa lançada com sucesso!",
        variant: "default",
      });

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao lançar despesa:", error);
      toast({
        title: "Erro",
        description: "Erro ao lançar despesa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = caixaLoading || entidadesLoading;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Ao fechar o dialog, sempre resetar o formulário
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="default"
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          <TrendingDown className="h-4 w-4 mr-2" />
          Despesas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <TrendingDown className="h-5 w-5" />
            Lançar Despesa
          </DialogTitle>
          <DialogDescription>
            Registre uma nova saída do caixa
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-6">Carregando dados...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, data: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, valor: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      categoria: value,
                      descricao: "", // Limpar descrição quando categoria muda
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasDespesa().map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da Despesa *</Label>
                <SelectWithAdd
                  value={formData.descricao}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, descricao: value }))
                  }
                  placeholder={
                    formData.categoria
                      ? "Selecione a descrição"
                      : "Primeiro selecione uma categoria"
                  }
                  options={descricoesFiltradas().map((desc) => ({
                    value: desc.id.toString(),
                    label: desc.nome,
                  }))}
                  onAddNew={async (nomeDescricao) => {
                    await adicionarDescricao({
                      nome: nomeDescricao,
                      tipo: "despesa",
                      categoria: formData.categoria,
                    });
                  }}
                  addButtonText="Nova Descrição"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
              <SelectWithAdd
                value={formData.formaPagamento}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, formaPagamento: value }))
                }
                placeholder="Selecione a forma"
                options={formasPagamento.map((forma) => ({
                  value: forma.id.toString(),
                  label: forma.nome,
                }))}
                onAddNew={async (nomeForma) => {
                  await adicionarFormaPagamento({
                    nome: nomeForma,
                  });
                }}
                addButtonText="Nova Forma"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Select
                  value={formData.cidade}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      cidade: value,
                      setor: "" // Limpar setor quando cidade muda
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(cidades) ? cidades : []).map((cidade, index) => (
                      <SelectItem key={`cidade-${index}-${cidade}`} value={cidade}>
                        {cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setor">Setor</Label>
                <Select
                  value={formData.setor}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, setor: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      formData.cidade
                        ? "Selecione o setor"
                        : "Primeiro selecione uma cidade"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {setoresFiltrados.map((setor) => (
                      <SelectItem key={setor.id} value={setor.id.toString()}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais..."
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
              />
            </div>

            {/* Resumo financeiro */}
            {formData.valor && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">
                  Resumo da Despesa
                </h4>
                <div className="text-sm">
                  <span className="text-gray-600">Valor a ser debitado:</span>
                  <div className="font-medium text-red-600 text-lg">
                    R$ {parseFloat(formData.valor || "0").toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsOpen(false);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Lançando..." : "Lançar Despesa"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
