import { prisma } from "./database";

export async function addCheque() {
  console.log("💰 Adicionando forma de pagamento 'Cheque'...");

  try {
    // Verificar se Cheque já existe
    const existingCheque = await prisma.formaPagamento.findFirst({
      where: { nome: "Cheque" },
    });

    if (existingCheque) {
      console.log("✅ 'Cheque' já existe no banco de dados:", existingCheque);
      return existingCheque;
    }

    // Criar nova forma de pagamento "Cheque"
    const novoCheque = await prisma.formaPagamento.create({
      data: { nome: "Cheque" },
    });

    console.log("✅ 'Cheque' adicionado com sucesso:", novoCheque);

    // Mostrar todas as formas de pagamento atuais
    const todasFormas = await prisma.formaPagamento.findMany({
      orderBy: { nome: "asc" },
    });

    console.log("📋 Formas de pagamento atuais:");
    todasFormas.forEach(forma => {
      console.log(`   ID ${forma.id}: "${forma.nome}"`);
    });

    return novoCheque;
  } catch (error) {
    console.error("❌ Erro ao adicionar 'Cheque':", error);
    throw error;
  }
}

// Executar diretamente
addCheque()
  .then(() => {
    console.log("🎉 Script concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erro no script:", error);
    process.exit(1);
  });
