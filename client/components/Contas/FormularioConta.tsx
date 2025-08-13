import React, { useState } from "react";
import { useContas } from "../../contexts/ContasContext";
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
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Plus, TrendingDown, TrendingUp, UserPlus } from "lucide-react";
import ModalCadastroCliente from "../Clientes/ModalCadastroCliente";
import { toast } from "../ui/use-toast";

export default function FormularioConta() {
  const { adicionarConta } = useContas();
  const { formasPagamento } = useEntidades();
  const { clientes } = useClientes();

  console.log("[FormularioConta] Formas de pagamento:", formasPagamento);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pagar");

  const [formData, setFormData] = useState({
    dataVencimento: "",
    fornecedorCliente: "",
    cliente: "", // Para contas a receber - ID do cliente
    tipoPagamento: "",
    valor: "",
    observacoes: "",
  });

  const resetForm = () => {
    setFormData({
      dataVencimento: "",
      fornecedorCliente: "",
      cliente: "",
      tipoPagamento: "",
      valor: "",
      observacoes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valor = parseFloat(formData.valor);
    if (!valor || valor <= 0) return;

    // Para contas a receber, verificar se o cliente foi selecionado
    if (activeTab === "receber") {
      if (!formData.cliente || !formData.dataVencimento) return;
    } else {
      // Para contas a pagar, verificar fornecedor
      if (!formData.fornecedorCliente || !formData.dataVencimento) return;
    }

    // Buscar dados do cliente se for conta a receber
    const clienteSelecionado = activeTab === "receber" && formData.cliente
      ? clientes.find(c => c.id === formData.cliente)
      : null;

    const contaData = {
      tipo: activeTab as "pagar" | "receber",
      dataVencimento: new Date(formData.dataVencimento),
      // Para contas a receber, usar nome do cliente; para pagar, usar fornecedor
      fornecedorCliente: activeTab === "receber"
        ? clienteSelecionado?.nome || "Cliente não encontrado"
        : formData.fornecedorCliente,
      clienteId: activeTab === "receber" ? formData.cliente : undefined,
      tipoPagamento: formData.tipoPagamento,
      valor,
      status: "pendente",
      observacoes: formData.observacoes || undefined,
      descricao: activeTab === "receber"
        ? `Conta a receber - ${clienteSelecionado?.nome || "Cliente"}`
        : `Conta a pagar - ${formData.fornecedorCliente}`,
      dataCriacao: new Date(),
    };

    try {
      await adicionarConta(contaData);

      toast({
        title: "Conta Adicionada",
        description: `Conta ${activeTab === "receber" ? "a receber" : "a pagar"} foi criada com sucesso.`,
        variant: "default",
      });

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Conta</DialogTitle>
          <DialogDescription>
            Cadastre uma nova conta a pagar ou receber
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pagar" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />A Pagar
            </TabsTrigger>
            <TabsTrigger value="receber" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />A Receber
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pagar">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedorCliente}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fornecedorCliente: e.target.value,
                    })
                  }
                  placeholder="Nome do fornecedor"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vencimento">Data Vencimento</Label>
                  <Input
                    id="vencimento"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dataVencimento: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoPagamento">Tipo de Pagamento</Label>
                <Select
                  value={formData.tipoPagamento}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipoPagamento: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
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
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  placeholder="Observações sobre a conta..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive" className="flex-1">
                  Adicionar Conta a Pagar
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="receber">
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vencimento">Data Vencimento</Label>
                  <Input
                    id="vencimento"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dataVencimento: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoPagamento">Tipo de Pagamento</Label>
                <Select
                  value={formData.tipoPagamento}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipoPagamento: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map((forma) => (
                      <SelectItem key={forma.id} value={forma.id}>
                        {forma.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  placeholder="Observações sobre a conta..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Adicionar Conta a Receber
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
