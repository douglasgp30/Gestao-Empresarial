/**
 * Sistema de recuperação de dados perdidos
 * Implementa múltiplas camadas de proteção e recuperação
 */

import { LancamentoCaixa } from "@shared/types";

export class DataRecoveryService {
  private static readonly RECOVERY_PREFIX = "recovery_";
  private static readonly BACKUP_PREFIX = "lancamentos_backup_";
  private static readonly DELETED_PREFIX = "lancamento_excluido_";

  /**
   * Verifica se há dados perdidos e tenta recuperar automaticamente
   */
  static async checkAndRecoverLostData(): Promise<{
    found: boolean;
    recovered: LancamentoCaixa[];
    sources: string[];
  }> {
    console.log("🔍 Iniciando verificação de dados perdidos...");

    const result = {
      found: false,
      recovered: [] as LancamentoCaixa[],
      sources: [] as string[],
    };

    // 1. Verificar localStorage principal
    const currentData = this.getCurrentData();
    console.log(`📊 Dados atuais: ${currentData.length} lançamentos`);

    // 2. Procurar por backups automáticos
    const backups = this.findBackups();
    console.log(`💾 Backups encontrados: ${backups.length}`);

    // 3. Procurar por dados excluídos recentemente
    const deletedRecords = this.findDeletedRecords();
    console.log(`🗑️ Registros excluídos: ${deletedRecords.length}`);

    // 4. Tentar recuperar de cada fonte
    if (backups.length > 0) {
      const recoveredFromBackup = await this.recoverFromBackups(backups);
      if (recoveredFromBackup.length > 0) {
        result.found = true;
        result.recovered.push(...recoveredFromBackup);
        result.sources.push("backup automatico");
      }
    }

    if (deletedRecords.length > 0) {
      const recoveredFromDeleted =
        await this.recoverFromDeleted(deletedRecords);
      if (recoveredFromDeleted.length > 0) {
        result.found = true;
        result.recovered.push(...recoveredFromDeleted);
        result.sources.push("registros excluidos");
      }
    }

    // 5. Remover duplicatas baseado no ID
    result.recovered = this.removeDuplicates(result.recovered);

    console.log(
      `✅ Recuperação concluída: ${result.recovered.length} registros únicos`,
    );

    return result;
  }

  /**
   * Obter dados atuais do localStorage
   */
  private static getCurrentData(): LancamentoCaixa[] {
    try {
      const data = localStorage.getItem("lancamentos");
      if (data) {
        return JSON.parse(data).map((l: any) => ({
          ...l,
          data: new Date(l.data),
          dataPagamento: l.dataPagamento
            ? new Date(l.dataPagamento)
            : undefined,
        }));
      }
    } catch (error) {
      console.error("Erro ao ler dados atuais:", error);
    }
    return [];
  }

