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
import { toast } from "../ui/use-toast";
import { TrendingDown } from "lucide-react";

export function ModalDespesa() {
  const { adicionarLancamento, isLoading: caixaLoading } = useCaixa();
  const { 
    descricoes, 
    formasPagamento, 
    setores, 
    isLoading: entidadesLoading 
  } = useEntidades();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    valor: "",
    descricao: "",
    formaPagamento: "",
    setor: "",
    observacoes: "",
    numeroNota: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar descrições de despesa
  const descricoesDespesa = descricoes.filter(d => d.tipo === 'despesa');

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      valor: "",
      descricao: "",
      formaPagamento: "",
      setor: "",
      observacoes: "",
      numeroNota: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações robustas
    const erros = [];

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      erros.push("Valor deve ser maior que zero");
    }

    if (!formData.descricao) {
      erros.push("Descrição é obrigatória");
    }

    if (!formData.formaPagamento) {
      erros.push("Forma de pagamento é obrigatória");
    }

    if (erros.length > 0) {
      toast({
        title: "Erro de Validação",
        description: erros.join(". "),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await adicionarLancamento({
        data: new Date(formData.data),
        tipo: "despesa",
        valor: parseFloat(formData.valor),
        descricao: formData.descricao,
        formaPagamento: formData.formaPagamento,
        setor: formData.setor || undefined,
        observacoes: formData.observacoes || undefined,
        numeroNota: formData.numeroNota || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Despesa lançada com sucesso!",
        variant: "default"
      });

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao lançar despesa:', error);
      toast({
        title: "Erro",
        description: "Erro ao lançar despesa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = caixaLoading || entidadesLoading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <TrendingDown className="h-4 w-4 mr-2" />
          Lançar Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <TrendingDown className="h-5 w-5" />
            Lançar Despesa
          </DialogTitle>
          <DialogDescription>
            Registre uma nova saída do caixa
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-6">Carregando dados...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da Despesa *</Label>
                <Select
                  value={formData.descricao}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, descricao: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a descrição" />
                  </SelectTrigger>
                  <SelectContent>
                    {descricoesDespesa.map((desc) => (
                      <SelectItem key={desc.id} value={desc.id.toString()}>
                        {desc.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                <Select
                  value={formData.formaPagamento}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, formaPagamento: value }))}
                  required
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="setor">Setor/Região</Label>
                <Select
                  value={formData.setor}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, setor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((setor) => (
                      <SelectItem key={setor.id} value={setor.id.toString()}>
                        {setor.nome} - {setor.cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroNota">Número da Nota</Label>
                <Input
                  id="numeroNota"
                  placeholder="Ex: NF-001"
                  value={formData.numeroNota}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroNota: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais..."
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>

            {/* Resumo financeiro */}
            {formData.valor && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Resumo da Despesa</h4>
                <div className="text-sm">
                  <span className="text-gray-600">Valor a ser debitado:</span>
                  <div className="font-medium text-red-600 text-lg">
                    R$ {parseFloat(formData.valor || "0").toFixed(2)}
                  </div>
                </div>
              </div>
            )}

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
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Lançando..." : "Lançar Despesa"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
