import React, { useState, useRef, useEffect } from "react";
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
import { useEnterAsTab } from "../../hooks/use-enter-as-tab";
import { useCurrencyInput } from "../../hooks/use-currency-input";

interface FormularioDespesaProps {
  onSuccess?: () => void;
}

export function FormularioDespesa({ onSuccess }: FormularioDespesaProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const { adicionarLancamento, isLoading: caixaLoading } = useCaixa();
  const {
    formasPagamento,
    adicionarFormaPagamento,
    isLoading: entidadesLoading,
  } = useEntidades();

  // Hook para Enter funcionar como Tab
  useEnterAsTab(formRef);

  // Hook para input de moeda
  const valorInput = useCurrencyInput();

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    categoria: "",
    descricao: "",
    formaPagamento: "",
    observacoes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<
    { nome: string; tipo: string }[]
  >([]);
  const [descricoes, setDescricoes] = useState<
    { nome: string; categoria: string }[]
  >([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);
  const [carregandoDescricoes, setCarregandoDescricoes] = useState(false);

  // Carregar categorias de despesa
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        console.log(
          "🟡 [FormularioDespesa] Iniciando carregamento de categorias...",
        );
        setCarregandoCategorias(true);
        const response = await fetch(
          "/api/descricoes-e-categorias/categorias?tipo=despesa",
        );

        console.log(
          "🟡 [FormularioDespesa] Response categorias:",
          response.status,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log(
          "🟡 [FormularioDespesa] Dados categorias recebidos:",
          result,
        );

        if (result.data) {
          setCategorias(result.data);
          console.log(
            "✅ [FormularioDespesa] Categorias carregadas:",
            result.data.length,
          );
        }
      } catch (error) {
        console.error(
          "❌ [FormularioDespesa] Erro ao carregar categorias:",
          error,
        );
        toast({
          title: "Erro",
          description: "Erro ao carregar categorias",
          variant: "destructive",
        });
      } finally {
        setCarregandoCategorias(false);
      }
    };

    carregarCategorias();
  }, []);

  // Carregar descrições quando categoria mudar
  useEffect(() => {
    if (!formData.categoria) {
      setDescricoes([]);
      return;
    }

    const carregarDescricoes = async () => {
      try {
        setCarregandoDescricoes(true);
        const response = await fetch(
          `/api/descricoes-e-categorias/descricoes?tipo=despesa&categoria=${encodeURIComponent(formData.categoria)}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        if (result.data) {
          setDescricoes(result.data);
        }
      } catch (error) {
        console.error("Erro ao carregar descrições:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar descrições",
          variant: "destructive",
        });
      } finally {
        setCarregandoDescricoes(false);
      }
    };

    carregarDescricoes();
  }, [formData.categoria]);

  // Filtrar descrições pela categoria selecionada
  const descricoesFiltradas = descricoes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação completa dos campos obrigatórios
    const camposObrigatorios = {
      data: formData.data,
      valor: valorInput.numericValue,
      categoria: formData.categoria,
      descricao: formData.descricao,
      formaPagamento: formData.formaPagamento,
    };

    const camposFaltando = Object.entries(camposObrigatorios)
      .filter(([key, value]) => !value || value.toString().trim() === "")
      .map(([key]) => {
        const nomes = {
          data: "Data",
          valor: "Valor",
          categoria: "Categoria",
          descricao: "Descrição",
          formaPagamento: "Forma de Pagamento",
        };
        return nomes[key as keyof typeof nomes];
      });

    if (camposFaltando.length > 0) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: `Preencha os seguintes campos: ${camposFaltando.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await adicionarLancamento({
        data: new Date(formData.data),
        tipo: "despesa",
        valor: valorInput.numericValue,
        descricao: formData.descricao,
        formaPagamento: formData.formaPagamento,
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
        categoria: "",
        descricao: "",
        formaPagamento: "",
        observacoes: "",
      });

      // Resetar campo de moeda
      valorInput.reset();

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
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
              <Input id="valor" {...valorInput.inputProps} required />
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
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.nome} value={categoria.nome}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <SelectWithAdd
              value={formData.descricao}
              onValueChange={(value) => {
                const descricaoSelecionada = descricoesFiltradas.find(
                  (d) => d.id?.toString() === value,
                );
                setFormData((prev) => ({
                  ...prev,
                  descricao: descricaoSelecionada?.nome || value,
                }));
              }}
              placeholder={
                formData.categoria
                  ? "Selecione a descrição"
                  : "Primeiro selecione uma categoria"
              }
              label="Descrição da Despesa"
              required={true}
              disabled={!formData.categoria}
              items={descricoesFiltradas}
              onAddNew={async (data) => {
                try {
                  // Validate required fields before sending
                  if (!data.nome || !data.nome.trim()) {
                    throw new Error("Nome da descrição é obrigatório");
                  }
                  if (!formData.categoria || !formData.categoria.trim()) {
                    throw new Error("Categoria deve ser selecionada primeiro");
                  }

                  const response = await fetch("/api/descricoes-e-categorias", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      nome: data.nome.trim(),
                      tipo: "despesa",
                      tipoItem: "descricao",
                      categoria: formData.categoria.trim(),
                      ativo: true,
                    }),
                  });

                  if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                  }

                  const created = await response.json(); // Capturar o item criado

                  // Recarregar descrições
                  const descricoesResponse = await fetch(
                    `/api/descricoes-e-categorias/descricoes?tipo=despesa&categoria=${encodeURIComponent(formData.categoria)}`,
                  );
                  const descricoesResult = await descricoesResponse.json();
                  if (descricoesResult.data) {
                    setDescricoes(descricoesResult.data);
                  }

                  // Selecionar automaticamente o item recém-criado
                  setFormData((prev) => ({
                    ...prev,
                    descricao: created.nome || data.nome.trim(),
                  }));

                  toast({
                    title: "Sucesso!",
                    description: "Descrição adicionada com sucesso",
                  });
                } catch (error) {
                  console.error("Erro ao adicionar descrição:", error);
                  toast({
                    title: "Erro",
                    description: "Erro ao adicionar descrição",
                    variant: "destructive",
                  });
                }
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
              await adicionarFormaPagamento({
                nome: data.nome,
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
            ]}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Valor a ser debitado:</span>
                  <div className="font-medium text-red-600 text-lg">
                    R$ {parseFloat(formData.valor || "0").toFixed(2)}
                  </div>
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
