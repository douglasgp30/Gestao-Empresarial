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
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "../ui/use-toast";
import SelectWithAdd from "../ui/select-with-add";
import { TrendingUp } from "lucide-react";

export function ModalReceita() {
  const {
    adicionarLancamento,
    campanhas,
    adicionarCampanha,
    isLoading: caixaLoading,
  } = useCaixa();
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

  // Carregar técnicos usando a função que verifica localStorage
  const tecnicos = getTecnicos();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    valor: "",
    valorQueEntrou: "",
    categoria: "",
    descricao: "",
    formaPagamento: "",
    tecnicoResponsavel: "",
    setor: "",
    campanha: "",
    observacoes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar descrições de receita
  const descricoesReceita = descricoes.filter((d) => d.tipo === "receita");

  // Filtrar descrições pela categoria selecionada
  const descricoesFiltradas = formData.categoria
    ? descricoesReceita.filter((d) => d.categoria === formData.categoria)
    : [];

  // Obter categorias únicas das descrições de receita
  const categoriasReceita = [
    ...new Set(
      descricoesReceita
        .map((d) => d.categoria)
        .filter((categoria) => categoria && categoria.trim() !== ""),
    ),
  ].sort();

  // Verificar se forma de pagamento é cartão
  const isFormaPagamentoCartao =
    formData.formaPagamento &&
    formasPagamento
      .find((f) => f.id.toString() === formData.formaPagamento)
      ?.nome?.toLowerCase()
      .includes("cartão");

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split("T")[0],
      valor: "",
      valorQueEntrou: "",
      categoria: "",
      descricao: "",
      formaPagamento: "",
      tecnicoResponsavel: "",
      setor: "",
      campanha: "",
      observacoes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.valor ||
      !formData.categoria ||
      !formData.descricao ||
      !formData.formaPagamento
    ) {
      toast({
        title: "Erro",
        description:
          "Preencha todos os campos obrigatórios: Valor, Categoria, Descrição e Forma de Pagamento",
        variant: "destructive",
      });
      return;
    }

    // Validar valor recebido para pagamentos com cartão
    if (isFormaPagamentoCartao && !formData.valorQueEntrou) {
      toast({
        title: "Erro",
        description:
          "Para pagamentos com cartão, é obrigatório informar o valor recebido",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await adicionarLancamento({
        data: new Date(formData.data),
        tipo: "receita",
        valor: parseFloat(formData.valor),
        valorQueEntrou:
          parseFloat(formData.valorQueEntrou) || parseFloat(formData.valor),
        descricao: formData.descricao,
        formaPagamento: formData.formaPagamento,
        tecnicoResponsavel: formData.tecnicoResponsavel || undefined,
        setor: formData.setor || undefined,
        campanha: formData.campanha || undefined,
        observacoes: formData.observacoes || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Receita lançada com sucesso!",
        variant: "default",
      });

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao lançar receita:", error);
      toast({
        title: "Erro",
        description: "Erro ao lançar receita. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = caixaLoading || entidadesLoading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <TrendingUp className="h-4 w-4 mr-2" />
          Lançar Receita
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600 text-lg sm:text-xl">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Lançar Receita
          </DialogTitle>
          <DialogDescription className="text-sm">
            Registre uma nova entrada no caixa
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-6">Carregando dados...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Campos básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    {categoriasReceita.map((categoria) => (
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
                label="Descrição do Serviço"
                required={true}
                disabled={!formData.categoria}
                items={descricoesFiltradas}
                onAddNew={async (data) => {
                  await adicionarDescricao({
                    nome: data.nome,
                    tipo: "receita",
                    categoria: formData.categoria,
                  });
                }}
                addNewTitle="Nova Descrição de Receita"
                addNewDescription="Adicione uma nova descrição de serviço para receitas."
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

            {/* Campo Valor Recebido para Cartão - compacto, logo após forma de pagamento */}
            {isFormaPagamentoCartao && (
              <div className="space-y-2 col-span-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="valorQueEntrou" className="text-sm font-medium text-yellow-700">
                      Valor Recebido (R$) *
                    </Label>
                    <Input
                      id="valorQueEntrou"
                      type="number"
                      step="0.01"
                      placeholder="Valor líquido"
                      value={formData.valorQueEntrou}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          valorQueEntrou: e.target.value,
                        }))
                      }
                      className="bg-yellow-50 border-yellow-300 text-sm h-9"
                      required
                    />
                  </div>
                  <div className="text-xs text-yellow-600 md:col-span-2">
                    <strong>Importante:</strong> Para cartão, informe o valor líquido que entrou na conta (após descontar taxas da operadora).
                  </div>
                </div>
              </div>
            )}

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
                    {tecnicos.length === 0 ? (
                      <div className="px-2 py-1 text-sm text-gray-500">
                        Nenhum técnico cadastrado
                      </div>
                    ) : (
                      tecnicos
                        .filter(
                          (tecnico) =>
                            tecnico.id != null &&
                            tecnico.id !== "" &&
                            tecnico.id !== 0,
                        )
                        .map((tecnico) => (
                          <SelectItem
                            key={tecnico.id}
                            value={tecnico.id.toString()}
                          >
                            {tecnico.nome || tecnico.nomeCompleto}
                          </SelectItem>
                        ))
                    )}
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

            {/* Observações - Campo básico */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações do Serviço</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre o serviço prestado..."
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <SelectWithAdd
              value={formData.campanha}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, campanha: value }))
              }
              placeholder="Selecione a campanha"
              label="Campanha"
              required={false}
              items={campanhas}
              onAddNew={async (data) => {
                await adicionarCampanha({
                  nome: data.nome,
                });
              }}
              addNewTitle="Nova Campanha"
              addNewDescription="Adicione uma nova campanha de marketing."
              addNewFields={[
                {
                  key: "nome",
                  label: "Nome da Campanha",
                  required: true,
                },
              ]}
            />

            {/* Resumo financeiro */}
            {formData.valor && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Resumo Financeiro
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Valor Total:</span>
                    <div className="font-medium">
                      R$ {parseFloat(formData.valor || "0").toFixed(2)}
                    </div>
                  </div>
                  {formData.valorQueEntrou && (
                    <div>
                      <span className="text-gray-600">Valor Recebido:</span>
                      <div className="font-medium">
                        R$ {parseFloat(formData.valorQueEntrou || "0").toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Lançando..." : "Lançar Receita"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
