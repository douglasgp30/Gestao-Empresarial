import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  User, 
  Lock, 
  Shield, 
  CheckCircle,
  Eye,
  EyeOff,
  AlertTriangle 
} from "lucide-react";

export default function EditarPerfil() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sucessoMensagem, setSucessoMensagem] = useState("");

  const [formData, setFormData] = useState({
    nomeCompleto: user?.nomeCompleto || "",
    senhaAtual: "",
    novaSenha: "",
    confirmarNovaSenha: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      nomeCompleto: user?.nomeCompleto || "",
      senhaAtual: "",
      novaSenha: "",
      confirmarNovaSenha: "",
    });
    setErrors({});
    setSucessoMensagem("");
  };

  const validarFormulario = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = "Nome completo é obrigatório";
    }

    // Validar senha apenas se o usuário quiser alterar
    if (formData.novaSenha || formData.confirmarNovaSenha || formData.senhaAtual) {
      if (!formData.senhaAtual) {
        newErrors.senhaAtual = "Digite sua senha atual para confirmar as alterações";
      }

      if (formData.novaSenha && formData.novaSenha.length < 6) {
        newErrors.novaSenha = "Nova senha deve ter pelo menos 6 caracteres";
      }

      if (formData.novaSenha !== formData.confirmarNovaSenha) {
        newErrors.confirmarNovaSenha = "Confirmação de senha não confere";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    // TODO: Implementar API call para atualizar perfil
    console.log("Atualizando perfil:", formData);

    // Simular sucesso
    setSucessoMensagem("Perfil atualizado com sucesso!");
    
    // Limpar campos de senha
    setFormData(prev => ({
      ...prev,
      senhaAtual: "",
      novaSenha: "",
      confirmarNovaSenha: "",
    }));

    // Esconder mensagem após 3 segundos
    setTimeout(() => {
      setSucessoMensagem("");
    }, 3000);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <User className="h-4 w-4" />
          Editar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Editar Meu Perfil
          </DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e credenciais de acesso
          </DialogDescription>
        </DialogHeader>

        {sucessoMensagem && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{sucessoMensagem}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Atuais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Informações Atuais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Login:</span>
                <Badge variant="outline">{user.login}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tipo de Acesso:</span>
                <Badge variant={user.tipoAcesso === "Administrador" ? "default" : "secondary"}>
                  {user.tipoAcesso}
                </Badge>
              </div>
            </CardContent>
          </Card>

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
                  placeholder="Digite seu nome completo"
                  className={errors.nomeCompleto ? "border-red-500" : ""}
                />
                {errors.nomeCompleto && (
                  <p className="text-sm text-red-500">{errors.nomeCompleto}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Deixe em branco se não quiser alterar a senha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="senhaAtual"
                    type={showPassword ? "text" : "password"}
                    value={formData.senhaAtual}
                    onChange={(e) =>
                      setFormData({ ...formData, senhaAtual: e.target.value })
                    }
                    placeholder="Digite sua senha atual"
                    className={errors.senhaAtual ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                {errors.senhaAtual && (
                  <p className="text-sm text-red-500">{errors.senhaAtual}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <Input
                  id="novaSenha"
                  type="password"
                  value={formData.novaSenha}
                  onChange={(e) =>
                    setFormData({ ...formData, novaSenha: e.target.value })
                  }
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                  className={errors.novaSenha ? "border-red-500" : ""}
                />
                {errors.novaSenha && (
                  <p className="text-sm text-red-500">{errors.novaSenha}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarNovaSenha">Confirmar Nova Senha</Label>
                <Input
                  id="confirmarNovaSenha"
                  type="password"
                  value={formData.confirmarNovaSenha}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmarNovaSenha: e.target.value })
                  }
                  placeholder="Digite a nova senha novamente"
                  className={errors.confirmarNovaSenha ? "border-red-500" : ""}
                />
                {errors.confirmarNovaSenha && (
                  <p className="text-sm text-red-500">{errors.confirmarNovaSenha}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Aviso de Permissões */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Para alterar permissões ou tipo de acesso, solicite a um administrador.
            </AlertDescription>
          </Alert>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
