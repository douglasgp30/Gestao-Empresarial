import { prisma } from "./database";

async function createSampleData() {
  console.log("🚀 Creating sample data for system testing...");

  try {
    // Create payment methods
    const paymentMethods = [
      { nome: "Dinheiro" },
      { nome: "Cartão de Débito" },
      { nome: "Cartão de Crédito" },
      { nome: "PIX" },
      { nome: "Transferência Bancária" },
    ];

    for (const method of paymentMethods) {
      await prisma.formaPagamento.create({ data: method });
    }
    console.log(`✅ Created ${paymentMethods.length} payment methods`);

    // Create more diverse categories and descriptions
    const additionalData = [
      // Categories
      { nome: "Produtos", tipo: "receita", tipoItem: "categoria" },
      { nome: "Impostos", tipo: "despesa", tipoItem: "categoria" },
      { nome: "Salários", tipo: "despesa", tipoItem: "categoria" },

      // Descriptions for Produtos (receita)
      {
        nome: "Venda de Software",
        tipo: "receita",
        tipoItem: "descricao",
        categoria: "Produtos",
      },
      {
        nome: "Licenças",
        tipo: "receita",
        tipoItem: "descricao",
        categoria: "Produtos",
      },

      // Descriptions for Serviços (receita) - additional
      {
        nome: "Suporte Técnico",
        tipo: "receita",
        tipoItem: "descricao",
        categoria: "Serviços",
      },
      {
        nome: "Treinamento",
        tipo: "receita",
        tipoItem: "descricao",
        categoria: "Serviços",
      },

      // Descriptions for Impostos (despesa)
      {
        nome: "IRPJ",
        tipo: "despesa",
        tipoItem: "descricao",
        categoria: "Impostos",
      },
      {
        nome: "CSLL",
        tipo: "despesa",
        tipoItem: "descricao",
        categoria: "Impostos",
      },

      // Descriptions for Salários (despesa)
      {
        nome: "Salário CLT",
        tipo: "despesa",
        tipoItem: "descricao",
        categoria: "Salários",
      },
      {
        nome: "Pro-labore",
        tipo: "despesa",
        tipoItem: "descricao",
        categoria: "Salários",
      },

      // Descriptions for Operacional (despesa) - additional
      {
        nome: "Aluguel",
        tipo: "despesa",
        tipoItem: "descricao",
        categoria: "Operacional",
      },
      {
        nome: "Energia Elétrica",
        tipo: "despesa",
        tipoItem: "descricao",
        categoria: "Operacional",
      },

      // Descriptions for Marketing (despesa) - additional
      {
        nome: "Google Ads",
        tipo: "despesa",
        tipoItem: "descricao",
        categoria: "Marketing",
      },
      {
        nome: "Facebook Ads",
        tipo: "despesa",
        tipoItem: "descricao",
        categoria: "Marketing",
      },
    ];

    for (const item of additionalData) {
      await prisma.descricaoECategoria.create({
        data: {
          nome: item.nome,
          tipo: item.tipo,
          tipoItem: item.tipoItem,
          categoria: item.categoria || null,
          ativo: true,
        },
      });
    }

    console.log(
      `✅ Created ${additionalData.length} additional categories and descriptions`,
    );

    // Summary
    const totalCategories = await prisma.descricaoECategoria.count({
      where: { tipoItem: "categoria", ativo: true },
    });
    const totalDescriptions = await prisma.descricaoECategoria.count({
      where: { tipoItem: "descricao", ativo: true },
    });
    const totalPaymentMethods = await prisma.formaPagamento.count();

    console.log("\n📊 SAMPLE DATA SUMMARY:");
    console.log(`   📁 Categories: ${totalCategories}`);
    console.log(`   📝 Descriptions: ${totalDescriptions}`);
    console.log(`   💳 Payment Methods: ${totalPaymentMethods}`);
    console.log(`   🎉 System is ready for comprehensive testing!`);
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
    throw error;
  }
}

// Run if called directly
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  createSampleData()
    .catch(console.error)
    .finally(() => process.exit());
}

export { createSampleData };
