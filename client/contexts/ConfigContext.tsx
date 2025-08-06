import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BackupConfig } from '@shared/types';

interface EmpresaConfig {
  nomeEmpresa: string;
  subtituloEmpresa: string;
  logoUrl?: string;
  corPrimaria: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  cnpj?: string;
}

interface ConfigContextType {
  empresaConfig: EmpresaConfig;
  backupConfig: BackupConfig;
  updateEmpresaConfig: (config: Partial<EmpresaConfig>) => void;
  updateBackupConfig: (config: Partial<BackupConfig>) => void;
  resetToDefault: () => void;
}

const defaultConfig: EmpresaConfig = {
  nomeEmpresa: 'Solução Desentupimento',
  subtituloEmpresa: 'Sistema de Gestão Empresarial',
  corPrimaria: '217 91% 60%',
  endereco: '',
  telefone: '',
  email: '',
  cnpj: ''
};

const defaultBackupConfig: BackupConfig = {
  localBackup: 'C:\\Backups\\',
  backupAutomatico: true,
  ultimoBackup: undefined,
  ultimoLoginData: undefined
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [empresaConfig, setEmpresaConfig] = useState<EmpresaConfig>(defaultConfig);
  const [backupConfig, setBackupConfig] = useState<BackupConfig>(defaultBackupConfig);

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedConfig = localStorage.getItem('empresa_config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setEmpresaConfig({ ...defaultConfig, ...parsedConfig });
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }

    // Carregar configurações de backup
    const savedBackupConfig = localStorage.getItem('backup_config');
    if (savedBackupConfig) {
      try {
        const parsedBackupConfig = JSON.parse(savedBackupConfig);
        setBackupConfig({ ...defaultBackupConfig, ...parsedBackupConfig });
      } catch (error) {
        console.error('Erro ao carregar configurações de backup:', error);
      }
    }
  }, []);

  const updateEmpresaConfig = (newConfig: Partial<EmpresaConfig>) => {
    const updatedConfig = { ...empresaConfig, ...newConfig };
    setEmpresaConfig(updatedConfig);
    localStorage.setItem('empresa_config', JSON.stringify(updatedConfig));
    
    // Atualizar CSS custom property se cor primária foi alterada
    if (newConfig.corPrimaria) {
      document.documentElement.style.setProperty('--primary', newConfig.corPrimaria);
    }
  };

  const resetToDefault = () => {
    setEmpresaConfig(defaultConfig);
    localStorage.removeItem('empresa_config');
    document.documentElement.style.setProperty('--primary', defaultConfig.corPrimaria);
  };

  const value = {
    empresaConfig,
    updateEmpresaConfig,
    resetToDefault
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
