import React from 'react';
import PlaceholderPage from './PlaceholderPage';
import { Megaphone } from 'lucide-react';

export default function Campanhas() {
  return (
    <PlaceholderPage
      title="Campanhas"
      description="Gestão de campanhas de marketing e promoções"
      icon={Megaphone}
      features={[
        'Criação e gestão de campanhas',
        'Controle de períodos de vigência',
        'Vinculação de serviços a campanhas',
        'Relatórios de performance por campanha',
        'Análise de ROI e resultados',
        'Histórico de campanhas anteriores'
      ]}
    />
  );
}
