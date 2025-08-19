import React, { useState } from "react";
import { Clock, History, Settings, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { PontoProvider } from "../contexts/PontoContext";
import { BaterPonto } from "../components/Ponto/BaterPonto";
import { HistoricoPonto } from "../components/Ponto/HistoricoPonto";
import { GerenciarPontos } from "../components/Ponto/GerenciarPontos";

function PontoContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("ponto");

  // Verificar se o usuário tem permissão para acessar o controle de ponto
  const podeAcessarPonto = user?.tipoAcesso === "Administrador" || user?.registraPonto;

  if (!podeAcessarPonto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Você não tem permissão para acessar o controle de ponto. Entre em contato com o administrador do sistema para habilitar essa funcionalidade.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = user?.tipoAcesso === "Administrador";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Controle de Ponto</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus registros de entrada e saída
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              <Clock className="h-3 w-3 mr-1" />
              {new Date().toLocaleDateString('pt-BR')}
            </Badge>
            {user?.registraPonto && (
              <Badge variant="secondary" className="text-sm">
                Autorizado
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Navegação por abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="ponto" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Bater Ponto</span>
          </TabsTrigger>
          
          <TabsTrigger value="historico" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Meu Histórico</span>
          </TabsTrigger>

          {isAdmin && (
            <>
              <TabsTrigger value="gerenciar" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Gerenciar</span>
              </TabsTrigger>

              <TabsTrigger value="relatorios" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Relatórios</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Conteúdo das abas */}
        <TabsContent value="ponto" className="space-y-6">
          <BaterPonto />
        </TabsContent>

        <TabsContent value="historico" className="space-y-6">
          <HistoricoPonto />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="gerenciar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Gerenciamento de Pontos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
                    <p className="text-muted-foreground">
                      Funcionalidades administrativas em desenvolvimento.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relatorios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Relatórios de Ponto</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
                    <p className="text-muted-foreground">
                      Sistema de relatórios em desenvolvimento.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

export default function Ponto() {
  return (
    <PontoProvider>
      <PontoContent />
    </PontoProvider>
  );
}
