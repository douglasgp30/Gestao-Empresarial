import React, { useState } from "react";
import { useConfig } from "../contexts/ConfigContext";
import { useDashboard } from "../contexts/DashboardContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Alert, AlertDescription } from "../components/ui/alert";
import SistemaBackup from "../components/Backup/SistemaBackup";
import { CleanFakeData } from "../components/Debug/CleanFakeData";
import LimpezaCompleta from "../components/Debug/LimpezaCompleta";
import ResetarSistema from "../components/Debug/ResetarSistema";
import { DiagnosticoLoop } from "../components/Debug/DiagnosticoLoop";
import { TesteBasico } from "../components/Debug/TesteBasico";
import { DebugPrimeiroAcesso } from "../components/Debug/DebugPrimeiroAcesso";
import { DebugTecnicos } from "../components/Debug/DebugTecnicos";
import { DebugFormularioReceita } from "../components/Debug/DebugFormularioReceita";
import { GerenciadorCidadesSetores } from "../components/Caixa/GerenciadorCidadesSetores";
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
  HardDrive,
  BarChart3,
  FolderOpen,
  AlertTriangle,
  Shield,
} from "lucide-react";
import EmpresaLogo from "../components/EmpresaLogo";
import LogsAuditoria from "../components/Auditoria/LogsAuditoria";
import { useEffect } from "react";

