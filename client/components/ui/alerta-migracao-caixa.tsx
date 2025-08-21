import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { AlertTriangle, Database, Loader2 } from "lucide-react";

export function AlertaMigracaoCaixa() {
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [migrandoAgora, setMigrandoAgora] = useState(false);
  const [resultadoMigracao, setResultadoMigracao] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há dados no localStorage que precisam ser migrados
    const verificarMigracao = () => {
      const lancamentosLocal = localStorage.getItem("lancamentos_caixa");
      const jaVerificado = localStorage.getItem("migracao_caixa_verificada");
      
      if (lancamentosLocal && !jaVerificado) {
        const dados = JSON.parse(lancamentosLocal);
        if (dados.length > 0) {
          setMostrarAlerta(true);
        } else {
          // Se não há dados, marcar como verificado
          localStorage.setItem("migracao_caixa_verificada", "true");
        }
      }
    };

    verificarMigracao();
  }, []);

  const handleMigrar = async () => {
    setMigrandoAgora(true);
    setResultadoMigracao(null);

    try {
      // Usar a função global de migração
      const resultado = await (window as any).migrarLancamentosParaBanco();
      
      if (resultado.success) {
        setResultadoMigracao(`✅ Migração concluída! ${resultado.sucessos} lançamentos migrados.`);
        localStorage.setItem("migracao_caixa_verificada", "true");
        
        // Esconder alerta após 3 segundos se foi bem-sucedida
        setTimeout(() => {
          setMostrarAlerta(false);
        }, 3000);
      } else {
        setResultadoMigracao(`❌ Erro na migração: ${resultado.message}`);
      }
    } catch (error) {
      setResultadoMigracao(`❌ Erro inesperado: ${error.message}`);
    } finally {
      setMigrandoAgora(false);
    }
  };

  const handleIgnorar = () => {
    localStorage.setItem("migracao_caixa_verificada", "true");
    setMostrarAlerta(false);
  };

  const handleDebug = () => {
    // Abrir console com informações de debug
    (window as any).debugCaixa();
    console.log("💡 Use 'migrarUmLancamento(0)' para testar a migração de um lançamento");
    console.log("💡 Use 'migrarLancamentosParaBanco()' para migrar todos os lançamentos");
  };

  if (!mostrarAlerta) {
    return null;
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">
        🔄 Migração de Dados Necessária
      </AlertTitle>
      <AlertDescription className="text-orange-700">
        <div className="space-y-3">
          <p>
            Detectamos lançamentos do caixa salvos localmente que precisam ser migrados para o banco de dados. 
            Isso garantirá que seus dados sejam preservados entre diferentes dispositivos e sessões.
          </p>
          
          {resultadoMigracao && (
            <div className="p-2 bg-white rounded border">
              <code className="text-sm">{resultadoMigracao}</code>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              onClick={handleMigrar} 
              disabled={migrandoAgora}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {migrandoAgora ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Migrando...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Migrar para Banco
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDebug}
              className="border-orange-300 text-orange-700"
            >
              Ver Detalhes
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleIgnorar}
              className="text-orange-600"
            >
              Ignorar (não recomendado)
            </Button>
          </div>
          
          <div className="text-xs text-orange-600 mt-2">
            💡 <strong>Dica:</strong> A migração criará automaticamente um backup dos seus dados antes de transferi-los.
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
