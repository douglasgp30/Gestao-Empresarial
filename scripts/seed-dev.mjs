#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de desenvolvimento...");

  const adminLogin = "admin";
  const adminSenha = "admin123";

  const admin = await prisma.funcionario.upsert({
    where: { login: adminLogin },
    update: {
      nome: "Administrador do Sistema",
      temAcessoSistema: true,
      tipoAcesso: "Administrador",
      senha: adminSenha,
      ehTecnico: false,
      percentualComissao: 0,
      cargo: "Administrador",
    },
    create: {
      nome: "Administrador do Sistema",
      login: adminLogin,
      senha: adminSenha,
      temAcessoSistema: true,
      tipoAcesso: "Administrador",
      ehTecnico: false,
      percentualComissao: 0,
      cargo: "Administrador",
      email: "admin@sistema.local",
      telefone: "",
      salario: 0,
    },
  });

  const formas = ["Dinheiro", "Pix", "Cartão", "Boleto"];
  for (const nome of formas) {
    const existe = await prisma.formaPagamento.findFirst({ where: { nome } });
    if (!existe) {
      await prisma.formaPagamento.create({ data: { nome } });
    }
  }

  console.log("✅ Seed finalizado com sucesso.");
  console.log("🔐 Login de teste:");
  console.log(`   usuário: ${admin.login}`);
  console.log(`   senha: ${adminSenha}`);
  console.log(`   id: ${admin.id}`);
}

main()
  .catch((err) => {
    console.error("❌ Erro no seed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
