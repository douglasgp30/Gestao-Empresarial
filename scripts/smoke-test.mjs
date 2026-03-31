#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Iniciando smoke test local...");

  await prisma.$queryRaw`SELECT 1`;
  const totalFuncionarios = await prisma.funcionario.count();
  const admin = await prisma.funcionario.findFirst({
    where: { login: "admin", temAcessoSistema: true },
    select: { id: true, nome: true, login: true, tipoAcesso: true },
  });

  console.log(`✅ Banco respondeu. Funcionários: ${totalFuncionarios}`);

  if (!admin) {
    throw new Error(
      "Usuário admin não encontrado. Rode: npm run seed:dev ou npm run setup:dev",
    );
  }

  console.log("✅ Admin encontrado:", admin);
  console.log("🎉 Smoke test concluído com sucesso.");
}

main()
  .catch((err) => {
    console.error("❌ Smoke test falhou:", err.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
