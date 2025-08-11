-- CreateTable
CREATE TABLE "campanhas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "descricoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'receita',
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "subdescricoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricaoId" INTEGER NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subdescricoes_descricaoId_fkey" FOREIGN KEY ("descricaoId") REFERENCES "descricoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "formas_pagamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "telefonePrincipal" TEXT NOT NULL,
    "telefoneSecundario" TEXT,
    "email" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "complemento" TEXT,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "percentualServico" REAL,
    "email" TEXT,
    "telefone" TEXT,
    "cargo" TEXT,
    "salario" REAL,
    "temAcessoSistema" BOOLEAN NOT NULL DEFAULT false,
    "login" TEXT,
    "senha" TEXT,
    "permissoes" TEXT,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "setores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cidade" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "lancamentos_caixa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataHora" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "valorRecebido" REAL,
    "conta" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricaoId" INTEGER NOT NULL,
    "formaPagamentoId" INTEGER NOT NULL,
    "subdescricaoId" INTEGER,
    "funcionarioId" INTEGER,
    "setorId" INTEGER,
    "campanhaId" INTEGER,
    CONSTRAINT "lancamentos_caixa_descricaoId_fkey" FOREIGN KEY ("descricaoId") REFERENCES "descricoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "formas_pagamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_subdescricaoId_fkey" FOREIGN KEY ("subdescricaoId") REFERENCES "subdescricoes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "dataPagamento" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "observacoes" TEXT,
    "categoria" TEXT,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "horario" TEXT NOT NULL,
    "servico" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER NOT NULL,
    "funcionarioId" INTEGER,
    "setorId" INTEGER,
    CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agendamentos_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "agendamentos_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "dataAlteracao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_login_key" ON "funcionarios"("login");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");
