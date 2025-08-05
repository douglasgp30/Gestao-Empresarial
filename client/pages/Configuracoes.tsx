import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import SistemaBackup from '../components/Backup/SistemaBackup';
import {
  Settings,
  Building2,
  Palette,
  Users,
  FileText,
  Save,
  RotateCcw,
  CheckCircle,
  Upload,
  HardDrive
} from 'lucide-react';
import EmpresaLogo from '../components/EmpresaLogo';

export default function Configuracoes() {
  const { empresaConfig, updateEmpresaConfig, resetToDefault } = useConfig();
  const [localConfig, setLocalConfig] = useState(empresaConfig);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    updateEmpresaConfig(localConfig);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleReset = () => {
    resetToDefault();
    setLocalConfig({
      nomeEmpresa: 'Solução Desentupimento',
      subtituloEmpresa: 'Sistema de Gestão Empresarial',
      corPrimaria: '217 91% 60%',
      endereco: '',
      telefone: '',
      email: '',
      cnpj: ''
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setLocalConfig({ ...localConfig, logoUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const cores = [
    { nome: 'Azul Padrão', valor: '217 91% 60%' },
    { nome: 'Verde', valor: '142 71% 45%' },
    { nome: 'Roxo', valor: '262 52% 47%' },
    { nome: 'Laranja', valor: '25 95% 53%' },
    { nome: 'Vermelho', valor: '0 84% 60%' },
    { nome: 'Cinza', valor: '220 9% 46%' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {savedMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Configurações salvas com sucesso!
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="empresa">
            <Building2 className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="aparencia">
            <Palette className="h-4 w-4 mr-2" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="sistema">
            <FileText className="h-4 w-4 mr-2" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="backup">
            <HardDrive className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Configure os dados básicos da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <Input
                    id="nomeEmpresa"
                    value={localConfig.nomeEmpresa}
                    onChange={(e) => setLocalConfig({ ...localConfig, nomeEmpresa: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtituloEmpresa">Subtítulo</Label>
                  <Input
                    id="subtituloEmpresa"
                    value={localConfig.subtituloEmpresa}
                    onChange={(e) => setLocalConfig({ ...localConfig, subtituloEmpresa: e.target.value })}
                    placeholder="Subtítulo ou slogan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={localConfig.endereco || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, endereco: e.target.value })}
                  placeholder="Endereço completo da empresa"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={localConfig.telefone || ''}
                    onChange={(e) => setLocalConfig({ ...localConfig, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={localConfig.email || ''}
                    onChange={(e) => setLocalConfig({ ...localConfig, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={localConfig.cnpj || ''}
                    onChange={(e) => setLocalConfig({ ...localConfig, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo da Empresa</CardTitle>
              <CardDescription>
                Personalize a logo que aparece no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <EmpresaLogo size="lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Alterar Logo</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Imagem
                    </Button>
                    {localConfig.logoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocalConfig({ ...localConfig, logoUrl: undefined })}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: PNG, JPG, SVG (máx. 2MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cor Primária</CardTitle>
              <CardDescription>
                Escolha a cor principal do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 grid-cols-3 md:grid-cols-6">
                {cores.map((cor) => (
                  <button
                    key={cor.valor}
                    onClick={() => setLocalConfig({ ...localConfig, corPrimaria: cor.valor })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      localConfig.corPrimaria === cor.valor
                        ? 'border-foreground'
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                    style={{ backgroundColor: `hsl(${cor.valor})` }}
                  >
                    <div className="w-full h-6 rounded flex items-center justify-center">
                      {localConfig.corPrimaria === cor.valor && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="corCustom">Cor Personalizada (HSL)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="corCustom"
                    value={localConfig.corPrimaria}
                    onChange={(e) => setLocalConfig({ ...localConfig, corPrimaria: e.target.value })}
                    placeholder="217 91% 60%"
                  />
                  <div
                    className="w-12 h-10 rounded border border-border"
                    style={{ backgroundColor: `hsl(${localConfig.corPrimaria})` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Usuários</CardTitle>
              <CardDescription>
                Configuraç��es relacionadas a funcionários e permissões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Percentual de Comissão Padrão</h4>
                    <p className="text-sm text-muted-foreground">
                      Percentual aplicado por padrão para novos funcionários
                    </p>
                  </div>
                  <Badge variant="secondary">15%</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Percentual de Imposto (NF)</h4>
                    <p className="text-sm text-muted-foreground">
                      Desconto aplicado quando nota fiscal é emitida
                    </p>
                  </div>
                  <Badge variant="secondary">6%</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sessão Automática</h4>
                    <p className="text-sm text-muted-foreground">
                      Tempo limite para logout automático (em minutos)
                    </p>
                  </div>
                  <Badge variant="secondary">60 min</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Parâmetros gerais e configurações avançadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Versão do Sistema</h4>
                    <p className="text-sm text-muted-foreground">
                      Versão atual instalada
                    </p>
                  </div>
                  <Badge variant="secondary">v1.0.0</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Banco de Dados</h4>
                    <p className="text-sm text-muted-foreground">
                      Status da conexão com o banco
                    </p>
                  </div>
                  <Badge className="bg-success text-success-foreground">Conectado</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Migrações de Banco</h4>
                    <p className="text-sm text-muted-foreground">
                      Sistema de atualização automática
                    </p>
                  </div>
                  <Badge className="bg-success text-success-foreground">Atualizado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Backup</CardTitle>
              <CardDescription>
                Gerencie backups manuais do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <HardDrive className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Backup Manual</h4>
                      <p className="text-sm text-blue-700">
                        Gere uma cópia de segurança completa do banco de dados SQL Server.
                        O backup incluirá todos os dados e estruturas do sistema.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Último Backup</h4>
                      <p className="text-sm text-muted-foreground">
                        Nunca executado
                      </p>
                    </div>
                    <Badge variant="secondary">Não disponível</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Pasta de Destino</h4>
                      <p className="text-sm text-muted-foreground">
                        C:\Backups\
                      </p>
                    </div>
                    <Badge variant="outline">Configurado</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Formato do Arquivo</h4>
                      <p className="text-sm text-muted-foreground">
                        SQL Server Backup (.bak)
                      </p>
                    </div>
                    <Badge variant="outline">Padrão</Badge>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-center">
                  <SistemaBackup />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Recomendações</h4>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Execute backups regularmente</li>
                        <li>• Mantenha backups em local seguro</li>
                        <li>• Teste a restauração periodicamente</li>
                        <li>• Considere backups em mídia externa</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
