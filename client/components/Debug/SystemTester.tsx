import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { runSystemTests, SystemTestReport, formatTestReport } from '../../lib/systemTests';
import { Loader2, Play, CheckCircle, XCircle, AlertCircle, ChevronDown } from 'lucide-react';

export default function SystemTester() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<SystemTestReport | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const testReport = await runSystemTests();
      setReport(testReport);
      setIsExpanded(true);
      
      // Log detalhado no console
      console.log(formatTestReport(testReport));
    } catch (error) {
      console.error('Erro ao executar testes:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'fail':
        return <Badge variant="destructive">Reprovado</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aviso</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Testes do Sistema
        </CardTitle>
        <CardDescription>
          Execute testes automatizados para verificar a integridade das funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleRunTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Executando Testes...' : 'Executar Testes'}
          </Button>
        </div>

        {report && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(report.overall)}
                  <span>Relatório de Testes</span>
                  {getStatusBadge(report.overall)}
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 mt-4">
              {/* Resumo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Resumo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{report.summary.passed}</div>
                      <div className="text-sm text-muted-foreground">Aprovados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{report.summary.failed}</div>
                      <div className="text-sm text-muted-foreground">Falharam</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{report.summary.warnings}</div>
                      <div className="text-sm text-muted-foreground">Avisos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{report.summary.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detalhes por categoria */}
              {(() => {
                const categories = [...new Set(report.results.map(r => r.category))];
                return categories.map(category => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg">🏷️ {category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {report.results
                          .filter(r => r.category === category)
                          .map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result.status)}
                                <span className="font-medium">{result.test}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{result.message}</span>
                                {getStatusBadge(result.status)}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}

              {/* Timestamp */}
              <div className="text-xs text-muted-foreground text-center">
                Executado em: {report.timestamp.toLocaleString('pt-BR')}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Instruções */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 O que este teste verifica:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Cadastro Dinâmico:</strong> Se os setores e cidades são criados e atualizados em tempo real</li>
              <li>• <strong>Meta Mensal:</strong> Se o cálculo da meta está correto (Meta Restante = Meta - Alcançado)</li>
              <li>• <strong>Filtros de Data:</strong> Se o filtro "Este Mês" mostra do dia 1 ao último dia</li>
              <li>• <strong>Validações:</strong> Se os campos obrigatórios estão sendo validados</li>
              <li>• <strong>API:</strong> Se a comunicação com o backend está funcionando</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
