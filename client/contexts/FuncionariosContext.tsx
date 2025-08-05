import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Funcionario } from '@shared/types';
import { useAuth } from './AuthContext';

interface FuncionariosContextType {
  funcionarios: Funcionario[];
  filtros: {
    busca?: string;
    tipoAcesso?: 'Administrador' | 'Operador' | 'todos';
    status?: 'ativo' | 'inativo' | 'todos';
    permissaoAcesso?: boolean;
  };
  estatisticas: {
    totalFuncionarios: number;
    totalAtivos: number;
    totalAdministradores: number;
    totalOperadores: number;
  };
  adicionarFuncionario: (funcionario: Omit<Funcionario, 'id' | 'dataCadastro'>) => void;
  editarFuncionario: (id: string, funcionario: Partial<Funcionario>) => void;
  excluirFuncionario: (id: string) => void;
  alterarStatusFuncionario: (id: string, ativo: boolean) => void;
  setFiltros: (filtros: any) => void;
  isLoading: boolean;
}

const FuncionariosContext = createContext<FuncionariosContextType | undefined>(undefined);

// Mock data inicial
const mockFuncionarios: Funcionario[] = [
  {
    id: '1',
    nomeCompleto: 'Administrador do Sistema',
    login: 'admin',
    senha: 'admin123',
    permissaoAcesso: true,
    tipoAcesso: 'Administrador',
    percentualComissao: 0,
    dataCadastro: new Date(2024, 0, 1),
    ativo: true
  },
  {
    id: '2',
    nomeCompleto: 'João Silva',
    login: 'joao',
    senha: '123456',
    permissaoAcesso: true,
    tipoAcesso: 'Operador',
    percentualComissao: 15,
    dataCadastro: new Date(2024, 1, 15),
    ativo: true
  },
  {
    id: '3',
    nomeCompleto: 'Carlos Santos',
    login: 'carlos',
    senha: 'carlos123',
    permissaoAcesso: true,
    tipoAcesso: 'Operador',
    percentualComissao: 12,
    dataCadastro: new Date(2024, 2, 10),
    ativo: true
  },
  {
    id: '4',
    nomeCompleto: 'Roberto Lima',
    login: 'roberto',
    senha: 'roberto123',
    permissaoAcesso: true,
    tipoAcesso: 'Operador',
    percentualComissao: 18,
    dataCadastro: new Date(2024, 3, 5),
    ativo: true
  },
  {
    id: '5',
    nomeCompleto: 'Fernando Costa',
    login: 'fernando',
    senha: 'fernando123',
    permissaoAcesso: false,
    tipoAcesso: 'Operador',
    percentualComissao: 10,
    dataCadastro: new Date(2024, 4, 20),
    ativo: false
  }
];

export function FuncionariosProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(mockFuncionarios);
  const [isLoading, setIsLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    tipoAcesso: 'todos' as 'Administrador' | 'Operador' | 'todos',
    status: 'todos' as 'ativo' | 'inativo' | 'todos'
  });

  const adicionarFuncionario = (novoFuncionario: Omit<Funcionario, 'id' | 'dataCadastro'>) => {
    const id = Date.now().toString();
    const funcionario: Funcionario = {
      ...novoFuncionario,
      id,
      dataCadastro: new Date()
    };

    setFuncionarios(prev => [...prev, funcionario]);
  };

  const editarFuncionario = (id: string, dadosAtualizados: Partial<Funcionario>) => {
    setFuncionarios(prev => 
      prev.map(funcionario => 
        funcionario.id === id 
          ? { ...funcionario, ...dadosAtualizados }
          : funcionario
      )
    );
  };

  const excluirFuncionario = (id: string) => {
    // Não permitir excluir o próprio usuário ou o admin principal
    if (id === user?.id || id === '1') {
      alert('Não é possível excluir este usuário.');
      return;
    }
    setFuncionarios(prev => prev.filter(funcionario => funcionario.id !== id));
  };

  const alterarStatusFuncionario = (id: string, ativo: boolean) => {
    // Não permitir desativar o próprio usuário ou o admin principal
    if ((id === user?.id || id === '1') && !ativo) {
      alert('Não é possível desativar este usuário.');
      return;
    }
    
    editarFuncionario(id, { ativo });
  };

  // Calcular estatísticas baseadas nos filtros
  const estatisticas = React.useMemo(() => {
    const funcionariosFiltrados = funcionarios.filter(funcionario => {
      const buscaCorreta = !filtros.busca || 
        funcionario.nomeCompleto.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        funcionario.login.toLowerCase().includes(filtros.busca.toLowerCase());
      const tipoCorreto = filtros.tipoAcesso === 'todos' || funcionario.tipoAcesso === filtros.tipoAcesso;
      const statusCorreto = filtros.status === 'todos' || 
        (filtros.status === 'ativo' && funcionario.ativo) ||
        (filtros.status === 'inativo' && !funcionario.ativo);
      const permissaoCorreta = filtros.permissaoAcesso === undefined || funcionario.permissaoAcesso === filtros.permissaoAcesso;

      return buscaCorreta && tipoCorreto && statusCorreto && permissaoCorreta;
    });

    return {
      totalFuncionarios: funcionariosFiltrados.length,
      totalAtivos: funcionarios.filter(f => f.ativo).length,
      totalAdministradores: funcionarios.filter(f => f.tipoAcesso === 'Administrador').length,
      totalOperadores: funcionarios.filter(f => f.tipoAcesso === 'Operador').length
    };
  }, [funcionarios, filtros]);

  const value = {
    funcionarios,
    filtros,
    estatisticas,
    adicionarFuncionario,
    editarFuncionario,
    excluirFuncionario,
    alterarStatusFuncionario,
    setFiltros,
    isLoading
  };

  return (
    <FuncionariosContext.Provider value={value}>
      {children}
    </FuncionariosContext.Provider>
  );
}

export function useFuncionarios() {
  const context = useContext(FuncionariosContext);
  if (context === undefined) {
    throw new Error('useFuncionarios must be used within a FuncionariosProvider');
  }
  return context;
}
