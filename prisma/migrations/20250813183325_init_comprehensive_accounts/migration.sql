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
CREATE TABLE "categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "funcionarios" (
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
    "dataHora" DATETIME NOT NULL,
    "valor" REAL NOT NULL,
    "valorRecebido" REAL,
    "valorLiquido" REAL,
    "comissao" REAL,
    "imposto" REAL,
    "observacoes" TEXT,
    "numeroNota" TEXT,
    "arquivoNota" TEXT,
    "conta" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricaoId" INTEGER NOT NULL,
    "formaPagamentoId" INTEGER NOT NULL,
    "subdescricaoId" INTEGER,
    "funcionarioId" INTEGER,
    "setorId" INTEGER,
    "campanhaId" INTEGER,
    "clienteId" INTEGER,
    CONSTRAINT "lancamentos_caixa_descricaoId_fkey" FOREIGN KEY ("descricaoId") REFERENCES "descricoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "formas_pagamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_subdescricaoId_fkey" FOREIGN KEY ("subdescricaoId") REFERENCES "subdescricoes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contas_lancamentos" (
    "codLancamentoContas" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataLancamento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor" REAL NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "codigoCliente" INTEGER,
    "codigoFornecedor" INTEGER,
    "tipo" TEXT NOT NULL,
    "conta" TEXT NOT NULL DEFAULT 'empresa',
    "formaPg" INTEGER,
    "observacoes" TEXT,
    "descricaoCategoria" INTEGER,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "dataPagamento" DATETIME,
    CONSTRAINT "contas_lancamentos_codigoCliente_fkey" FOREIGN KEY ("codigoCliente") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_codigoFornecedor_fkey" FOREIGN KEY ("codigoFornecedor") REFERENCES "fornecedores" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_formaPg_fkey" FOREIGN KEY ("formaPg") REFERENCES "formas_pagamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_formaPg_fkey" FOREIGN KEY ("formaPg") REFERENCES "formas_pagamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_descricaoCategoria_fkey" FOREIGN KEY ("descricaoCategoria") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE INDEX "clientes_cpf_idx" ON "clientes"("cpf");

-- CreateIndex
CREATE INDEX "clientes_email_idx" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_email_key" ON "funcionarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_login_key" ON "funcionarios"("login");

-- CreateIndex
CREATE INDEX "funcionarios_email_idx" ON "funcionarios"("email");

-- CreateIndex
CREATE INDEX "funcionarios_temAcessoSistema_idx" ON "funcionarios"("temAcessoSistema");

-- CreateIndex
CREATE INDEX "funcionarios_tipoAcesso_idx" ON "funcionarios"("tipoAcesso");

-- CreateIndex
CREATE INDEX "lancamentos_caixa_dataHora_idx" ON "lancamentos_caixa"("dataHora");

-- CreateIndex
CREATE INDEX "lancamentos_caixa_conta_tipo_idx" ON "lancamentos_caixa"("conta", "tipo");

-- CreateIndex
CREATE INDEX "lancamentos_caixa_funcionarioId_idx" ON "lancamentos_caixa"("funcionarioId");

-- CreateIndex
CREATE INDEX "lancamentos_caixa_clienteId_idx" ON "lancamentos_caixa"("clienteId");

-- CreateIndex
CREATE INDEX "contas_lancamentos_dataVencimento_idx" ON "contas_lancamentos"("dataVencimento");

-- CreateIndex
CREATE INDEX "contas_lancamentos_tipo_idx" ON "contas_lancamentos"("tipo");

-- CreateIndex
CREATE INDEX "contas_lancamentos_pago_idx" ON "contas_lancamentos"("pago");

-- CreateIndex
CREATE INDEX "contas_lancamentos_codigoCliente_idx" ON "contas_lancamentos"("codigoCliente");

-- CreateIndex
CREATE INDEX "contas_lancamentos_codigoFornecedor_idx" ON "contas_lancamentos"("codigoFornecedor");

-- CreateIndex
CREATE INDEX "contas_dataVencimento_idx" ON "contas"("dataVencimento");

-- CreateIndex
CREATE INDEX "contas_status_idx" ON "contas"("status");

-- CreateIndex
CREATE INDEX "contas_tipo_idx" ON "contas"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");
