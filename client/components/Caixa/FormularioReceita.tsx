import React, { useState, useEffect, useRef, useMemo } from "react";
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
import {
  isFormaPagamentoCartao,
  isFormaPagamentoBoleto,
} from "../../lib/stringUtils";

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
    formasPagamento,
    getTecnicos,
    setores,
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

  // Carregar técnicos - atualiza quando a lista de funcionários muda
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
  const [isModalClienteOpen, setIsModalClienteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notaFiscalEmitida, setNotaFiscalEmitida] = useState(false);
  const [dataVencimentoBoleto, setDataVencimentoBoleto] = useState<Date | null>(
    null,
  );
  const [clienteRecemAdicionado, setClienteRecemAdicionado] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Estados para categorias e descrições carregadas diretamente da API
  const [categoriasReceita, setCategoriasReceita] = useState<string[]>([]);
  const [descricoesFiltradas, setDescricoesFiltradas] = useState<any[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);

  // Carregar categorias de receita diretamente da API
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        setCarregandoCategorias(true);
        const response = await fetch(
          "/api/descricoes-e-categorias/categorias?tipo=receita",
        );
        const data = await response.json();

        if (data.data) {
          // Remove duplicates and sort
          const nomes = [
            ...new Set(data.data.map((cat: any) => cat.nome)),
          ].sort();
          setCategoriasReceita(nomes);
        } else {
          // Nenhuma categoria encontrada
        }
      } catch (error) {
        console.error(
          "[FormularioReceita] Erro ao carregar categorias:",
          error,
        );
      } finally {
        setCarregandoCategorias(false);
      }
    };

    carregarCategorias();
  }, []);

  // Carregar descrições quando categoria muda
  useEffect(() => {
    const carregarDescricoes = async () => {
      if (!formData.categoria) {
        setDescricoesFiltradas([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/descricoes-e-categorias/descricoes?tipo=receita&categoria=${encodeURIComponent(formData.categoria)}`,
        );
        const data = await response.json();

        if (data.data) {
          setDescricoesFiltradas(data.data);
        }
      } catch (error) {
        console.error(
          "[FormularioReceita] Erro ao carregar descrições:",
          error,
        );
        setDescricoesFiltradas([]);
      }
    };

    carregarDescricoes();
  }, [formData.categoria]);

  // Verificar se forma de pagamento é cartão - memoização estabilizada
  const isCartao = useMemo(() => {
    if (!formData.formaPagamento || formasPagamento.length === 0) {
      return false;
    }

    const forma = formasPagamento.find(
      (f) => f.id.toString() === formData.formaPagamento,
    );

    return isFormaPagamentoCartao(forma);
  }, [formData.formaPagamento, formasPagamento]); // Usar array diretamente

  // Verificar se forma de pagamento é boleto - memoização estabilizada
  const isBoleto = useMemo(() => {
    if (!formData.formaPagamento || formasPagamento.length === 0) {
      return false;
    }

    const forma = formasPagamento.find(
      (f) => f.id.toString() === formData.formaPagamento,
    );

    return isFormaPagamentoBoleto(forma);
  }, [formData.formaPagamento, formasPagamento]); // Usar array diretamente

  // Calcular campos automaticamente usando os hooks de moeda
  const valorCalculado = valorInput.numericValue;
  const valorQueEntrouCalculado =
    valorQueEntrouInput.numericValue || valorCalculado;
  const impostoCalculado = impostoInput.numericValue;

  // SEQUÊNCIA CORRETA DE CÁLCULOS conforme especificação:
  // 1. Valor total do serviço = base para cálculo da nota fiscal
  // 2. Se cartão: valor que entrou (após taxas da operadora)
  // 3. Descontar nota fiscal do valor que entrou
  // 4. Calcular comissão sobre o valor após desconto da nota fiscal
  // 5. Valor final para empresa = valor líquido - comissão

  // Exemplo: R$ 100 serviço, nota fiscal R$ 6, cartão entrou R$ 90
  // R$ 90 - R$ 6 (nota) = R$ 84 (base para comissão)
  // R$ 84 - comissão = valor final para empresa

  // 1. Valor base para nota fiscal = valor total do serviço
  const valorBaseNotaFiscal = valorCalculado;

  // 2. Valor que efetivamente entrou (para cartão, é menor que o valor total)
  const valorQueEntrouReal = React.useMemo(() => {
    if (isCartao && valorQueEntrouCalculado > 0) {
      return valorQueEntrouCalculado;
    }
    return valorCalculado;
  }, [isCartao, valorQueEntrouCalculado, valorCalculado]);

  // 3. Calcular desconto da nota fiscal (6% do valor total do serviço) - memoizado
  const { percentualNotaFiscal, descontoNotaFiscal } = useMemo(() => {
    const percentual = formData.temNotaFiscal ? 6 : 0;
    const desconto = (valorCalculado * percentual) / 100;
    return { percentualNotaFiscal: percentual, descontoNotaFiscal: desconto };
  }, [formData.temNotaFiscal, valorCalculado]);

  // 4. Valor líquido = valor que entrou - desconto nota fiscal - impostos/taxas adicionais
  const valorLiquidoCalculado = React.useMemo(() => {
    return valorQueEntrouReal - descontoNotaFiscal - impostoCalculado;
  }, [valorQueEntrouReal, descontoNotaFiscal, impostoCalculado]);

  // Calcular comissão baseada no percentual do técnico sobre o valor líquido
  const comissaoCalculada = React.useMemo(() => {
    if (formData.tecnicoResponsavel && valorLiquidoCalculado > 0) {
      const tecnico = tecnicos.find(
        (t) => t.id.toString() === formData.tecnicoResponsavel,
      );
      if (tecnico) {
        // Usar percentualComissao ou percentualServico como fallback
        const percentual =
          tecnico.percentualComissao || tecnico.percentualServico || 0;
        if (percentual > 0) {
          const comissao = valorLiquidoCalculado * (percentual / 100);
          return comissao;
        }
      }
    }
    return 0;
  }, [
    formData.tecnicoResponsavel,
    valorLiquidoCalculado,
    tecnicos, // Usar array diretamente para maior estabilidade
  ]);

  // Valor final para a empresa = valor líquido - comissão do técnico
  const valorParaEmpresa = React.useMemo(() => {
    return valorLiquidoCalculado - comissaoCalculada;
  }, [valorLiquidoCalculado, comissaoCalculada]);

  // ✅ CORREÇÃO: Removido useEffect que causava piscar - valores são calculados diretamente com useMemo

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
      tecnicoResponsavel: formData.tecnicoResponsavel,
      cidade: formData.cidade,
      setor: formData.setor,
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
          tecnicoResponsavel: "Técnico Responsável",
          cidade: "Cidade",
          setor: "Setor",
        };
        return nomes[key as keyof typeof nomes];
      });

    if (camposFaltando.length > 0) {
      setShowValidationErrors(true);
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: `Preencha os seguintes campos: ${camposFaltando.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // Validações específicas para boleto
    if (isBoleto) {
      if (!formData.cliente) {
        toast({
          title: "Campo obrigatório",
          description:
            "Cliente é obrigatório quando a forma de pagamento for boleto",
          variant: "destructive",
        });
        return;
      }

      if (!dataVencimentoBoleto) {
        toast({
          title: "Campo obrigatório",
          description: "Data de vencimento é obrigatória para boletos",
          variant: "destructive",
        });
        return;
      }
    }

    // Validar valor recebido para pagamentos com cartão
    if (isCartao && valorQueEntrouInput.numericValue <= 0) {
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
      // Para boletos, o valor não entra no caixa imediatamente (valor para empresa = 0)
      // Para outros, o valor para empresa é o valor líquido menos a comissão
      const valorParaEmpresaCalculado = isBoleto ? 0 : valorParaEmpresa;

      // Valores calculados para lançamento

      // Gerar código único do serviço se for boleto
      let codigoServico = undefined;
      if (isBoleto) {
        codigoServico = `SRV-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      }

      // Buscar objetos completos para criar snapshots
      const formaSelecionada = formasPagamento.find(
        (f) => f.id?.toString() === formData.formaPagamento,
      );
      const campanhaSelecionada = campanhas.find(
        (c) => c.id?.toString() === formData.campanha,
      );
      const clienteSelecionado = clientes.find(
        (c) => c.id.toString() === formData.cliente,
      );
      const setorSelecionado = setores.find(
        (s) => s.id?.toString() === formData.setor,
      );
      const tecnicoSelecionado = tecnicos.find(
        (t) => t.id?.toString() === formData.tecnicoResponsavel,
      );

      // Validar dados selecionados

      // Validar se cliente foi encontrado quando necessário
      if (formData.cliente && !clienteSelecionado) {
        console.error("Cliente selecionado não encontrado:", formData.cliente);
        toast({
          title: "Erro",
          description:
            "Cliente selecionado não foi encontrado. Tente selecionar novamente.",
          variant: "destructive",
        });
        return;
      }

      // Validar se forma de pagamento foi encontrada
      if (formData.formaPagamento && !formaSelecionada) {
        console.error(
          "Forma de pagamento selecionada não encontrada:",
          formData.formaPagamento,
        );
        toast({
          title: "Erro",
          description:
            "Forma de pagamento selecionada não foi encontrada. Tente selecionar novamente.",
          variant: "destructive",
        });
        return;
      }

      // Criar lançamento no caixa com snapshots completos
      const lancamentoCaixa = await adicionarLancamento({
        data: new Date(formData.data),
        tipo: "receita",
        valor: valorInput.numericValue,
        valorLiquido: valorLiquidoCalculado,
        valorParaEmpresa: valorParaEmpresaCalculado,
        valorQueEntrou: valorQueEntrouCalculado,
        comissao: comissaoCalculada,
        imposto: impostoInput.numericValue,
        categoria: formData.categoria,
        descricao: formData.descricao,

        // Salvar snapshots dos objetos para preservar dados históricos
        formaPagamento: formaSelecionada || {
          id: formData.formaPagamento,
          nome: formData.formaPagamento,
        },
        formaPagamentoId:
          formaSelecionada?.id?.toString() || formData.formaPagamento,

        tecnicoResponsavel: tecnicoSelecionado
          ? {
              id: tecnicoSelecionado.id,
              nome: tecnicoSelecionado.nome || tecnicoSelecionado.nomeCompleto,
              percentualComissao:
                tecnicoSelecionado.percentualComissao ||
                tecnicoSelecionado.percentualServico,
            }
          : undefined,
        tecnicoResponsavelId:
          tecnicoSelecionado?.id?.toString() ||
          formData.tecnicoResponsavel ||
          undefined,

        setor: setorSelecionado
          ? {
              id: setorSelecionado.id,
              nome: setorSelecionado.nome,
              cidade:
                typeof setorSelecionado.cidade === "object"
                  ? setorSelecionado.cidade?.nome
                  : setorSelecionado.cidade,
            }
          : undefined,
        setorId:
          setorSelecionado?.id?.toString() || formData.setor || undefined,

        campanha: campanhaSelecionada
          ? {
              id: campanhaSelecionada.id,
              nome: campanhaSelecionada.nome,
            }
          : undefined,
        campanhaId:
          campanhaSelecionada?.id?.toString() || formData.campanha || undefined,

        cliente: clienteSelecionado
          ? {
              id: clienteSelecionado.id,
              nome: clienteSelecionado.nome,
            }
          : undefined,
        clienteId: clienteSelecionado?.id || formData.cliente || undefined,

        observacoes: formData.observacoes || undefined,
        numeroNota: formData.numeroNota || undefined,
        codigoServico: codigoServico, // Adicionar código do serviço
      });

      // Se for boleto, criar automaticamente conta a receber
      if (isBoleto && dataVencimentoBoleto && codigoServico) {
        try {
          // Criando conta a receber para boleto

          const dadosContaReceber = {
            tipo: "receber",
            valor: valorInput.numericValue,
            dataVencimento: dataVencimentoBoleto.toISOString().split("T")[0], // YYYY-MM-DD
            codigoCliente: parseInt(formData.cliente), // Corrigido: usar codigoCliente (number) como esperado pela API
            observacoes: `[BOLETO AUTOMÁTICO] ${formData.categoria} - ${formData.descricao}${formData.observacoes ? ` | Obs: ${formData.observacoes}` : ""} | Cód: ${codigoServico}`,
            codigoServico: codigoServico,
            categoria: formData.categoria,
            descricao: formData.descricao,
            pago: false,
            // Adicionar campos para integração
            lancamentoCaixaId: lancamentoCaixa.id, // Vincular com o lançamento do caixa
            sistemaOrigem: "caixa_boleto",
            status: "pendente",
            prioridadePagamento: "normal",
          };

          // Dados preparados para criar conta a receber

          const responseContaReceber = await fetch("/api/contas", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosContaReceber),
          });

          if (responseContaReceber.ok) {
            const contaCriada = await responseContaReceber.json();
            // Conta a receber criada automaticamente para boleto

            toast({
              title: "Boleto registrado com sucesso!",
              description: `Receita lançada no Caixa e conta a receber criada automaticamente. Vencimento: ${dataVencimentoBoleto.toLocaleDateString("pt-BR")}`,
              variant: "default",
            });
          } else {
            const errorData = await responseContaReceber.json();
            console.error(
              "Erro ao criar conta a receber para boleto:",
              errorData,
            );

            toast({
              title: "Atenção",
              description:
                "Receita lançada no Caixa, mas houve erro ao criar conta a receber automaticamente. Verifique o módulo Contas.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Erro ao criar conta a receber:", error);

          toast({
            title: "Atenção",
            description:
              "Receita lançada no Caixa, mas houve erro na integração com Contas a Receber.",
            variant: "destructive",
          });
        }
      } else if (isBoleto) {
        // Sucesso normal para boletos sem integração
        toast({
          title: "Boleto registrado!",
          description: `Receita de boleto lançada. O valor entrará no caixa quando for pago. Vencimento: ${dataVencimentoBoleto?.toLocaleDateString("pt-BR")}`,
          variant: "default",
        });
      } else {
        // Sucesso normal para outras formas de pagamento
        toast({
          title: "Sucesso",
          description: "Receita lançada com sucesso!",
          variant: "default",
        });
      }

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
      setDataVencimentoBoleto(null);
      setClienteRecemAdicionado(false);
      setShowValidationErrors(false);

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

  // Só mostrar loading se realmente não há dados essenciais
  const isLoadingEssential =
    carregandoCategorias || (entidadesLoading && formasPagamento.length === 0);

  if (isLoadingEssential) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Carregando dados...
          </div>
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
              <Input
                id="valor"
                {...valorInput.inputProps}
                placeholder="R$ 0,00"
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
                  {carregandoCategorias ? (
                    <div className="px-2 py-1 text-sm text-gray-500">
                      Carregando categorias...
                    </div>
                  ) : categoriasReceita.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-gray-500">
                      Nenhuma categoria de receita encontrada
                    </div>
                  ) : (
                    categoriasReceita.map((categoria, index) => (
                      <SelectItem
                        key={`categoria-${index}-${categoria}`}
                        value={categoria}
                      >
                        {categoria}
                      </SelectItem>
                    ))
                  )}
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
              label="Descrição do Serviço"
              required={true}
              disabled={!formData.categoria}
              items={descricoesFiltradas}
              renderItem={(item) => item.nome}
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      nome: data.nome.trim(),
                      tipo: "receita",
                      categoria: formData.categoria.trim(),
                      tipoItem: "descricao",
                      ativo: true,
                    }),
                  });

                  if (!response.ok) throw new Error("Erro ao criar descrição");

                  const created = await response.json(); // Capturar o item criado

                  // Recarregar descrições
                  const reloadResponse = await fetch(
                    `/api/descricoes-e-categorias/descricoes?tipo=receita&categoria=${encodeURIComponent(formData.categoria)}`,
                  );
                  const reloadData = await reloadResponse.json();
                  if (reloadData.data) {
                    setDescricoesFiltradas(reloadData.data);
                  }

                  // Selecionar automaticamente o item recém-criado
                  setFormData((prev) => ({
                    ...prev,
                    descricao: created.nome || data.nome.trim(),
                  }));
                } catch (error) {
                  console.error("Erro ao adicionar descrição:", error);
                  throw error;
                }
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
              renderItem={(item) => item.nome}
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
            {isCartao && (
              <div className="space-y-2 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
                <Label
                  htmlFor="valorQueEntrou"
                  className="text-sm font-semibold text-yellow-800"
                >
                  💳 Valor Recebido (Líquido após taxas) *
                </Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="valorQueEntrou"
                    {...valorQueEntrouInput.inputProps}
                    className="bg-white border-yellow-400 text-lg font-medium"
                    placeholder="R$ 0,00"
                    required
                  />
                  <p className="text-xs text-yellow-700">
                    ⚠��{" "}
                    <strong>
                      Digite o valor que realmente entrou na conta após as taxas
                      da operadora do cartão
                    </strong>
                  </p>
                  {valorInput.numericValue > 0 &&
                    valorQueEntrouCalculado > 0 && (
                      <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                        📊 Taxa da operadora: R${" "}
                        {(valorInput.numericValue - valorQueEntrouCalculado)
                          .toFixed(2)
                          .replace(".", ",")}
                        (
                        {(
                          ((valorInput.numericValue - valorQueEntrouCalculado) /
                            valorInput.numericValue) *
                          100
                        ).toFixed(1)}
                        %)
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Técnico e Campanha na mesma linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tecnicoResponsavel">Técnico Responsável <span className="text-red-500">*</span></Label>
              <Select
                value={formData.tecnicoResponsavel}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    tecnicoResponsavel: value,
                  }))
                }
                required
              >
                <SelectTrigger className={showValidationErrors && !formData.tecnicoResponsavel ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-gray-500">
                      <div className="font-medium text-red-600">
                        Nenhum técnico encontrado
                      </div>
                      <div className="text-xs mt-1 space-y-1">
                        <div>1. Vá em "Funcionários" no menu</div>
                        <div>2. Cadastre um funcionário</div>
                        <div>3. Marque o tipo como "Técnico"</div>
                      </div>
                    </div>
                  ) : (
                    tecnicos
                      .filter(
                        (tecnico) =>
                          tecnico.id != null &&
                          tecnico.id !== "" &&
                          tecnico.id !== 0,
                      )
                      .map((tecnico) => {
                        const percentual =
                          tecnico.percentualComissao ||
                          tecnico.percentualServico ||
                          0;
                        const nome = tecnico.nome || tecnico.nomeCompleto;
                        return (
                          <SelectItem
                            key={tecnico.id}
                            value={tecnico.id.toString()}
                          >
                            {nome} {percentual > 0 && `(${percentual}%)`}
                          </SelectItem>
                        );
                      })
                  )}
                </SelectContent>
              </Select>
              {showValidationErrors && !formData.tecnicoResponsavel && (
                <p className="text-xs text-red-500">
                  Técnico responsável é obrigatório
                </p>
              )}
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
              renderItem={(item) => item.nome}
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
          </div>

          {/* Cidade e Setor - agora separados e obrigatórios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade <span className="text-red-500">*</span></Label>
              <Select
                value={formData.cidade}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, cidade: value, setor: "" }))
                }
                required
              >
                <SelectTrigger className={showValidationErrors && !formData.cidade ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cidades.map((cidade) => (
                    <SelectItem key={cidade} value={cidade}>
                      {cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showValidationErrors && !formData.cidade && (
                <p className="text-xs text-red-500">
                  Cidade é obrigatória
                </p>
              )}
            </div>

            <SelectWithAdd
              value={formData.setor}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, setor: value }))
              }
              placeholder={formData.cidade ? "Selecione o setor" : "Primeiro selecione uma cidade"}
              label="Setor <span className='text-red-500'>*</span>"
              required={true}
              disabled={!formData.cidade}
              items={setores.filter(setor =>
                !formData.cidade ||
                (typeof setor.cidade === "object" ? setor.cidade?.nome : setor.cidade) === formData.cidade
              )}
              onAddNew={async (data) => {
                await adicionarSetor({
                  nome: data.nome,
                  cidade: formData.cidade,
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
              ]}
              renderItem={(setor) =>
                `${setor.nome} - ${typeof setor.cidade === "object" ? setor.cidade?.nome : setor.cidade}`
              }
            />
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label
              htmlFor="cliente"
              className={isBoleto ? "text-red-600 font-semibold" : ""}
            >
              Cliente {isBoleto && "*"}
            </Label>
            <div className="flex gap-2">
              <Select
                value={formData.cliente}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, cliente: value }))
                }
                required={isBoleto}
              >
                <SelectTrigger
                  className={`flex-1 ${isBoleto && !formData.cliente ? "border-red-500" : ""}`}
                >
                  <SelectValue
                    placeholder={
                      isBoleto
                        ? "Selecione um cliente (obrigatório para boleto)"
                        : "Selecione um cliente"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id?.toString()}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Adicionar Cliente"
                onClick={() => setIsModalClienteOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            {isBoleto && !formData.cliente && (
              <p className="text-xs text-red-500">
                Cliente é obrigatório quando a forma de pagamento for boleto
              </p>
            )}

            {formData.cliente && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">
                    Cliente selecionado:{" "}
                    {clientes.find((c) => c.id === formData.cliente)?.nome}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  ✓ Você pode continuar editando os campos e adicionar
                  observações antes de finalizar o lançamento
                </p>
              </div>
            )}
          </div>

          {/* Data de Vencimento do Boleto - só aparece para boletos */}
          {isBoleto && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <Label
                  htmlFor="dataVencimentoBoleto"
                  className="text-blue-800 font-semibold"
                >
                  Data de Vencimento do Boleto *
                </Label>
              </div>

              <Input
                id="dataVencimentoBoleto"
                type="date"
                value={
                  dataVencimentoBoleto
                    ? dataVencimentoBoleto.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value) {
                    setDataVencimentoBoleto(new Date(e.target.value));
                  } else {
                    setDataVencimentoBoleto(null);
                  }
                }}
                className="bg-blue-50 border-blue-300"
                required
              />

              {!dataVencimentoBoleto && (
                <p className="text-xs text-red-600 font-medium">
                  ⚠�� Data de vencimento é obrigatória para boletos
                </p>
              )}

              <div className="bg-blue-100 p-3 rounded border-l-4 border-blue-400">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  🔄 Integração Automática Caixa + Contas a Receber
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>
                    • <strong>Agora:</strong> Lança receita bruta no Caixa (não
                    soma no saldo)
                  </li>
                  <li>
                    • <strong>Agora:</strong> Cria automaticamente conta a
                    receber
                  </li>
                  <li>
                    • <strong>Quando pago:</strong> Marque como pago em Contas a
                    Receber
                  </li>
                  <li>
                    • <strong>Automático:</strong> Sistema lança receita real no
                    Caixa
                  </li>
                </ul>
              </div>
            </div>
          )}

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
                {!isCartao && (
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
            <div
              className={`p-4 rounded-lg ${isBoleto ? "bg-yellow-50 border border-yellow-200" : "bg-green-50"}`}
            >
              <h4
                className={`font-medium mb-3 ${isBoleto ? "text-yellow-800" : "text-green-800"}`}
              >
                {isBoleto
                  ? "Resumo Financeiro - BOLETO"
                  : "Resumo Financeiro Detalhado"}
              </h4>
              {isBoleto && (
                <div className="mb-3 p-2 bg-yellow-100 rounded border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-800">
                    <strong>ATENÇÃO:</strong> Como é um boleto, este valor será
                    registrado apenas como receita bruta. O valor não entrará
                    para a empresa até o pagamento do boleto.
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {/* Primeira linha - valores base */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">
                      Valor Total do Serviço:
                    </span>
                    <div className="font-medium">
                      R$ {valorInput.numericValue.toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                  <div className={isCartao ? "bg-yellow-100 p-2 rounded" : ""}>
                    <span className="text-gray-600">
                      {isCartao
                        ? "💳 Valor Recebido (após taxas):"
                        : "Valor Recebido:"}
                    </span>
                    <div
                      className={`font-medium ${isCartao ? "text-yellow-800" : ""}`}
                    >
                      R$ {valorQueEntrouReal.toFixed(2).replace(".", ",")}
                    </div>
                    {isCartao &&
                      valorInput.numericValue !== valorQueEntrouReal && (
                        <div className="text-xs text-yellow-600">
                          Taxa: R${" "}
                          {(valorInput.numericValue - valorQueEntrouReal)
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>
                      )}
                  </div>
                  <div>
                    <span className="text-gray-600">
                      Outras Taxas/Impostos:
                    </span>
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
                        Desc. Nota Fiscal ({percentualNotaFiscal}% sobre R${" "}
                        {valorBaseNotaFiscal.toFixed(2).replace(".", ",")}):
                      </span>
                      <div className="font-medium text-orange-600">
                        - R$ {descontoNotaFiscal.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  )}
                  {isCartao && (
                    <div>
                      <span className="text-gray-600">Taxa Cartão:</span>
                      <div className="font-medium text-green-600">
                        Já descontada
                      </div>
                      <div className="text-xs text-gray-500">
                        (Valor recebido já é líquido)
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
                    <div
                      className={`font-bold text-lg ${isBoleto ? "text-yellow-600" : "text-green-600"}`}
                    >
                      R${" "}
                      {isBoleto
                        ? "0,00"
                        : valorParaEmpresa.toFixed(2).replace(".", ",")}
                    </div>
                    {isBoleto && (
                      <p className="text-xs text-yellow-600 mt-1">
                        (Valor será creditado após pagamento do boleto)
                      </p>
                    )}
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
            {isSubmitting
              ? "Lançando..."
              : formData.cliente
                ? `Lançar Receita para ${clientes.find((c) => c.id === formData.cliente)?.nome || "Cliente Selecionado"}`
                : "Lançar Receita"}
          </Button>
        </form>

        {/* Modal de Cliente fora do form para evitar aninhamento */}
        <ModalCadastroCliente
          isOpen={isModalClienteOpen}
          onOpenChange={setIsModalClienteOpen}
          onClienteAdicionado={(cliente) => {
            // Selecionar o cliente recém-criado
            setFormData((prev) => ({
              ...prev,
              cliente: cliente.id?.toString(),
            }));

            // Marcar que cliente foi recém-adicionado
            setClienteRecemAdicionado(true);

            // Feedback positivo ao usuário
            toast({
              title: "Cliente Adicionado com Sucesso! ✅",
              description: `Cliente "${cliente.nome}" foi cadastrado e selecionado. Você pode continuar editando o lançamento.`,
              variant: "default",
              duration: 4000,
            });

            // Focar no campo de observações após um breve delay para permitir edições
            setTimeout(() => {
              const observacoesField = document.getElementById("observacoes");
              if (observacoesField) {
                observacoesField.focus();
                observacoesField.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
              // Reset flag após o foco
              setClienteRecemAdicionado(false);
            }, 500);
          }}
        />
      </CardContent>
    </Card>
  );
}
