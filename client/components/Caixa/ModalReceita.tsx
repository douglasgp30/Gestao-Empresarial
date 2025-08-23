import React, { useState, useEffect, useCallback } from "react";
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
import { isFormaPagamentoBoleto } from "../../lib/stringUtils";

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
    cidades,
    adicionarFormaPagamento,
    adicionarSetor,
    isLoading: entidadesLoading,
    // Usar apenas tabela unificada
    getCategorias,
    getDescricoes,
    adicionarDescricaoECategoria,
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
    categoria: "",
    descricao: "",
    descricaoId: "", // Adicionar campo para o ID da descrição
    formaPagamento: "",
    tecnicoResponsavel: "",
    cidade: "",
    setor: "",
    campanha: "",
    cliente: "",
    observacoes: "",
    numeroNota: "",
    temNotaFiscal: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notaFiscalEmitida, setNotaFiscalEmitida] = useState(false);
  const [dataVencimentoBoleto, setDataVencimentoBoleto] = useState<Date | null>(
    null,
  );

  // Usar useMemo ao invés de useCallback para evitar re-renderizações desnecessárias
  const categoriasReceita = React.useMemo(() => {
    const categorias = getCategorias("receita");
    console.log("[ModalReceita] Debug - Categorias de receita:", categorias);
    return categorias.map((cat) => cat.nome).sort();
  }, [getCategorias]);

  const descricoesReceita = React.useMemo(() => {
    return getDescricoes("receita");
  }, [getDescricoes]);

  // Filtrar descrições pela categoria selecionada
  const descricoesFiltradas = React.useMemo(() => {
    if (!formData.categoria) return [];
    const descricoes = getDescricoes("receita", formData.categoria);
    console.log(
      "[ModalReceita] Debug - Categoria selecionada:",
      formData.categoria,
    );
    console.log("[ModalReceita] Debug - Descrições filtradas:", descricoes);
    return descricoes;
  }, [formData.categoria, getDescricoes]);

  // Filtrar setores pela cidade selecionada
  const setoresFiltrados = React.useMemo(() => {
    if (!formData.cidade) return [];
    return (Array.isArray(setores) ? setores : []).filter((setor) => {
      const nomeCidadeSetor =
        typeof setor.cidade === "object" ? setor.cidade?.nome : setor.cidade;
      return nomeCidadeSetor === formData.cidade;
    });
  }, [formData.cidade, setores]);

  // Verificar se forma de pagamento é cartão - usar useMemo para estabilizar
  const isFormaPagamentoCartao = React.useMemo(() => {
    return (
      formData.formaPagamento &&
      formasPagamento
        .find((f) => f.id.toString() === formData.formaPagamento)
        ?.nome?.toLowerCase()
        .includes("cartão")
    );
  }, [formData.formaPagamento, formasPagamento]);

  // Verificar se forma de pagamento é boleto - usar função padronizada
  const isBoleto = React.useMemo(() => {
    if (!formData.formaPagamento || formasPagamento.length === 0) {
      return false;
    }

    const forma = formasPagamento.find(
      (f) => f.id.toString() === formData.formaPagamento,
    );

    return isFormaPagamentoBoleto(forma);
  }, [formData.formaPagamento, formasPagamento]);

  // Buscar percentual de imposto das configurações
  const getPercentualImposto = () => {
    try {
      const savedConfigs = localStorage.getItem("userConfigs");
      if (savedConfigs) {
        const configs = JSON.parse(savedConfigs);
        return configs.percentualImposto || 6; // 6% é o padrão
      }
    } catch (error) {
      console.error("Erro ao carregar percentual de imposto:", error);
    }
    return 6; // Valor padrão
  };

  // Calcular campos automaticamente
  const valorCalculado = parseFloat(formData.valor) || 0;
  const valorQueEntrouCalculado =
    parseFloat(formData.valorQueEntrou) || valorCalculado;

  // Calcular imposto apenas se tem nota fiscal
  const percentualImposto = getPercentualImposto();
  const impostoCalculado = formData.temNotaFiscal
    ? (valorCalculado * percentualImposto) / 100
    : 0;

  // Debug log para verificar cálculo
  if (formData.temNotaFiscal && valorCalculado > 0) {
    console.log(
      `[ModalReceita] Calculando imposto: ${valorCalculado} * ${percentualImposto}% = R$ ${impostoCalculado.toFixed(2)}`,
    );
  }

  // Valor líquido descontando o imposto se houver nota fiscal
  const valorLiquidoCalculado = valorQueEntrouCalculado - impostoCalculado;

  // Calcular comissão baseada no percentual do técnico
  const comissaoCalculada = (() => {
    if (formData.tecnicoResponsavel) {
      const tecnico = tecnicos.find(
        (t) => t.id.toString() === formData.tecnicoResponsavel,
      );

      if (tecnico) {
        // Usar percentualComissao ou percentualServico como fallback
        const percentual =
          tecnico.percentualComissao || tecnico.percentualServico || 0;
        if (percentual > 0) {
          return valorLiquidoCalculado * (percentual / 100);
        }
      }
    }
    return 0;
  })();

  // Remover useEffect que causa piscar da tela - valores calculados serão mostrados apenas no resumo

  // Remover useEffect que causa piscar ao resetar valorQueEntrou

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
      categoria: "",
      descricao: "",
      descricaoId: "",
      formaPagamento: "",
      tecnicoResponsavel: "",
      cidade: "",
      setor: "",
      campanha: "",
      cliente: "",
      observacoes: "",
      numeroNota: "",
      temNotaFiscal: false,
    });
    setNotaFiscalEmitida(false);
    setDataVencimentoBoleto(null);
  };

  // Função removida - o contexto já atualiza automaticamente após adicionar lançamento

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
      // Gerar código único do serviço se for boleto
      let codigoServico = undefined;
      if (isBoleto) {
        codigoServico = `SRV-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      }

      // Buscar objetos completos para criar snapshots
      const clienteSelecionado = clientes.find(
        (c) => c.id === formData.cliente || c.id.toString() === formData.cliente,
      );

      const lancamentoCaixa = await adicionarLancamento({
        data: new Date(formData.data),
        tipo: "receita",
        valor: valorCalculado,
        valorLiquido: valorLiquidoCalculado,
        valorQueEntrou: valorQueEntrouCalculado,
        imposto: impostoCalculado, // Incluir o imposto calculado
        // Não enviar comissao - deixar o servidor calcular automaticamente
        descricao: formData.descricao,
        formaPagamento: formData.formaPagamento,
        tecnicoResponsavel: formData.tecnicoResponsavel || undefined,
        setor: formData.setor || undefined,
        campanha: formData.campanha || undefined,

        // Incluir snapshot do cliente para preservar dados históricos
        cliente: clienteSelecionado
          ? {
              id: clienteSelecionado.id,
              nome: clienteSelecionado.nome,
            }
          : undefined,
        clienteId: clienteSelecionado?.id || formData.cliente || undefined,

        observacoes: formData.observacoes || undefined,
        numeroNota: formData.numeroNota || undefined,

        // Campos de integração para boletos
        codigoServico: codigoServico,
        sistemaOrigem: isBoleto ? "caixa_boleto" : undefined,
      });

      // Se for boleto, criar conta a receber automaticamente
      if (isBoleto && dataVencimentoBoleto && codigoServico) {
        try {
          // Criar conta a receber
          const contaData = {
            tipo: "receber",
            valor: valorCalculado,
            dataVencimento: dataVencimentoBoleto.toISOString().split("T")[0], // YYYY-MM-DD
            codigoCliente: parseInt(formData.cliente), // Usar codigoCliente como esperado pela API
            valorOriginal: valorCalculado, // Adicionar campo obrigatório
            valorLiquido: valorLiquidoCalculado || valorCalculado, // Adicionar campo obrigatório
            observacoes: `[BOLETO AUTOMÁTICO] ${formData.categoria} - ${formData.descricao}${formData.observacoes ? ` | Obs: ${formData.observacoes}` : ""} | Cód: ${codigoServico}`,
            codigoServico: codigoServico,
            categoria: formData.categoria,
            descricao: formData.descricao,
            pago: false,
            sistemaOrigem: "caixa_boleto",
            status: "pendente",
            prioridadePagamento: "normal",
            // Adicionar campos para integração
            lancamentoCaixaId: lancamentoCaixa?.id, // Vincular com o lançamento do caixa
          };

          // Fazer chamada para API de contas
          const response = await fetch("/api/contas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contaData),
          });

          // Ler o response uma única vez para evitar "body stream already read"
          let responseData;
          try {
            // Verificar se o response ainda está disponível para leitura
            if (response.bodyUsed) {
              console.warn("⚠️ [ModalReceita] Response body já foi consumido");
              responseData = null;
            } else {
              // Verificar se há conteúdo para fazer parse
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
              } else {
                // Se não é JSON, tentar ler como texto
                const textResponse = await response.text();
                responseData = textResponse ? { error: textResponse } : null;
              }
            }
          } catch (parseError) {
            console.error(
              "❌ [ModalReceita] Erro ao fazer parse da resposta:",
              parseError,
            );
            // Fornecer informações mais detalhadas do erro
            responseData = {
              error: "Erro ao processar resposta do servidor",
              details: parseError.message
            };
          }

          if (response.ok) {
            console.log(
              "✅ [ModalReceita] Conta a receber criada automaticamente para boleto:",
              responseData,
            );
          } else {
            console.error(
              "❌ [ModalReceita] Erro ao criar conta a receber para boleto:",
              responseData,
            );

            console.log("🔍 [ModalReceita] Dados enviados:", contaData);
            console.log("🔍 [ModalReceita] Status da resposta:", response.status);

            // Detectar se é erro de cliente não encontrado
            const isClienteError = responseData?.error?.includes('Cliente com ID') && responseData?.error?.includes('não encontrado');

            toast({
              title: "Atenção",
              description: isClienteError
                ? "Receita lançada no Caixa, mas o cliente selecionado não foi encontrado. Verifique se o cliente existe no cadastro."
                : "Receita lançada no Caixa, mas houve erro ao criar conta a receber automaticamente. Verifique o módulo Contas.",
              variant: "destructive",
            });
          }
        } catch (contaError) {
          console.error(
            "❌ [ModalReceita] Erro na integração com contas a receber:",
            contaError,
          );

          toast({
            title: "Atenção",
            description:
              "Receita lançada no Caixa, mas houve erro na integração com Contas a Receber.",
            variant: "destructive",
          });
        }
      } else if (isBoleto) {
        // Caso especial: boleto sem data de vencimento ou código (já validado antes)
        toast({
          title: "Boleto registrado!",
          description: `Receita de boleto lançada. O valor entrará no caixa quando for pago.`,
          variant: "default",
        });
      }

      toast({
        title: "Sucesso",
        description: isBoleto
          ? `Boleto registrado com sucesso! Receita lançada no Caixa e conta a receber criada automaticamente. Vencimento: ${dataVencimentoBoleto?.toLocaleDateString("pt-BR")}`
          : "Receita lançada com sucesso!",
        variant: "default",
      });

      resetForm();
      setIsOpen(false);

      // Não recarregar a página toda, apenas aguardar contexto atualizar
      console.log("[ModalReceita] Lançamento salvo, modal fechado");
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

  // Estado para forçar desbloqueio após timeout
  const [loadingForced, setLoadingForced] = useState(false);

  // Timeout de segurança para forçar loading=false
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!loadingForced) {
        setLoadingForced(true);
      }
    }, 3000); // 3 segundos m��ximo

    return () => clearTimeout(timer);
  }, [loadingForced]);

  // Loading com timeout de segurança
  const isLoading =
    !loadingForced && (caixaLoading || entidadesLoading || clientesLoading);

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
          <div>
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
                      setFormData((prev) => ({
                        ...prev,
                        valor: e.target.value,
                      }))
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
                        descricaoId: "", // Limpar ID da descrição quando categoria muda
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

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição do Serviço *</Label>
                  <Select
                    value={formData.descricaoId}
                    onValueChange={(value) => {
                      // Buscar a descriç��o selecionada para salvar o nome e ID
                      const descricaoSelecionada = descricoesFiltradas.find(
                        (d) => d.id?.toString() === value,
                      );
                      setFormData((prev) => ({
                        ...prev,
                        descricaoId: value,
                        descricao: descricaoSelecionada?.nome || "",
                      }));
                    }}
                    disabled={!formData.categoria}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          formData.categoria
                            ? "Selecione a descrição"
                            : "Primeiro selecione uma categoria"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {descricoesFiltradas.length > 0 ? (
                        descricoesFiltradas.map((desc) => (
                          <SelectItem key={desc.id} value={desc.id.toString()}>
                            {desc.nome}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-gray-500">
                          {formData.categoria
                            ? "Nenhuma descrição encontrada para esta categoria"
                            : "Selecione uma categoria primeiro"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                  <Select
                    value={formData.formaPagamento}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        formaPagamento: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma" />
                    </SelectTrigger>
                    <SelectContent>
                      {formasPagamento.map((forma) => (
                        <SelectItem key={forma.id} value={forma.id.toString()}>
                          {forma.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

              {/* Técnico e Campanha na mesma linha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tecnicoResponsavel">
                    Técnico Responsável
                  </Label>
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
                          .map((tecnico) => {
                            const percentual =
                              tecnico.percentualComissao ||
                              tecnico.percentualServico ||
                              0;
                            return (
                              <SelectItem
                                key={tecnico.id}
                                value={tecnico.id.toString()}
                              >
                                {tecnico.nome || tecnico.nomeCompleto}
                                {percentual > 0 && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({percentual}% comissão)
                                  </span>
                                )}
                              </SelectItem>
                            );
                          })
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campanha">Campanha</Label>
                  <Select
                    value={formData.campanha}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, campanha: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a campanha" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(campanhas) ? campanhas : []).map(
                        (campanha) => (
                          <SelectItem
                            key={campanha.id}
                            value={campanha.id.toString()}
                          >
                            {campanha.nome}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cidade e Setor na mesma linha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Select
                    value={formData.cidade}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        cidade: value,
                        setor: "", // Limpar setor quando cidade muda
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(cidades) ? cidades : []).map(
                        (cidade, index) => (
                          <SelectItem
                            key={`cidade-${index}-${cidade}`}
                            value={cidade}
                          >
                            {cidade}
                          </SelectItem>
                        ),
                      )}
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
                      <SelectValue
                        placeholder={
                          formData.cidade
                            ? "Selecione o setor"
                            : "Primeiro selecione uma cidade"
                        }
                      />
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
                {isBoleto && !formData.cliente && (
                  <p className="text-xs text-red-500">
                    Cliente é obrigatório quando a forma de pagamento for boleto
                  </p>
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
                      ⚠️ Data de vencimento é obrigatória para boletos
                    </p>
                  )}

                  <div className="bg-blue-100 p-3 rounded border-l-4 border-blue-400">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      🔄 Integração Automática Caixa + Contas a Receber
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>
                        • <strong>Agora:</strong> Lança receita bruta no Caixa
                        (não soma no saldo)
                      </li>
                      <li>
                        • <strong>Agora:</strong> Cria automaticamente conta a
                        receber
                      </li>
                      <li>
                        • <strong>Quando pago:</strong> Marque como pago em
                        Contas a Receber
                      </li>
                      <li>
                        • <strong>Automático:</strong> Sistema lança receita
                        real no Caixa
                      </li>
                    </ul>
                  </div>
                </div>
              )}

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
                      <Label
                        htmlFor="numeroNotaObrigatorio"
                        className="text-sm"
                      >
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

              {/* Resumo financeiro */}
              {formData.valor && (
                <div
                  className={`p-4 rounded-lg ${isBoleto ? "bg-yellow-50 border border-yellow-200" : "bg-green-50"}`}
                >
                  <h4
                    className={`font-medium mb-2 ${isBoleto ? "text-yellow-800" : "text-green-800"}`}
                  >
                    {isBoleto
                      ? "Resumo Financeiro - BOLETO"
                      : "Resumo Financeiro"}
                  </h4>
                  {isBoleto && (
                    <div className="mb-3 p-2 bg-yellow-100 rounded border-l-4 border-yellow-400">
                      <p className="text-sm text-yellow-800">
                        <strong>ATENÇÃO:</strong> Como é um boleto, este valor
                        será registrado apenas como receita bruta. O valor não
                        entrará para a empresa até o pagamento do boleto.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Valor Total:</span>
                      <div className="font-medium">
                        R$ {parseFloat(formData.valor || "0").toFixed(2)}
                      </div>
                    </div>
                    {formData.temNotaFiscal && (
                      <div>
                        <span className="text-gray-600">
                          Imposto NF ({percentualImposto}%):
                        </span>
                        <div className="font-medium text-red-600">
                          - R$ {impostoCalculado.toFixed(2)}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">
                        Comissão:
                        {formData.tecnicoResponsavel &&
                          comissaoCalculada > 0 && (
                            <span className="ml-1 text-xs">
                              (
                              {(() => {
                                const tecnico = tecnicos.find(
                                  (t) =>
                                    t.id.toString() ===
                                    formData.tecnicoResponsavel,
                                );
                                const percentual =
                                  tecnico?.percentualComissao ||
                                  tecnico?.percentualServico ||
                                  0;
                                return percentual;
                              })()}
                              %)
                            </span>
                          )}
                      </span>
                      <div className="font-medium">
                        R$ {comissaoCalculada.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Para Empresa:</span>
                      <div
                        className={`font-medium ${isBoleto ? "text-yellow-600" : "text-green-600"}`}
                      >
                        R${" "}
                        {isBoleto
                          ? "0,00"
                          : (valorLiquidoCalculado - comissaoCalculada).toFixed(
                              2,
                            )}
                      </div>
                      {isBoleto && (
                        <p className="text-xs text-yellow-600 mt-1">
                          (Valor será creditado após pagamento do boleto)
                        </p>
                      )}
                    </div>
                  </div>
                  {formData.temNotaFiscal && (
                    <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700">
                      💡 <strong>Imposto NF:</strong> {percentualImposto}%
                      aplicado automaticamente sobre o valor total
                      <br />
                      <span className="text-blue-600">
                        Este percentual pode ser alterado em Configurações →
                        Percentual de Imposto (NF)
                      </span>
                    </div>
                  )}
                  {formData.tecnicoResponsavel && comissaoCalculada === 0 && (
                    <div className="mt-2 text-xs text-amber-600">
                      ⚠️ Técnico selecionado não possui percentual de comissão
                      configurado
                    </div>
                  )}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
