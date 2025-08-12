import React, { useState, useEffect } from "react";
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
import { TrendingUp, UserPlus } from "lucide-react";
import ModalCadastroCliente from "../Clientes/ModalCadastroCliente";

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
  const {
    clientes,
    adicionarCliente,
    isLoading: clientesLoading,
  } = useClientes();

  // Carregar técnicos usando a função que verifica localStorage
  const tecnicos = getTecnicos();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    valor: "",
    valorQueEntrou: "",
    valorLiquido: "",
    comissao: "",
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

  // Calcular campos automaticamente
  const valorCalculado = parseFloat(formData.valor) || 0;
  const valorQueEntrouCalculado =
    parseFloat(formData.valorQueEntrou) || valorCalculado;
  const valorLiquidoCalculado = valorQueEntrouCalculado;

  // Calcular comissão baseada no percentual do técnico
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

  // Atualizar campos calculados apenas quando necessário
  useEffect(() => {
    const novoValorLiquido = valorLiquidoCalculado.toFixed(2);
    const novaComissao = comissaoCalculada.toFixed(2);

    if (
      formData.valorLiquido !== novoValorLiquido ||
      formData.comissao !== novaComissao
    ) {
      setFormData((prev) => ({
        ...prev,
        valorLiquido: novoValorLiquido,
        comissao: novaComissao,
      }));
    }
  }, [
    valorLiquidoCalculado,
    comissaoCalculada,
    formData.valorLiquido,
    formData.comissao,
  ]);

  // Resetar valorQueEntrou quando mudança de Cartão para outras formas
  useEffect(() => {
    if (
      !isFormaPagamentoCartao &&
      formData.valorQueEntrou &&
      formData.valorQueEntrou !== formData.valor
    ) {
      setFormData((prev) => ({
        ...prev,
        valorQueEntrou: "",
      }));
    }
  }, [isFormaPagamentoCartao]);

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

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split("T")[0],
      valor: "",
      valorQueEntrou: "",
      valorLiquido: "",
      comissao: "",
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
    setNotaFiscalEmitida(false);
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
        valor: parseFloat(formData.valor),
        valorLiquido:
          parseFloat(formData.valorLiquido) || parseFloat(formData.valor),
        valorQueEntrou:
          parseFloat(formData.valorQueEntrou) || parseFloat(formData.valor),
        comissao: parseFloat(formData.comissao) || 0,
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
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Receitas
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
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.valorQueEntrou}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            valorQueEntrou: e.target.value,
                          }))
                        }
                        className="bg-yellow-50 border-yellow-300 pl-8"
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
                    <SelectItem value="">Nenhum cliente</SelectItem>
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

            {/* Nota Fiscal */}
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg border">
              <div className="flex items-center space-x-2">
                <Switch
                  id="nota-fiscal"
                  checked={formData.temNotaFiscal}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      temNotaFiscal: checked,
                    }));
                    if (!checked) {
                      setFormData((prev) => ({ ...prev, numeroNota: "" }));
                      setNotaFiscalEmitida(false);
                    } else {
                      // Abrir automaticamente quando marca
                      emitirNotaFiscal();
                    }
                  }}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="nota-fiscal" className="font-medium text-sm">
                  Há nota fiscal para esta receita?
                </Label>
              </div>

              {formData.temNotaFiscal && (
                <div className="space-y-3 pl-6">
                  <div className="text-xs text-blue-600">
                    ℹ️ O site da nota fiscal foi aberto automaticamente. Após
                    emitir, preencha o número abaixo.
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Valor Total:</span>
                    <div className="font-medium">
                      R$ {parseFloat(formData.valor || "0").toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor Líquido:</span>
                    <div className="font-medium">
                      R$ {parseFloat(formData.valorLiquido || "0").toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Comissão:</span>
                    <div className="font-medium">
                      R$ {parseFloat(formData.comissao || "0").toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Para Empresa:</span>
                    <div className="font-medium text-green-600">
                      R${" "}
                      {(
                        parseFloat(formData.valorLiquido || "0") -
                        parseFloat(formData.comissao || "0")
                      ).toFixed(2)}
                    </div>
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
