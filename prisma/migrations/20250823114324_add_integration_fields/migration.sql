-- AlterTable
ALTER TABLE "lancamentos_caixa" ADD COLUMN "codigoExterno" TEXT;
ALTER TABLE "lancamentos_caixa" ADD COLUMN "sistemaOrigem" TEXT;

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "dadosAntigos" TEXT,
    "dadosNovos" TEXT,
    "descricao" TEXT,
    "usuarioId" TEXT NOT NULL,
    "usuarioNome" TEXT NOT NULL,
    "usuarioLogin" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "sessaoId" TEXT,
    "sucesso" BOOLEAN NOT NULL DEFAULT true,
    "mensagemErro" TEXT,
    "duracaoMs" INTEGER,
    "dataHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "pontos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "funcionarioId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "horaEntrada" DATETIME,
    "horaSaidaAlmoco" DATETIME,
    "horaRetornoAlmoco" DATETIME,
    "horaSaida" DATETIME,
    "vendeuAlmoco" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "totalHoras" REAL,
    "horasExtras" REAL,
    "saldoHoras" REAL,
    "atraso" INTEGER,
    "justificativaAtraso" TEXT,
    "editadoPorAdmin" BOOLEAN NOT NULL DEFAULT false,
    "usuarioEdicao" TEXT,
    "dataEdicao" DATETIME,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pontos_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "configuracoes_ponto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "horaInicioExpediente" TEXT NOT NULL DEFAULT '08:00',
    "horaFimExpediente" TEXT NOT NULL DEFAULT '18:00',
    "jornadaDiariaPadrao" REAL NOT NULL DEFAULT 8.0,
    "intervaloAlmocoMinutos" INTEGER NOT NULL DEFAULT 60,
    "toleranciaAtrasoMinutos" INTEGER NOT NULL DEFAULT 10,
    "permitirHorasExtras" BOOLEAN NOT NULL DEFAULT true,
    "exigirJustificativaAtraso" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAlteracao" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_funcionarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "percentualServico" REAL,
    "percentualComissao" REAL,
    "ehTecnico" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "telefone" TEXT,
    "cargo" TEXT,
    "salario" REAL,
    "temAcessoSistema" BOOLEAN NOT NULL DEFAULT false,
    "tipoAcesso" TEXT,
    "login" TEXT,
    "senha" TEXT,
    "permissoes" TEXT,
    "registraPonto" BOOLEAN NOT NULL DEFAULT false,
    "jornadaDiaria" REAL DEFAULT 8.0,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_funcionarios" ("cargo", "dataCriacao", "ehTecnico", "email", "id", "login", "nome", "percentualComissao", "percentualServico", "permissoes", "salario", "senha", "telefone", "temAcessoSistema", "tipoAcesso") SELECT "cargo", "dataCriacao", "ehTecnico", "email", "id", "login", "nome", "percentualComissao", "percentualServico", "permissoes", "salario", "senha", "telefone", "temAcessoSistema", "tipoAcesso" FROM "funcionarios";
DROP TABLE "funcionarios";
ALTER TABLE "new_funcionarios" RENAME TO "funcionarios";
CREATE UNIQUE INDEX "funcionarios_email_key" ON "funcionarios"("email");
CREATE UNIQUE INDEX "funcionarios_login_key" ON "funcionarios"("login");
CREATE INDEX "funcionarios_email_idx" ON "funcionarios"("email");
CREATE INDEX "funcionarios_temAcessoSistema_idx" ON "funcionarios"("temAcessoSistema");
CREATE INDEX "funcionarios_tipoAcesso_idx" ON "funcionarios"("tipoAcesso");
CREATE INDEX "funcionarios_registraPonto_idx" ON "funcionarios"("registraPonto");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "logs_auditoria_usuarioId_idx" ON "logs_auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "logs_auditoria_entidade_idx" ON "logs_auditoria"("entidade");

-- CreateIndex
CREATE INDEX "logs_auditoria_acao_idx" ON "logs_auditoria"("acao");

-- CreateIndex
CREATE INDEX "logs_auditoria_dataHora_idx" ON "logs_auditoria"("dataHora");

-- CreateIndex
CREATE INDEX "pontos_funcionarioId_idx" ON "pontos"("funcionarioId");

-- CreateIndex
CREATE INDEX "pontos_data_idx" ON "pontos"("data");

-- CreateIndex
CREATE INDEX "pontos_dataCriacao_idx" ON "pontos"("dataCriacao");

-- CreateIndex
CREATE UNIQUE INDEX "pontos_funcionarioId_data_key" ON "pontos"("funcionarioId", "data");
