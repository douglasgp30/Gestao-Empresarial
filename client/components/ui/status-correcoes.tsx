import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { CheckCircle, AlertCircle, Code, Calendar } from "lucide-react";

export function StatusCorrecoes() {
  const correcoes = [
    {
      arquivo: "dateUtils.ts",
      status: "criado",
      descricao: "Função utilitária segura para formatação de datas",
      detalhes: "Lida com Date, string, null, undefined e datas inválidas"
    },
    {
      arquivo: "ModalCampanhas.tsx", 
      status: "corrigido",
      descricao: "Função formatDate atualizada para usar utilitário",
      detalhes: "TypeError: date.toLocaleDateString corrigido"
    },
    {
      arquivo: "ListaLancamentosSimples.tsx",
      status: "corrigido", 
      descricao: "Função formatarData substituída por formatDate seguro",
      detalhes: "Evita erros com datas vindas da API"
    },
    {
      arquivo: "tabela-responsiva.tsx",
      status: "corrigido",
      descricao: "Função formatDate local removida, usando utilitário",
      detalhes: "Consistência na formatação de datas"
    },
    {
      arquivo: "Clientes.tsx",
      status: "corrigido",
      descricao: "Import da função utilitária adicionado",
      detalhes: "Formatação segura de datas de cadastro"
    },
    {
      arquivo: "Dashboard.tsx",
      status: "corrigido",
      descricao: "Funções formatDate locais substituídas",
      detalhes: "Usa formatDate e formatDateRange do utilitário"
    }
  ];

  const statusColors = {
    criado: "bg-blue-100 text-blue-700",
    corrigido: "bg-green-100 text-green-700",
    pendente: "bg-yellow-100 text-yellow-700"
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Status das Correções - Formatação de Datas
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-700">
            ✅ Erro TypeError resolvido
          </Badge>
          <Badge variant="outline">
            {correcoes.length} arquivos corrigidos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {correcoes.map((correcao, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-sm">{correcao.arquivo}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${statusColors[correcao.status as keyof typeof statusColors]}`}
                >
                  {correcao.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 mb-1">{correcao.descricao}</p>
              <p className="text-xs text-gray-500">{correcao.detalhes}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Problema Resolvido
          </h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>• <strong>TypeError eliminado:</strong> date.toLocaleDateString is not a function</p>
            <p>• <strong>Função utilitária criada:</strong> formatDate seguro para todos os tipos de entrada</p>
            <p>• <strong>Validação robusta:</strong> Lida com strings, Date objects, null, undefined</p>
            <p>• <strong>Tratamento de erro:</strong> Retorna "-" para datas inválidas com log de warning</p>
            <p>• <strong>Consistência:</strong> Mesma formatação em toda a aplicação</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">O que foi implementado:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>✅ <code>formatDate(date)</code> - Formatação básica de data</p>
            <p>✅ <code>formatDateTime(date)</code> - Formatação de data e hora</p>
            <p>✅ <code>formatDateRange(inicio, fim)</code> - Formatação de intervalos</p>
            <p>✅ Suporte a Date objects, strings ISO, null, undefined</p>
            <p>✅ Logs de debug para valores inválidos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
