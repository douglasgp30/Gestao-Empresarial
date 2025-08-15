-- CreateTable for unified geographic locations (cities and sectors)
CREATE TABLE "localizacoes_geograficas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipoItem" TEXT NOT NULL, -- "cidade" ou "setor"
    "cidade" TEXT,  -- Nome da cidade pai (apenas para setores)
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX "localizacoes_geograficas_tipoItem_idx" ON "localizacoes_geograficas"("tipoItem");
CREATE INDEX "localizacoes_geograficas_ativo_idx" ON "localizacoes_geograficas"("ativo");
CREATE INDEX "localizacoes_geograficas_cidade_idx" ON "localizacoes_geograficas"("cidade");

-- Add localizacaoId to lancamentos_caixa
ALTER TABLE "lancamentos_caixa" ADD COLUMN "localizacaoId" INTEGER;

-- Add localizacaoId to agendamentos
ALTER TABLE "agendamentos" ADD COLUMN "localizacaoId" INTEGER;

-- Add localizacaoId to contas_lancamentos_enhanced
ALTER TABLE "contas_lancamentos_enhanced" ADD COLUMN "localizacaoId" INTEGER;

-- Add foreign key constraints
-- Note: SQLite doesn't support adding foreign keys to existing tables,
-- so we'll handle the relationships in the application code
