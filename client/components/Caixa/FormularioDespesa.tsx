import React, { useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/use-toast";
import SelectWithAdd from "../ui/select-with-add";
import { TrendingDown } from "lucide-react";

interface FormularioDespesaProps {
  onSuccess?: () => void;
}

export function FormularioDespesa({ onSuccess }: FormularioDespesaProps) {
  const { adicionarLancamento, isLoading: caixaLoading } = useCaixa();
  const {
    descricoes,
    formasPagamento,
    setores,
    adicionarDescricao,
    adicionarFormaPagamento,
    adicionarSetor,
    isLoading: entidadesLoading,
  } = useEntidades();

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    valor: "",
    categoria: "",
    descricao: "",
    formaPagamento: "",
    setor: "",
    observacoes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar descrições de despesa
  const descricoesDespesa = descricoes.filter((d) => d.tipo === "despesa");

  // Filtrar descrições pela categoria selecionada
  const descricoesFiltradas = formData.categoria
    ? descricoesDespesa.filter((d) => d.categoria === formData.categoria)
    : [];

  // Obter categorias únicas das descrições de despesa
  const categoriasDespesa = [...new Set(
    descricoesDespesa
      .map((d) => d.categoria)
      .filter((categoria) => categoria && categoria.trim() !== "")
  )].sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.valor || !formData.categoria || !formData.descricao || !formData.formaPagamento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios: Valor, Categoria, Descrição e Forma de Pagamento",
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

      // Resetar formulário
      setFormData({
        data: new Date().toISOString().split("T")[0],
        valor: "",
        categoria: "",
        descricao: "",
        formaPagamento: "",
        setor: "",
        observacoes: "",
      });

      onSuccess?.();
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando dados...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <TrendingDown className="h-5 w-5" />
          Lançar Despesa
        </CardTitle>
        <CardDescription>Registre uma nova saída do caixa</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <SelectWithAdd
              value={formData.descricao}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, descricao: value }))
              }
              placeholder="Selecione a descrição"
              label="Descrição da Despesa"
              required={true}
              items={descricoesDespesa}
              onAddNew={async (data) => {
                await adicionarDescricao({
                  nome: data.nome,
                  tipo: "despesa",
                });
              }}
              addNewTitle="Nova Descrição de Despesa"
              addNewDescription="Adicione uma nova descrição para despesas."
              addNewFields={[
                {
                  key: "nome",
                  label: "Nome da Descrição",
                  required: true,
                },
              ]}
            />

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
                await adicionarFormaPagamento({
                  nome: data.nome,
                  descricao: data.descricao || "",
                });
              }}
              addNewTitle="Nova Forma de Pagamento"
              addNewDescription="Adicione uma nova forma de pagamento."
              addNewFields={[
                {
                  key: "nome",
                  label: "Nome da Forma de Pagamento",
                  required: true,
                },
                {
                  key: "descricao",
                  label: "Descrição (opcional)",
                  required: false,
                },
              ]}
            />
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

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Lançando..." : "Lançar Despesa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
