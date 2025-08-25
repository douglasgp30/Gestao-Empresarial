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
import { useEntidades } from "@/contexts/EntidadesContext";
import { useClientes } from "@/contexts/ClientesContext";
import { ContaLancamento } from "@shared/types";
import { useCurrencyInput } from "@/hooks/use-currency-input";
import {
  CalendarIcon,
  Plus,
  Receipt,
  UserPlus,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ModalCadastroCliente from "@/components/Clientes/ModalCadastroCliente";
import ModalClienteSimples from "@/components/Clientes/ModalClienteSimples";
import SelectWithAdd from "@/components/ui/select-with-add";

interface ModalContasReceberProps {
  contaParaEditar?: ContaLancamento;
  onSuccess?: () => void;
}

export function ModalContasReceber({
  contaParaEditar,
  onSuccess,
}: ModalContasReceberProps) {
  const { toast } = useToast();
  const { adicionarConta, atualizarConta } = useContas();

  // Usar contextos separados para obter os dados
  const { clientes, adicionarCliente } = useClientes();
  const {
    descricoes,
    formasPagamento,
    adicionarDescricao,
    adicionarFormaPagamento,
    categorias: entidadesCategorias,
    adicionarCategoria,
  } = useEntidades();

  const [isOpen, setIsOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [isModalClienteOpen, setIsModalClienteOpen] = useState(false);
  const [formData, setFormData] = useState({
    valor: "",
    dataVencimento: new Date(),
    codigoCliente: "",
    formaPg: "",
    observacoes: "",
    descricao: "",
    categoria: "",
    pago: false,
    dataPagamento: undefined as Date | undefined,
  });

  const valorInput = useCurrencyInput();

  // Filtrar descrições de receita para contas a receber
  const descricoesReceita = descricoes.filter((d) => d.tipo === "receita");

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      valor: "",
      dataVencimento: new Date(),
      codigoCliente: "",
      formaPg: "",
      observacoes: "",
      descricao: "",
      categoria: "",
      pago: false,
      dataPagamento: undefined,
    });
    valorInput.reset();
  };

  // Preencher formulário quando houver conta para editar
  useEffect(() => {
    if (contaParaEditar && isOpen) {
      setFormData({
        valor: contaParaEditar.valor.toString(),
        dataVencimento: contaParaEditar.dataVencimento,
        codigoCliente: contaParaEditar.codigoCliente?.toString() || "",
        formaPg: contaParaEditar.formaPg?.toString() || "",
        observacoes: contaParaEditar.observacoes || "",
        descricao: contaParaEditar.descricao || "",
        categoria: contaParaEditar.categoria?.nome || "",
        pago: contaParaEditar.pago,
        dataPagamento: contaParaEditar.dataPagamento
          ? new Date(contaParaEditar.dataPagamento)
          : undefined,
      });
      valorInput.setValue(contaParaEditar.valor);
    }
  }, [contaParaEditar, isOpen, valorInput.setValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (valorInput.numericValue <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido",
        variant: "destructive",
      });
      return;
    }

    if (!formData.codigoCliente) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um cliente",
        variant: "destructive",
      });
      return;
    }

    if (!formData.formaPg) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma forma de pagamento",
        variant: "destructive",
      });
      return;
    }

    setSalvando(true);

    try {
      const valorNumerico = valorInput.numericValue;

      const contaData = {
        tipo: "receber" as const,
        valor: valorNumerico,
        dataVencimento: formData.dataVencimento,
        codigoCliente: parseInt(formData.codigoCliente),
        formaPg: parseInt(formData.formaPg),
        observacoes: formData.observacoes,
        descricao: formData.descricao,
        categoria: formData.categoria
          ? { nome: formData.categoria }
          : undefined,
        pago: formData.pago,
        dataPagamento: formData.dataPagamento,
      };

      if (contaParaEditar) {
        await atualizarConta(contaParaEditar.codLancamentoContas, contaData);
        toast({
          title: "Sucesso",
          description: "Conta a receber atualizada com sucesso!",
        });
      } else {
        await adicionarConta(contaData);
        toast({
          title: "Sucesso",
          description: "Conta a receber adicionada com sucesso!",
        });
      }

      resetForm();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Receipt className="mr-2 h-4 w-4" />
          {contaParaEditar ? "Editar" : "A Receber"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-600">
            {contaParaEditar
              ? "Editar Conta a Receber"
              : "Nova Conta a Receber"}
          </DialogTitle>
          <DialogDescription>
            {contaParaEditar
              ? "Atualize os dados da conta a receber"
              : "Adicione uma nova conta a receber ao sistema"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor *</Label>
            <Input id="valor" {...valorInput.inputProps} required />
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
                  {formData.dataVencimento ? (
                    format(formData.dataVencimento, "dd/MM/yyyy", {
                      locale: ptBR,
                    })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
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

          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <div className="flex gap-2">
              <Select
                value={formData.codigoCliente}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, codigoCliente: value }))
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setIsModalClienteOpen(true)}
                title="Adicionar Cliente"
              >
                <UserPlus className="h-4 w-4" />
              </Button>

              <ModalClienteSimples
                isOpen={isModalClienteOpen}
                onClose={() => setIsModalClienteOpen(false)}
                onClienteAdicionado={(cliente) => {
                  setFormData((prev) => ({
                    ...prev,
                    codigoCliente: cliente.id,
                  }));
                  toast({
                    title: "Cliente Adicionado",
                    description: `Cliente "${cliente.nome}" foi cadastrado e selecionado.`,
                    variant: "default",
                  });
                }}
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <SelectWithAdd
              placeholder="Selecione uma categoria"
              value={formData.categoria}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, categoria: value }))
              }
              options={entidadesCategorias.map((cat) => ({
                value: cat.nome,
                label: cat.nome,
              }))}
              onAddNew={async (novaCategoria) => {
                try {
                  await adicionarCategoria({
                    nome: novaCategoria,
                    tipo: "receita",
                  });
                  toast({
                    title: "Sucesso",
                    description: "Categoria adicionada com sucesso!",
                  });
                  return true;
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Erro ao adicionar categoria",
                    variant: "destructive",
                  });
                  return false;
                }
              }}
              addButtonText="Nova Categoria"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <SelectWithAdd
              placeholder="Selecione uma descrição"
              value={formData.descricao}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, descricao: value }))
              }
              options={descricoesReceita.map((desc) => ({
                value: desc.nome,
                label: desc.nome,
              }))}
              onAddNew={async (novaDescricao) => {
                try {
                  await adicionarDescricao({
                    nome: novaDescricao,
                    tipo: "receita",
                  });
                  toast({
                    title: "Sucesso",
                    description: "Descrição adicionada com sucesso!",
                  });
                  return true;
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Erro ao adicionar descrição",
                    variant: "destructive",
                  });
                  return false;
                }
              }}
              addButtonText="Nova Descrição"
            />
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
            <SelectWithAdd
              placeholder="Selecione uma forma de pagamento"
              value={formData.formaPg}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, formaPg: value }))
              }
              options={formasPagamento.map((forma) => ({
                value: forma.id.toString(),
                label: forma.nome,
              }))}
              onAddNew={async (novaForma) => {
                try {
                  await adicionarFormaPagamento({ nome: novaForma });
                  toast({
                    title: "Sucesso",
                    description: "Forma de pagamento adicionada com sucesso!",
                  });
                  return true;
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Erro ao adicionar forma de pagamento",
                    variant: "destructive",
                  });
                  return false;
                }
              }}
              addButtonText="Nova Forma"
            />
          </div>

          {/* Observa��ões */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais..."
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

          {/* Pago */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pago"
              checked={formData.pago}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, pago: !!checked }))
              }
            />
            <Label htmlFor="pago">Marcar como pago</Label>
          </div>

          {/* Data de Pagamento (apenas se marcado como pago) */}
          {formData.pago && (
            <div className="space-y-2">
              <Label>Data de Pagamento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataPagamento ? (
                      format(formData.dataPagamento, "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataPagamento}
                    onSelect={(date) => {
                      if (date) {
                        setFormData((prev) => ({
                          ...prev,
                          dataPagamento: date,
                        }));
                      }
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvando}
              className="bg-green-600 hover:bg-green-700"
            >
              {salvando
                ? "Salvando..."
                : contaParaEditar
                  ? "Atualizar"
                  : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
