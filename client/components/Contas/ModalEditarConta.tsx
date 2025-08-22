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
import { CalendarIcon, Edit, Receipt } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ModalEditarContaProps {
  conta: ContaLancamento;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ModalEditarConta({
  conta,
  trigger,
  onSuccess,
}: ModalEditarContaProps) {
  const { toast } = useToast();
  const {
    atualizarConta,
    clientes,
    fornecedores,
    formasPagamento,
    categorias,
  } = useContas();

  const [isOpen, setIsOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    valor: "",
    dataVencimento: new Date(),
    codigoCliente: "",
    codigoFornecedor: "",
    tipo: "receber" as "receber" | "pagar",
    formaPg: "",
    observacoes: "",
    descricaoCategoria: "0",
    pago: false,
    dataPagamento: undefined as Date | undefined,
  });

  const valorInput = useCurrencyInput();

  // Preencher formulário quando abrir o modal
  useEffect(() => {
    if (isOpen && conta) {
      setFormData({
        valor: conta.valor.toString(),
        dataVencimento: conta.dataVencimento,
        codigoCliente: conta.codigoCliente?.toString() || "",
        codigoFornecedor: conta.codigoFornecedor?.toString() || "",
        tipo: conta.tipo,
        formaPg: conta.formaPg?.toString() || "",
        observacoes: conta.observacoes || "",
        descricaoCategoria: conta.descricaoCategoria?.toString() || "0",
        pago: conta.pago,
        dataPagamento: conta.dataPagamento,
      });
      setValor(conta.valor.toString());
    }
  }, [isOpen, conta, setValor]);

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
        codigoCliente:
          formData.tipo === "receber"
            ? parseInt(formData.codigoCliente)
            : undefined,
        codigoFornecedor:
          formData.tipo === "pagar"
            ? parseInt(formData.codigoFornecedor)
            : undefined,
        tipo: formData.tipo,
        formaPg:
          formData.pago && formData.formaPg
            ? parseInt(formData.formaPg)
            : undefined,
        observacoes: formData.observacoes || undefined,
        descricaoCategoria:
          formData.descricaoCategoria && formData.descricaoCategoria !== "0"
            ? parseInt(formData.descricaoCategoria)
            : undefined,
        pago: formData.pago,
        dataPagamento: formData.pago ? formData.dataPagamento : undefined,
      };

      console.log("🔍 [MODAL EDITAR CONTA] Enviando dados:", dadosConta);

      await atualizarConta(conta.codLancamentoContas, dadosConta);
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso!",
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("❌ [MODAL EDITAR CONTA] Erro ao salvar conta:", error);
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
    setFormData((prev) => ({
      ...prev,
      tipo: novoTipo,
      codigoCliente: "", // Limpar cliente ao mudar tipo
      codigoFornecedor: "", // Limpar fornecedor ao mudar tipo
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600 text-lg sm:text-xl">
            <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
            Editar Conta
          </DialogTitle>
          <DialogDescription className="text-sm">
            Atualize os dados da conta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select value={formData.tipo} onValueChange={handleTipoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receber">Conta a Receber</SelectItem>
                <SelectItem value="pagar">Conta a Pagar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cliente/Fornecedor */}
          <div className="space-y-2">
            {formData.tipo === "receber" ? (
              <>
                <Label htmlFor="codigoCliente">Cliente *</Label>
                <Select
                  value={formData.codigoCliente}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, codigoCliente: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem
                        key={cliente.id}
                        value={cliente.id.toString()}
                      >
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
                    setFormData((prev) => ({
                      ...prev,
                      codigoFornecedor: value,
                    }))
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
                        {fornecedor.nome}{" "}
                        {fornecedor.telefone && `- ${fornecedor.telefone}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
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
                required
              />
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
                    onSelect={(date) => {
                      if (date) {
                        setFormData((prev) => ({
                          ...prev,
                          dataVencimento: date,
                        }));
                      }
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                {categorias.map((categoria) => (
                  <SelectItem
                    key={categoria.id}
                    value={categoria.id.toString()}
                  >
                    {categoria.nome} ({categoria.tipo})
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
                setFormData((prev) => ({ ...prev, pago: !!checked }))
              }
            />
            <Label htmlFor="pago" className="cursor-pointer">
              Conta já foi paga
            </Label>
          </div>

          {/* Forma de Pagamento (só aparece se está pago) */}
          {formData.pago && (
            <div className="space-y-2">
              <Label htmlFor="formaPg">Forma de Pagamento *</Label>
              <Select
                value={formData.formaPg}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, formaPg: value }))
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
                setFormData((prev) => ({
                  ...prev,
                  observacoes: e.target.value,
                }))
              }
              placeholder="Observaç��es sobre a conta"
              rows={3}
            />
          </div>

          {/* Botões */}
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Atualizar Conta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
