import React, { useState, useEffect, useRef } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { useClientes } from "../../contexts/ClientesContext";
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
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/use-toast";
import SelectWithAdd from "../ui/select-with-add";
import { TrendingUp, TrendingDown, UserPlus } from "lucide-react";
import { useEnterAsTab } from "../../hooks/use-enter-as-tab";
import { useCurrencyInput } from "../../hooks/use-currency-input";
import ModalCadastroCliente from "../Clientes/ModalCadastroCliente";
import { LancamentoCaixa } from "@shared/types";

interface ModalEditarLancamentoCompletoProps {
  lancamento: LancamentoCaixa;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalEditarLancamentoCompleto({
  lancamento,
  isOpen,
  onClose,
}: ModalEditarLancamentoCompletoProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const {
    editarLancamento,
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
  const {
    clientes,
    adicionarCliente,
    isLoading: clientesLoading,
  } = useClientes();

  // Hook para Enter funcionar como Tab
  useEnterAsTab(formRef);

  // Hook para input de moeda
  const valorInput = useCurrencyInput();
  const valorQueEntrouInput = useCurrencyInput();
  const impostoInput = useCurrencyInput();

  // Carregar técnicos usando a função que verifica localStorage
  const tecnicos = getTecnicos();

  const [formData, setFormData] = useState({
    data: "",
    categoria: "",
    descricao: "",
    formaPagamento: "",
    tecnicoResponsavel: "",
    setor: "",
    campanha: "",
    cliente: "",
    observacoes: "",
    numeroNota: "",
    temNotaFiscal: false,
    conta: "empresa",
  });

  const [mostrarCamposAvancados, setMostrarCamposAvancados] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados do lançamento quando modal abrir
  useEffect(() => {
    if (isOpen && lancamento) {
      // Converter Date para string no formato YYYY-MM-DD
      const dataFormatada = lancamento.data
        ? new Date(lancamento.data).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      setFormData({
        data: dataFormatada,
        categoria: lancamento.descricao?.categoria || "",
        descricao: lancamento.descricao?.id?.toString() || "",
        formaPagamento: lancamento.formaPagamento?.id?.toString() || "",
        tecnicoResponsavel: lancamento.funcionario?.id?.toString() || "none",
        setor: lancamento.setor?.id?.toString() || "",
        campanha: lancamento.campanha?.id?.toString() || "",
        cliente: lancamento.cliente?.id || "none",
        observacoes: lancamento.observacoes || "",
        numeroNota: lancamento.numeroNota || "",
        temNotaFiscal: !!lancamento.numeroNota,
        conta: lancamento.conta || "empresa",
      });

      // Configurar valores monetários
      valorInput.setValue(lancamento.valor?.toString() || "0");
      valorQueEntrouInput.setValue(lancamento.valorRecebido?.toString() || "0");
      impostoInput.setValue(lancamento.imposto?.toString() || "0");

      // Mostrar campos avançados se houver dados neles
      const temDadosAvancados = 
        lancamento.valorRecebido || 
        lancamento.imposto || 
        lancamento.campanha ||
        lancamento.numeroNota;
      setMostrarCamposAvancados(!!temDadosAvancados);
    }
  }, [isOpen, lancamento, valorInput, valorQueEntrouInput, impostoInput]);

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

  // Verificar se forma de pagamento é cartão
  const isFormaPagamentoCartao =
    formData.formaPagamento &&
    formasPagamento
      .find((f) => f.id.toString() === formData.formaPagamento)
      ?.nome?.toLowerCase()
      .includes("cartão");

  // Calcular campos automaticamente usando os hooks de moeda
  const valorCalculado = Number(valorInput.numericValue || 0);
  const valorQueEntrouCalculado =
    Number(valorQueEntrouInput.numericValue || valorCalculado);
  const impostoCalculado = Number(impostoInput.numericValue || 0);

  // Calcular descontos baseados nos percentuais
  const percentualNotaFiscal = formData.temNotaFiscal ? 5 : 0; // 5% se houver nota fiscal
  const descontoNotaFiscal =
    (valorQueEntrouCalculado * percentualNotaFiscal) / 100;

  // Taxa do cartão - aplicar só se for forma de pagamento de cartão
  const taxaCartao = isFormaPagamentoCartao ? (valorCalculado * 3.5) / 100 : 0; // 3.5% para cartão

  // Valor líquido = valor recebido - impostos - desconto nota fiscal - taxa cartão
  const valorLiquidoCalculado =
    valorQueEntrouCalculado -
    impostoCalculado -
    descontoNotaFiscal -
    taxaCartao;

  // Calcular comissão baseada no percentual do técnico sobre o valor líquido
  const comissaoCalculada = (() => {
    if (formData.tecnicoResponsavel) {
      const tecnico = tecnicos.find(
        (t) => t.id.toString() === formData.tecnicoResponsavel,
      );
      if (tecnico && tecnico.percentualComissao) {
        return valorLiquidoCalculado * (tecnico.percentualComissao / 100);
      }
    }
    return 0;
  })();

  // Valor final para a empresa = valor líquido - comissão do técnico
  const valorParaEmpresa = valorLiquidoCalculado - comissaoCalculada;

  // Resetar valorQueEntrou quando mudança de Cartão para outras formas
  useEffect(() => {
    if (!isFormaPagamentoCartao && valorQueEntrouInput.numericValue > 0) {
      valorQueEntrouInput.reset();
    }
  }, [isFormaPagamentoCartao, valorQueEntrouInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação completa dos campos obrigatórios
    const camposObrigatorios: any = {
      data: formData.data,
      valor: valorInput.numericValue || 0,
      categoria: formData.categoria,
      descricao: formData.descricao,
      formaPagamento: formData.formaPagamento,
    };

    // Adicionar validação específica para despesas
    if (lancamento.tipo === "despesa") {
      camposObrigatorios.conta = formData.conta;
    }

    const camposFaltando = Object.entries(camposObrigatorios)
      .filter(([key, value]) => !value || value.toString().trim() === "")
      .map(([key]) => {
        const nomes = {
          data: "Data",
          valor: "Valor",
          categoria: "Categoria",
          descricao: "Descrição",
          formaPagamento: "Forma de Pagamento",
          conta: "Conta",
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

    // Validar valor recebido para pagamentos com cartão
    if (isFormaPagamentoCartao && (valorQueEntrouInput.numericValue || 0) <= 0) {
      toast({
        title: "Erro",
        description:
          "Para pagamentos com cartão, é obrigatório informar o valor recebido",
        variant: "destructive",
      });
      return;
    }

    // Validar número da nota se nota fiscal foi marcada
    if (formData.temNotaFiscal && !formData.numeroNota) {
      toast({
        title: "Erro",
        description:
          "Número da nota fiscal é obrigatório quando há nota fiscal",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await editarLancamento(lancamento.id.toString(), {
        valor: valorInput.numericValue || 0,
        valorQueEntrou: valorQueEntrouCalculado || 0,
        valorLiquido: valorLiquidoCalculado || 0,
        comissao: comissaoCalculada || 0,
        imposto: impostoInput.numericValue || 0,
        descricao: formData.descricao,
        formaPagamento: formData.formaPagamento,
        tecnicoResponsavel: formData.tecnicoResponsavel && formData.tecnicoResponsavel !== "none" ? formData.tecnicoResponsavel : undefined,
        setor: formData.setor || undefined,
        campanha: formData.campanha || undefined,
        clienteId: formData.cliente && formData.cliente !== "none" ? formData.cliente : undefined,
        observacoes: formData.observacoes || undefined,
        numeroNota: formData.numeroNota || undefined,
        conta: lancamento.tipo === "despesa" ? formData.conta : undefined,
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

  const isLoading = caixaLoading || entidadesLoading || clientesLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {lancamento.tipo === "receita" ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            Editar {lancamento.tipo === "receita" ? "Receita" : "Despesa"}
          </DialogTitle>
          <DialogDescription>
            Modifique os dados do lançamento conforme necessário. Todos os campos são editáveis.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6 text-center">Carregando dados...</div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6 p-4"
          >
            {/* Campos básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-sm font-medium">
                  Data *
                </Label>
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

            {/* Campo conta apenas para despesas */}
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
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empresa">Empresa</SelectItem>
                    <SelectItem value="pessoal">Pessoal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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
                label={`Descrição ${lancamento.tipo === "receita" ? "do Serviço" : "da Despesa"}`}
                required={true}
                disabled={!formData.categoria}
                items={descricoesFiltradas}
                onAddNew={async (data) => {
                  await adicionarDescricao({
                    nome: data.nome,
                    tipo: lancamento.tipo,
                    categoria: formData.categoria,
                  });
                }}
                addNewTitle={`Nova Descrição de ${lancamento.tipo === "receita" ? "Receita" : "Despesa"}`}
                addNewDescription={`Adicione uma nova descrição de ${lancamento.tipo === "receita" ? "serviço para receitas" : "despesa"}.`}
                addNewFields={[
                  {
                    key: "nome",
                    label: "Nome da Descrição",
                    required: true,
                  },
                ]}
              />
            </div>

            <div className="space-y-4">
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

              {/* Campo Valor Recebido para Cartão - logo após forma de pagamento */}
              {isFormaPagamentoCartao && (
                <div className="space-y-2">
                  <Label
                    htmlFor="valorQueEntrou"
                    className="text-sm font-medium text-yellow-700"
                  >
                    Valor Recebido *
                  </Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="relative w-full sm:w-40">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        R$
                      </span>
                      <Input
                        id="valorQueEntrou"
                        {...valorQueEntrouInput.inputProps}
                        className="bg-yellow-50 border-yellow-300"
                        required
                      />
                    </div>
                    <p className="text-xs text-yellow-600 sm:flex-1">
                      <strong>Importante:</strong> Valor líquido após taxas da
                      operadora.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Técnico e Setor apenas para receitas */}
            {lancamento.tipo === "receita" && (
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
            )}

            {/* Cliente apenas para receitas */}
            {lancamento.tipo === "receita" && (
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.cliente}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, cliente: value }))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ModalCadastroCliente
                    trigger={
                      <Button type="button" variant="outline" size="icon">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    }
                    onClienteAdicionado={(cliente) => {
                      setFormData((prev) => ({ ...prev, cliente: cliente.id }));
                      toast({
                        title: "Cliente Adicionado",
                        description: `Cliente "${cliente.nome}" foi cadastrado e selecionado.`,
                        variant: "default",
                      });
                    }}
                  />
                </div>
              </div>
            )}

            {/* Campanha apenas para receitas */}
            {lancamento.tipo === "receita" && (
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
            )}

            {/* Nota Fiscal apenas para receitas */}
            {lancamento.tipo === "receita" && (
              <div className="space-y-3 p-3 bg-blue-50 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="nota-fiscal"
                    checked={formData.temNotaFiscal}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => ({ ...prev, temNotaFiscal: checked }));
                      if (!checked) {
                        setFormData((prev) => ({ ...prev, numeroNota: "" }));
                      }
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="nota-fiscal" className="font-medium text-sm">
                    Há nota fiscal para esta receita?
                  </Label>
                </div>

                {formData.temNotaFiscal && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="numeroNotaObrigatorio" className="text-sm">
                      Número da Nota Fiscal *
                    </Label>
                    <Input
                      id="numeroNotaObrigatorio"
                      placeholder="Ex: 12345"
                      value={formData.numeroNota}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          numeroNota: e.target.value,
                        }))
                      }
                      required={formData.temNotaFiscal}
                      className={
                        formData.temNotaFiscal && !formData.numeroNota
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formData.temNotaFiscal && !formData.numeroNota && (
                      <p className="text-xs text-red-500">
                        Número da nota fiscal é obrigatório
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Campos avançados */}
            <div className="flex items-center space-x-2">
              <Switch
                id="campos-avancados"
                checked={mostrarCamposAvancados}
                onCheckedChange={setMostrarCamposAvancados}
              />
              <Label htmlFor="campos-avancados">Mostrar campos avançados</Label>
            </div>

            {mostrarCamposAvancados && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!isFormaPagamentoCartao && lancamento.tipo === "receita" && (
                    <div className="space-y-2">
                      <Label htmlFor="valorQueEntrouAvancado">
                        Valor que Entrou (R$)
                      </Label>
                      <Input
                        id="valorQueEntrouAvancado"
                        {...valorQueEntrouInput.inputProps}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="imposto">Desconto/Taxa (R$)</Label>
                    <Input id="imposto" {...impostoInput.inputProps} />
                  </div>
                </div>

                {lancamento.tipo === "receita" && (
                  <div className="space-y-2">
                    <Label htmlFor="comissao">Comissão (R$)</Label>
                    <Input
                      id="comissao"
                      value={`R$ ${(comissaoCalculada || 0).toFixed(2).replace(".", ",")}`}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Resumo financeiro para receitas */}
            {lancamento.tipo === "receita" && (valorInput.numericValue || 0) > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-3">
                  Resumo Financeiro Detalhado
                </h4>
                <div className="space-y-3">
                  {/* Primeira linha - valores base */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Valor Total:</span>
                      <div className="font-medium">
                        R$ {Number(valorInput.numericValue || 0).toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Valor Recebido:</span>
                      <div className="font-medium">
                        R$ {(valorQueEntrouCalculado || 0).toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Impostos/Taxas:</span>
                      <div className="font-medium">
                        R$ {(impostoCalculado || 0).toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>

                  {/* Segunda linha - descontos */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm border-t pt-2">
                    {formData.temNotaFiscal && (
                      <div>
                        <span className="text-gray-600">
                          Desc. Nota Fiscal ({percentualNotaFiscal}%):
                        </span>
                        <div className="font-medium text-orange-600">
                          - R$ {(descontoNotaFiscal || 0).toFixed(2).replace(".", ",")}
                        </div>
                      </div>
                    )}
                    {isFormaPagamentoCartao && (
                      <div>
                        <span className="text-gray-600">Taxa Cartão (3,5%):</span>
                        <div className="font-medium text-orange-600">
                          - R$ {(taxaCartao || 0).toFixed(2).replace(".", ",")}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Comissão Técnico:</span>
                      <div className="font-medium text-blue-600">
                        R$ {(comissaoCalculada || 0).toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>

                  {/* Resultado final */}
                  <div className="border-t pt-2">
                    <div className="text-center">
                      <span className="text-gray-600">Para Empresa:</span>
                      <div className="font-bold text-green-600 text-lg">
                        R$ {(valorParaEmpresa || 0).toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resumo financeiro para despesas */}
            {lancamento.tipo === "despesa" && (valorInput.numericValue || 0) > 0 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">
                  Resumo da Despesa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Valor a ser debitado:</span>
                    <div className="font-medium text-red-600 text-lg">
                      R$ {Number(valorInput.numericValue || 0).toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Conta:</span>
                    <div className="font-medium capitalize">{formData.conta}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Observações - Campo no final */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">
                Observações {lancamento.tipo === "receita" ? "do Serviço" : "da Despesa"}
              </Label>
              <Textarea
                id="observacoes"
                placeholder={`Observações sobre ${lancamento.tipo === "receita" ? "o serviço prestado" : "a despesa"}...`}
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

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className={`flex-1 ${
                  lancamento.tipo === "receita" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={isSubmitting}
              >
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
