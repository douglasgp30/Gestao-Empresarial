import React, { useState } from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import { useEntidades } from "../../contexts/EntidadesContext";
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
import { Switch } from "../ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DollarSign, TrendingUp, Calculator } from "lucide-react";

const formasPagamento = [
  "Dinheiro",
  "Pix",
  "Cartão de Débito",
  "Cartão de Crédito",
  "Boleto",
  "Transferência",
];

const tecnicos = [
  "João Silva",
  "Carlos Santos",
  "Roberto Lima",
  "Fernando Costa",
];

export default function FormularioReceita() {
  const { adicionarLancamento, campanhas, adicionarCampanha } = useCaixa();
  const { setores, adicionarSetor, cidades, adicionarCidade } = useEntidades();
  const { adicionarConta } = useContas();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewCampanhaOpen, setIsNewCampanhaOpen] = useState(false);
  const [isNewSetorOpen, setIsNewSetorOpen] = useState(false);
  const [isNewCidadeOpen, setIsNewCidadeOpen] = useState(false);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);
  const [boletoData, setBoletoData] = useState({
    valorTotal: 0,
    parcelas: 1,
    vencimentos: [] as Date[],
    cliente: "",
    descricao: "",
  });

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    valor: "",
    formaPagamento: "",
    tecnicoResponsavel: "",
    notaFiscal: false,
    setor: "",
    cidade: "",
    campanha: "",
    observacoes: "",
  });

  const [novaCampanha, setNovaCampanha] = useState({
    nome: "",
    descricao: "",
    dataInicio: new Date().toISOString().split("T")[0],
    dataFim: "",
  });

  const [novoSetor, setNovoSetor] = useState({
    nome: "",
  });

  const [novaCidade, setNovaCidade] = useState({
    nome: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valor = parseFloat(formData.valor);
    if (!valor || valor <= 0) return;

    let valorLiquido = valor;
    let descontoImposto = 0;

    // Aplicar desconto de imposto se nota fiscal
    if (formData.notaFiscal) {
      const percentualImposto = 6; // 6% de imposto
      descontoImposto = valor * (percentualImposto / 100);
      valorLiquido = valor - descontoImposto;
    }

    // Aplicar taxa do cartão se for cartão
    if (formData.formaPagamento.includes("Cartão")) {
      const taxaCartao =
        formData.formaPagamento === "Cartão de Débito" ? 2 : 3.5;
      const desconto = valorLiquido * (taxaCartao / 100);
      valorLiquido = valorLiquido - desconto;
    }

    // Se for boleto, abrir modal de parcelamento
    if (formData.formaPagamento === "Boleto") {
      setBoletoData({
        valorTotal: valor,
        parcelas: 1,
        vencimentos: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)], // 30 dias a partir de hoje
        cliente: formData.tecnicoResponsavel || "",
        descricao: `Serviço - ${formData.setor || "Geral"} - ${formData.cidade || ""}`.trim(),
      });
      setIsBoletoModalOpen(true);
      return; // Não prosseguir com o lançamento ainda
    }

    adicionarLancamento({
      tipo: "receita",
      data: new Date(formData.data),
      valor,
      valorLiquido,
      formaPagamento: formData.formaPagamento,
      tecnicoResponsavel: formData.tecnicoResponsavel,
      notaFiscal: formData.notaFiscal,
      descontoImposto: formData.notaFiscal ? descontoImposto : undefined,
      setor: formData.setor,
      cidade: formData.cidade,
      campanha: formData.campanha || undefined,
      descricao: formData.observacoes || undefined,
    });

    // Reset form
    setFormData({
      data: new Date().toISOString().split("T")[0],
      valor: "",
      formaPagamento: "",
      tecnicoResponsavel: "",
      notaFiscal: false,
      setor: "",
      cidade: "",
      campanha: "",
      observacoes: "",
    });

    setIsOpen(false);
  };

  const handleCriarCampanha = () => {
    if (!novaCampanha.nome) return;

    adicionarCampanha({
      nome: novaCampanha.nome,
      descricao: novaCampanha.descricao,
      ativa: true,
      dataInicio: new Date(novaCampanha.dataInicio),
      dataFim: novaCampanha.dataFim
        ? new Date(novaCampanha.dataFim)
        : undefined,
    });

    setNovaCampanha({
      nome: "",
      descricao: "",
      dataInicio: new Date().toISOString().split("T")[0],
      dataFim: "",
    });

    setIsNewCampanhaOpen(false);
  };

  const handleAddSetor = () => {
    if (!novoSetor.nome.trim()) return;

    adicionarSetor({
      nome: novoSetor.nome,
    });

    setNovoSetor({
      nome: "",
    });

    setIsNewSetorOpen(false);
  };

  const handleAddCidade = () => {
    if (!novaCidade.nome.trim()) return;

    adicionarCidade({
      nome: novaCidade.nome,
    });

    setNovaCidade({
      nome: "",
    });

    setIsNewCidadeOpen(false);
  };

  const handleParcelasChange = (numParcelas: number) => {
    const novasData = [];
    const valorParcela = boletoData.valorTotal / numParcelas;

    for (let i = 0; i < numParcelas; i++) {
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + (i + 1) * 30); // 30 dias entre parcelas
      novasData.push(dataVencimento);
    }

    setBoletoData({
      ...boletoData,
      parcelas: numParcelas,
      vencimentos: novasData,
    });
  };

  const handleVencimentoChange = (index: number, novaData: string) => {
    const novosVencimentos = [...boletoData.vencimentos];
    novosVencimentos[index] = new Date(novaData);
    setBoletoData({
      ...boletoData,
      vencimentos: novosVencimentos,
    });
  };

  const handleConfirmarBoleto = () => {
    const valorParcela = boletoData.valorTotal / boletoData.parcelas;

    // Adicionar lançamento no caixa
    adicionarLancamento({
      tipo: "receita",
      data: new Date(formData.data),
      valor: boletoData.valorTotal,
      valorLiquido: boletoData.valorTotal,
      formaPagamento: "Boleto",
      tecnicoResponsavel: formData.tecnicoResponsavel,
      notaFiscal: formData.notaFiscal,
      descontoImposto: formData.notaFiscal ? boletoData.valorTotal * 0.06 : undefined,
      setor: formData.setor,
      cidade: formData.cidade,
      campanha: formData.campanha || undefined,
      descricao: boletoData.descricao,
    });

    // Adicionar cada parcela como conta a receber
    boletoData.vencimentos.forEach((vencimento, index) => {
      adicionarConta({
        tipo: "receber",
        dataVencimento: vencimento,
        fornecedorCliente: boletoData.cliente,
        tipoPagamento: "Boleto",
        valor: valorParcela,
        status: "pendente",
        observacoes: `${boletoData.descricao} - Parcela ${index + 1}/${boletoData.parcelas}`,
      });
    });

    // Reset forms
    setFormData({
      data: new Date().toISOString().split("T")[0],
      valor: "",
      formaPagamento: "",
      tecnicoResponsavel: "",
      notaFiscal: false,
      setor: "",
      cidade: "",
      campanha: "",
      observacoes: "",
    });

    setBoletoData({
      valorTotal: 0,
      parcelas: 1,
      vencimentos: [],
      cliente: "",
      descricao: "",
    });

    setIsBoletoModalOpen(false);
    setIsOpen(false);
  };

  const calcularValorLiquido = () => {
    const valor = parseFloat(formData.valor) || 0;
    let valorLiquido = valor;

    if (formData.notaFiscal) {
      valorLiquido = valor * 0.94; // 6% de imposto
    }

    if (formData.formaPagamento.includes("Cartão")) {
      const taxa =
        formData.formaPagamento === "Cartão de Débito" ? 0.02 : 0.035;
      valorLiquido = valorLiquido * (1 - taxa);
    }

    return valorLiquido;
  };

  const calcularComissao = () => {
    const valorLiquido = calcularValorLiquido();
    return valorLiquido * 0.15; // 15% de comissão
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Nova Receita
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Lançar Receita (Serviço Realizado)
          </DialogTitle>
          <DialogDescription>
            Registre um serviço de desentupimento realizado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="valor">Valor Total (R$)</Label>
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

          <div className="grid gap-4 md:grid-cols-2">
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
              <Label>Técnico Responsável</Label>
              <Select
                value={formData.tecnicoResponsavel}
                onValueChange={(value) =>
                  setFormData({ ...formData, tecnicoResponsavel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico} value={tecnico}>
                      {tecnico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Setor
                <Dialog open={isNewSetorOpen} onOpenChange={setIsNewSetorOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      + Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Setor</DialogTitle>
                      <DialogDescription>
                        Cadastre um novo setor para os serviços
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomeSetor">Nome do Setor *</Label>
                        <Input
                          id="nomeSetor"
                          value={novoSetor.nome}
                          onChange={(e) =>
                            setNovoSetor({ ...novoSetor, nome: e.target.value })
                          }
                          placeholder="Ex: Residencial, Comercial..."
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsNewSetorOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleAddSetor}>
                          Adicionar Setor
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </Label>
              <Select
                value={formData.setor}
                onValueChange={(value) =>
                  setFormData({ ...formData, setor: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((setor) => (
                    <SelectItem key={setor.id} value={setor.nome}>
                      {setor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Cidade
                <Dialog
                  open={isNewCidadeOpen}
                  onOpenChange={setIsNewCidadeOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      + Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Cidade</DialogTitle>
                      <DialogDescription>
                        Cadastre uma nova cidade para os serviços
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomeCidade">Nome da Cidade *</Label>
                        <Input
                          id="nomeCidade"
                          value={novaCidade.nome}
                          onChange={(e) =>
                            setNovaCidade({
                              ...novaCidade,
                              nome: e.target.value,
                            })
                          }
                          placeholder="Ex: São Paulo, Santos..."
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsNewCidadeOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleAddCidade}>
                          Adicionar Cidade
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </Label>
              <Select
                value={formData.cidade}
                onValueChange={(value) =>
                  setFormData({ ...formData, cidade: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cidades.map((cidade) => (
                    <SelectItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Campanha
                <Dialog
                  open={isNewCampanhaOpen}
                  onOpenChange={setIsNewCampanhaOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      + Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Campanha</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomeCampanha">Nome da Campanha</Label>
                        <Input
                          id="nomeCampanha"
                          value={novaCampanha.nome}
                          onChange={(e) =>
                            setNovaCampanha({
                              ...novaCampanha,
                              nome: e.target.value,
                            })
                          }
                          placeholder="Ex: Promoção Janeiro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descCampanha">Descrição</Label>
                        <Textarea
                          id="descCampanha"
                          value={novaCampanha.descricao}
                          onChange={(e) =>
                            setNovaCampanha({
                              ...novaCampanha,
                              descricao: e.target.value,
                            })
                          }
                          placeholder="Descrição da campanha"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="dataInicioCampanha">
                            Data Início
                          </Label>
                          <Input
                            id="dataInicioCampanha"
                            type="date"
                            value={novaCampanha.dataInicio}
                            onChange={(e) =>
                              setNovaCampanha({
                                ...novaCampanha,
                                dataInicio: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dataFimCampanha">
                            Data Fim (Opcional)
                          </Label>
                          <Input
                            id="dataFimCampanha"
                            type="date"
                            value={novaCampanha.dataFim}
                            onChange={(e) =>
                              setNovaCampanha({
                                ...novaCampanha,
                                dataFim: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleCriarCampanha}
                        className="w-full"
                      >
                        Criar Campanha
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </Label>
              <Select
                value={formData.campanha}
                onValueChange={(value) =>
                  setFormData({ ...formData, campanha: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione campanha (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {campanhas
                    .filter((c) => c.ativa)
                    .map((campanha) => (
                      <SelectItem key={campanha.id} value={campanha.nome}>
                        {campanha.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="notaFiscal"
              checked={formData.notaFiscal}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, notaFiscal: checked })
              }
            />
            <Label htmlFor="notaFiscal">
              Emitir Nota Fiscal (desconto de 6% de imposto)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (Opcional)</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Observações sobre o serviço..."
              rows={3}
            />
          </div>

          {formData.valor && parseFloat(formData.valor) > 0 && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Valor Bruto:</span>
                    <span className="font-bold">
                      R${" "}
                      {parseFloat(formData.valor).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {formData.notaFiscal && (
                    <div className="flex justify-between text-red-600">
                      <span>Desconto Imposto (6%):</span>
                      <span>
                        - R${" "}
                        {(parseFloat(formData.valor) * 0.06).toLocaleString(
                          "pt-BR",
                          { minimumFractionDigits: 2 },
                        )}
                      </span>
                    </div>
                  )}
                  {formData.formaPagamento.includes("Cartão") && (
                    <div className="flex justify-between text-orange-600">
                      <span>
                        Taxa Cartão (
                        {formData.formaPagamento === "Cartão de Débito"
                          ? "2%"
                          : "3,5%"}
                        ):
                      </span>
                      <span>
                        - R${" "}
                        {(
                          calcularValorLiquido() *
                          (formData.formaPagamento === "Cartão de Débito"
                            ? 0.02
                            : 0.035)
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Valor Líquido:</span>
                    <span className="text-green-600">
                      R${" "}
                      {calcularValorLiquido().toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {formData.tecnicoResponsavel && (
                    <div className="flex justify-between text-blue-600">
                      <span>Comissão {formData.tecnicoResponsavel} (15%):</span>
                      <span>
                        R${" "}
                        {calcularComissao().toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
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
            <Button type="submit" className="flex-1">
              Lançar Receita
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
