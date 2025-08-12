import React, { useState } from "react";
import { useFuncionarios } from "../../contexts/FuncionariosContext";
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
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Badge } from "../ui/badge";
import {
  UserPlus,
  User,
  Shield,
  Percent,
  ChevronDown,
  Lock,
  Eye,
  Edit,
  Settings,
  BarChart3,
  HardDrive,
  Users,
} from "lucide-react";
import { FuncionarioPermissoes } from "@shared/types";

const permissoesDisponiveis = [
  {
    id: "acessarDashboard",
    nome: "Acessar Dashboard",
    descricao: "Visualizar resumo financeiro e indicadores",
    modulo: "Dashboard",
    icon: BarChart3,
  },
  {
    id: "verCaixa",
    nome: "Ver Caixa",
    descricao: "Visualizar lançamentos do caixa",
    modulo: "Caixa",
    icon: Eye,
  },
  {
    id: "lancarReceita",
    nome: "Lançar Receita",
    descricao: "Criar novos lançamentos de receita",
    modulo: "Caixa",
    icon: Edit,
  },
  {
    id: "lancarDespesa",
    nome: "Lançar Despesa",
    descricao: "Criar novos lançamentos de despesa",
    modulo: "Caixa",
    icon: Edit,
  },
  {
    id: "editarLancamentos",
    nome: "Editar Lançamentos",
    descricao: "Modificar e excluir lançamentos existentes",
    modulo: "Caixa",
    icon: Edit,
  },
  {
    id: "verContas",
    nome: "Ver Contas",
    descricao: "Visualizar contas a pagar e receber",
    modulo: "Contas",
    icon: Eye,
  },
  {
    id: "lancarContasPagar",
    nome: "Lançar Contas a Pagar",
    descricao: "Criar novas contas a pagar",
    modulo: "Contas",
    icon: Edit,
  },
  {
    id: "lancarContasReceber",
    nome: "Lançar Contas a Receber",
    descricao: "Criar novas contas a receber",
    modulo: "Contas",
    icon: Edit,
  },
  {
    id: "marcarContasPagas",
    nome: "Marcar Contas como Pagas",
    descricao: "Alterar status de contas para paga/recebida",
    modulo: "Contas",
    icon: Edit,
  },
  {
    id: "acessarConfiguracoes",
    nome: "Acessar Configurações",
    descricao: "Acessar página de configurações do sistema",
    modulo: "Sistema",
    icon: Settings,
  },
  {
    id: "fazerBackupManual",
    nome: "Fazer Backup Manual",
    descricao: "Executar backups manuais do sistema",
    modulo: "Sistema",
    icon: HardDrive,
  },
  {
    id: "gerarRelatorios",
    nome: "Gerar Relatórios",
    descricao: "Acessar e gerar relatórios",
    modulo: "Relatórios",
    icon: BarChart3,
  },
  {
    id: "verCadastros",
    nome: "Ver Cadastros",
    descricao: "Visualizar cadastros auxiliares (clientes, fornecedores, etc.)",
    modulo: "Cadastros",
    icon: Eye,
  },
  {
    id: "gerenciarFuncionarios",
    nome: "Gerenciar Funcionários",
    descricao: "Criar, editar e excluir funcionários",
    modulo: "Sistema",
    icon: Users,
  },
  {
    id: "alterarPermissoes",
    nome: "Alterar Permissões",
    descricao: "Modificar permissões de outros usuários",
    modulo: "Sistema",
    icon: Shield,
  },
];

const permissoesPorModulo = permissoesDisponiveis.reduce(
  (acc, permissao) => {
    if (!acc[permissao.modulo]) {
      acc[permissao.modulo] = [];
    }
    acc[permissao.modulo].push(permissao);
    return acc;
  },
  {} as Record<string, typeof permissoesDisponiveis>,
);