export default function Configuracoes() {
  const { user } = useAuth();
  const {
    empresaConfig,
    backupConfig,
    updateEmpresaConfig,
    updateBackupConfig,
    resetToDefault,
  } = useConfig();
  const [localConfig, setLocalConfig] = useState(empresaConfig);
  const [localBackupConfig, setLocalBackupConfig] = useState(backupConfig);
  const [savedMessage, setSavedMessage] = useState(false);

  // Configurações de usuários
  const [percentualComissao, setPercentualComissao] = useState(15);
  const [percentualImposto, setPercentualImposto] = useState(6);
  const [tempoSessao, setTempoSessao] = useState(60);
  const [abrirSiteNotaFiscal, setAbrirSiteNotaFiscal] = useState(true);
  const [urlSiteNotaFiscal, setUrlSiteNotaFiscal] = useState(
    "https://www6.goiania.go.gov.br/sistemas/saces/asp/saces00000f5.asp?sigla=snfse&c=1&aid=efeb5319b1b9661f1a8a5aee6848c7db68773380001&dth=20250812101733",
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [temaDark, setTemaDark] = useState(false);

  // Carregar configurações salvas ao inicializar
  useEffect(() => {
    console.log("📂 [Configurações] Carregando configurações salvas...");
    const savedConfigs = localStorage.getItem("userConfigs");

    if (savedConfigs) {
      try {
        const configs = JSON.parse(savedConfigs);
        console.log("📄 [Configurações] Configurações encontradas:", configs);

        setPercentualComissao(configs.percentualComissao || 15);
        setPercentualImposto(configs.percentualImposto || 6);
        setTempoSessao(configs.tempoSessao || 60);

        // Carregamento explícito para evitar problemas de persistência
        const abrirSiteValue =
          configs.abrirSiteNotaFiscal === true ||
          configs.abrirSiteNotaFiscal === "true";
        console.log(
          "🔧 [Configurações] Configuração abrir site NF:",
          configs.abrirSiteNotaFiscal,
          "->",
          abrirSiteValue,
        );
        setAbrirSiteNotaFiscal(abrirSiteValue);

        setUrlSiteNotaFiscal(
          configs.urlSiteNotaFiscal ||
            "https://www6.goiania.go.gov.br/sistemas/saces/asp/saces00000f5.asp?sigla=snfse&c=1&aid=efeb5319b1b9661f1a8a5aee6848c7db68773380001&dth=20250812101733",
        );

        console.log("✅ [Configurações] Configurações carregadas com sucesso");
      } catch (error) {
        console.error(
          "❌ [Configurações] Erro ao carregar configurações:",
          error,
        );
      }
    } else {
      console.log(
        "📭 [Configurações] Nenhuma configuração salva encontrada, usando valores padrão",
      );
    }

    // Carregar tema salvo
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setTemaDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setTemaDark(false);
    }
  }, []);

  const validateUserConfigs = () => {
    const errors: Record<string, string> = {};

    if (percentualComissao < 0 || percentualComissao > 100) {
      errors.percentualComissao =
        "Percentual de comissão deve estar entre 0% e 100%";
    }

    if (percentualImposto < 0 || percentualImposto > 100) {
      errors.percentualImposto =
        "Percentual de imposto deve estar entre 0% e 100%";
    }

    if (tempoSessao < 5 || tempoSessao > 480) {
      errors.tempoSessao = "Tempo de sessão deve estar entre 5 e 480 minutos";
    }

    if (abrirSiteNotaFiscal && !urlSiteNotaFiscal.trim()) {
      errors.urlSiteNotaFiscal =
        "URL do site de nota fiscal é obrigatória quando a opção está ativada";
    }

    if (urlSiteNotaFiscal.trim() && !urlSiteNotaFiscal.startsWith("http")) {
      errors.urlSiteNotaFiscal = "URL deve começar com http:// ou https://";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateUserConfigs()) {
      return;
    }

    updateEmpresaConfig(localConfig);
    updateBackupConfig(localBackupConfig);

    // Salvar configurações de usuários no localStorage
    const configsToSave = {
      percentualComissao,
      percentualImposto,
      tempoSessao,
      abrirSiteNotaFiscal,
      urlSiteNotaFiscal,
    };

    console.log("💾 [Configurações] Salvando configurações:", configsToSave);

    try {
      localStorage.setItem("userConfigs", JSON.stringify(configsToSave));
      console.log("✅ [Configurações] Configurações salvas com sucesso");
    } catch (error) {
      console.error("❌ [Configurações] Erro ao salvar configurações:", error);
    }

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleReset = () => {
    resetToDefault();
    setLocalConfig({
      nomeEmpresa: "Solução Desentupimento",
      subtituloEmpresa: "Sistema de Gestão Empresarial",
      corPrimaria: "217 91% 60%",
      endereco: "",
      telefone: "",
      email: "",
      cnpj: "",
    });
    setLocalBackupConfig({
      localBackup: "C:\\Backups\\",
      backupAutomatico: true,
      ultimoBackup: undefined,
      ultimoLoginData: undefined,
    });

    // Resetar configurações de usuários
    setPercentualComissao(15);
    setPercentualImposto(6);
    setTempoSessao(60);
    setAbrirSiteNotaFiscal(true);
    setUrlSiteNotaFiscal(
      "https://www6.goiania.go.gov.br/sistemas/saces/asp/saces00000f5.asp?sigla=snfse&c=1&aid=efeb5319b1b9661f1a8a5aee6848c7db68773380001&dth=20250812101733",
    );
    setValidationErrors({});

    // Resetar tema para claro
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    setTemaDark(false);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (m��ximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("O arquivo deve ter no máximo 2MB.");
        return;
      }

      // Validar tipo do arquivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione apenas arquivos de imagem.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setLocalConfig({ ...localConfig, logoUrl });

        // Feedback de sucesso
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 2000);
      };
      reader.onerror = () => {
        alert("Erro ao carregar a imagem. Tente novamente.");
      };
      reader.readAsDataURL(file);
    }

    // Limpar o input para permitir upload do mesmo arquivo novamente
    event.target.value = "";
  };

  const cores = [
    { nome: "Azul Padrão", valor: "217 91% 60%" },
    { nome: "Verde", valor: "142 71% 45%" },
    { nome: "Roxo", valor: "262 52% 47%" },
    { nome: "Laranja", valor: "25 95% 53%" },
    { nome: "Vermelho", valor: "0 84% 60%" },
    { nome: "Cinza", valor: "220 9% 46%" },
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
          <AlertDescription>Configurações salvas com sucesso!</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
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
          <TabsTrigger value="testes">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Limpeza
          </TabsTrigger>
          <TabsTrigger value="auditoria">
            <Shield className="h-4 w-4 mr-2" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="debug">
            <Settings className="h-4 w-4 mr-2" />
            Debug
          </TabsTrigger>
          <TabsTrigger value="localizacoes">
            <Building2 className="h-4 w-4 mr-2" />
            Localizações
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
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        nomeEmpresa: e.target.value,
                      })
                    }
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtituloEmpresa">Subtítulo</Label>
                  <Input
                    id="subtituloEmpresa"
                    value={localConfig.subtituloEmpresa}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        subtituloEmpresa: e.target.value,
                      })
                    }
                    placeholder="Subtítulo ou slogan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={localConfig.endereco || ""}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, endereco: e.target.value })
                  }
                  placeholder="Endereço completo da empresa"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={localConfig.telefone || ""}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        telefone: e.target.value,
                      })
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={localConfig.email || ""}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, email: e.target.value })
                    }
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={localConfig.cnpj || ""}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, cnpj: e.target.value })
                    }
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
              <CardTitle>Tema do Sistema</CardTitle>
              <CardDescription>
                Escolha entre modo claro ou escuro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button
                  variant={!temaDark ? "default" : "outline"}
                  onClick={() => {
                    document.documentElement.classList.remove("dark");
                    localStorage.setItem("theme", "light");
                    setTemaDark(false);
                  }}
                  className="flex-1"
                >
                  ☀️ Modo Claro
                </Button>
                <Button
                  variant={temaDark ? "default" : "outline"}
                  onClick={() => {
                    document.documentElement.classList.add("dark");
                    localStorage.setItem("theme", "dark");
                    setTemaDark(true);
                  }}
                  className="flex-1"
                >
                  🌙 Modo Escuro
                </Button>
              </div>
            </CardContent>
          </Card>

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
                      onClick={() => document.getElementById("logo")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Imagem
                    </Button>
                    {localConfig.logoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setLocalConfig({ ...localConfig, logoUrl: undefined })
                        }
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
                    onClick={() =>
                      setLocalConfig({ ...localConfig, corPrimaria: cor.valor })
                    }
                    className={`p-3 rounded-lg border-2 transition-all ${
                      localConfig.corPrimaria === cor.valor
                        ? "border-foreground"
                        : "border-transparent hover:border-muted-foreground"
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
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        corPrimaria: e.target.value,
                      })
                    }
                    placeholder="217 91% 60%"
                  />
                  <div
                    className="w-12 h-10 rounded border border-border"
                    style={{
                      backgroundColor: `hsl(${localConfig.corPrimaria})`,
                    }}
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
                Configurações relacionadas a funcionários e permissões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="percentualComissao">
                    Percentual de Comissão Padrão (%)
                  </Label>
                  <Input
                    id="percentualComissao"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={percentualComissao}
                    onChange={(e) =>
                      setPercentualComissao(parseFloat(e.target.value) || 0)
                    }
                    placeholder="15"
                    className={
                      validationErrors.percentualComissao
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {validationErrors.percentualComissao && (
                    <p className="text-sm text-red-500">
                      {validationErrors.percentualComissao}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Percentual aplicado por padrão para novos funcionários
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="percentualImposto">
                    Percentual de Imposto (NF) (%)
                  </Label>
                  <Input
                    id="percentualImposto"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={percentualImposto}
                    onChange={(e) =>
                      setPercentualImposto(parseFloat(e.target.value) || 0)
                    }
                    placeholder="6"
                    className={
                      validationErrors.percentualImposto ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.percentualImposto && (
                    <p className="text-sm text-red-500">
                      {validationErrors.percentualImposto}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Desconto aplicado quando nota fiscal é emitida
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Configurações de Nota Fiscal
                  </h3>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Switch
                        id="abrir-site-nf"
                        checked={abrirSiteNotaFiscal}
                        onCheckedChange={setAbrirSiteNotaFiscal}
                      />
                      <div>
                        <Label htmlFor="abrir-site-nf" className="font-medium">
                          Abrir automaticamente site de emissão de NF
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {abrirSiteNotaFiscal
                            ? "Site será aberto automaticamente ao marcar nota fiscal"
                            : "Site não será aberto automaticamente"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={abrirSiteNotaFiscal ? "default" : "secondary"}
                    >
                      {abrirSiteNotaFiscal ? "Ativo" : "Desativo"}
                    </Badge>
                  </div>

                  {abrirSiteNotaFiscal && (
                    <div className="space-y-2">
                      <Label htmlFor="urlSiteNotaFiscal">
                        URL do Site de Emissão de Nota Fiscal{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="urlSiteNotaFiscal"
                        type="url"
                        value={urlSiteNotaFiscal}
                        onChange={(e) => setUrlSiteNotaFiscal(e.target.value)}
                        placeholder="https://exemplo.gov.br/nota-fiscal"
                        className={
                          validationErrors.urlSiteNotaFiscal
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {validationErrors.urlSiteNotaFiscal && (
                        <p className="text-sm text-red-500">
                          {validationErrors.urlSiteNotaFiscal}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        URL do sistema de emissão de nota fiscal do seu
                        estado/município
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="tempoSessao">
                    Tempo de Sessão Automática (minutos)
                  </Label>
                  <Input
                    id="tempoSessao"
                    type="number"
                    min="5"
                    max="480"
                    value={tempoSessao}
                    onChange={(e) =>
                      setTempoSessao(parseInt(e.target.value) || 60)
                    }
                    placeholder="60"
                    className={
                      validationErrors.tempoSessao ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.tempoSessao && (
                    <p className="text-sm text-red-500">
                      {validationErrors.tempoSessao}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Tempo limite para logout automático (5 a 480 minutos)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configura��ões do Sistema</CardTitle>
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
                  <Badge className="bg-green-100 text-green-800">
                    Conectado
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Migrações de Banco</h4>
                    <p className="text-sm text-muted-foreground">
                      Sistema de atualização automática
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Atualizado
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Backup</CardTitle>
              <CardDescription>
                Configure o local de backup e backup automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="localBackup">Local de Backup</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="localBackup"
                      value={localBackupConfig.localBackup}
                      onChange={(e) =>
                        setLocalBackupConfig({
                          ...localBackupConfig,
                          localBackup: e.target.value,
                        })
                      }
                      placeholder="C:\Backups\"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Em um sistema real, isso abriria um seletor de pasta
                        alert(
                          "Função para selecionar pasta seria implementada aqui",
                        );
                      }}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Diretório onde os backups automáticos e manuais serão salvos
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Switch
                      id="backup-automatico"
                      checked={localBackupConfig.backupAutomatico}
                      onCheckedChange={(checked) =>
                        setLocalBackupConfig({
                          ...localBackupConfig,
                          backupAutomatico: checked,
                        })
                      }
                    />
                    <div>
                      <Label
                        htmlFor="backup-automatico"
                        className="font-medium"
                      >
                        Backup Automático Diário
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {localBackupConfig.backupAutomatico
                          ? "Backup será feito automaticamente no primeiro login do dia"
                          : "Backup automático desativado"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      localBackupConfig.backupAutomatico
                        ? "default"
                        : "secondary"
                    }
                  >
                    {localBackupConfig.backupAutomatico ? "Ativo" : "Desativo"}
                  </Badge>
                </div>

                {localBackupConfig.backupAutomatico &&
                  !localBackupConfig.localBackup.trim() && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        ⚠️ Local de backup não definido. Configure o local de
                        backup para ativar o backup automático.
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            </CardContent>
          </Card>

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
                      <h4 className="font-medium text-blue-800">
                        Backup Manual
                      </h4>
                      <p className="text-sm text-blue-700">
                        Gere uma cópia de segurança completa do banco de dados
                        SQL Server. O backup incluirá todos os dados e
                        estruturas do sistema.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Último Backup</h4>
                      <p className="text-sm text-muted-foreground">
                        {backupConfig.ultimoBackup
                          ? new Date(backupConfig.ultimoBackup).toLocaleString(
                              "pt-BR",
                            )
                          : "Nunca executado"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        backupConfig.ultimoBackup ? "default" : "secondary"
                      }
                    >
                      {backupConfig.ultimoBackup
                        ? "Disponível"
                        : "Não disponível"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Pasta de Destino</h4>
                      <p className="text-sm text-muted-foreground">
                        {backupConfig.localBackup}
                      </p>
                    </div>
                    <Badge
                      variant={
                        backupConfig.localBackup.trim()
                          ? "default"
                          : "destructive"
                      }
                    >
                      {backupConfig.localBackup.trim()
                        ? "Configurado"
                        : "Não configurado"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Formato do Arquivo</h4>
                      <p className="text-sm text-muted-foreground">
                        backup_YYYY-MM-DD_HH-MM-SS
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
                      <h4 className="font-medium text-yellow-800">
                        Recomendações
                      </h4>
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

        <TabsContent value="testes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Status do Sistema</CardTitle>
              <CardDescription>
                Acompanhe o status dos módulos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ✅ Sistema funcionando corretamente com dados reais
              </p>
            </CardContent>
          </Card>

          <TesteBasico />

          <DiagnosticoLoop />

          <CleanFakeData />

          <LimpezaCompleta />

          <ResetarSistema />
        </TabsContent>

        <TabsContent value="auditoria" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Logs de Auditoria
              </CardTitle>
              <CardDescription>
                Visualize todas as ações executadas no sistema pelos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.tipoAcesso !== "Administrador" ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-red-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-700 mb-2">
                    Acesso Restrito
                  </h3>
                  <p className="text-sm text-red-600 mb-4">
                    Apenas administradores podem visualizar os logs de
                    auditoria.
                  </p>
                  <Badge variant="destructive">Acesso negado</Badge>
                </div>
              ) : (
                <LogsAuditoria />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <DebugPrimeiroAcesso />
          <DebugTecnicos />
        </TabsContent>

        <TabsContent value="localizacoes" className="space-y-6">
          <GerenciadorCidadesSetores />
        </TabsContent>
      </Tabs>
    </div>
  );
}
