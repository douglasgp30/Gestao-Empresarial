import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContas } from "@/contexts/ContasContext";
import { ContaLancamento } from "@shared/types";
import { useCurrencyInput } from "@/hooks/use-currency-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FormularioContaProps {
  contaParaEditar?: ContaLancamento;
  onSuccess?: () => void;
}

export function FormularioConta({ contaParaEditar, onSuccess }: FormularioContaProps) {
  const { toast } = useToast();
  const { 
    adicionarConta, 
    atualizarConta, 
    clientes, 
    fornecedores, 
    formasPagamento, 
    categorias 
  } = useContas();

  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    valor: "",
    dataVencimento: new Date(),
    codigoCliente: "",
    codigoFornecedor: "",
    tipo: "receber" as "receber" | "pagar",
    conta: "empresa" as "empresa" | "pessoal",
    formaPg: "",
    observacoes: "",
    descricaoCategoria: "",
    pago: false,
    dataPagamento: undefined as Date | undefined,
  });

  const {
    value: valorFormatado,
    onChange: onValorChange,
    setValue: setValor,
  } = useCurrencyInput();

  // Preencher formulário quando houver conta para editar
  useEffect(() => {
    if (contaParaEditar) {
      setFormData({
        valor: contaParaEditar.valor.toString(),
        dataVencimento: contaParaEditar.dataVencimento,
        codigoCliente: contaParaEditar.codigoCliente?.toString() || "",
        codigoFornecedor: contaParaEditar.codigoFornecedor?.toString() || "",
        tipo: contaParaEditar.tipo,
        conta: contaParaEditar.conta,
        formaPg: contaParaEditar.formaPg?.toString() || "",
        observacoes: contaParaEditar.observacoes || "",
        descricaoCategoria: contaParaEditar.descricaoCategoria?.toString() || "",
        pago: contaParaEditar.pago,
        dataPagamento: contaParaEditar.dataPagamento,
      });
      setValor(contaParaEditar.valor.toString());
    }
  }, [contaParaEditar, setValor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      // Validações obrigatórias
      const valorNumerico = parseFloat(valorFormatado.replace(/[^\d,]/g, "").replace(",", "."));
      
      if (!valorNumerico || valorNumerico <= 0) {
        toast({
          title: "Erro de Validação",
          description: "Informe um valor válido.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.dataVencimento) {
        toast({
          title: "Erro de Validação",
          description: "Selecione a data de vencimento.",
          variant: "destructive",
        });
        return;
      }

      if (formData.tipo === "receber" && !formData.codigoCliente) {
        toast({
          title: "Erro de Validação",
          description: "Selecione um cliente para contas a receber.",
          variant: "destructive",
        });
        return;
      }

      if (formData.tipo === "pagar" && !formData.codigoFornecedor) {
        toast({
          title: "Erro de Validação",
          description: "Selecione um fornecedor para contas a pagar.",
          variant: "destructive",
        });
        return;
      }

      if (formData.pago && !formData.formaPg) {
        toast({
          title: "Erro de Validação",
          description: "Selecione uma forma de pagamento para contas pagas.",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para envio
      const dadosConta = {
        valor: valorNumerico,
        dataVencimento: formData.dataVencimento,
        codigoCliente: formData.tipo === "receber" ? parseInt(formData.codigoCliente) : undefined,
        codigoFornecedor: formData.tipo === "pagar" ? parseInt(formData.codigoFornecedor) : undefined,
        tipo: formData.tipo,
        conta: formData.conta,
        formaPg: formData.pago && formData.formaPg ? parseInt(formData.formaPg) : undefined,
        observacoes: formData.observacoes || undefined,
        descricaoCategoria: formData.descricaoCategoria ? parseInt(formData.descricaoCategoria) : undefined,
        pago: formData.pago,
        dataPagamento: formData.pago ? (formData.dataPagamento || new Date()) : undefined,
      };

      console.log("🔍 [FORM CONTA] Enviando dados:", dadosConta);

      if (contaParaEditar) {
        await atualizarConta(contaParaEditar.codLancamentoContas, dadosConta);
        toast({
          title: "Sucesso",
          description: "Conta atualizada com sucesso!",
        });
      } else {
        await adicionarConta(dadosConta);
        toast({
          title: "Sucesso",
          description: "Conta adicionada com sucesso!",
        });
      }

      // Limpar formulário após sucesso
      if (!contaParaEditar) {
        setFormData({
          valor: "",
          dataVencimento: new Date(),
          codigoCliente: "",
          codigoFornecedor: "",
          tipo: "receber",
          conta: "empresa",
          formaPg: "",
          observacoes: "",
          descricaoCategoria: "",
          pago: false,
          dataPagamento: undefined,
        });
        setValor("");
      }

      onSuccess?.();
    } catch (error) {
      console.error("❌ [FORM CONTA] Erro ao salvar conta:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleTipoChange = (novoTipo: "receber" | "pagar") => {
    setFormData(prev => ({
      ...prev,
      tipo: novoTipo,
      codigoCliente: "", // Limpar cliente ao mudar tipo
      codigoFornecedor: "", // Limpar fornecedor ao mudar tipo
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          {contaParaEditar ? "Editar Conta" : "Nova Conta"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={handleTipoChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receber">Conta a Receber</SelectItem>
                  <SelectItem value="pagar">Conta a Pagar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta">Conta *</Label>
              <Select
                value={formData.conta}
                onValueChange={(value: "empresa" | "pessoal") =>
                  setFormData(prev => ({ ...prev, conta: value }))
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
          </div>

          {/* Cliente/Fornecedor */}
          <div className="space-y-2">
            {formData.tipo === "receber" ? (
              <>
                <Label htmlFor="codigoCliente">Cliente *</Label>
                <Select
                  value={formData.codigoCliente}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, codigoCliente: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nome} - {cliente.telefonePrincipal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Label htmlFor="codigoFornecedor">Fornecedor *</Label>
                <Select
                  value={formData.codigoFornecedor}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, codigoFornecedor: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map((fornecedor) => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id.toString()}>
                        {fornecedor.nome} {fornecedor.telefone && `- ${fornecedor.telefone}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor *</Label>
            <Input
              id="valor"
              value={valorFormatado}
              onChange={onValorChange}
              placeholder="R$ 0,00"
            />
          </div>

          {/* Data de Vencimento */}
          <div className="space-y-2">
            <Label>Data de Vencimento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dataVencimento
                    ? format(formData.dataVencimento, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione a data"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dataVencimento}
                  onSelect={(date) =>
                    setFormData(prev => ({ ...prev, dataVencimento: date || new Date() }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={formData.descricaoCategoria}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, descricaoCategoria: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                    {categoria.nome} ({categoria.tipo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status de Pagamento */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="pago"
              checked={formData.pago}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, pago: e.target.checked }))
              }
              className="h-4 w-4"
            />
            <Label htmlFor="pago">Conta já foi paga</Label>
          </div>

          {/* Forma de Pagamento (só aparece se está pago) */}
          {formData.pago && (
            <div className="space-y-2">
              <Label htmlFor="formaPg">Forma de Pagamento *</Label>
              <Select
                value={formData.formaPg}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, formaPg: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
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
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, observacoes: e.target.value }))
              }
              placeholder="Observações sobre a conta"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={salvando}
            className="w-full"
          >
            {salvando && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {contaParaEditar ? "Atualizar Conta" : "Adicionar Conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
