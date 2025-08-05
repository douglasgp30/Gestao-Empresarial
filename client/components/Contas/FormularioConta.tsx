import React, { useState } from "react";
import { useContas } from "../../contexts/ContasContext";
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
import { Plus, TrendingDown, TrendingUp } from "lucide-react";

const tiposPagamento = [
  "Dinheiro",
  "Pix",
  "Cartão de Débito",
  "Cartão de Crédito",
  "Boleto",
  "Transferência",
  "Cheque",
];

export default function FormularioConta() {
  const { adicionarConta } = useContas();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pagar");

  const [formData, setFormData] = useState({
    dataVencimento: "",
    fornecedorCliente: "",
    tipoPagamento: "",
    valor: "",
    observacoes: "",
  });

  const resetForm = () => {
    setFormData({
      dataVencimento: "",
      fornecedorCliente: "",
      tipoPagamento: "",
      valor: "",
      observacoes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valor = parseFloat(formData.valor);
    if (!valor || valor <= 0) return;
    if (!formData.fornecedorCliente || !formData.dataVencimento) return;

    adicionarConta({
      tipo: activeTab as "pagar" | "receber",
      dataVencimento: new Date(formData.dataVencimento),
      fornecedorCliente: formData.fornecedorCliente,
      tipoPagamento: formData.tipoPagamento,
      valor,
      status: "pendente",
      observacoes: formData.observacoes || undefined,
    });

    resetForm();
    setIsOpen(false);
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
                <Label>Tipo de Pagamento</Label>
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
                    {tiposPagamento.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
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
                <Input
                  id="cliente"
                  value={formData.fornecedorCliente}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fornecedorCliente: e.target.value,
                    })
                  }
                  placeholder="Nome do cliente"
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
                <Label>Tipo de Pagamento</Label>
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
                    {tiposPagamento.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
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
