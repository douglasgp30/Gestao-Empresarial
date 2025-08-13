import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testarFiltrosAPI() {
  try {
    console.log("🧪 Testando filtros da API de contas...\n");

    // 1. Buscar todas as contas sem filtros
    console.log("1️⃣ Todas as contas:");
    const todasContas = await prisma.conta.findMany({
      orderBy: { dataVencimento: 'desc' }
    });
    console.log(`Total: ${todasContas.length} contas`);
    todasContas.forEach(c => {
      console.log(`  - ${c.tipo} | ${c.descricao} | R$ ${c.valor} | ${c.dataVencimento.toISOString().split('T')[0]} | ${c.status}`);
    });

    // 2. Filtrar por data (período atual - deveria incluir as de teste)
    console.log("\n2️⃣ Filtro por data (01/08/2024 a 31/12/2025):");
    const contasPorData = await prisma.conta.findMany({
      where: {
        dataVencimento: {
          gte: new Date("2024-08-01"),
          lte: new Date("2025-12-31")
        }
      },
      orderBy: { dataVencimento: 'desc' }
    });
    console.log(`Total: ${contasPorData.length} contas`);
    contasPorData.forEach(c => {
      console.log(`  - ${c.tipo} | ${c.descricao} | R$ ${c.valor} | ${c.dataVencimento.toISOString().split('T')[0]} | ${c.status}`);
    });

    // 3. Filtrar por tipo (a receber)
    console.log("\n3️⃣ Filtro por tipo (receber):");
    const contasReceber = await prisma.conta.findMany({
      where: {
        tipo: "receber",
        dataVencimento: {
          gte: new Date("2024-08-01"),
          lte: new Date("2025-12-31")
        }
      },
      orderBy: { dataVencimento: 'desc' }
    });
    console.log(`Total: ${contasReceber.length} contas a receber`);
    contasReceber.forEach(c => {
      console.log(`  - ${c.descricao} | R$ ${c.valor} | ${c.dataVencimento.toISOString().split('T')[0]} | ${c.status}`);
    });

    // 4. Filtrar por status (pendente)
    console.log("\n4️⃣ Filtro por status (pendente):");
    const contasPendentes = await prisma.conta.findMany({
      where: {
        status: "pendente",
        dataVencimento: {
          gte: new Date("2024-08-01"),
          lte: new Date("2025-12-31")
        }
      },
      orderBy: { dataVencimento: 'desc' }
    });
    console.log(`Total: ${contasPendentes.length} contas pendentes`);
    contasPendentes.forEach(c => {
      console.log(`  - ${c.tipo} | ${c.descricao} | R$ ${c.valor} | ${c.dataVencimento.toISOString().split('T')[0]}`);
    });

    console.log("\n🎉 Teste de filtros concluído!");

  } catch (error) {
    console.error("❌ Erro ao testar filtros:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testarFiltrosAPI();
