import React from "react";
import { Shield, Users, FileText, Edit, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useAuth } from "../../contexts/AuthContext";

export function InfoAdministrador() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Card de boas-vindas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-blue-900">Bem-vindo, {user?.nomeCompleto || user?.nome}</CardTitle>
              <p className="text-blue-700 text-sm">
                Você é um administrador do sistema de controle de ponto
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  Administradores não registram ponto próprio
                </h4>
                <p className="text-blue-700 text-sm">
                  Como gestor, você não precisa registrar ponto para si mesmo. 
                  Sua função é gerenciar os pontos dos funcionários operacionais.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suas permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Suas Permissões de Administrador</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Consultar Todos os Registros</h4>
                <p className="text-sm text-gray-600">
                  Visualize os pontos de todos os funcionários com filtros por data, período e status.
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  Gerenciar Pontos
                </Badge>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Corrigir e Incluir Registros</h4>
                <p className="text-sm text-gray-600">
                  Edite horários incorretos ou registre ponto para funcionários que esqueceram de bater.
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  Edição Manual
                </Badge>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Gerar Relatórios Completos</h4>
                <p className="text-sm text-gray-600">
                  Crie relatórios detalhados de horas trabalhadas, extras, atrasos e exporte em Excel/PDF.
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  Relatórios
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos passos */}
      <Card>
        <CardHeader>
          <CardTitle>Começar a Gerenciar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">1. Gerenciar Pontos dos Funcionários</h4>
                <p className="text-sm text-gray-600">
                  Veja todos os registros, edite se necessário e acompanhe a presença.
                </p>
              </div>
              <Badge variant="secondary">Aba "Gerenciar"</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">2. Gerar Relatórios Mensais</h4>
                <p className="text-sm text-gray-600">
                  Crie relatórios de horas extras, atrasos e produtividade da equipe.
                </p>
              </div>
              <Badge variant="secondary">Aba "Relatórios"</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
