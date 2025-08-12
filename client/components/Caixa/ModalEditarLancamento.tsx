import React, { useState, useEffect } from "react";
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
} from "../ui/dialog";
import { toast } from "../ui/use-toast";
import SelectWithAdd from "../ui/select-with-add";
import { LancamentoCaixa } from "@shared/types";

interface ModalEditarLancamentoProps {
  lancamento: LancamentoCaixa;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalEditarLancamento({
  lancamento,
  isOpen,
  onClose,
}: ModalEditarLancamentoProps) {
  const { editarLancamento, isLoading: caixaLoading } = useCaixa();
  const {
    descricoes,
    formasPagamento,
    getTecnicos,
    setores,
    adicionarDescricao,
    adicionarFormaPagamento,
    adicionarSetor,
    isLoading: entidadesLoading,
  } = useEntidades();

  const tecnicos = getTecnicos();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    valor: "",
    valorQueEntrou: "",
    valorLiquido: "",
    comissao: "",
    imposto: "",
    categoria: "",
    descricao: "",
    formaPagamento: "",
    tecnicoResponsavel: "",
    setor: "",
    observacoes: "",
    conta: "empresa",
  });

  // Carregar dados do lançamento quando modal abrir
  useEffect(() => {
    if (isOpen && lancamento) {
      setFormData({
        valor: lancamento.valor?.toString() || "",
        valorQueEntrou: lancamento.valorRecebido?.toString() || "",
        valorLiquido: lancamento.valorLiquido?.toString() || "",
        comissao: lancamento.comissao?.toString() || "",
        imposto: lancamento.imposto?.toString() || "",
        categoria: lancamento.descricao?.categoria || "",
        descricao: lancamento.descricao?.id?.toString() || "",
        formaPagamento: lancamento.formaPagamento?.id?.toString() || "",
        tecnicoResponsavel: lancamento.funcionario?.id?.toString() || "",
        setor: lancamento.setor?.id?.toString() || "",
        observacoes: lancamento.observacoes || "",
        conta: lancamento.conta || "empresa",
      });
    }
  }, [isOpen, lancamento]);

  // Filtrar descrições por tipo e categoria
  const descricoesDoTipo = descricoes.filter((d) => d.tipo === lancamento.tipo);
  const descricoesFiltradas = formData.categoria
    ? descricoesDoTipo.filter((d) => d.categoria === formData.categoria)
    : [];

  // Obter categorias únicas
  const categorias = [
    ...new Set(
      descricoesDoTipo
        .map((d) => d.categoria)
        .filter((categoria) => categoria && categoria.trim() !== ""),
    ),
  ].sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.valor || !formData.descricao || !formData.formaPagamento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await editarLancamento(lancamento.id.toString(), {
        valor: parseFloat(formData.valor),
        valorQueEntrou: formData.valorQueEntrou
          ? parseFloat(formData.valorQueEntrou)
          : undefined,
        valorLiquido: formData.valorLiquido
          ? parseFloat(formData.valorLiquido)
          : undefined,
        comissao: formData.comissao ? parseFloat(formData.comissao) : undefined,
        imposto: formData.imposto ? parseFloat(formData.imposto) : undefined,
        descricao: formData.descricao,
        formaPagamento: formData.formaPagamento,
        tecnicoResponsavel: formData.tecnicoResponsavel === "none" ? undefined : formData.tecnicoResponsavel,
        setor: formData.setor === "none" ? undefined : formData.setor,
        observacoes: formData.observacoes || undefined,
        conta: formData.conta,
      });

      toast({
        title: "Sucesso",
        description: "Lançamento editado com sucesso!",
        variant: "default",
      });

      onClose();
    } catch (error) {
      console.error("Erro ao editar lançamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao editar lançamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = caixaLoading || entidadesLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar {lancamento.tipo === "receita" ? "Receita" : "Despesa"}
          </DialogTitle>
          <DialogDescription>
            Modifique os dados do lançamento conforme necessário.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6 text-center">Carregando dados...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, valor: e.target.value }))
                  }
                  required
                />
              </div>

              {lancamento.tipo === "despesa" && (
                <div className="space-y-2">
                  <Label htmlFor="conta">Conta *</Label>
                  <Select
                    value={formData.conta}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, conta: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empresa">Empresa</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                      descricao: "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                label="Descrição"
                required={true}
                disabled={!formData.categoria}
                items={descricoesFiltradas}
                onAddNew={async (data) => {
                  await adicionarDescricao({
                    nome: data.nome,
                    categoria: formData.categoria,
                    tipo: lancamento.tipo,
                  });
                }}
                addNewTitle="Nova Descrição"
                addNewDescription="Adicione uma nova descrição."
                addNewFields={[
                  {
                    key: "nome",
                    label: "Nome da Descrição",
                    required: true,
                  },
                ]}
              />
            </div>

            <SelectWithAdd
              value={formData.formaPagamento}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, formaPagamento: value }))
              }
              placeholder="Selecione a forma"
              label="Forma de Pagamento"
              required={true}
              items={formasPagamento}
              onAddNew={async (data) => {
                // Implementar se necessário
              }}
              addNewTitle="Nova Forma de Pagamento"
              addNewDescription="Adicione uma nova forma de pagamento."
              addNewFields={[
                {
                  key: "nome",
                  label: "Nome da Forma de Pagamento",
                  required: true,
                },
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tecnicoResponsavel">Técnico Responsável</Label>
                <Select
                  value={formData.tecnicoResponsavel}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      tecnicoResponsavel: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {tecnicos.map((tecnico) => (
                      <SelectItem
                        key={tecnico.id}
                        value={tecnico.id.toString()}
                      >
                        {tecnico.nome || tecnico.nomeCompleto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <SelectWithAdd
                value={formData.setor}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, setor: value }))
                }
                placeholder="Selecione o setor"
                label="Setor/Região"
                required={false}
                items={setores}
                onAddNew={async (data) => {
                  await adicionarSetor({
                    nome: data.nome,
                    cidade: data.cidade,
                  });
                }}
                addNewTitle="Novo Setor/Região"
                addNewDescription="Adicione um novo setor ou região."
                addNewFields={[
                  {
                    key: "nome",
                    label: "Nome do Setor",
                    required: true,
                  },
                  {
                    key: "cidade",
                    label: "Cidade",
                    required: true,
                  },
                ]}
                renderItem={(setor) => `${setor.nome} - ${setor.cidade}`}
              />
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

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
