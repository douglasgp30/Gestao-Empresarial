import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Construction, ArrowRight } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  features?: string[];
}

export default function PlaceholderPage({ 
  title, 
  description, 
  icon: Icon = Construction,
  features = []
}: PlaceholderPageProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Icon className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Módulo em Desenvolvimento</CardTitle>
          <CardDescription>
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Funcionalidades planejadas:</h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="pt-4 border-t">
            <Button onClick={() => window.history.back()} variant="outline" className="w-full">
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
