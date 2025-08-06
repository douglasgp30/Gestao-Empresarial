import { BackupConfig, BackupResult } from '@shared/types';

export class BackupService {
  private static readonly STORAGE_KEY = 'backup_config';

  static getBackupConfig(): BackupConfig {
    try {
      const config = localStorage.getItem(this.STORAGE_KEY);
      if (config) {
        const parsed = JSON.parse(config);
        return {
          localBackup: parsed.localBackup || 'C:\\Backups\\',
          backupAutomatico: parsed.backupAutomatico !== false,
          ultimoBackup: parsed.ultimoBackup ? new Date(parsed.ultimoBackup) : undefined,
          ultimoLoginData: parsed.ultimoLoginData || undefined
        };
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de backup:', error);
    }
    
    return {
      localBackup: 'C:\\Backups\\',
      backupAutomatico: true,
      ultimoBackup: undefined,
      ultimoLoginData: undefined
    };
  }

  static updateBackupConfig(config: Partial<BackupConfig>): void {
    const currentConfig = this.getBackupConfig();
    const updatedConfig = { ...currentConfig, ...config };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedConfig));
  }

  static generateBackupFileName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return `backup_${year}-${month}-${day}_${hour}-${minute}-${second}`;
  }

  static isFirstLoginToday(): boolean {
    const config = this.getBackupConfig();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return config.ultimoLoginData !== today;
  }

  static markLoginToday(): void {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    this.updateBackupConfig({ ultimoLoginData: today });
  }

  static shouldPerformAutomaticBackup(): boolean {
    const config = this.getBackupConfig();
    
    // Verificar se backup automático está ativado
    if (!config.backupAutomatico) {
      return false;
    }

    // Verificar se local de backup está configurado
    if (!config.localBackup.trim()) {
      return false;
    }

    // Verificar se é o primeiro login do dia
    return this.isFirstLoginToday();
  }

  static async performBackup(
    onProgress?: (stage: string, progress: number) => void
  ): Promise<BackupResult> {
    const config = this.getBackupConfig();
    
    if (!config.localBackup.trim()) {
      return {
        sucesso: false,
        dataBackup: new Date(),
        erro: 'Local de backup não configurado'
      };
    }

    const fileName = this.generateBackupFileName();
    const fullPath = `${config.localBackup.endsWith('\\') ? config.localBackup : config.localBackup + '\\'}${fileName}`;

    try {
      // Simular etapas do backup
      const stages = [
        { stage: 'Verificando configurações...', duration: 500 },
        { stage: 'Conectando ao banco de dados...', duration: 800 },
        { stage: 'Validando integridade dos dados...', duration: 1200 },
        { stage: 'Exportando dados do Caixa...', duration: 1500 },
        { stage: 'Exportando dados de Contas...', duration: 1200 },
        { stage: 'Exportando dados de Funcionários...', duration: 800 },
        { stage: 'Exportando configurações...', duration: 600 },
        { stage: 'Compactando arquivo de backup...', duration: 1000 },
        { stage: 'Finalizando backup...', duration: 400 }
      ];

      for (let i = 0; i < stages.length; i++) {
        const { stage, duration } = stages[i];
        const progress = ((i + 1) / stages.length) * 100;
        
        if (onProgress) {
          onProgress(stage, progress);
        }

        // Simular tempo de processamento
        await new Promise(resolve => setTimeout(resolve, duration));
      }

      // Atualizar configuração com último backup
      const backupDate = new Date();
      this.updateBackupConfig({ ultimoBackup: backupDate });

      return {
        sucesso: true,
        nomeArquivo: fileName,
        caminhoCompleto: fullPath,
        dataBackup: backupDate
      };

    } catch (error) {
      console.error('Erro ao executar backup:', error);
      return {
        sucesso: false,
        dataBackup: new Date(),
        erro: error instanceof Error ? error.message : 'Erro desconhecido durante o backup'
      };
    }
  }

  static showBackupAlert(message: string, isError: boolean = false): void {
    // Criar notificação visual
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm transition-all duration-300 ${
      isError 
        ? 'bg-red-100 border border-red-300 text-red-800' 
        : 'bg-green-100 border border-green-300 text-green-800'
    }`;
    
    alertDiv.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="flex-shrink-0">
          ${isError 
            ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
            : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
          }
        </div>
        <div class="flex-1">
          <p class="font-medium">${isError ? 'Erro no Backup' : 'Backup Realizado'}</p>
          <p class="text-sm">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 ml-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(alertDiv);

    // Auto-remover após 5 segundos
    setTimeout(() => {
      if (alertDiv.parentElement) {
        alertDiv.remove();
      }
    }, 5000);
  }

  static showConfigurationAlert(): void {
    this.showBackupAlert(
      '⚠️ Local de backup não definido. Configure em Configurações.',
      true
    );
  }
}
