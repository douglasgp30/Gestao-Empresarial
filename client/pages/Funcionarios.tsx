import React from 'react';
import PlaceholderPage from './PlaceholderPage';
import { Users } from 'lucide-react';

export default function Funcionarios() {
  return (
    <PlaceholderPage
      title="Funcionários"
      description="Cadastro e gestão de funcionários"
      icon={Users}
      features={[
        'Cadastro completo de funcionários',
        'Controle de login e senhas',
        'Definição de permissões de acesso',
        'Configuração de tipos de acesso (Admin/Operador)',
        'Gestão de percentual de comissão',
        'Histórico de atividades',
        'Relatórios de performance'
      ]}
    />
  );
}
