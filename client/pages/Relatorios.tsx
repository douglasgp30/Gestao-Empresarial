import React from 'react';
import PlaceholderPage from './PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export default function Relatorios() {
  return (
    <PlaceholderPage
      title="Relatórios"
      description="Relatórios financeiros e operacionais"
      icon={BarChart3}
      features={[
        'Relatórios financeiros detalhados',
        'Filtros avançados por período',
        'Exportação em PDF e Excel',
        'Análise de receitas e despesas',
        'Relatórios por técnico e setor',
        'Gráficos e visualizações',
        'Relatórios personalizados'
      ]}
    />
  );
}