export default function FormularioFuncionarioAvancado() {
  const { adicionarFuncionario } = useFuncionarios();
  const [isOpen, setIsOpen] = useState(false);
  const [permissoesAbertas, setPermissoesAbertas] = useState(false);

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    login: "",
    senha: "",
    confirmarSenha: "",
    ehTecnico: false,
    temAcessoSistema: false,
    tipoAcesso: "Operador" as "Administrador" | "Operador" | "Técnico",
    percentualComissao: "",
    ativo: true,
  });

  const [permissoes, setPermissoes] = useState<FuncionarioPermissoes>({
    acessarDashboard: false,
    verCaixa: false,
    lancarReceita: false,
    lancarDespesa: false,
    editarLancamentos: false,
    verContas: false,
    lancarContasPagar: false,
    lancarContasReceber: false,
    marcarContasPagas: false,
    acessarConfiguracoes: false,
    fazerBackupManual: false,
    gerarRelatorios: false,
    verCadastros: false,
    gerenciarFuncionarios: false,
    alterarPermissoes: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      nomeCompleto: "",
      login: "",
      senha: "",
      confirmarSenha: "",
      ehTecnico: false,
      temAcessoSistema: false,
      tipoAcesso: "Operador",
      percentualComissao: "",
      ativo: true,
    });
    setPermissoes({
      acessarDashboard: false,
      verCaixa: false,
      lancarReceita: false,
      lancarDespesa: false,
      editarLancamentos: false,
      verContas: false,
      lancarContasPagar: false,
      lancarContasReceber: false,
      marcarContasPagas: false,
      acessarConfiguracoes: false,
      fazerBackupManual: false,
      gerarRelatorios: false,
      verCadastros: false,
      gerenciarFuncionarios: false,
      alterarPermissoes: false,
    });
    setErrors({});
  };

  const aplicarPermissoesPadrao = (
    tipo: "Administrador" | "Operador" | "Técnico",
  ) => {
    if (tipo === "Administrador") {
      // Administrador tem todas as permissões
      setPermissoes({
        acessarDashboard: true,
        verCaixa: true,
        lancarReceita: true,
        lancarDespesa: true,
        editarLancamentos: true,
        verContas: true,
        lancarContasPagar: true,
        lancarContasReceber: true,
        marcarContasPagas: true,
        acessarConfiguracoes: true,
        fazerBackupManual: true,
        gerarRelatorios: true,
        verCadastros: true,
        gerenciarFuncionarios: true,
        alterarPermissoes: true,
      });
    } else if (tipo === "Operador") {
      // Operador tem permissões básicas
      setPermissoes({
        acessarDashboard: true,
        verCaixa: true,
        lancarReceita: true,
        lancarDespesa: true,
        editarLancamentos: false,
        verContas: true,
        lancarContasPagar: false,
        lancarContasReceber: false,
        marcarContasPagas: true,
        acessarConfiguracoes: false,
        fazerBackupManual: false,
        gerarRelatorios: true,
        verCadastros: true,
        gerenciarFuncionarios: false,
        alterarPermissoes: false,
      });
    } else if (tipo === "Técnico") {
      // Técnico tem permiss��es limitadas, focadas em lançamentos
      setPermissoes({
        acessarDashboard: true,
        verCaixa: true,
        lancarReceita: true,
        lancarDespesa: false,
        editarLancamentos: false,
        verContas: false,
        lancarContasPagar: false,
        lancarContasReceber: false,
        marcarContasPagas: false,
        acessarConfiguracoes: false,
        fazerBackupManual: false,
        gerarRelatorios: false,
        verCadastros: false,
        gerenciarFuncionarios: false,
        alterarPermissoes: false,
      });
    }
  };

  const validarFormulario = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = "Nome completo é obrigatório";
    }

    if (formData.temAcessoSistema) {
      if (!formData.login.trim()) {
        newErrors.login = "Login é obrigatório quando há acesso ao sistema";
      } else if (formData.login.length < 3) {
        newErrors.login = "Login deve ter pelo menos 3 caracteres";
      }

      if (!formData.senha) {
        newErrors.senha = "Senha é obrigatória quando há acesso ao sistema";
      } else if (formData.senha.length < 6) {
        newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
      }

      if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = "Senhas não coincidem";
      }
    }

    const percentual = parseFloat(formData.percentualComissao);
    if (isNaN(percentual) || percentual < 0 || percentual > 100) {
      newErrors.percentualComissao = "Percentual deve estar entre 0 e 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      await adicionarFuncionario({
        nomeCompleto: formData.nomeCompleto,
        ehTecnico: formData.ehTecnico,
        login: formData.temAcessoSistema ? formData.login : undefined,
        senha: formData.temAcessoSistema ? formData.senha : undefined,
        temAcessoSistema: formData.temAcessoSistema,
        tipoAcesso: formData.temAcessoSistema ? formData.tipoAcesso : undefined,
        permissoes: formData.temAcessoSistema ? permissoes : undefined,
        percentualComissao: parseFloat(formData.percentualComissao),
        ativo: formData.ativo,
      });

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error);
      // TODO: Mostrar erro para o usuário
    }
  };

  const contarPermissoesAtivas = () => {
    return Object.values(permissoes).filter(Boolean).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Funcionário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Cadastrar Novo Funcionário
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do funcionário e configure as permissões de acesso
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                <Input
                  id="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={(e) =>
                    setFormData({ ...formData, nomeCompleto: e.target.value })
                  }
                  placeholder="Digite o nome completo"
                  className={errors.nomeCompleto ? "border-red-500" : ""}
                />
                {errors.nomeCompleto && (
                  <p className="text-sm text-red-500">{errors.nomeCompleto}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ehTecnico"
                  checked={formData.ehTecnico}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ehTecnico: checked === true })
                  }
                />
                <Label htmlFor="ehTecnico" className="text-sm font-medium">
                  Este funcionário é um técnico
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentualComissao">
                  Percentual de Comissão (%)
                </Label>
                <div className="relative">
                  <Input
                    id="percentualComissao"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.percentualComissao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentualComissao: e.target.value,
                      })
                    }
                    className={
                      errors.percentualComissao ? "border-red-500" : ""
                    }
                  />
                  <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.percentualComissao && (
                  <p className="text-sm text-red-500">
                    {errors.percentualComissao}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ativo: checked })
                  }
                />
                <Label htmlFor="ativo">Funcionário ativo</Label>
              </div>
            </CardContent>
          </Card>

          {/* Controle de Acesso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Controle de Acesso ao Sistema
              </CardTitle>
              <CardDescription>
                Configure se este funcionário terá acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="temAcessoSistema"
                  checked={formData.temAcessoSistema}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, temAcessoSistema: checked });
                    if (!checked) {
                      // Limpar dados de acesso se desabilitar
                      setFormData((prev) => ({
                        ...prev,
                        login: "",
                        senha: "",
                        confirmarSenha: "",
                      }));
                    }
                  }}
                />
                <Label htmlFor="temAcessoSistema">
                  Este funcionário ter�� acesso ao sistema?
                </Label>
              </div>

              {formData.temAcessoSistema && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  {/* Dados de Login */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="login">Login *</Label>
                      <Input
                        id="login"
                        value={formData.login}
                        onChange={(e) =>
                          setFormData({ ...formData, login: e.target.value })
                        }
                        placeholder="nome.sobrenome"
                        className={errors.login ? "border-red-500" : ""}
                      />
                      {errors.login && (
                        <p className="text-sm text-red-500">{errors.login}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Acesso</Label>
                      <Select
                        value={formData.tipoAcesso}
                        onValueChange={(
                          value: "Administrador" | "Operador" | "Técnico",
                        ) => {
                          setFormData({ ...formData, tipoAcesso: value });
                          aplicarPermissoesPadrao(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Operador">Operador</SelectItem>
                          <SelectItem value="Administrador">
                            Administrador
                          </SelectItem>
                          <SelectItem value="Técnico">Técnico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha *</Label>
                      <Input
                        id="senha"
                        type="password"
                        value={formData.senha}
                        onChange={(e) =>
                          setFormData({ ...formData, senha: e.target.value })
                        }
                        placeholder="Mínimo 6 caracteres"
                        className={errors.senha ? "border-red-500" : ""}
                      />
                      {errors.senha && (
                        <p className="text-sm text-red-500">{errors.senha}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                      <Input
                        id="confirmarSenha"
                        type="password"
                        value={formData.confirmarSenha}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmarSenha: e.target.value,
                          })
                        }
                        placeholder="Digite a senha novamente"
                        className={
                          errors.confirmarSenha ? "border-red-500" : ""
                        }
                      />
                      {errors.confirmarSenha && (
                        <p className="text-sm text-red-500">
                          {errors.confirmarSenha}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Permissões */}
                  <Collapsible
                    open={permissoesAbertas}
                    onOpenChange={setPermissoesAbertas}
                  >
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="gap-2 p-0">
                          <Shield className="h-4 w-4" />
                          Permissões Detalhadas
                          {contarPermissoesAtivas() > 0 && (
                            <Badge variant="secondary">
                              {contarPermissoesAtivas()} ativas
                            </Badge>
                          )}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${permissoesAbertas ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4">
                        {Object.entries(permissoesPorModulo).map(
                          ([modulo, permissoesModulo]) => (
                            <div key={modulo} className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                {modulo}
                              </h4>
                              <div className="grid gap-2 pl-4">
                                {permissoesModulo.map((permissao) => {
                                  const Icon = permissao.icon;
                                  return (
                                    <div
                                      key={permissao.id}
                                      className="flex items-start space-x-2"
                                    >
                                      <Checkbox
                                        id={permissao.id}
                                        checked={
                                          permissoes[
                                            permissao.id as keyof FuncionarioPermissoes
                                          ]
                                        }
                                        onCheckedChange={(checked) =>
                                          setPermissoes((prev) => ({
                                            ...prev,
                                            [permissao.id]: checked,
                                          }))
                                        }
                                      />
                                      <div className="grid gap-1">
                                        <Label
                                          htmlFor={permissao.id}
                                          className="text-sm font-medium flex items-center gap-2"
                                        >
                                          <Icon className="h-3 w-3" />
                                          {permissao.nome}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                          {permissao.descricao}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões */}
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
              Cadastrar Funcionário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
