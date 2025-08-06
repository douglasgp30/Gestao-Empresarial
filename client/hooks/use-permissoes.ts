import { useAuth } from '../contexts/AuthContext';
import { FuncionarioPermissoes } from '@shared/types';

export function usePermissoes() {
  const { user } = useAuth();

  // Se não há usuário logado, sem permissões
  if (!user) {
    return {
      temPermissao: () => false,
      isAdmin: false,
      isOperador: false,
      permissoes: null,
    };
  }

  // Administrador tem todas as permissões por padrão
  const isAdmin = user.tipoAcesso === 'Administrador';
  const isOperador = user.tipoAcesso === 'Operador';

  // Função para verificar permissão específica
  const temPermissao = (permissao: keyof FuncionarioPermissoes): boolean => {
    // Administrador sempre tem permissão
    if (isAdmin) return true;
    
    // Para operadores, verificar permissões específicas
    // TODO: Implementar verificação real das permissões do usuário
    // Por enquanto, retorna true para permissões básicas
    const permissoesBasicas: (keyof FuncionarioPermissoes)[] = [
      'acessarDashboard',
      'verCaixa', 
      'lancarReceita',
      'lancarDespesa',
      'verContas',
      'marcarContasPagas',
      'gerarRelatorios',
      'verCadastros'
    ];
    
    return permissoesBasicas.includes(permissao);
  };

  return {
    temPermissao,
    isAdmin,
    isOperador,
    permissoes: user.permissoes || null,
  };
}

// Hook para componentes que precisam ser protegidos
export function usePermissaoComponente(permissaoRequerida: keyof FuncionarioPermissoes) {
  const { temPermissao } = usePermissoes();
  return temPermissao(permissaoRequerida);
}

// Hook para esconder/mostrar elementos baseado em permissões
export function usePermissaoCondicional(permissaoRequerida: keyof FuncionarioPermissoes) {
  const { temPermissao } = usePermissoes();
  
  return {
    mostrar: temPermissao(permissaoRequerida),
    esconder: !temPermissao(permissaoRequerida),
  };
}
