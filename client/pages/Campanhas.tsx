import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Megaphone, ArrowRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Campanhas() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Campanhas</h1>
        <p className="text-muted-foreground">
          Gestão de campanhas de marketing e promoções
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Megaphone className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Campanhas Integradas ao Caixa</CardTitle>
          <CardDescription>
            As campanhas são criadas e gerenciadas diretamente no módulo de Caixa durante o lançamento de receitas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary" />
              Como funciona:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Ao lançar uma receita no módulo Caixa, você pode criar ou selecionar uma campanha</span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Cada serviço realizado pode ser vinculado a uma campanha específica</span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Relatórios de performance por campanha estarão disponíveis no módulo de Relatórios</span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Histórico completo de campanhas e resultados integrados ao sistema financeiro</span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <Link to="/caixa">
              <Button className="w-full">
                <DollarSign className="h-4 w-4 mr-2" />
                Ir para o Módulo Caixa
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
