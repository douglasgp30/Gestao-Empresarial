import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CheckCircle, 
  User, 
  Key, 
  Shield, 
  ArrowRight,
  Building2
} from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { PasswordStrength, validarForcaSenha } from '../ui/password-strength';

const AdminSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  login: z.string().min(3, 'Login deve ter pelo menos 3 caracteres'),
  senha: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .refine((senha) => {
      const { valida } = validarForcaSenha(senha);
      return valida;
    }, 'Senha não atende aos requisitos de segurança'),
  confirmarSenha: z.string()
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"]
});

interface PrimeiroAcessoProps {
  onAdminCriado: (admin: any) => void;
}

export default function PrimeiroAcesso({ onAdminCriado }: PrimeiroAcessoProps) {
  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    login: '',
    senha: '',
    confirmarSenha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validarFormulario = () => {
    try {
      AdminSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const criarAdministrador = async () => {
    if (!validarFormulario()) return;

    setIsLoading(true);
    try {
      const novoAdmin = {
        id: `admin-${Date.now()}`,
        nomeCompleto: formData.nomeCompleto,
        login: formData.login,
        senha: formData.senha,
        permissaoAcesso: true,
        tipoAcesso: "Administrador" as const,
        percentualComissao: 0,
        dataCadastro: new Date(),
        ativo: true,
        ehTecnico: false,
        temAcessoSistema: true,
        telefone: "",
        email: "",
        cargo: "Administrador",
        salario: 0,
        permissoes: ""
      };

      await onAdminCriado(novoAdmin);
      toast.success('Administrador criado com sucesso! Bem-vindo ao sistema!');
    } catch (error) {
      toast.error('Erro ao criar administrador');
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEtapa1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo ao Sistema de Gestão Empresarial
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Configure seu sistema em alguns passos simples
          </p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Para começar a usar o sistema, você precisa criar o primeiro usuário administrador.
            Este usuário terá acesso completo a todas as funcionalidades.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          O que você poderá fazer:
        </h3>
        
        <div className="grid gap-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Gerenciar funcionários</p>
              <p className="text-sm text-gray-600">Cadastre técnicos e outros usuários</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Controle financeiro</p>
              <p className="text-sm text-gray-600">Gerencie caixa, contas e relatórios</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Configurações e auditoria</p>
              <p className="text-sm text-gray-600">Configure o sistema e monitore atividades</p>
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={() => setEtapa(2)} 
        className="w-full"
        size="lg"
      >
        Começar configuração
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );

  const renderEtapa2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Criar Administrador</h2>
        <p className="text-gray-600">
          Preencha os dados do primeiro usuário administrador
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nomeCompleto">Nome completo</Label>
          <Input
            id="nomeCompleto"
            value={formData.nomeCompleto}
            onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
            placeholder="Digite o nome completo"
            disabled={isLoading}
          />
          {errors.nomeCompleto && (
            <p className="text-sm text-red-600">{errors.nomeCompleto}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="login">Login</Label>
          <Input
            id="login"
            value={formData.login}
            onChange={(e) => handleInputChange('login', e.target.value)}
            placeholder="Digite o login"
            disabled={isLoading}
          />
          {errors.login && (
            <p className="text-sm text-red-600">{errors.login}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            value={formData.senha}
            onChange={(e) => handleInputChange('senha', e.target.value)}
            placeholder="Digite a senha (mínimo 6 caracteres)"
            disabled={isLoading}
          />
          {errors.senha && (
            <p className="text-sm text-red-600">{errors.senha}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmarSenha">Confirmar senha</Label>
          <Input
            id="confirmarSenha"
            type="password"
            value={formData.confirmarSenha}
            onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
            placeholder="Digite a senha novamente"
            disabled={isLoading}
          />
          {errors.confirmarSenha && (
            <p className="text-sm text-red-600">{errors.confirmarSenha}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setEtapa(1)}
          disabled={isLoading}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button 
          onClick={criarAdministrador}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Criando...' : 'Criar administrador'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center space-x-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${etapa >= 1 ? 'bg-primary' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${etapa >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
          </div>
          <CardTitle className="text-lg">
            Etapa {etapa} de 2
          </CardTitle>
        </CardHeader>
        <CardContent>
          {etapa === 1 ? renderEtapa1() : renderEtapa2()}
        </CardContent>
      </Card>
    </div>
  );
}
