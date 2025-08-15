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
CREATE TABLE "descricoes_e_categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tipoItem" TEXT NOT NULL,
    "categoria" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "localizacoes_geograficas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipoItem" TEXT NOT NULL,
    "cidade" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "subdescricoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricaoId" INTEGER NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricaoECategoriaId" INTEGER,
    CONSTRAINT "subdescricoes_descricaoId_fkey" FOREIGN KEY ("descricaoId") REFERENCES "descricoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "subdescricoes_descricaoECategoriaId_fkey" FOREIGN KEY ("descricaoECategoriaId") REFERENCES "descricoes_e_categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "tipo" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricaoId" INTEGER NOT NULL,
    "formaPagamentoId" INTEGER NOT NULL,
    "subdescricaoId" INTEGER,
    "funcionarioId" INTEGER,
    "campanhaId" INTEGER,
    "clienteId" INTEGER,
    "localizacaoId" INTEGER,
    "descricaoECategoriaId" INTEGER,
    CONSTRAINT "lancamentos_caixa_descricaoId_fkey" FOREIGN KEY ("descricaoId") REFERENCES "descricoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "formas_pagamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_subdescricaoId_fkey" FOREIGN KEY ("subdescricaoId") REFERENCES "subdescricoes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_descricaoECategoriaId_fkey" FOREIGN KEY ("descricaoECategoriaId") REFERENCES "descricoes_e_categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_caixa_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "localizacoes_geograficas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contas_lancamentos_enhanced" (
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
    "localizacaoId" INTEGER,
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
    "dataAlteracao" DATETIME NOT NULL,
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
    CONSTRAINT "contas_lancamentos_enhanced_descricaoECategoriaId_fkey" FOREIGN KEY ("descricaoECategoriaId") REFERENCES "descricoes_e_categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contas_lancamentos_enhanced_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "localizacoes_geograficas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "centros_custo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "projetos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" DATETIME,
    "dataFim" DATETIME,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "contas_bancarias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "banco" TEXT NOT NULL,
    "agencia" TEXT NOT NULL,
    "conta" TEXT NOT NULL,
    "digito" TEXT,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "localizacaoId" INTEGER,
    CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agendamentos_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "agendamentos_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "localizacoes_geograficas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE INDEX "descricoes_e_categorias_tipo_idx" ON "descricoes_e_categorias"("tipo");

-- CreateIndex
CREATE INDEX "descricoes_e_categorias_tipoItem_idx" ON "descricoes_e_categorias"("tipoItem");

-- CreateIndex
CREATE INDEX "descricoes_e_categorias_ativo_idx" ON "descricoes_e_categorias"("ativo");

-- CreateIndex
CREATE INDEX "localizacoes_geograficas_tipoItem_idx" ON "localizacoes_geograficas"("tipoItem");

-- CreateIndex
CREATE INDEX "localizacoes_geograficas_ativo_idx" ON "localizacoes_geograficas"("ativo");

-- CreateIndex
CREATE INDEX "localizacoes_geograficas_cidade_idx" ON "localizacoes_geograficas"("cidade");

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
CREATE INDEX "lancamentos_caixa_tipo_idx" ON "lancamentos_caixa"("tipo");

-- CreateIndex
CREATE INDEX "lancamentos_caixa_funcionarioId_idx" ON "lancamentos_caixa"("funcionarioId");

-- CreateIndex
CREATE INDEX "lancamentos_caixa_clienteId_idx" ON "lancamentos_caixa"("clienteId");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_dataVencimento_idx" ON "contas_lancamentos_enhanced"("dataVencimento");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_dataPagamento_idx" ON "contas_lancamentos_enhanced"("dataPagamento");

-- CreateIndex
CREATE INDEX "contas_lancamentos_tipo_idx" ON "contas_lancamentos_enhanced"("tipo");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_status_idx" ON "contas_lancamentos_enhanced"("status");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_codigoCliente_idx" ON "contas_lancamentos_enhanced"("codigoCliente");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_codigoFornecedor_idx" ON "contas_lancamentos_enhanced"("codigoFornecedor");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_formaPagamentoId_idx" ON "contas_lancamentos_enhanced"("formaPagamentoId");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_centroCustoId_idx" ON "contas_lancamentos_enhanced"("centroCustoId");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_projetoId_idx" ON "contas_lancamentos_enhanced"("projetoId");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_numeroDocumento_idx" ON "contas_lancamentos_enhanced"("numeroDocumento");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_numeroNF_idx" ON "contas_lancamentos_enhanced"("numeroNF");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_ehRecorrente_idx" ON "contas_lancamentos_enhanced"("ehRecorrente");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_proximoVencimento_idx" ON "contas_lancamentos_enhanced"("proximoVencimento");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_dataCriacao_idx" ON "contas_lancamentos_enhanced"("dataCriacao");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_ativo_idx" ON "contas_lancamentos_enhanced"("ativo");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_aprovado_idx" ON "contas_lancamentos_enhanced"("aprovado");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_statusCobranca_idx" ON "contas_lancamentos_enhanced"("statusCobranca");

-- CreateIndex
CREATE INDEX "contas_lancamentos_enhanced_prioridadePagamento_idx" ON "contas_lancamentos_enhanced"("prioridadePagamento");

-- CreateIndex
CREATE UNIQUE INDEX "centros_custo_codigo_key" ON "centros_custo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "projetos_codigo_key" ON "projetos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_codigo_key" ON "departamentos"("codigo");

-- CreateIndex
CREATE INDEX "contas_dataVencimento_idx" ON "contas"("dataVencimento");

-- CreateIndex
CREATE INDEX "contas_status_idx" ON "contas"("status");

-- CreateIndex
CREATE INDEX "contas_tipo_idx" ON "contas"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");
