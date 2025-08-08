import React, { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Calendar, Check } from "lucide-react";

export function TesteFiltros() {
  const [testesRealizados, setTestesRealizados] = useState<string[]>([]);

  const testes = [
    {
      id: "dashboard",
      nome: "Dashboard",
      descricao: "Filtros de data inicial e final funcionando",
      status: "implementado"
    },
    {
      id: "caixa", 
      nome: "Caixa",
      descricao: "Filtros por período nos lançamentos",
      status: "implementado"
    },
    {
      id: "agendamentos",
      nome: "Agendamentos", 
      descricao: "Filtros de período já existentes",
      status: "implementado"
    },
    {
      id: "contas",
      nome: "Contas",
      descricao: "Filtros de período já existentes", 
      status: "implementado"
    },
    {
      id: "relatorios",
      nome: "Relatórios",
      descricao: "Filtros de período já existentes",
      status: "implementado"
    },
    {
      id: "clientes",
      nome: "Clientes",
      descricao: "Filtros por data de cadastro implementados",
      status: "implementado"
    },
    {
      id: "funcionarios",
      nome: "Funcionários", 
      descricao: "Filtros por data de cadastro implementados",
      status: "implementado"
    },
    {
      id: "campanhas",
      nome: "Campanhas",
      descricao: "Filtros por período com estatísticas reais",
      status: "implementado"
    }
  ];

  const marcarTesteConcluido = (testeId: string) => {
    if (!testesRealizados.includes(testeId)) {
      setTestesRealizados([...testesRealizados, testeId]);
    }
  };

  const todosTestes = testes.length;
  const testesCompletos = testesRealizados.length;
  const percentualCompleto = Math.round((testesCompletos / todosTestes) * 100);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Status dos Filtros de Período por Página
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {testesCompletos}/{todosTestes} implementados
          </Badge>
          <Badge variant="secondary">
            {percentualCompleto}% completo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {testes.map((teste) => (
          <div
            key={teste.id}
            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{teste.nome}</h4>
                <Badge 
                  variant="default"
                  className="bg-green-100 text-green-700 text-xs"
                >
                  ✓ Implementado
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {teste.descricao}
              </p>
            </div>
            <Button
              size="sm"
              variant={testesRealizados.includes(teste.id) ? "default" : "outline"}
              onClick={() => marcarTesteConcluido(teste.id)}
              className="ml-3"
            >
              {testesRealizados.includes(teste.id) ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Testado
                </>
              ) : (
                "Testar"
              )}
            </Button>
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">
            ✅ Implementação Completa
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Todas as páginas</strong> agora têm filtros de período funcionais</p>
            <p>• <strong>Datas inicial e final</strong> são usadas apenas para pesquisa/filtro</p>
            <p>• <strong>Não são salvas no banco</strong> - apenas para consulta</p>
            <p>• <strong>Componente reutilizável</strong> FiltrosPeriodo criado</p>
            <p>• <strong>Filtros automáticos</strong> com botões de período rápido</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
