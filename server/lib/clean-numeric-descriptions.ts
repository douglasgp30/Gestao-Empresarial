import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanNumericDescriptions() {
  try {
    console.log("🧹 Iniciando limpeza de descrições numéricas...");

    // Buscar descrições com nomes apenas numéricos
    const numericDescriptions = await prisma.descricao.findMany({
      where: {
        nome: {
          regex: "^[0-9]+$"
        }
      }
    });

    console.log(`Encontradas ${numericDescriptions.length} descrições numéricas`);

    // Buscar descrições e categorias unificadas com nomes apenas numéricos
    const numericDescricoesECategorias = await prisma.descricaoECategoria.findMany({
      where: {
        nome: {
          regex: "^[0-9]+$"
        }
      }
    });

    console.log(`Encontradas ${numericDescricoesECategorias.length} descrições e categorias numéricas`);

    // Atualizar descrições numéricas
    if (numericDescriptions.length > 0) {
      for (const desc of numericDescriptions) {
        await prisma.descricao.update({
          where: { id: desc.id },
          data: {
            nome: `Serviço (corrigido ${desc.id})`
          }
        });
        console.log(`✅ Corrigida descrição ID ${desc.id}: "${desc.nome}" → "Serviço (corrigido ${desc.id})"`);
      }
    }

    // Atualizar descrições e categorias unificadas numéricas
    if (numericDescricoesECategorias.length > 0) {
      for (const desc of numericDescricoesECategorias) {
        await prisma.descricaoECategoria.update({
          where: { id: desc.id },
          data: {
            nome: `Serviço (corrigido ${desc.id})`
          }
        });
        console.log(`✅ Corrigida descrição e categoria ID ${desc.id}: "${desc.nome}" → "Serviço (corrigido ${desc.id})"`);
      }
    }

    console.log("🎉 Limpeza concluída!");
  } catch (error) {
    console.error("❌ Erro na limpeza:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanNumericDescriptions();
