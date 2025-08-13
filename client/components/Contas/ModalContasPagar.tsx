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
import { ContaLancamento } from "@shared/types";
import { useCurrencyInput } from "@/hooks/use-currency-input";
import {
  CalendarIcon,
  Plus,
  Receipt,
  Building2,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import SelectWithAdd from "@/components/ui/select-with-add";

interface ModalContasPagarProps {
  contaParaEditar?: ContaLancamento;
  onSuccess?: () => void;
}

export function ModalContasPagar({
  contaParaEditar,
  onSuccess,
}: ModalContasPagarProps) {
  const { toast } = useToast();
  const { adicionarConta, atualizarConta, fornecedores, adicionarFornecedor } =
    useContas();

  // Usar contexto das entidades para obter dados compartilhados
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
  const [formData, setFormData] = useState({
    valor: "",
    dataVencimento: new Date(),
    codigoFornecedor: "",
    conta: "empresa" as "empresa" | "pessoal",
    formaPg: "",
    observacoes: "",
    descricao: "",
    categoria: "",
    pago: false,
    dataPagamento: undefined as Date | undefined,
    novoFornecedor: "",
  });

  const {
    value: valorFormatado,
    onChange: onValorChange,
    setValue: setValor,
  } = useCurrencyInput();

  // Filtrar descrições de despesa para contas a pagar
  const descricoesDespesa = descricoes.filter((d) => d.tipo === "despesa");

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      valor: "",
      dataVencimento: new Date(),
      codigoFornecedor: "",
      conta: "empresa",
      formaPg: "",
      observacoes: "",
      descricao: "",
      categoria: "",
      pago: false,
      dataPagamento: undefined,
      novoFornecedor: "",
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
        descricao: contaParaEditar.descricao || "",
        categoria: contaParaEditar.categoria?.nome || "",
        pago: contaParaEditar.pago,
        dataPagamento: contaParaEditar.dataPagamento
          ? new Date(contaParaEditar.dataPagamento)
          : undefined,
        novoFornecedor: "",
      });
      setValor(contaParaEditar.valor.toString());
    }
  }, [contaParaEditar, isOpen, setValor]);

  const handleAddFornecedor = async () => {
    if (!formData.novoFornecedor.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do fornecedor",
        variant: "destructive",
      });
      return;
    }

    try {
      const novoFornecedor = await adicionarFornecedor({
        nome: formData.novoFornecedor.trim(),
        email: "",
        telefone: "",
        endereco: "",
      });

      setFormData((prev) => ({
        ...prev,
        codigoFornecedor: novoFornecedor.id.toString(),
        novoFornecedor: "",
      }));

      toast({
        title: "Sucesso",
        description: "Fornecedor adicionado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar fornecedor",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !valorFormatado ||
      parseFloat(valorFormatado.replace(/[^\d,]/g, "").replace(",", ".")) <= 0
    ) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido",
        variant: "destructive",
      });
      return;
    }

    if (!formData.codigoFornecedor) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um fornecedor",
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
      const valorNumerico = parseFloat(
        valorFormatado.replace(/[^\d,]/g, "").replace(",", "."),
      );

      const contaData = {
        tipo: "pagar" as const,
        valor: valorNumerico,
        dataVencimento: formData.dataVencimento,
        codigoFornecedor: parseInt(formData.codigoFornecedor),
        conta: formData.conta,
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
          description: "Conta a pagar atualizada com sucesso!",
        });
      } else {
        await adicionarConta(contaData);
        toast({
          title: "Sucesso",
          description: "Conta a pagar adicionada com sucesso!",
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
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <CreditCard className="mr-2 h-4 w-4" />
          {contaParaEditar ? "Editar" : "A Pagar"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            {contaParaEditar ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
          </DialogTitle>
          <DialogDescription>
            {contaParaEditar
              ? "Atualize os dados da conta a pagar"
              : "Adicione uma nova conta a pagar ao sistema"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor *</Label>
            <Input
              id="valor"
              type="text"
              placeholder="R$ 0,00"
              value={valorFormatado}
              onChange={onValorChange}
              required
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
          </div>

          {/* Fornecedor */}
          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor *</Label>
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
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Opção para adicionar novo fornecedor */}
            <div className="flex gap-2">
              <Input
                placeholder="Novo fornecedor"
                value={formData.novoFornecedor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    novoFornecedor: e.target.value,
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddFornecedor}
                disabled={!formData.novoFornecedor.trim()}
              >
                <Building2 className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
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
                    tipo: "despesa",
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
              options={descricoesDespesa.map((desc) => ({
                value: desc.nome,
                label: desc.nome,
              }))}
              onAddNew={async (novaDescricao) => {
                try {
                  await adicionarDescricao({
                    nome: novaDescricao,
                    tipo: "despesa",
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

          {/* Conta */}
          <div className="space-y-2">
            <Label htmlFor="conta">Conta</Label>
            <Select
              value={formData.conta}
              onValueChange={(value: "empresa" | "pessoal") =>
                setFormData((prev) => ({ ...prev, conta: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empresa">Empresa</SelectItem>
                <SelectItem value="pessoal">Pessoal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
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
                    onSelect={(date) =>
                      setFormData((prev) => ({ ...prev, dataPagamento: date }))
                    }
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
              className="bg-red-600 hover:bg-red-700"
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
