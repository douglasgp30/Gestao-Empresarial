import React from "react";
import { AgendamentosProvider } from "../contexts/AgendamentosContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Plus } from "lucide-react";
import FiltrosAgendamentosCompacto from "../components/Agendamentos/FiltrosAgendamentosCompacto";
import ListaAgendamentos from "../components/Agendamentos/ListaAgendamentos";
import FormularioAgendamento from "../components/Agendamentos/FormularioAgendamento";
import TotaisAgendamentos from "../components/Agendamentos/TotaisAgendamentos";

export default function Agendamentos() {
  return (
    <AgendamentosProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
              <p className="text-muted-foreground">
                Gerencie os agendamentos de serviços da empresa
              </p>
            </div>
          </div>
          
          <FormularioAgendamento>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Agendamento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </FormularioAgendamento>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filtros</CardTitle>
            <CardDescription>
              Filtre os agendamentos por período, status, setor ou técnico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FiltrosAgendamentosCompacto />
          </CardContent>
        </Card>

        {/* Lista de Agendamentos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lista de Agendamentos</CardTitle>
            <CardDescription>
              Visualize, edite e gerencie todos os agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListaAgendamentos />
          </CardContent>
        </Card>

        {/* Totais e Estatísticas */}
        <TotaisAgendamentos />

        {/* Informações de Rodapé */}
        <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
          <p>
            💡 Os lembretes serão exibidos automaticamente no horário configurado. 
            Certifique-se de manter o sistema aberto para receber as notificações.
          </p>
        </div>
      </div>
    </AgendamentosProvider>
  );
}
