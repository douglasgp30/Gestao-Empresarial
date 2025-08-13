import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useContas } from "@/contexts/ContasContext";
import { ContaLancamento } from "@shared/types";
import { useCurrencyInput } from "@/hooks/use-currency-input";
import { CalendarIcon, Plus, Receipt, Building2, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ModalContasPagarProps {
  contaParaEditar?: ContaLancamento;
  onSuccess?: () => void;
}

export function ModalContasPagar({ contaParaEditar, onSuccess }: ModalContasPagarProps) {
  const { toast } = useToast();
  const {
    adicionarConta,
    atualizarConta,
    fornecedores,
    formasPagamento,
    categorias,
  } = useContas();

  const [isOpen, setIsOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    valor: "",
    dataVencimento: new Date(),
    codigoFornecedor: "",
    conta: "empresa" as "empresa" | "pessoal",
    formaPg: "",
    observacoes: "",
    descricaoCategoria: "0",
    pago: false,
    dataPagamento: undefined as Date | undefined,
    numeroDocumento: "",
    numeroNF: "",
  });

  const {
    value: valorFormatado,
    onChange: onValorChange,
    setValue: setValor,
  } = useCurrencyInput();

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      valor: "",
      dataVencimento: new Date(),
      codigoFornecedor: "",
      conta: "empresa",
      formaPg: "",
      observacoes: "",
      descricaoCategoria: "0",
      pago: false,
      dataPagamento: undefined,
      numeroDocumento: "",
      numeroNF: "",
    });
    setValor("");
  };

  // Preencher formulário quando houver conta para editar
  useEffect(() => {
    if (contaParaEditar && isOpen) {
      setFormData({
        valor: contaParaEditar.valor.toString(),
        dataVencimento: contaParaEditar.dataVencimento,
        codigoFornecedor: contaParaEditar.codigoFornecedor?.toString() || "",
        conta: contaParaEditar.conta,
        formaPg: contaParaEditar.formaPg?.toString() || "",
        observacoes: contaParaEditar.observacoes || "",
        descricaoCategoria: contaParaEditar.descricaoCategoria?.toString() || "0",
        pago: contaParaEditar.pago,
        dataPagamento: contaParaEditar.dataPagamento,
        numeroDocumento: "",
        numeroNF: "",
      });
      setValor(contaParaEditar.valor.toString());
    } else if (isOpen && !contaParaEditar) {
      resetForm();
    }
  }, [contaParaEditar, isOpen, setValor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      // Validações obrigatórias
      const valorNumerico = parseFloat(
        valorFormatado.replace(/[^\d,]/g, "").replace(",", "."),
      );

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

      if (!formData.codigoFornecedor) {
        toast({
          title: "Erro de Validação",
          description: "Selecione um fornecedor para a conta a pagar.",
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
        codigoFornecedor: parseInt(formData.codigoFornecedor),
        tipo: "pagar" as const,
        conta: formData.conta,
        formaPg: formData.pago && formData.formaPg ? parseInt(formData.formaPg) : undefined,
        observacoes: formData.observacoes || undefined,
        descricaoCategoria: formData.descricaoCategoria && formData.descricaoCategoria !== "0"
          ? parseInt(formData.descricaoCategoria)
          : undefined,
        pago: formData.pago,
        dataPagamento: formData.pago
          ? formData.dataPagamento || new Date()
          : undefined,
      };

      console.log("🔍 [MODAL CONTAS PAGAR] Enviando dados:", dadosConta);

      if (contaParaEditar) {
        await atualizarConta(contaParaEditar.codLancamentoContas, dadosConta);
        toast({
          title: "Sucesso",
          description: "Conta a pagar atualizada com sucesso!",
        });
      } else {
        await adicionarConta(dadosConta);
        toast({
          title: "Sucesso",
          description: "Conta a pagar adicionada com sucesso!",
        });
      }

      resetForm();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("❌ [MODAL CONTAS PAGAR] Erro ao salvar conta:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="default"
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Nova Conta a Pagar
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-lg sm:text-xl">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
            {contaParaEditar ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {contaParaEditar ? "Atualize os dados da conta a pagar" : "Registre uma nova conta a pagar para fornecedor"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Fornecedor e Conta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigoFornecedor">Fornecedor *</Label>
              <Select
                value={formData.codigoFornecedor}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, codigoFornecedor: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((fornecedor) => (
                    <SelectItem
                      key={fornecedor.id}
                      value={fornecedor.id.toString()}
                    >
                      {fornecedor.nome} 
                      {fornecedor.telefone && ` - ${fornecedor.telefone}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta">Conta *</Label>
              <Select
                value={formData.conta}
                onValueChange={(value: "empresa" | "pessoal") =>
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
          </div>

          {/* Documentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroDocumento">Número do Documento</Label>
              <Input
                id="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, numeroDocumento: e.target.value }))
                }
                placeholder="Ex: DOC-001, REF-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroNF">Número da Nota Fiscal</Label>
              <Input
                id="numeroNF"
                value={formData.numeroNF}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, numeroNF: e.target.value }))
                }
                placeholder="Ex: NF-12345"
              />
            </div>
          </div>

          {/* Valor e Data de Vencimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                value={valorFormatado}
                onChange={onValorChange}
                placeholder="R$ 0,00"
                className="text-lg font-medium text-red-600"
                required
              />
              <p className="text-xs text-muted-foreground">
                Valor a ser pago ao fornecedor
              </p>
            </div>

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
                      ? format(formData.dataVencimento, "dd/MM/yyyy", {
                          locale: ptBR,
                        })
                      : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataVencimento}
                    onSelect={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        dataVencimento: date || new Date(),
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Data limite para pagamento
              </p>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={formData.descricaoCategoria}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, descricaoCategoria: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Nenhuma</SelectItem>
                {categorias
                  .filter(cat => cat.tipo === "despesa")
                  .map((categoria) => (
                    <SelectItem
                      key={categoria.id}
                      value={categoria.id.toString()}
                    >
                      {categoria.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status de Pagamento */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pago"
              checked={formData.pago}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, pago: checked as boolean }))
              }
            />
            <Label htmlFor="pago" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Conta já foi paga
            </Label>
          </div>

          {/* Forma de Pagamento (só aparece se está pago) */}
          {formData.pago && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formaPg">Forma de Pagamento *</Label>
                <Select
                  value={formData.formaPg}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, formaPg: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Como foi pago?" />
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

              <div className="space-y-2">
                <Label>Data do Pagamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dataPagamento
                        ? format(formData.dataPagamento, "dd/MM/yyyy", { locale: ptBR })
                        : "Data do pagamento"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dataPagamento}
                      onSelect={(date) =>
                        setFormData((prev) => ({ ...prev, dataPagamento: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  observacoes: e.target.value,
                }))
              }
              placeholder="Observações sobre a conta a pagar (opcional)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Informações adicionais sobre este pagamento
            </p>
          </div>

          {/* Botões */}
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
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : contaParaEditar ? "Atualizar Conta" : "Adicionar Conta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
