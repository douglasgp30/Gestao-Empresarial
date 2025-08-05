import React from 'react';
import PlaceholderPage from './PlaceholderPage';
import { Settings } from 'lucide-react';

export default function Configuracoes() {
  return (
    <PlaceholderPage
      title="Configurações"
      description="Configurações gerais do sistema"
      icon={Settings}
      features={[
        'Configuração de permissões de usuários',
        'Definição de percentuais de imposto',
        'Gestão de categorias de despesas',
        'Configuração de setores e departamentos',
        'Parâmetros gerais do sistema',
        'Backup e restauração',
        'Configurações de relatórios'
      ]}
    />
  );
}
