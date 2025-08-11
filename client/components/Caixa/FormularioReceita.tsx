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
import { toast } from "../ui/use-toast";
import SelectWithAdd from "../ui/select-with-add";
import { DollarSign, TrendingUp, Calculator, Upload, FileText, X } from "lucide-react";

interface FormularioReceitaProps {
  onSuccess?: () => void;
}

export function FormularioReceita({ onSuccess }: FormularioReceitaProps) {
  const { adicionarLancamento, campanhas, adicionarCampanha, isLoading: caixaLoading } = useCaixa();
  const {
    descricoes,
    formasPagamento,
    tecnicos,
    setores,
    adicionarDescricao,
    adicionarFormaPagamento,
    adicionarSetor,
    isLoading: entidadesLoading
  } = useEntidades();

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    valor: "",
    valorQueEntrou: "",
    valorLiquido: "",
    comissao: "",
    imposto: "",
    descricao: "",
    formaPagamento: "",
    tecnicoResponsavel: "",
    setor: "",
    campanha: "",
    observacoes: "",
    numeroNota: "",
    arquivoNota: "",
    temNotaFiscal: false,
  });

  const [mostrarCamposAvancados, setMostrarCamposAvancados] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notaFiscalEmitida, setNotaFiscalEmitida] = useState(false);

  // Filtrar descrições de receita
  const descricoesReceita = descricoes.filter(d => d.tipo === 'receita');

  // Calcular campos automaticamente
  useEffect(() => {
    const valor = parseFloat(formData.valor) || 0;
    const valorQueEntrou = parseFloat(formData.valorQueEntrou) || valor;
    const imposto = parseFloat(formData.imposto) || 0;
    const valorLiquido = valorQueEntrou - imposto;
    
    // Calcular comissão (15% do valor líquido se houver técnico)
    const comissao = formData.tecnicoResponsavel ? valorLiquido * 0.15 : 0;

    setFormData(prev => ({
      ...prev,
      valorLiquido: valorLiquido.toFixed(2),
      comissao: comissao.toFixed(2)
    }));
  }, [formData.valor, formData.valorQueEntrou, formData.imposto, formData.tecnicoResponsavel]);

  // Função para emitir nota fiscal
  const emitirNotaFiscal = () => {
    const urlNotaFiscal = "https://www6.goiania.go.gov.br/sistemas/saces/asp/saces00000f5.asp?sigla=snfse&c=1&aid=e813ef4862bf420ee0c3b8a62347579b68773380001&dth=20250811115913";
    const janelaNotaFiscal = window.open(urlNotaFiscal, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');

    // Monitorar quando a janela for fechada
    const interval = setInterval(() => {
      if (janelaNotaFiscal?.closed) {
        clearInterval(interval);
        setNotaFiscalEmitida(true);
        toast({
          title: "Nota Fiscal",
          description: "Preencha o número da nota fiscal emitida",
          variant: "default"
        });
      }
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.valor || !formData.descricao || !formData.formaPagamento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validar número da nota se nota fiscal foi marcada
    if (formData.temNotaFiscal && !formData.numeroNota) {
      toast({
        title: "Erro",
        description: "Número da nota fiscal é obrigatório quando há nota fiscal",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await adicionarLancamento({
        data: new Date(formData.data),
        tipo: "receita",
        valor: parseFloat(formData.valor),
        valorLiquido: parseFloat(formData.valorLiquido) || parseFloat(formData.valor),
        valorQueEntrou: parseFloat(formData.valorQueEntrou) || parseFloat(formData.valor),
        comissao: parseFloat(formData.comissao) || 0,
        imposto: parseFloat(formData.imposto) || 0,
        descricao: formData.descricao,
        formaPagamento: formData.formaPagamento,
        tecnicoResponsavel: formData.tecnicoResponsavel || undefined,
        setor: formData.setor || undefined,
        campanha: formData.campanha || undefined,
        observacoes: formData.observacoes || undefined,
        numeroNota: formData.numeroNota || undefined,
        arquivoNota: formData.arquivoNota || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Receita lançada com sucesso!",
        variant: "default"
      });

      // Resetar formulário
      setFormData({
        data: new Date().toISOString().split('T')[0],
        valor: "",
        valorQueEntrou: "",
        valorLiquido: "",
        comissao: "",
        imposto: "",
        descricao: "",
        formaPagamento: "",
        tecnicoResponsavel: "",
        setor: "",
        campanha: "",
        observacoes: "",
        numeroNota: "",
        arquivoNota: "",
        temNotaFiscal: false,
      });
      setNotaFiscalEmitida(false);

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao lançar receita:', error);
      toast({
        title: "Erro",
        description: "Erro ao lançar receita. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = caixaLoading || entidadesLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando dados...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <TrendingUp className="h-5 w-5" />
          Lançar Receita
        </CardTitle>
        <CardDescription>
          Registre uma nova entrada no caixa
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <SelectWithAdd
              value={formData.descricao}
              onValueChange={(value) => setFormData(prev => ({ ...prev, descricao: value }))}
              placeholder="Selecione a descrição"
              label="Descrição do Serviço"
              required={true}
              items={descricoesReceita}
              onAddNew={async (data) => {
                await adicionarDescricao({
                  nome: data.nome,
                  tipo: 'receita'
                });
              }}
              addNewTitle="Nova Descrição de Receita"
              addNewDescription="Adicione uma nova descrição de serviço para receitas."
              addNewFields={[
                {
                  key: 'nome',
                  label: 'Nome da Descrição',
                  required: true
                }
              ]}
            />

            <SelectWithAdd
              value={formData.formaPagamento}
              onValueChange={(value) => setFormData(prev => ({ ...prev, formaPagamento: value }))}
              placeholder="Selecione a forma"
              label="Forma de Pagamento"
              required={true}
              items={formasPagamento}
              onAddNew={async (data) => {
                await adicionarFormaPagamento({
                  nome: data.nome,
                  descricao: data.descricao || ''
                });
              }}
              addNewTitle="Nova Forma de Pagamento"
              addNewDescription="Adicione uma nova forma de pagamento."
              addNewFields={[
                {
                  key: 'nome',
                  label: 'Nome da Forma de Pagamento',
                  required: true
                },
                {
                  key: 'descricao',
                  label: 'Descrição (opcional)',
                  required: false
                }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tecnicoResponsavel">Técnico Responsável</Label>
              <Select
                value={formData.tecnicoResponsavel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tecnicoResponsavel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                      {tecnico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <SelectWithAdd
              value={formData.setor}
              onValueChange={(value) => setFormData(prev => ({ ...prev, setor: value }))}
              placeholder="Selecione o setor"
              label="Setor/Região"
              required={false}
              items={setores}
              onAddNew={async (data) => {
                await adicionarSetor({
                  nome: data.nome,
                  cidade: data.cidade
                });
              }}
              addNewTitle="Novo Setor/Região"
              addNewDescription="Adicione um novo setor ou região."
              addNewFields={[
                {
                  key: 'nome',
                  label: 'Nome do Setor',
                  required: true
                },
                {
                  key: 'cidade',
                  label: 'Cidade',
                  required: true
                }
              ]}
              renderItem={(setor) => `${setor.nome} - ${setor.cidade}`}
            />
          </div>

          {/* Campos avançados */}
          <div className="flex items-center space-x-2">
            <Switch
              id="campos-avancados"
              checked={mostrarCamposAvancados}
              onCheckedChange={setMostrarCamposAvancados}
            />
            <Label htmlFor="campos-avancados">Mostrar campos avançados</Label>
          </div>

          {mostrarCamposAvancados && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorQueEntrou">Valor que Entrou (R$)</Label>
                  <Input
                    id="valorQueEntrou"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valorQueEntrou}
                    onChange={(e) => setFormData(prev => ({ ...prev, valorQueEntrou: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imposto">Desconto/Taxa (R$)</Label>
                  <Input
                    id="imposto"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.imposto}
                    onChange={(e) => setFormData(prev => ({ ...prev, imposto: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorLiquido">Valor Líquido (R$)</Label>
                  <Input
                    id="valorLiquido"
                    type="number"
                    step="0.01"
                    value={formData.valorLiquido}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="comissao">Comissão (R$)</Label>
                  <Input
                    id="comissao"
                    type="number"
                    step="0.01"
                    value={formData.comissao}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <SelectWithAdd
                  value={formData.campanha}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, campanha: value }))}
                  placeholder="Selecione a campanha"
                  label="Campanha"
                  required={false}
                  items={campanhas}
                  onAddNew={async (data) => {
                    await adicionarCampanha({
                      nome: data.nome
                    });
                  }}
                  addNewTitle="Nova Campanha"
                  addNewDescription="Adicione uma nova campanha de marketing."
                  addNewFields={[
                    {
                      key: 'nome',
                      label: 'Nome da Campanha',
                      required: true
                    }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroNota">Número da Nota</Label>
                  <Input
                    id="numeroNota"
                    placeholder="Ex: NF-001"
                    value={formData.numeroNota}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroNota: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arquivoNota">Arquivo da Nota</Label>
                  <Input
                    id="arquivoNota"
                    placeholder="URL do arquivo"
                    value={formData.arquivoNota}
                    onChange={(e) => setFormData(prev => ({ ...prev, arquivoNota: e.target.value }))}
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
            </div>
          )}

          {/* Resumo financeiro */}
          {formData.valor && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Resumo Financeiro</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Valor Total:</span>
                  <div className="font-medium">R$ {parseFloat(formData.valor || "0").toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Valor Líquido:</span>
                  <div className="font-medium">R$ {parseFloat(formData.valorLiquido || "0").toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Comissão:</span>
                  <div className="font-medium">R$ {parseFloat(formData.comissao || "0").toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Para Empresa:</span>
                  <div className="font-medium text-green-600">
                    R$ {(parseFloat(formData.valorLiquido || "0") - parseFloat(formData.comissao || "0")).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Lançando..." : "Lançar Receita"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
