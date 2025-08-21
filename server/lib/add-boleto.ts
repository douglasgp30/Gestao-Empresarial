import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addBoleto() {
  try {
    // Verificar se boleto já existe
    const boletoExists = await prisma.formaPagamento.findFirst({
      where: {
        nome: {
          contains: "Boleto"
        }
      }
    });

    if (boletoExists) {
      console.log("✅ Boleto já existe:", boletoExists.nome);
      return;
    }

    // Criar boleto
    const boleto = await prisma.formaPagamento.create({
      data: {
        nome: "Boleto",
        dataCriacao: new Date(),
      },
    });

    console.log("✅ Boleto criado:", boleto);
  } catch (error) {
    console.error("❌ Erro ao criar boleto:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addBoleto();
