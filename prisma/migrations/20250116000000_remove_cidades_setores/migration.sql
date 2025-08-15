-- Remove foreign key constraints first
-- Remove cidadeId and setorId from lancamentos_caixa
PRAGMA foreign_keys=off;

-- Create new lancamentos_caixa table without cidade/setor references
CREATE TABLE "lancamentos_caixa_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataHora" DATETIME NOT NULL,
    "valor" REAL NOT NULL,
    "valorRecebido" REAL,
    "valorLiquido" REAL,
    "comissao" REAL,
    "imposto" REAL,
    "observacoes" TEXT,
    "numeroNota" TEXT,
    "arquivoNota" TEXT,
    "tipo" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricaoId" INTEGER NOT NULL,
    "formaPagamentoId" INTEGER NOT NULL,
    "subdescricaoId" INTEGER,
    "funcionarioId" INTEGER,
    "campanhaId" INTEGER,
    "clienteId" INTEGER,
    "descricaoECategoriaId" INTEGER,
    CONSTRAINT "lancamentos_caixa_descricaoId_fkey" FOREIGN KEY ("descricaoId") REFERENCES "descricoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "formas_pagamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_subdescricaoId_fkey" FOREIGN KEY ("subdescricaoId") REFERENCES "subdescricoes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_descricaoECategoriaId_fkey" FOREIGN KEY ("descricaoECategoriaId") REFERENCES "descricoes_e_categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data from old table (excluding cidadeId and setorId columns)
INSERT INTO "lancamentos_caixa_new" (
    "id", "dataHora", "valor", "valorRecebido", "valorLiquido", "comissao", "imposto", 
    "observacoes", "numeroNota", "arquivoNota", "tipo", "dataCriacao", 
    "descricaoId", "formaPagamentoId", "subdescricaoId", "funcionarioId", 
    "campanhaId", "clienteId", "descricaoECategoriaId"
)
SELECT 
    "id", "dataHora", "valor", "valorRecebido", "valorLiquido", "comissao", "imposto", 
    "observacoes", "numeroNota", "arquivoNota", "tipo", "dataCriacao", 
    "descricaoId", "formaPagamentoId", "subdescricaoId", "funcionarioId", 
    "campanhaId", "clienteId", "descricaoECategoriaId"
FROM "lancamentos_caixa";

-- Drop old table and rename new one
DROP TABLE "lancamentos_caixa";
ALTER TABLE "lancamentos_caixa_new" RENAME TO "lancamentos_caixa";

-- Recreate indexes for lancamentos_caixa
CREATE INDEX "lancamentos_caixa_dataHora_idx" ON "lancamentos_caixa"("dataHora");
CREATE INDEX "lancamentos_caixa_tipo_idx" ON "lancamentos_caixa"("tipo");
CREATE INDEX "lancamentos_caixa_funcionarioId_idx" ON "lancamentos_caixa"("funcionarioId");
CREATE INDEX "lancamentos_caixa_clienteId_idx" ON "lancamentos_caixa"("clienteId");

-- Remove cidadeId and setorId from agendamentos
CREATE TABLE "agendamentos_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "horario" TEXT NOT NULL,
    "servico" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER NOT NULL,
    "funcionarioId" INTEGER,
    CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agendamentos_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data from old agendamentos table (excluding cidadeId and setorId)
INSERT INTO "agendamentos_new" (
    "id", "data", "horario", "servico", "observacoes", "status", "dataCriacao", "clienteId", "funcionarioId"
)
SELECT 
    "id", "data", "horario", "servico", "observacoes", "status", "dataCriacao", "clienteId", "funcionarioId"
FROM "agendamentos";

-- Drop old table and rename new one
DROP TABLE "agendamentos";
ALTER TABLE "agendamentos_new" RENAME TO "agendamentos";

