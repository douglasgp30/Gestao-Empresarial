import React from 'react';
import PlaceholderPage from './PlaceholderPage';
import { FileText } from 'lucide-react';

export default function Contas() {
  return (
    <PlaceholderPage
      title="Contas"
      description="Gestão de contas a pagar e receber"
      icon={FileText}
      features={[
        'Contas a pagar para fornecedores',
        'Contas a receber de clientes',
        'Controle de vencimentos e status',
        'Alertas para contas vencidas',
        'Filtros por período e status',
        'Totalizadores por categoria',
        'Histórico de pagamentos'
      ]}
    />
  );
}
