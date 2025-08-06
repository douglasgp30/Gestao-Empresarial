import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
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
import { TrendingDown, Receipt } from "lucide-react";

const formasPagamento = [
  "Dinheiro",
  "Pix",
  "Cartão de Débito",
  "Cartão de Crédito",
  "Boleto",
  "Transferência",
];

const categoriasDespesa = [
  "Combustível",
  "Material de Trabalho",
  "Ferramentas",
  "Manutenção de Veículos",
  "Alimentação",
  "Telefone/Internet",
  "Água",
  "Energia Elétrica",
  "Aluguel",
  "Impostos",
  "Marketing",
  "Escritório",
  "Outros",
];

export default function FormularioDespesa() {
  const { adicionarLancamento } = useCaixa();
  const { descricoes, categorias, adicionarDescricao } = useEntidades();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewDescricaoOpen, setIsNewDescricaoOpen] = useState(false);

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    valor: "",
    formaPagamento: "",
    categoria: "",
    descricaoServico: "",
    observacoes: "",
  });

  const [novaDescricao, setNovaDescricao] = useState({
    nome: "",
    categoria: "",
    tipo: "despesa" as 'receita' | 'despesa',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valor = parseFloat(formData.valor);
    if (!valor || valor <= 0) return;

    if (!formData.descricaoServico.trim()) {
      alert('Por favor, selecione ou cadastre uma descrição da despesa.');
      return;
    }

    adicionarLancamento({
      tipo: "despesa",
      data: new Date(formData.data),
      valor,
      formaPagamento: formData.formaPagamento,
      categoria: formData.categoria,
      descricao: formData.descricaoServico,
    });

    // Reset form
    setFormData({
      data: new Date().toISOString().split("T")[0],
      valor: "",
      formaPagamento: "",
      categoria: "",
      descricaoServico: "",
      observacoes: "",
    });

    setIsOpen(false);
  };

  const handleAddDescricao = () => {
    if (!novaDescricao.nome.trim()) return;

    adicionarDescricao({
      nome: novaDescricao.nome,
      tipo: "despesa",
      categoria: novaDescricao.categoria || undefined,
    });

    setNovaDescricao({
      nome: "",
      categoria: "",
      tipo: "despesa",
    });

    setIsNewDescricaoOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <TrendingDown className="h-4 w-4" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-red-600" />
            Lançar Despesa
          </DialogTitle>
          <DialogDescription>Registre uma despesa da empresa</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
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
            <Label>Forma de Pagamento</Label>
            <Select
              value={formData.formaPagamento}
              onValueChange={(value) =>
                setFormData({ ...formData, formaPagamento: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma" />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((forma) => (
                  <SelectItem key={forma} value={forma}>
                    {forma}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria da Despesa</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) =>
                setFormData({ ...formData, categoria: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias
                  .filter(cat => cat.tipo === 'despesa')
                  .map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.nome}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Descrição da Despesa *
              <Dialog
                open={isNewDescricaoOpen}
                onOpenChange={setIsNewDescricaoOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    + Novo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Descrição</DialogTitle>
                    <DialogDescription>
                      Cadastre uma nova descrição de despesa
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeDescricao">Nome da Descrição *</Label>
                      <Input
                        id="nomeDescricao"
                        value={novaDescricao.nome}
                        onChange={(e) =>
                          setNovaDescricao({
                            ...novaDescricao,
                            nome: e.target.value,
                          })
                        }
                        placeholder="Ex: Combustível, Material de limpeza..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoriaDescricao">Categoria (Opcional)</Label>
                      <Select
                        value={novaDescricao.categoria}
                        onValueChange={(value) =>
                          setNovaDescricao({
                            ...novaDescricao,
                            categoria: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias
                            .filter(cat => cat.tipo === 'despesa')
                            .map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.nome}>
                              {categoria.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsNewDescricaoOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddDescricao}>
                        Adicionar Descrição
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </Label>
            <Select
              value={formData.descricaoServico}
              onValueChange={(value) =>
                setFormData({ ...formData, descricaoServico: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione ou cadastre a descrição *" />
              </SelectTrigger>
              <SelectContent>
                {descricoes
                  .filter((descricao) => descricao.tipo === 'despesa')
                  .map((descricao) => (
                  <SelectItem key={descricao.id} value={descricao.nome}>
                    {descricao.nome}
                    {descricao.categoria && (
                      <span className="text-muted-foreground"> - {descricao.categoria}</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (Opcional)</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Observações adicionais..."
              rows={2}
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
              Lançar Despesa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
