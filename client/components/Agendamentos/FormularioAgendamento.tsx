import React, { useState } from "react";
import { useAgendamentos } from "../../contexts/AgendamentosContext";
import { useEntidades } from "../../contexts/EntidadesContext";
import { useFuncionarios } from "../../contexts/FuncionariosContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Calendar, Clock, Plus, User } from "lucide-react";
import { toast } from "../../hooks/use-toast";

interface FormularioAgendamentoProps {
  children?: React.ReactNode;
  agendamentoId?: string; // Para edição
  onClose?: () => void; // Callback quando modal fechar
}

export default function FormularioAgendamento({
  children,
  agendamentoId,
  onClose,
}: FormularioAgendamentoProps) {
  const { criarAgendamento, atualizarAgendamento, agendamentos } =
    useAgendamentos();
  const { setores, adicionarSetor, cidades, adicionarCidade } = useEntidades();
  const { funcionarios } = useFuncionarios();

  const [aberto, setAberto] = useState(false);
  const [novoSetor, setNovoSetor] = useState("");
  const [mostrarNovoSetor, setMostrarNovoSetor] = useState(false);
  const [novaCidade, setNovaCidade] = useState("");
  const [mostrarNovaCidade, setMostrarNovaCidade] = useState(false);

  // Buscar agendamento para edição
  const agendamentoEdicao = agendamentoId
    ? agendamentos.find((ag) => ag.id === agendamentoId)
    : null;

  // Estado do formulário
  const [formData, setFormData] = useState({
    dataServico: new Date().toISOString().split("T")[0],
    horaServico: "09:00",
    descricaoServico: "",
    setor: "",
    cidade: "",
    tecnicoResponsavel: "",
    finalTelefoneCliente: "",
    tempoLembrete: 30,
  });

  // Atualizar formulário quando agendamento de edição mudar
  React.useEffect(() => {
    if (agendamentoEdicao) {
      setFormData({
        dataServico: agendamentoEdicao.dataServico.toISOString().split("T")[0],
        horaServico: agendamentoEdicao.horaServico,
        descricaoServico: agendamentoEdicao.descricaoServico,
        setor: agendamentoEdicao.setor,
        cidade: agendamentoEdicao.cidade || "",
        tecnicoResponsavel: agendamentoEdicao.tecnicoResponsavel || "",
        finalTelefoneCliente: agendamentoEdicao.finalTelefoneCliente,
        tempoLembrete: agendamentoEdicao.tempoLembrete,
      });
      setAberto(true);
    }
  }, [agendamentoEdicao]);

  const [erros, setErros] = useState<Record<string, string>>({});

  const tecnicos = funcionarios.filter((f) => f.ativo);

  const opcoesLembrete = [
    { valor: 10, label: "10 minutos antes" },
    { valor: 15, label: "15 minutos antes" },
    { valor: 30, label: "30 minutos antes" },
    { valor: 60, label: "1 hora antes" },
    { valor: 120, label: "2 horas antes" },
  ];

  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.dataServico) {
      novosErros.dataServico = "Data do serviço é obrigatória";
    }

    if (!formData.horaServico) {
      novosErros.horaServico = "Hora do serviço é obrigatória";
    }

    if (!formData.descricaoServico.trim()) {
      novosErros.descricaoServico = "Descrição do serviço é obrigatória";
    }

    if (!formData.setor) {
      novosErros.setor = "Setor é obrigatório";
    }

    if (!formData.cidade) {
      novosErros.cidade = "Cidade é obrigatória";
    }

    if (!formData.finalTelefoneCliente.trim()) {
      novosErros.finalTelefoneCliente = "Final do telefone é obrigatório";
    } else if (!/^\d{4}$/.test(formData.finalTelefoneCliente)) {
      novosErros.finalTelefoneCliente = "Deve conter exatamente 4 dígitos";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      const dadosAgendamento = {
        dataServico: new Date(formData.dataServico),
        horaServico: formData.horaServico,
        descricaoServico: formData.descricaoServico.trim(),
        setor: formData.setor,
        cidade: formData.cidade,
        tecnicoResponsavel: formData.tecnicoResponsavel || undefined,
        finalTelefoneCliente: formData.finalTelefoneCliente,
        tempoLembrete: formData.tempoLembrete,
      };

      if (agendamentoId) {
        atualizarAgendamento(agendamentoId, dadosAgendamento);
        toast({
          title: "Agendamento atualizado",
          description: "O agendamento foi atualizado com sucesso.",
        });
      } else {
        criarAgendamento(dadosAgendamento);
        toast({
          title: "Agendamento criado",
          description: "O agendamento foi criado com sucesso.",
        });
      }

      setAberto(false);
      resetarFormulario();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const resetarFormulario = () => {
    setFormData({
      dataServico: new Date().toISOString().split("T")[0],
      horaServico: "09:00",
      descricaoServico: "",
      setor: "",
      cidade: "",
      tecnicoResponsavel: "",
      finalTelefoneCliente: "",
      tempoLembrete: 30,
    });
    setErros({});
  };

  const handleAdicionarSetor = async () => {
    if (!formData.cidade) {
      toast({
        title: "Erro",
        description: "Selecione uma cidade antes de adicionar um setor.",
        variant: "destructive"
      });
      return;
    }

    if (novoSetor.trim()) {
      try {
        await adicionarSetor({
          nome: novoSetor.trim(),
          cidade: formData.cidade
        });

        // Buscar o setor recém-criado para obter o ID correto
        const setorCriado = setores.find(s => s.nome === novoSetor.trim() && s.cidade === formData.cidade);
        if (setorCriado) {
          setFormData({ ...formData, setor: setorCriado.id.toString() });
        }

        setNovoSetor("");
        setMostrarNovoSetor(false);
        toast({
          title: "Setor adicionado",
          description: `O setor "${novoSetor}" foi adicionado com sucesso.`,
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao adicionar setor. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAdicionarCidade = async () => {
    if (novaCidade.trim()) {
      try {
        await adicionarCidade({ nome: novaCidade.trim() });
        setFormData({ ...formData, cidade: novaCidade.trim() });
        setNovaCidade("");
        setMostrarNovaCidade(false);
        toast({
          title: "Cidade adicionada",
          description: `A cidade "${novaCidade}" foi adicionada com sucesso.`,
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao adicionar cidade. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const gerarHorarios = () => {
    const horarios = [];
    for (let hora = 6; hora <= 22; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const h = hora.toString().padStart(2, "0");
        const m = minuto.toString().padStart(2, "0");
        horarios.push(`${h}:${m}`);
      }
    }
    return horarios;
  };

  const handleOpenChange = (open: boolean) => {
    setAberto(open);
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button onClick={() => setAberto(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {agendamentoId ? "Editar Agendamento" : "Novo Agendamento"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {agendamentoId ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {agendamentoId
              ? "Atualize as informações do agendamento."
              : "Preencha os dados para criar um novo agendamento de serviço."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data do Serviço */}
          <div className="space-y-2">
            <Label htmlFor="dataServico" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data do Serviço
            </Label>
            <Input
              id="dataServico"
              type="date"
              value={formData.dataServico}
              onChange={(e) =>
                setFormData({ ...formData, dataServico: e.target.value })
              }
              className={erros.dataServico ? "border-red-500" : ""}
            />
            {erros.dataServico && (
              <p className="text-sm text-red-500">{erros.dataServico}</p>
            )}
          </div>

          {/* Hora do Serviço */}
          <div className="space-y-2">
            <Label htmlFor="horaServico" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hora do Serviço
            </Label>
            <Select
              value={formData.horaServico}
              onValueChange={(value) =>
                setFormData({ ...formData, horaServico: value })
              }
            >
              <SelectTrigger
                className={erros.horaServico ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {gerarHorarios().map((horario) => (
                  <SelectItem key={horario} value={horario}>
                    {horario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.horaServico && (
              <p className="text-sm text-red-500">{erros.horaServico}</p>
            )}
          </div>

          {/* Descrição do Serviço */}
          <div className="space-y-2">
            <Label htmlFor="descricaoServico">Descrição do Serviço</Label>
            <Textarea
              id="descricaoServico"
              placeholder="Ex: Desentupimento de fossa, Dedetização..."
              value={formData.descricaoServico}
              onChange={(e) =>
                setFormData({ ...formData, descricaoServico: e.target.value })
              }
              className={erros.descricaoServico ? "border-red-500" : ""}
              rows={3}
            />
            {erros.descricaoServico && (
              <p className="text-sm text-red-500">{erros.descricaoServico}</p>
            )}
          </div>

          {/* Setor */}
          <div className="space-y-2">
            <Label>Setor</Label>
            <div className="flex gap-2">
              <Select
                value={formData.setor}
                onValueChange={(value) =>
                  setFormData({ ...formData, setor: value })
                }
              >
                <SelectTrigger
                  className={`flex-1 ${erros.setor ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores
                    .filter(setor => !formData.cidade || setor.cidade === formData.cidade)
                    .map((setor) => (
                    <SelectItem key={setor.id} value={setor.id.toString()}>
                      {setor.nome} - {setor.cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMostrarNovoSetor(!mostrarNovoSetor)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {mostrarNovoSetor && (
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do novo setor"
                  value={novoSetor}
                  onChange={(e) => setNovoSetor(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" size="sm" onClick={handleAdicionarSetor}>
                  Adicionar
                </Button>
              </div>
            )}

            {erros.setor && (
              <p className="text-sm text-red-500">{erros.setor}</p>
            )}
          </div>

          {/* Cidade */}
          <div className="space-y-2">
            <Label>Cidade</Label>
            <div className="flex gap-2">
              <Select
                value={formData.cidade}
                onValueChange={(value) =>
                  setFormData({ ...formData, cidade: value })
                }
              >
                <SelectTrigger
                  className={`flex-1 ${erros.cidade ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cidades.map((cidade, index) => (
                    <SelectItem key={`cidade-${index}-${cidade}`} value={cidade}>
                      {cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMostrarNovaCidade(!mostrarNovaCidade)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {mostrarNovaCidade && (
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da nova cidade"
                  value={novaCidade}
                  onChange={(e) => setNovaCidade(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" size="sm" onClick={handleAdicionarCidade}>
                  Adicionar
                </Button>
              </div>
            )}

            {erros.cidade && (
              <p className="text-sm text-red-500">{erros.cidade}</p>
            )}
          </div>

          {/* Técnico (Opcional) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Selecionar Técnico (Opcional)
            </Label>
            <Select
              value={formData.tecnicoResponsavel || "sem_tecnico"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  tecnicoResponsavel: value === "sem_tecnico" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem_tecnico">Nenhum técnico</SelectItem>
                {tecnicos.map((tecnico) => (
                  <SelectItem key={tecnico.id} value={tecnico.nomeCompleto}>
                    {tecnico.nomeCompleto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Final do Telefone */}
          <div className="space-y-2">
            <Label htmlFor="finalTelefone">Final do Telefone (4 dígitos)</Label>
            <Input
              id="finalTelefone"
              type="text"
              placeholder="Ex: 1234"
              value={formData.finalTelefoneCliente}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, "").slice(0, 4);
                setFormData({ ...formData, finalTelefoneCliente: valor });
              }}
              maxLength={4}
              className={erros.finalTelefoneCliente ? "border-red-500" : ""}
            />
            {erros.finalTelefoneCliente && (
              <p className="text-sm text-red-500">
                {erros.finalTelefoneCliente}
              </p>
            )}
          </div>

          {/* Tempo para Lembrete */}
          <div className="space-y-2">
            <Label>Lembrar quanto tempo antes</Label>
            <Select
              value={formData.tempoLembrete.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, tempoLembrete: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {opcoesLembrete.map((opcao) => (
                  <SelectItem key={opcao.valor} value={opcao.valor.toString()}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {agendamentoId ? "Atualizar" : "Criar"} Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
