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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/use-toast";
import SelectWithAdd from "../ui/select-with-add";
import { TrendingUp, UserPlus } from "lucide-react";
import { useEnterAsTab } from "../../hooks/use-enter-as-tab";
import { useCurrencyInput } from "../../hooks/use-currency-input";
import ModalCadastroCliente from "../Clientes/ModalCadastroCliente";

interface FormularioReceitaProps {
  onSuccess?: () => void;
}

export function FormularioReceita({ onSuccess }: FormularioReceitaProps) {
  const formRef = useRef<HTMLFormElement>(null);

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
    data: new Date().toISOString().split("T")[0],
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
  });

  const [mostrarCamposAvancados, setMostrarCamposAvancados] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notaFiscalEmitida, setNotaFiscalEmitida] = useState(false);

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

  // Calcular campos automaticamente usando os hooks de moeda
  const valorCalculado = valorInput.numericValue;
  const valorQueEntrouCalculado =
    valorQueEntrouInput.numericValue || valorCalculado;
  const impostoCalculado = impostoInput.numericValue;

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

  // Função para emitir nota fiscal
  const emitirNotaFiscal = () => {
    const urlNotaFiscal =
      "https://www6.goiania.go.gov.br/sistemas/saces/asp/saces00000f5.asp?sigla=snfse&c=1&aid=efeb5319b1b9661f1a8a5aee6848c7db68773380001&dth=20250812101733";
    const janelaNotaFiscal = window.open(
      urlNotaFiscal,
      "_blank",
      "width=1200,height=800,scrollbars=yes,resizable=yes",
    );

    // Monitorar quando a janela for fechada
    const interval = setInterval(() => {
      if (janelaNotaFiscal?.closed) {
        clearInterval(interval);
        setNotaFiscalEmitida(true);
        toast({
          title: "Nota Fiscal",
          description: "Preencha o número da nota fiscal emitida",
          variant: "default",
        });
      }
    }, 1000);
  };

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
      await adicionarLancamento({
        data: new Date(formData.data),
        tipo: "receita",
        valor: valorInput.numericValue,
        valorLiquido: valorLiquidoCalculado,
        valorQueEntrou: valorQueEntrouCalculado,
        comissao: comissaoCalculada,
        imposto: impostoInput.numericValue,
        descricao: formData.descricao,
        formaPagamento: formData.formaPagamento,
        tecnicoResponsavel: formData.tecnicoResponsavel || undefined,
        setor: formData.setor || undefined,
        campanha: formData.campanha || undefined,
        clienteId: formData.cliente || undefined,
        observacoes: formData.observacoes || undefined,
        numeroNota: formData.numeroNota || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Receita lançada com sucesso!",
        variant: "default",
      });

      // Resetar formulário
      setFormData({
        data: new Date().toISOString().split("T")[0],
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
      });

      // Resetar campos de moeda
      valorInput.reset();
      valorQueEntrouInput.reset();
      impostoInput.reset();
      setNotaFiscalEmitida(false);

      onSuccess?.();
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

  const isLoading = caixaLoading || entidadesLoading || clientesLoading;

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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-green-600 text-lg sm:text-xl">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          Lançar Receita
        </CardTitle>
        <CardDescription className="text-sm">
          Registre uma nova entrada no caixa
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6"
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

          {/* Cliente */}
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

          {/* Campanha */}
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

          {/* Nota Fiscal */}
          <div className="space-y-3 p-4 bg-blue-50/70 rounded-lg border border-blue-200/70 shadow-sm">
            <div className="flex items-center space-x-3">
              <Switch
                id="nota-fiscal"
                checked={formData.temNotaFiscal}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({ ...prev, temNotaFiscal: checked }));
                  if (!checked) {
                    setFormData((prev) => ({ ...prev, numeroNota: "" }));
                    setNotaFiscalEmitida(false);
                  } else {
                    // Abrir automaticamente quando marca
                    emitirNotaFiscal();
                  }
                }}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-blue-200"
              />
              <Label
                htmlFor="nota-fiscal"
                className="font-medium text-sm text-blue-800 cursor-pointer"
              >
                Há nota fiscal para esta receita?
              </Label>
            </div>

            {formData.temNotaFiscal && (
              <div className="space-y-3 pl-6">
                <div className="text-xs text-blue-600">
                  ℹ️ O site da nota fiscal foi aberto automaticamente. Após
                  emitir, preencha o n��mero abaixo.
                </div>

                <div className="space-y-2">
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
              </div>
            )}
          </div>

          {/* Campos avançados */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50/70 rounded-lg border border-gray-200/70 shadow-sm">
            <Switch
              id="campos-avancados"
              checked={mostrarCamposAvancados}
              onCheckedChange={setMostrarCamposAvancados}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
            />
            <Label
              htmlFor="campos-avancados"
              className="font-medium text-sm text-gray-700 cursor-pointer"
            >
              Mostrar campos avançados
            </Label>
          </div>

          {mostrarCamposAvancados && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isFormaPagamentoCartao && (
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

              <div className="space-y-2">
                <Label htmlFor="comissao">Comissão (R$)</Label>
                <Input
                  id="comissao"
                  value={`R$ ${comissaoCalculada.toFixed(2).replace(".", ",")}`}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
          )}

          {/* Resumo financeiro */}
          {valorInput.numericValue > 0 && (
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
                      R$ {valorInput.numericValue.toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor Recebido:</span>
                    <div className="font-medium">
                      R$ {valorQueEntrouCalculado.toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Impostos/Taxas:</span>
                    <div className="font-medium">
                      R$ {impostoCalculado.toFixed(2).replace(".", ",")}
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
                        - R$ {descontoNotaFiscal.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  )}
                  {isFormaPagamentoCartao && (
                    <div>
                      <span className="text-gray-600">Taxa Cartão (3,5%):</span>
                      <div className="font-medium text-orange-600">
                        - R$ {taxaCartao.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Comissão Técnico:</span>
                    <div className="font-medium text-blue-600">
                      R$ {comissaoCalculada.toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                </div>

                {/* Resultado final */}
                <div className="border-t pt-2">
                  <div className="text-center">
                    <span className="text-gray-600">Para Empresa:</span>
                    <div className="font-bold text-green-600 text-lg">
                      R$ {valorParaEmpresa.toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Observações - Campo no final */}
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

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Lançando..." : "Lançar Receita"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
