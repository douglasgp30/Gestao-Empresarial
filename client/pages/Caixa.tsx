import React from 'react';
import PlaceholderPage from './PlaceholderPage';
import { DollarSign } from 'lucide-react';

export default function Caixa() {
  return (
    <PlaceholderPage
      title="Caixa"
      description="Controle de receitas e despesas da empresa"
      icon={DollarSign}
      features={[
        'Lançamentos de receita (serviços realizados)',
        'Lançamentos de despesa',
        'Cálculo automático de comissões',
        'Controle de formas de pagamento',
        'Filtros por período, técnico e campanha',
        'Visualização de totais e saldo',
        'Gestão de notas fiscais e impostos'
      ]}
    />
  );
}
