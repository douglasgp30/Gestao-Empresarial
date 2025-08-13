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
import { UserPlus, User, Shield, Percent } from "lucide-react";

export default function FormularioFuncionario() {
  const { adicionarFuncionario, funcionarios } = useFuncionarios();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    login: "",
    senha: "",
    confirmarSenha: "",
    ehTecnico: false,
    permissaoAcesso: true,
    tipoAcesso: "Operador" as "Administrador" | "Operador",
    percentualComissao: "",
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      nomeCompleto: "",
      login: "",
      senha: "",
      confirmarSenha: "",
      ehTecnico: false,
      permissaoAcesso: true,
      tipoAcesso: "Operador",
      percentualComissao: "",
      ativo: true,
    });
    setErrors({});
  };

  const validarFormulario = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = "Nome completo é obrigatório";
    }

    // Login e senha só são obrigatórios se o funcionário tiver permissão de acesso
    if (formData.permissaoAcesso) {
      if (!formData.login.trim()) {
        newErrors.login =
          "Login é obrigatório para funcionários com acesso ao sistema";
      } else if (formData.login.length < 3) {
        newErrors.login = "Login deve ter pelo menos 3 caracteres";
      } else {
        // Verificar se o login já existe
        const loginExistente = funcionarios.find(
          (func) =>
            func.login?.toLowerCase() === formData.login.trim().toLowerCase(),
        );
        if (loginExistente) {
          newErrors.login =
            "Este login já está sendo usado por outro funcionário";
        }
      }

      if (!formData.senha) {
        newErrors.senha =
          "Senha é obrigatória para funcionários com acesso ao sistema";
      } else if (formData.senha.length < 6) {
        newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
      }

      if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = "Senhas não coincidem";
      }
    }

    if (!formData.percentualComissao.trim()) {
      newErrors.percentualComissao = "Percentual de comissão é obrigatório";
    } else {
      const percentual = parseFloat(formData.percentualComissao);
      if (isNaN(percentual) || percentual < 0 || percentual > 100) {
        newErrors.percentualComissao = "Percentual deve estar entre 0 e 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      await adicionarFuncionario({
        nomeCompleto: formData.nomeCompleto.trim(),
        ehTecnico: formData.ehTecnico,
        login: formData.permissaoAcesso ? formData.login.trim().toLowerCase() : undefined,
        senha: formData.permissaoAcesso ? formData.senha : undefined,
        permissaoAcesso: formData.permissaoAcesso,
        tipoAcesso: formData.tipoAcesso,
        percentualComissao: parseFloat(formData.percentualComissao),
        ativo: formData.ativo,
      });

      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Erro ao adicionar funcionário:", error);

      // Check if error message indicates login already exists
      if (error?.message?.includes("login já está sendo usado")) {
        setErrors({ login: error.message });
      } else if (error?.message?.includes("email já está sendo usado")) {
        setErrors({ email: error.message });
      } else {
        setErrors({ general: error?.message || "Erro ao criar funcionário. Tente novamente." });
      }
    } finally {
      setSubmitting(false);
    }
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
            Preencha os dados do novo funcionário para dar acesso ao sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Display */}
          {errors.general && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

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
                  placeholder="Nome completo do funcionário"
                  className={errors.nomeCompleto ? "border-red-500" : ""}
                />
                {errors.nomeCompleto && (
                  <p className="text-sm text-red-500">{errors.nomeCompleto}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ehTecnico"
                  checked={formData.ehTecnico}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ehTecnico: checked })
                  }
                />
                <Label htmlFor="ehTecnico" className="text-sm font-medium">
                  Este funcionário é um técnico
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Dados de Acesso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Dados de Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="login">Login *</Label>
                  <Input
                    id="login"
                    value={formData.login}
                    onChange={(e) =>
                      setFormData({ ...formData, login: e.target.value })
                    }
                    placeholder="Login para acesso"
                    className={errors.login ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    O login será convertido automaticamente para minúsculas
                  </p>
                  {errors.login && (
                    <p className="text-sm text-red-500">{errors.login}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Acesso</Label>
                  <Select
                    value={formData.tipoAcesso}
                    onValueChange={(value: "Administrador" | "Operador") =>
                      setFormData({ ...formData, tipoAcesso: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operador">Operador</SelectItem>
                      <SelectItem value="Administrador">
                        Administrador
                      </SelectItem>
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
                    placeholder="Senha de acesso"
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
                    placeholder="Confirme a senha"
                    className={errors.confirmarSenha ? "border-red-500" : ""}
                  />
                  {errors.confirmarSenha && (
                    <p className="text-sm text-red-500">
                      {errors.confirmarSenha}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="permissaoAcesso"
                  checked={formData.permissaoAcesso}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, permissaoAcesso: checked })
                  }
                />
                <Label htmlFor="permissaoAcesso">
                  Permissão de acesso ao sistema
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Configurações Financeiras
              </CardTitle>
              <CardDescription>
                Defina a comissão que o funcionário receberá sobre os serviços
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="percentualComissao">
                  Percentual de Comissão (%) *
                </Label>
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
                  placeholder="0.0"
                  className={errors.percentualComissao ? "border-red-500" : ""}
                />
                {errors.percentualComissao && (
                  <p className="text-sm text-red-500">
                    {errors.percentualComissao}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Use 0 para funcionários que não recebem comissão
                </p>
                <p className="text-sm text-muted-foreground">
                  Percentual aplicado sobre o valor líquido dos serviços
                  realizados
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ativo: checked })
                  }
                />
                <Label htmlFor="ativo">Funcionário ativo no sistema</Label>
              </div>
            </CardContent>
          </Card>

          <Separator />

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