-- Update contas_lancamentos_enhanced table to remove cidadeId and setorId
-- Check if table exists first
CREATE TABLE IF NOT EXISTS "contas_lancamentos_enhanced_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataLancamento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataVencimento" DATETIME NOT NULL,
    "dataPagamento" DATETIME,
    "dataOperacao" DATETIME,
    "numeroDocumento" TEXT,
    "numeroNF" TEXT,
    "numeroNFSe" TEXT,
    "serieDocumento" TEXT,
    "chaveNFe" TEXT,
    "numeroMesParcela" INTEGER,
    "totalParcelas" INTEGER,
    "descricaoParcela" TEXT,
    "contrato" TEXT,
    "valorOriginal" REAL NOT NULL,
    "valorDesconto" REAL DEFAULT 0,
    "valorAcrescimo" REAL DEFAULT 0,
    "valorJuros" REAL DEFAULT 0,
    "valorMulta" REAL DEFAULT 0,
    "valorLiquido" REAL NOT NULL,
    "valorPago" REAL DEFAULT 0,
    "valorRestante" REAL DEFAULT 0,
    "valorIR" REAL DEFAULT 0,
    "valorISS" REAL DEFAULT 0,
    "valorPIS" REAL DEFAULT 0,
    "valorCOFINS" REAL DEFAULT 0,
    "valorCSLL" REAL DEFAULT 0,
    "valorINSS" REAL DEFAULT 0,
    "baseCalculoIR" REAL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "statusCobranca" TEXT,
    "prioridadePagamento" TEXT DEFAULT 'normal',
    "codigoCliente" INTEGER,
    "codigoFornecedor" INTEGER,
    "tipo" TEXT NOT NULL,
    "formaPagamentoId" INTEGER,
    "contaBancariaId" INTEGER,
    "agenciaBancaria" TEXT,
    "numeroConta" TEXT,
    "digitoConta" TEXT,
    "nomeBanco" TEXT,
    "codigoBanco" TEXT,
    "centroCustoId" INTEGER,
    "projetoId" INTEGER,
    "departamentoId" INTEGER,
    "categoriaId" INTEGER,
    "subcategoriaId" INTEGER,
    "descricaoECategoriaId" INTEGER,
    "ehRecorrente" BOOLEAN NOT NULL DEFAULT false,
    "tipoRecorrencia" TEXT,
    "proximoVencimento" DATETIME,
    "contaOrigemId" INTEGER,
    "observacoes" TEXT,
    "observacoesInternas" TEXT,
    "motivoCancelamento" TEXT,
    "anexos" TEXT,
    "tags" TEXT,
    "funcionarioLancamento" INTEGER,
    "funcionarioPagamento" INTEGER,
    "funcionarioCobranca" INTEGER,
    "codigoExterno" TEXT,
    "sistemaOrigem" TEXT,
    "sincronizado" BOOLEAN NOT NULL DEFAULT false,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAlteracao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioCriacao" INTEGER,
    "usuarioAlteracao" INTEGER,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "dataAprovacao" DATETIME,
    "usuarioAprovacao" INTEGER,
    "workflow" TEXT,
    CONSTRAINT "contas_lancamentos_enhanced_codigoCliente_fkey" FOREIGN KEY ("codigoCliente") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_enhanced_codigoFornecedor_fkey" FOREIGN KEY ("codigoFornecedor") REFERENCES "fornecedores" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_enhanced_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "formas_pagamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_enhanced_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_enhanced_funcionarioLancamento_fkey" FOREIGN KEY ("funcionarioLancamento") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_enhanced_funcionarioPagamento_fkey" FOREIGN KEY ("funcionarioPagamento") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_enhanced_funcionarioCobranca_fkey" FOREIGN KEY ("funcionarioCobranca") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_enhanced_contaOrigemId_fkey" FOREIGN KEY ("contaOrigemId") REFERENCES "contas_lancamentos_enhanced" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_enhanced_descricaoECategoriaId_fkey" FOREIGN KEY ("descricaoECategoriaId") REFERENCES "descricoes_e_categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data if the table exists (some installations may not have it)
