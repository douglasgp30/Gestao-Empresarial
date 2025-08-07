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
import { DollarSign, TrendingUp, Calculator, Upload, FileText, X } from "lucide-react";

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
  const {
    setores,
    adicionarSetor,
    cidades,
    adicionarCidade,
    descricoes,
    categorias,
    adicionarDescricao,
  } = useEntidades();
  const { adicionarConta } = useContas();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewCampanhaOpen, setIsNewCampanhaOpen] = useState(false);
  const [isNewSetorOpen, setIsNewSetorOpen] = useState(false);
  const [isNewCidadeOpen, setIsNewCidadeOpen] = useState(false);
  const [isNewDescricaoOpen, setIsNewDescricaoOpen] = useState(false);
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
    descricaoServico: "",
    campanha: "",
    observacoes: "",
    valorEntrou: "", // Para cartão de crédito/débito
  });

  const [notaFiscalProcessada, setNotaFiscalProcessada] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [notaFiscalArquivada, setNotaFiscalArquivada] = useState(false);

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

  const [novaDescricao, setNovaDescricao] = useState({
    nome: "",
    categoria: "",
    tipo: "receita" as "receita" | "despesa",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valor = parseFloat(formData.valor);
    if (!valor || valor <= 0) return;

    if (!formData.descricaoServico.trim()) {
      alert("Por favor, selecione ou cadastre uma descrição do serviço.");
      return;
    }

    if (formData.notaFiscal && !notaFiscalProcessada) {
      alert(
        "Por favor, aguarde a emissão da nota fiscal antes de lançar a receita.",
      );
      return;
    }

    if (formData.notaFiscal && notaFiscalProcessada && !notaFiscalArquivada) {
      alert(
        "Por favor, faça o upload da nota fiscal em PDF antes de lançar a receita.",
      );
      return;
    }

    // Calcular valor líquido (valor real que fica para a empresa após todas as deduções)
    let valorLiquido = valor;
    let descontoImposto = 0;
    let comissaoFuncionario = 0;

    // 🧾 Nota fiscal: descontar imposto de 6%
    if (formData.notaFiscal) {
      const percentualImposto = 6; // 6% de imposto
      descontoImposto = valor * (percentualImposto / 100);
      valorLiquido = valor - descontoImposto;
    }

    // 💳 Cartão de crédito/débito: usar valor que entrou ou calcular taxa
    if (formData.formaPagamento.includes("Cartão")) {
      if (formData.valorEntrou && parseFloat(formData.valorEntrou) > 0) {
        // Usar o valor que realmente entrou
        valorLiquido = parseFloat(formData.valorEntrou);
      } else {
        // Calcular com taxa padrão
        const taxaCartao =
          formData.formaPagamento === "Cartão de Débito" ? 2 : 3.5;
        const desconto = valorLiquido * (taxaCartao / 100);
        valorLiquido = valorLiquido - desconto;
      }
    }

    // 👷 Comissão do funcionário: abater do valor líquido
    if (formData.tecnicoResponsavel) {
      const percentualComissao = 15; // 15% de comissão padrão (pode vir das configurações)
      comissaoFuncionario = valorLiquido * (percentualComissao / 100);
      valorLiquido = valorLiquido - comissaoFuncionario; // Abater comissão do valor da empresa
    }

    // 💰 Demais formas (Dinheiro, Pix, Boleto, Transferência): valor cheio menos comissão

    // Se for boleto, abrir modal de parcelamento
    if (formData.formaPagamento === "Boleto") {
      setBoletoData({
        valorTotal: valor,
        parcelas: 1,
        vencimentos: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)], // 30 dias a partir de hoje
        cliente: formData.tecnicoResponsavel || "",
        descricao:
          `Serviço - ${formData.setor || "Geral"} - ${formData.cidade || ""}`.trim(),
      });
      setIsBoletoModalOpen(true);
      return; // Não prosseguir com o lançamento ainda
    }

    adicionarLancamento({
      tipo: "receita",
      data: new Date(formData.data),
      valor,
      valorLiquido, // Valor que realmente fica para a empresa (já descontada a comissão)
      formaPagamento: formData.formaPagamento,
      tecnicoResponsavel: formData.tecnicoResponsavel,
      comissao: comissaoFuncionario, // Valor da comissão calculada
      notaFiscal: formData.notaFiscal,
      descontoImposto: formData.notaFiscal ? descontoImposto : undefined,
      setor: formData.setor,
      cidade: formData.cidade,
      campanha: formData.campanha || undefined,
      descricao: formData.descricaoServico,
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
      descricaoServico: "",
      campanha: "",
      observacoes: "",
      valorEntrou: "",
    });
    setNotaFiscalProcessada(false);
    setNotaFiscalArquivada(false);
    setUploadedFile(null);

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

  const handleAddDescricao = () => {
    if (!novaDescricao.nome.trim()) return;

    adicionarDescricao({
      nome: novaDescricao.nome,
      tipo: "receita",
      categoria: novaDescricao.categoria || undefined,
    });

    setNovaDescricao({
      nome: "",
      categoria: "",
      tipo: "receita",
    });

    setIsNewDescricaoOpen(false);
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
      descontoImposto: formData.notaFiscal
        ? boletoData.valorTotal * 0.06
        : undefined,
      setor: formData.setor,
      cidade: formData.cidade,
      campanha: formData.campanha || undefined,
      descricao: formData.descricaoServico,
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
      descricaoServico: "",
      campanha: "",
      observacoes: "",
      valorEntrou: "",
    });
    setNotaFiscalProcessada(false);
    setNotaFiscalArquivada(false);
    setUploadedFile(null);

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

  const calcularValorSemComissao = () => {
    const valor = parseFloat(formData.valor) || 0;
    let valorLiquido = valor;

    if (formData.notaFiscal) {
      valorLiquido = valor * 0.94; // 6% de imposto
    }

    if (formData.formaPagamento.includes("Cartão")) {
      if (formData.valorEntrou && parseFloat(formData.valorEntrou) > 0) {
        valorLiquido = parseFloat(formData.valorEntrou);
      } else {
        const taxa =
          formData.formaPagamento === "Cartão de D��bito" ? 0.02 : 0.035;
        valorLiquido = valorLiquido * (1 - taxa);
      }
    }

    return valorLiquido;
  };

  const calcularComissao = () => {
    const valorSemComissao = calcularValorSemComissao();
    return valorSemComissao * 0.15; // 15% de comissão
  };

  const calcularValorLiquidoFinal = () => {
    const valorSemComissao = calcularValorSemComissao();
    const comissao = formData.tecnicoResponsavel ? calcularComissao() : 0;
    return valorSemComissao - comissao; // Valor final para a empresa
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
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
                    setFormData({
                      ...formData,
                      formaPagamento: value,
                      valorEntrou: "",
                    })
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

              {/* Campo "Valor que Entrou" para cart��es */}
              {(formData.formaPagamento === "Cartão de Crédito" ||
                formData.formaPagamento === "Cartão de Débito") && (
                <div className="space-y-2">
                  <Label htmlFor="valorEntrou">Valor que Entrou (R$)</Label>
                  <Input
                    id="valorEntrou"
                    type="number"
                    step="0.01"
                    placeholder="Valor líquido recebido"
                    value={formData.valorEntrou}
                    onChange={(e) =>
                      setFormData({ ...formData, valorEntrou: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor que realmente entrou na conta após as taxas
                  </p>
                </div>
              )}

              {!(
                formData.formaPagamento === "Cartão de Crédito" ||
                formData.formaPagamento === "Cartão de Débito"
              ) && (
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
              )}
            </div>

            {/* Campo Técnico Responsável separado quando for cartão */}
            {(formData.formaPagamento === "Cartão de Crédito" ||
              formData.formaPagamento === "Cartão de Débito") && (
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
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  Setor
                  <Dialog
                    open={isNewSetorOpen}
                    onOpenChange={setIsNewSetorOpen}
                  >
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
                              setNovoSetor({
                                ...novoSetor,
                                nome: e.target.value,
                              })
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

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Descrição do Serviço *
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
                        Cadastre uma nova descrição de serviço
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomeDescricao">
                          Nome da Descrição *
                        </Label>
                        <Input
                          id="nomeDescricao"
                          value={novaDescricao.nome}
                          onChange={(e) =>
                            setNovaDescricao({
                              ...novaDescricao,
                              nome: e.target.value,
                            })
                          }
                          placeholder="Ex: Desentupimento, Fossa Séptica..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoriaDescricao">
                          Categoria (Opcional)
                        </Label>
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
                              .filter((cat) => cat.tipo === "receita")
                              .map((categoria) => (
                                <SelectItem
                                  key={categoria.id}
                                  value={categoria.nome}
                                >
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
                    .filter((descricao) => descricao.tipo === "receita")
                    .map((descricao) => (
                      <SelectItem key={descricao.id} value={descricao.nome}>
                        {descricao.nome}
                        {descricao.categoria && (
                          <span className="text-muted-foreground">
                            {" "}
                            - {descricao.categoria}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, notaFiscal: checked });
                  if (checked && !notaFiscalProcessada) {
                    // Site da prefeitura de Goiânia para emiss��o de nota fiscal
                    const linkPrefeitura =
                      "https://www10.goiania.go.gov.br/Internet/Login.aspx?OriginalURL=https%3a%2f%2fwww10.goiania.go.gov.br%2fsicaeportal%2fHomePageNovo.aspx";
                    const janela = window.open(
                      linkPrefeitura,
                      "_blank",
                      "width=1200,height=800,scrollbars=yes,resizable=yes",
                    );

                    // Detectar quando a janela é fechada
                    const intervalo = setInterval(() => {
                      if (janela?.closed) {
                        setNotaFiscalProcessada(true);
                        clearInterval(intervalo);
                        // Abrir modal de upload após fechar a janela da prefeitura
                        setIsUploadModalOpen(true);
                      }
                    }, 1000);
                  }
                }}
              />
              <Label htmlFor="notaFiscal">
                Emitir Nota Fiscal (desconto de 6% de imposto)
              </Label>
              {formData.notaFiscal && !notaFiscalProcessada && (
                <span className="text-orange-600 text-sm">
                  ⏳ Aguardando emissão da nota fiscal...
                </span>
              )}
              {formData.notaFiscal && notaFiscalProcessada && !notaFiscalArquivada && (
                <span className="text-blue-600 text-sm">
                  📄 Nota emitida - Aguardando upload do PDF
                </span>
              )}
              {formData.notaFiscal && notaFiscalArquivada && (
                <span className="text-green-600 text-sm flex items-center gap-1">
                  ✅ Nota fiscal arquivada
                  {uploadedFile && (
                    <Badge variant="outline" className="text-xs">
                      {uploadedFile.name}
                    </Badge>
                  )}
                </span>
              )}
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
                    {formData.formaPagamento.includes("Cartão") &&
                      !formData.valorEntrou && (
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
                              (parseFloat(formData.valor) || 0) *
                              (formData.formaPagamento === "Cartão de Débito"
                                ? 0.02
                                : 0.035)
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                    {formData.formaPagamento.includes("Cartão") &&
                      formData.valorEntrou && (
                        <div className="flex justify-between text-blue-600">
                          <span>Valor que Entrou:</span>
                          <span>
                            R${" "}
                            {parseFloat(formData.valorEntrou).toLocaleString(
                              "pt-BR",
                              {
                                minimumFractionDigits: 2,
                              },
                            )}
                          </span>
                        </div>
                      )}
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span>Valor Antes da Comissão:</span>
                      <span className="text-blue-600">
                        R${" "}
                        {calcularValorSemComissao().toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {formData.tecnicoResponsavel && (
                      <div className="flex justify-between text-orange-600">
                        <span>
                          Comissão {formData.tecnicoResponsavel} (15%):
                        </span>
                        <span>
                          - R${" "}
                          {calcularComissao().toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Valor Líquido Final (Empresa):</span>
                      <span className="text-green-600">
                        R${" "}
                        {calcularValorLiquidoFinal().toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
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
              <Button
                type="submit"
                className="flex-1"
                disabled={formData.notaFiscal && !notaFiscalProcessada}
              >
                {formData.notaFiscal && !notaFiscalProcessada
                  ? "Aguardando Nota Fiscal..."
                  : "Lançar Receita"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Upload de Nota Fiscal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload da Nota Fiscal
            </DialogTitle>
            <DialogDescription>
              Faça o upload da nota fiscal em PDF para arquivar no sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {uploadedFile ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-green-600" />
                  <p className="text-sm font-medium text-green-600">
                    Arquivo selecionado:
                  </p>
                  <p className="text-xs text-muted-foreground break-all">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                    className="mt-2"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remover
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Arraste o arquivo PDF aqui ou clique para selecionar
                  </p>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === "application/pdf") {
                        setUploadedFile(file);
                      } else {
                        alert("Por favor, selecione apenas arquivos PDF.");
                      }
                    }}
                    className="cursor-pointer"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadedFile(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (uploadedFile) {
                    // Simular arquivamento do PDF
                    // Em uma implementação real, você enviaria o arquivo para o servidor
                    setNotaFiscalArquivada(true);
                    setIsUploadModalOpen(false);
                    alert(
                      "Nota fiscal arquivada com sucesso! Agora você pode lançar a receita.",
                    );
                  } else {
                    alert("Por favor, selecione um arquivo PDF.");
                  }
                }}
                disabled={!uploadedFile}
                className="flex-1"
              >
                Arquivar Nota
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Parcelamento Boleto */}
      <Dialog open={isBoletoModalOpen} onOpenChange={setIsBoletoModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar Boleto - Contas a Receber</DialogTitle>
            <DialogDescription>
              Configure o parcelamento e vencimentos para o boleto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="valorTotal">Valor Total</Label>
                <Input
                  id="valorTotal"
                  type="number"
                  step="0.01"
                  value={boletoData.valorTotal}
                  onChange={(e) =>
                    setBoletoData({
                      ...boletoData,
                      valorTotal: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parcelas">Número de Parcelas</Label>
                <Select
                  value={boletoData.parcelas.toString()}
                  onValueChange={(value) =>
                    handleParcelasChange(parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "parcela" : "parcelas"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={boletoData.cliente}
                  onChange={(e) =>
                    setBoletoData({ ...boletoData, cliente: e.target.value })
                  }
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={boletoData.descricao}
                  onChange={(e) =>
                    setBoletoData({ ...boletoData, descricao: e.target.value })
                  }
                  placeholder="Descrição do serviço"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lista de Parcelas e Vencimentos</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {boletoData.vencimentos.map((vencimento, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 border rounded"
                  >
                    <span className="w-20 text-sm font-medium">
                      Parcela {index + 1}:
                    </span>
                    <span className="w-24 text-sm">
                      R${" "}
                      {(
                        boletoData.valorTotal / boletoData.parcelas
                      ).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <Label htmlFor={`vencimento-${index}`} className="text-sm">
                      Vencimento:
                    </Label>
                    <Input
                      id={`vencimento-${index}`}
                      type="date"
                      value={vencimento.toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleVencimentoChange(index, e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBoletoModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmarBoleto}
                className="flex-1"
              >
                Confirmar Lançamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
