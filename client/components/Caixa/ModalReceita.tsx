import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "../ui/use-toast";
import { TrendingUp } from "lucide-react";
import {
  gerarDataHoraAutomatica,
  isFormaPagamentoCartao,
} from "../../lib/dateUtils";

export function ModalReceita() {
  const {
    adicionarLancamento,
    campanhas,
    isLoading: caixaLoading,
  } = useCaixa();
  const {
    descricoes,
    formasPagamento,
    tecnicos,
    setores,
    isLoading: entidadesLoading,
  } = useEntidades();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    valor: "",
    valorRecebido: "", // Novo campo obrigatório para cartão
    conta: "", // Novo campo obrigatório (empresa/pessoal)
    descricao: "",
    subdescricao: "", // Novo campo opcional
    formaPagamento: "",
    tecnicoResponsavel: "",
    setor: "",
    campanha: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar descrições de receita
  const descricoesReceita = descricoes.filter((d) => d.tipo === "receita");

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split("T")[0],
      valor: "",
      valorRecebido: "",
      conta: "",
      descricao: "",
      subdescricao: "",
      formaPagamento: "",
      tecnicoResponsavel: "",
      setor: "",
      campanha: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas obrigatórias
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

    if (!formData.conta) {
      erros.push("Conta é obrigatória");
    }

    // Validação específica: valorRecebido obrigatório para cartão
    const formaPagamentoSelecionada = formasPagamento.find(
      (f) => f.id.toString() === formData.formaPagamento,
    );
    const isCartao = formaPagamentoSelecionada
      ? isFormaPagamentoCartao(formaPagamentoSelecionada.nome)
      : false;

    if (
      isCartao &&
      (!formData.valorRecebido || parseFloat(formData.valorRecebido) <= 0)
    ) {
      erros.push(
        "Valor recebido é obrigatório e deve ser maior que zero para pagamentos no cartão",
      );
    }

    if (erros.length > 0) {
      toast({
        title: "Erro de Validação",
        description: erros.join(". "),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await adicionarLancamento({
        dataHora: gerarDataHoraAutomatica(),
        tipo: "receita",
        valor: parseFloat(formData.valor),
        valorRecebido: formData.valorRecebido
          ? parseFloat(formData.valorRecebido)
          : undefined,
        conta: formData.conta as "empresa" | "pessoal",
        descricaoId: parseInt(formData.descricao),
        subdescricaoId: formData.subdescricao && formData.subdescricao !== "none"
          ? parseInt(formData.subdescricao)
          : undefined,
        formaPagamentoId: parseInt(formData.formaPagamento),
        funcionarioId: formData.tecnicoResponsavel
          ? parseInt(formData.tecnicoResponsavel)
          : undefined,
        setorId: formData.setor ? parseInt(formData.setor) : undefined,
        campanhaId: formData.campanha ? parseInt(formData.campanha) : undefined,
      });

      toast({
        title: "Sucesso",
        description: "Receita lançada com sucesso!",
        variant: "default",
      });

      resetForm();
      setIsOpen(false);
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

  const isLoading = caixaLoading || entidadesLoading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <TrendingUp className="h-4 w-4 mr-2" />
          Lançar Receita
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            Lançar Receita
          </DialogTitle>
          <DialogDescription>
            Registre uma nova entrada no caixa
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-6">Carregando dados...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    setFormData((prev) => ({ ...prev, valor: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conta">Conta *</Label>
                <Select
                  value={formData.conta}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, conta: value }))
                  }
                  required
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

            {/* Campo valorRecebido (condicional para cartão) */}
            {(() => {
              const formaPagamentoSelecionada = formasPagamento.find(
                (f) => f.id.toString() === formData.formaPagamento,
              );
              const isCartao = formaPagamentoSelecionada
                ? isFormaPagamentoCartao(formaPagamentoSelecionada.nome)
                : false;

              if (isCartao) {
                return (
                  <div className="space-y-2">
                    <Label htmlFor="valorRecebido">Valor Recebido (R$) *</Label>
                    <Input
                      id="valorRecebido"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.valorRecebido}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          valorRecebido: e.target.value,
                        }))
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Obrigatório para pagamentos no cartão
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição do Serviço *</Label>
                <Select
                  value={formData.descricao}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, descricao: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a descrição" />
                  </SelectTrigger>
                  <SelectContent>
                    {descricoesReceita
                      .filter((desc) => desc.id != null && desc.id !== "" && desc.id !== 0)
                      .map((desc) => (
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
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, formaPagamento: value }))
                  }
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

            {/* Campo Subdescrição (opcional, dependente da descrição selecionada) */}
            {formData.descricao && (
              <div className="space-y-2">
                <Label htmlFor="subdescricao">Subdescrição</Label>
                <Select
                  value={formData.subdescricao}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, subdescricao: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a subdescrição (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {/* TODO: Filtrar subdescricoes baseado na descricao selecionada */}
                    {/* Por enquanto mostrando placeholder até implementar a API de subdescricoes */}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Detalhamento adicional da descrição (opcional)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tecnicoResponsavel">Técnico Responsável</Label>
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
                    {tecnicos.map((tecnico) => (
                      <SelectItem
                        key={tecnico.id}
                        value={tecnico.id.toString()}
                      >
                        {tecnico.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setor">Setor/Região</Label>
                <Select
                  value={formData.setor}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, setor: value }))
                  }
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
                    {campanhas.map((campanha) => (
                      <SelectItem
                        key={campanha.id}
                        value={campanha.id.toString()}
                      >
                        {campanha.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resumo dos dados preenchidos */}
            {formData.valor && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Resumo do Lançamento
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Valor:</span>
                    <div className="font-medium">
                      R$ {parseFloat(formData.valor || "0").toFixed(2)}
                    </div>
                  </div>
                  {formData.valorRecebido && (
                    <div>
                      <span className="text-gray-600">Valor Recebido:</span>
                      <div className="font-medium">
                        R${" "}
                        {parseFloat(formData.valorRecebido || "0").toFixed(2)}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Conta:</span>
                    <div className="font-medium capitalize">
                      {formData.conta}
                    </div>
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
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Lançando..." : "Lançar Receita"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
