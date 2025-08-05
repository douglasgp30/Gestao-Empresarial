// Sistema de Migração Automática - Simulação para Frontend
// Em um sistema real, isso seria executado no backend com SQL Server

interface MigrationScript {
  version: string;
  description: string;
  script: string;
  executed: boolean;
}

const migrations: MigrationScript[] = [
  {
    version: "1.0.0",
    description: "Criar tabela Campanhas",
    script: `
      IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Campanhas')
      BEGIN
          CREATE TABLE Campanhas (
              id INT PRIMARY KEY IDENTITY,
              nome NVARCHAR(100) NOT NULL,
              descricao NVARCHAR(500),
              ativa BIT DEFAULT 1,
              data_inicio DATETIME,
              data_fim DATETIME,
              data_criacao DATETIME DEFAULT GETDATE()
          )
      END
    `,
    executed: false,
  },
  {
    version: "1.0.1",
    description: "Criar tabela Descricoes",
    script: `
      IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Descricoes')
      BEGIN
          CREATE TABLE Descricoes (
              id INT PRIMARY KEY IDENTITY,
              nome NVARCHAR(100) NOT NULL,
              categoria NVARCHAR(50),
              data_criacao DATETIME DEFAULT GETDATE()
          )
      END
    `,
    executed: false,
  },
  {
    version: "1.0.2",
    description: "Criar tabela FormasPagamento",
    script: `
      IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'FormasPagamento')
      BEGIN
          CREATE TABLE FormasPagamento (
              id INT PRIMARY KEY IDENTITY,
              nome NVARCHAR(50) NOT NULL,
              ativa BIT DEFAULT 1,
              data_criacao DATETIME DEFAULT GETDATE()
          )
      END
    `,
    executed: false,
  },
  {
    version: "1.0.3",
    description: "Criar tabela Clientes",
    script: `
      IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Clientes')
      BEGIN
          CREATE TABLE Clientes (
              id INT PRIMARY KEY IDENTITY,
              nome NVARCHAR(100) NOT NULL,
              cpf NVARCHAR(14),
              telefone1 NVARCHAR(20) NOT NULL,
              telefone2 NVARCHAR(20),
              email NVARCHAR(100),
              endereco NVARCHAR(500),
              data_criacao DATETIME DEFAULT GETDATE()
          )
      END
    `,
    executed: false,
  },
  {
    version: "1.0.4",
    description: "Criar tabela Fornecedores",
    script: `
      IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Fornecedores')
      BEGIN
          CREATE TABLE Fornecedores (
              id INT PRIMARY KEY IDENTITY,
              nome NVARCHAR(100) NOT NULL,
              telefone NVARCHAR(20),
              data_criacao DATETIME DEFAULT GETDATE()
          )
      END
    `,
    executed: false,
  },
];

class MigrationService {
  private static instance: MigrationService;
  private migrationKey = "system_migrations_executed";

  static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  async runMigrations(): Promise<void> {
    console.log("🔄 Iniciando verificação de migrações...");

    const executedMigrations = this.getExecutedMigrations();
    const pendingMigrations = migrations.filter(
      (migration) => !executedMigrations.includes(migration.version),
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ Todas as migrações já foram executadas");
      return;
    }

    console.log(
      `🔧 Executando ${pendingMigrations.length} migração(ões) pendente(s)...`,
    );

    for (const migration of pendingMigrations) {
      try {
        await this.executeMigration(migration);
        this.markMigrationAsExecuted(migration.version);
        console.log(
          `✅ Migração ${migration.version} executada: ${migration.description}`,
        );
      } catch (error) {
        console.error(`❌ Erro na migração ${migration.version}:`, error);
        throw new Error(
          `Falha na migração ${migration.version}: ${migration.description}`,
        );
      }
    }

    console.log("🎉 Todas as migrações foram executadas com sucesso!");
  }

  private async executeMigration(migration: MigrationScript): Promise<void> {
    // Simulação de execução SQL - em um sistema real seria executado no SQL Server
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Executando SQL: ${migration.script.substring(0, 100)}...`);
        resolve();
      }, 100);
    });
  }

  private getExecutedMigrations(): string[] {
    const stored = localStorage.getItem(this.migrationKey);
    return stored ? JSON.parse(stored) : [];
  }

  private markMigrationAsExecuted(version: string): void {
    const executed = this.getExecutedMigrations();
    if (!executed.includes(version)) {
      executed.push(version);
      localStorage.setItem(this.migrationKey, JSON.stringify(executed));
    }
  }

  getMigrationStatus(): Array<{
    version: string;
    description: string;
    executed: boolean;
  }> {
    const executedMigrations = this.getExecutedMigrations();
    return migrations.map((migration) => ({
      version: migration.version,
      description: migration.description,
      executed: executedMigrations.includes(migration.version),
    }));
  }

  async resetMigrations(): Promise<void> {
    localStorage.removeItem(this.migrationKey);
    console.log(
      "🔄 Migrações resetadas - próxima inicialização executará todas",
    );
  }
}

export const migrationService = MigrationService.getInstance();

import React from "react";

// Hook para executar migrações automaticamente
export function useMigrations() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const runMigrations = async () => {
      try {
        await migrationService.runMigrations();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };

    runMigrations();
  }, []);

  return { isLoading, error };
}
