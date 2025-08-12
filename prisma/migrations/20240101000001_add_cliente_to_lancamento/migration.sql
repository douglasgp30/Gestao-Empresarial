-- AddColumn
ALTER TABLE "lancamentos_caixa" ADD COLUMN "clienteId" INTEGER;

-- CreateIndex
CREATE INDEX "lancamentos_caixa_clienteId_idx" ON "lancamentos_caixa"("clienteId");
