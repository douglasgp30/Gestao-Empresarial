import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginCredentials, Funcionario } from '@shared/types';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demonstration - in a real app this would be from a database
const mockFuncionarios: Funcionario[] = [
  {
    id: '1',
    nomeCompleto: 'Administrador do Sistema',
    login: 'admin',
    senha: 'admin123',
    permissaoAcesso: true,
    tipoAcesso: 'Administrador',
    percentualComissao: 0,
    dataCadastro: new Date(),
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
    dataCadastro: new Date(),
    ativo: true
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const funcionario = mockFuncionarios.find(
      f => f.login === credentials.login && 
           f.senha === credentials.senha && 
           f.permissaoAcesso && 
           f.ativo
    );

    if (funcionario) {
      const authUser: AuthUser = {
        id: funcionario.id,
        nomeCompleto: funcionario.nomeCompleto,
        login: funcionario.login,
        tipoAcesso: funcionario.tipoAcesso,
        permissaoAcesso: funcionario.permissaoAcesso
      };
      
      setUser(authUser);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
