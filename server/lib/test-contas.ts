import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function criarContasTeste() {
  try {
    console.log("🧪 Criando contas de teste...");

    // Criar uma conta a receber para hoje
    const contaReceber = await prisma.conta.create({
      data: {
        tipo: "receber",
        descricao: "Teste - Serviço de consultoria",
        valor: 500.00,
        dataVencimento: new Date("2024-08-15"),
        status: "pendente",
        categoria: "Serviços",
      },
    });

    console.log("✅ Conta a receber criada:", contaReceber);

    // Criar uma conta a pagar vencendo em breve
    const contaPagar = await prisma.conta.create({
      data: {
        tipo: "pagar",
        descricao: "Teste - Aluguel do escritório",
        valor: 800.00,
        dataVencimento: new Date("2024-08-20"),
        status: "pendente",
        categoria: "Despesas",
      },
    });

    console.log("✅ Conta a pagar criada:", contaPagar);

    // Criar uma conta já paga
    const contaPaga = await prisma.conta.create({
      data: {
        tipo: "pagar",
        descricao: "Teste - Conta de energia",
        valor: 150.00,
        dataVencimento: new Date("2024-08-10"),
        dataPagamento: new Date("2024-08-10"),
        status: "pago",
        categoria: "Utilidades",
      },
    });

    console.log("✅ Conta paga criada:", contaPaga);

    // Listar todas as contas
    const todasContas = await prisma.conta.findMany({
      orderBy: { dataVencimento: 'desc' }
    });

    console.log(`\n📊 Total de contas no banco: ${todasContas.length}`);
    console.log("Contas:", todasContas.map(c => `${c.tipo} - ${c.descricao} - R$ ${c.valor} - ${c.status}`));

  } catch (error) {
    console.error("❌ Erro ao criar contas de teste:", error);
  } finally {
    await prisma.$disconnect();
  }
}

criarContasTeste();
