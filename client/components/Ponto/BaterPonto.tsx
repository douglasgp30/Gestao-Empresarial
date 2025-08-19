import React, { useState } from "react";
import { Clock, Calendar, User, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { usePonto } from "../../contexts/PontoContext";
import { useAuth } from "../../contexts/AuthContext";
import { pontoApi } from "../../lib/pontoApi";
import { pontoLocalStorage } from "../../lib/pontoLocalStorage";

interface BaterPontoProps {
  onPontoRegistrado?: () => void;
}

export function BaterPonto({ onPontoRegistrado }: BaterPontoProps) {
  const { user } = useAuth();
  const { 
    pontoHoje, 
    proximaBatida, 
    podeRegistrar, 
    isRegistrandoPonto, 
    registrarPonto 
  } = usePonto();
  
  const [observacao, setObservacao] = useState("");
  const [mostrarObservacao, setMostrarObservacao] = useState(false);

  const handleRegistrarPonto = async () => {
    try {
      await registrarPonto(observacao.trim() || undefined);
      setObservacao("");
      setMostrarObservacao(false);
      onPontoRegistrado?.();
    } catch (error) {
      // Erro já tratado no context
    }
  };

  const formatarHorario = (data?: Date | string) => {
    return pontoApi.formatarHorario(data);
  };

  const formatarData = (data?: Date | string) => {
    return pontoApi.formatarData(data);
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case "entrada":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "saida_almoco":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "retorno_almoco":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "saida":
        return "bg-green-100 text-green-800 border-green-200";
      case "completo":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const obterTextoStatus = (status: string) => {
    switch (status) {
      case "entrada":
        return "Pronto para entrada";
      case "saida_almoco":
        return "Trabalhando - pode sair para almoço";
      case "retorno_almoco":
        return "No horário de almoço";
      case "saida":
        return "Trabalhando - pode registrar saída";
      case "completo":
        return "Ponto completo";
      default:
        return "Status desconhecido";
    }
  };

  const ponto = pontoHoje?.ponto;

  return (
    <div className="space-y-6">
      {/* Header com informações do usuário */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{user?.nomeCompleto}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {user?.tipoAcesso} • Hoje, {formatarData(new Date())}
                </p>
              </div>
            </div>
            <Badge className={obterCorStatus(proximaBatida)}>
              {obterTextoStatus(proximaBatida)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Status do ponto atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Registros de Hoje</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Entrada */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Entrada</div>
              <div className={`text-lg font-mono ${ponto?.horaEntrada ? 'text-foreground' : 'text-muted-foreground'}`}>
                {formatarHorario(ponto?.horaEntrada)}
              </div>
              {ponto?.horaEntrada && (
                <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
              )}
            </div>

            {/* Saída Almoço */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Saída Almoço</div>
              <div className={`text-lg font-mono ${ponto?.horaSaidaAlmoco ? 'text-foreground' : 'text-muted-foreground'}`}>
                {formatarHorario(ponto?.horaSaidaAlmoco)}
              </div>
              {ponto?.horaSaidaAlmoco && (
                <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
              )}
            </div>

            {/* Retorno Almoço */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Retorno Almoço</div>
              <div className={`text-lg font-mono ${ponto?.horaRetornoAlmoco ? 'text-foreground' : 'text-muted-foreground'}`}>
                {formatarHorario(ponto?.horaRetornoAlmoco)}
              </div>
              {ponto?.horaRetornoAlmoco && (
                <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
              )}
            </div>

            {/* Saída */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Saída</div>
              <div className={`text-lg font-mono ${ponto?.horaSaida ? 'text-foreground' : 'text-muted-foreground'}`}>
                {formatarHorario(ponto?.horaSaida)}
              </div>
              {ponto?.horaSaida && (
                <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
              )}
            </div>
          </div>

          {/* Informações extras se houver */}
          {ponto && (
            <div className="mt-4 pt-4 border-t space-y-2">
              {ponto.totalHoras !== undefined && ponto.totalHoras > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total trabalhado:</span>
                  <span className="font-medium">{pontoApi.formatarDuracaoHoras(ponto.totalHoras)}</span>
                </div>
              )}
              
              {ponto.atraso !== undefined && ponto.atraso > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Atraso:</span>
                  <span className="font-medium text-orange-600">{pontoApi.formatarMinutos(ponto.atraso)}</span>
                </div>
              )}
              
              {ponto.horasExtras !== undefined && ponto.horasExtras > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas extras:</span>
                  <span className="font-medium text-green-600">{pontoApi.formatarDuracaoHoras(ponto.horasExtras)}</span>
                </div>
              )}
              
              {ponto.observacao && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Observação:</span>
                  <p className="mt-1 text-foreground">{ponto.observacao}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de registro de ponto */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {podeRegistrar ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {pontoApi.obterTextoBatida(proximaBatida)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Clique no botão abaixo para registrar sua {proximaBatida.replace('_', ' ')}
                  </p>
                </div>

                {/* Botão para mostrar campo de observação */}
                {!mostrarObservacao && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarObservacao(true)}
                  >
                    Adicionar Observação
                  </Button>
                )}

                {/* Campo de observação */}
                {mostrarObservacao && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Observação (opcional)"
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMostrarObservacao(false);
                        setObservacao("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                {/* Botão principal */}
                <Button
                  onClick={handleRegistrarPonto}
                  disabled={isRegistrandoPonto}
                  size="lg"
                  className="w-full max-w-xs"
                >
                  {isRegistrandoPonto ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Bater Ponto
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-800">
                    Ponto Completo para Hoje
                  </h3>
                  <p className="text-sm text-green-700">
                    Todos os registros do dia foram realizados.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Horário atual */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold">
              {new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