  /**
   * Encontrar todos os backups disponíveis
   */
  private static findBackups(): Array<{ key: string; timestamp: number }> {
    const backups: Array<{ key: string; timestamp: number }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.BACKUP_PREFIX)) {
        const timestampStr = key.replace(this.BACKUP_PREFIX, "");
        const timestamp = parseInt(timestampStr);
        if (!isNaN(timestamp)) {
          backups.push({ key, timestamp });
        }
      }
    }

    // Ordenar por timestamp decrescente (mais recente primeiro)
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Encontrar registros excluídos recentemente
   */
  private static findDeletedRecords(): Array<{
    key: string;
    timestamp: number;
  }> {
    const deleted: Array<{ key: string; timestamp: number }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.DELETED_PREFIX)) {
        const parts = key.split("_");
        const timestampStr = parts[parts.length - 1];
        const timestamp = parseInt(timestampStr);
        if (!isNaN(timestamp)) {
          deleted.push({ key, timestamp });
        }
      }
    }

    // Ordenar por timestamp decrescente (mais recente primeiro)
    return deleted.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Recuperar dados de backups
   */
  private static async recoverFromBackups(
    backups: Array<{ key: string; timestamp: number }>,
  ): Promise<LancamentoCaixa[]> {
    const recovered: LancamentoCaixa[] = [];

    for (const backup of backups) {
      try {
        const data = localStorage.getItem(backup.key);
        if (data) {
          const parsed = JSON.parse(data);
          const lancamentosReais = parsed
            .filter((item: any) => !item.id?.startsWith("ex")) // Filtrar mock data
            .map((l: any) => ({
              ...l,
              data: new Date(l.data),
              dataPagamento: l.dataPagamento
                ? new Date(l.dataPagamento)
                : undefined,
            }));

          console.log(
            `📂 Backup ${backup.key}: ${lancamentosReais.length} lançamentos reais`,
          );
          recovered.push(...lancamentosReais);
        }
      } catch (error) {
        console.error(`Erro ao processar backup ${backup.key}:`, error);
      }
    }

    return recovered;
  }

  /**
   * Recuperar dados de registros excluídos
   */
  private static async recoverFromDeleted(
    deleted: Array<{ key: string; timestamp: number }>,
  ): Promise<LancamentoCaixa[]> {
    const recovered: LancamentoCaixa[] = [];

    for (const record of deleted) {
      try {
        const data = localStorage.getItem(record.key);
        if (data) {
          const lancamento = JSON.parse(data);
          // Verificar se não é mock data
          if (!lancamento.id?.startsWith("ex")) {
            const processedLancamento = {
              ...lancamento,
              data: new Date(lancamento.data),
              dataPagamento: lancamento.dataPagamento
                ? new Date(lancamento.dataPagamento)
                : undefined,
            };
            recovered.push(processedLancamento);
            console.log(`🔄 Recuperado lançamento excluído: ${lancamento.id}`);
          }
        }
      } catch (error) {
        console.error(
          `Erro ao processar registro excluído ${record.key}:`,
          error,
        );
      }
    }

    return recovered;
  }

  /**
   * Remover duplicatas baseado no ID
   */
  private static removeDuplicates(
    lancamentos: LancamentoCaixa[],
  ): LancamentoCaixa[] {
    const seen = new Set<string>();
    return lancamentos.filter((lancamento) => {
      if (seen.has(lancamento.id)) {
        return false;
      }
      seen.add(lancamento.id);
      return true;
    });
  }

  /**
   * Criar backup de emergência antes de qualquer operação crítica
   */
  static createEmergencyBackup(
    data: LancamentoCaixa[],
    reason: string,
  ): string {
    const timestamp = Date.now();
    const key = `emergency_backup_${timestamp}`;
    const backupData = {
      timestamp,
      reason,
      data: data,
      count: data.length,
    };

    localStorage.setItem(key, JSON.stringify(backupData));
    console.log(
      `🚨 Backup de emergência criado: ${key} (${data.length} registros)`,
    );

    return key;
  }

  /**
   * Listar todos os backups disponíveis para interface de usuário
   */
  static listAvailableBackups(): Array<{
    key: string;
    timestamp: number;
    date: string;
    type: "backup" | "deleted" | "emergency";
    count?: number;
  }> {
    const backups: Array<any> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      let type: "backup" | "deleted" | "emergency" | null = null;
      let timestampStr = "";

      if (key.startsWith(this.BACKUP_PREFIX)) {
        type = "backup";
        timestampStr = key.replace(this.BACKUP_PREFIX, "");
      } else if (key.startsWith(this.DELETED_PREFIX)) {
        type = "deleted";
        const parts = key.split("_");
        timestampStr = parts[parts.length - 1];
      } else if (key.startsWith("emergency_backup_")) {
        type = "emergency";
        timestampStr = key.replace("emergency_backup_", "");
      }

      if (type && timestampStr) {
        const timestamp = parseInt(timestampStr);
        if (!isNaN(timestamp)) {
          const date = new Date(timestamp);
          const item = {
            key,
            timestamp,
            date: date.toLocaleString("pt-BR"),
            type,
          };

          // Tentar obter contagem se for backup
          if (type === "backup" || type === "emergency") {
            try {
              const data = localStorage.getItem(key);
              if (data) {
                const parsed = JSON.parse(data);
                if (type === "backup") {
                  item.count = parsed.filter(
                    (item: any) => !item.id?.startsWith("ex"),
                  ).length;
                } else if (type === "emergency") {
                  item.count = parsed.count || parsed.data?.length || 0;
                }
              }
            } catch (error) {
              console.warn(`Erro ao ler ${key}:`, error);
            }
          }

          backups.push(item);
        }
      }
    }

    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }
}
