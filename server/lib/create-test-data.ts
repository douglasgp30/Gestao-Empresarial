import { prisma } from "./database";

async function createTestData() {
  console.log("🚀 Creating test data in unified table...");

  try {
    // Create categories
    const receiptCategory = await prisma.descricaoECategoria.create({
      data: {
        nome: "Serviços",
        tipo: "receita",
        tipoItem: "categoria",
        ativo: true,
      },
    });

    const expenseCategory = await prisma.descricaoECategoria.create({
      data: {
        nome: "Operacional",
        tipo: "despesa",
        tipoItem: "categoria",
        ativo: true,
      },
    });

    console.log("✅ Categories created");

    // Create descriptions
    await prisma.descricaoECategoria.create({
      data: {
        nome: "Consultoria",
        tipo: "receita",
        tipoItem: "descricao",
        categoria: "Serviços",
        ativo: true,
      },
    });

    await prisma.descricaoECategoria.create({
      data: {
        nome: "Material de Escritório",
        tipo: "despesa",
        tipoItem: "descricao",
        categoria: "Operacional",
        ativo: true,
      },
    });

    console.log("✅ Descriptions created");

    // Verify data
    const totalItems = await prisma.descricaoECategoria.count();
    const categories = await prisma.descricaoECategoria.count({
      where: { tipoItem: "categoria" },
    });
    const descriptions = await prisma.descricaoECategoria.count({
      where: { tipoItem: "descricao" },
    });

    console.log(
      `📊 Total items: ${totalItems} (${categories} categories, ${descriptions} descriptions)`,
    );
    console.log("🎉 Test data created successfully!");
  } catch (error) {
    console.error("❌ Error creating test data:", error);
    throw error;
  }
}

// Run if called directly
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  createTestData()
    .catch(console.error)
    .finally(() => process.exit());
}

export { createTestData };