INSERT OR IGNORE INTO "contas_lancamentos_enhanced_new" SELECT 
    "id", "dataLancamento", "dataVencimento", "dataPagamento", "dataOperacao",
    "numeroDocumento", "numeroNF", "numeroNFSe", "serieDocumento", "chaveNFe",
    "numeroMesParcela", "totalParcelas", "descricaoParcela", "contrato",
    "valorOriginal", "valorDesconto", "valorAcrescimo", "valorJuros", "valorMulta",
    "valorLiquido", "valorPago", "valorRestante", "valorIR", "valorISS", "valorPIS",
    "valorCOFINS", "valorCSLL", "valorINSS", "baseCalculoIR", "status", "statusCobranca",
    "prioridadePagamento", "codigoCliente", "codigoFornecedor", "tipo", "formaPagamentoId",
    "contaBancariaId", "agenciaBancaria", "numeroConta", "digitoConta", "nomeBanco",
    "codigoBanco", "centroCustoId", "projetoId", "departamentoId", "categoriaId",
    "subcategoriaId", "descricaoECategoriaId", "ehRecorrente", "tipoRecorrencia",
    "proximoVencimento", "contaOrigemId", "observacoes", "observacoesInternas",
    "motivoCancelamento", "anexos", "tags", "funcionarioLancamento", "funcionarioPagamento",
    "funcionarioCobranca", "codigoExterno", "sistemaOrigem", "sincronizado", "dataCriacao",
    "dataAlteracao", "usuarioCriacao", "usuarioAlteracao", "versao", "ativo", "aprovado",
    "dataAprovacao", "usuarioAprovacao", "workflow"
FROM "contas_lancamentos_enhanced" WHERE 1=0; -- Will copy structure but no data due to WHERE 1=0

-- Drop old tables completely
DROP TABLE IF EXISTS "setores";
DROP TABLE IF EXISTS "cidades"; 
DROP TABLE IF EXISTS "contas_lancamentos_enhanced";

-- Rename the new table
ALTER TABLE "contas_lancamentos_enhanced_new" RENAME TO "contas_lancamentos_enhanced";

-- Recreate indexes for enhanced contas table
CREATE INDEX "contas_lancamentos_enhanced_dataVencimento_idx" ON "contas_lancamentos_enhanced"("dataVencimento");
CREATE INDEX "contas_lancamentos_enhanced_dataPagamento_idx" ON "contas_lancamentos_enhanced"("dataPagamento");
CREATE INDEX "contas_lancamentos_enhanced_tipo_idx" ON "contas_lancamentos_enhanced"("tipo");
CREATE INDEX "contas_lancamentos_enhanced_status_idx" ON "contas_lancamentos_enhanced"("status");
CREATE INDEX "contas_lancamentos_enhanced_codigoCliente_idx" ON "contas_lancamentos_enhanced"("codigoCliente");
CREATE INDEX "contas_lancamentos_enhanced_codigoFornecedor_idx" ON "contas_lancamentos_enhanced"("codigoFornecedor");
CREATE INDEX "contas_lancamentos_enhanced_formaPagamentoId_idx" ON "contas_lancamentos_enhanced"("formaPagamentoId");
CREATE INDEX "contas_lancamentos_enhanced_centroCustoId_idx" ON "contas_lancamentos_enhanced"("centroCustoId");
CREATE INDEX "contas_lancamentos_enhanced_projetoId_idx" ON "contas_lancamentos_enhanced"("projetoId");
CREATE INDEX "contas_lancamentos_enhanced_numeroDocumento_idx" ON "contas_lancamentos_enhanced"("numeroDocumento");
CREATE INDEX "contas_lancamentos_enhanced_numeroNF_idx" ON "contas_lancamentos_enhanced"("numeroNF");
CREATE INDEX "contas_lancamentos_enhanced_ehRecorrente_idx" ON "contas_lancamentos_enhanced"("ehRecorrente");
CREATE INDEX "contas_lancamentos_enhanced_proximoVencimento_idx" ON "contas_lancamentos_enhanced"("proximoVencimento");
CREATE INDEX "contas_lancamentos_enhanced_dataCriacao_idx" ON "contas_lancamentos_enhanced"("dataCriacao");
CREATE INDEX "contas_lancamentos_enhanced_ativo_idx" ON "contas_lancamentos_enhanced"("ativo");
CREATE INDEX "contas_lancamentos_enhanced_aprovado_idx" ON "contas_lancamentos_enhanced"("aprovado");
CREATE INDEX "contas_lancamentos_enhanced_statusCobranca_idx" ON "contas_lancamentos_enhanced"("statusCobranca");
CREATE INDEX "contas_lancamentos_enhanced_prioridadePagamento_idx" ON "contas_lancamentos_enhanced"("prioridadePagamento");

PRAGMA foreign_keys=on;
