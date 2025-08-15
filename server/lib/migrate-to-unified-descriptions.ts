import { prisma } from "./database";

export async function migrateToUnifiedDescriptions() {
  console.log("🔄 Iniciando migração para sistema unificado de descrições/categorias...");

  try {
    // 1. Migrar categorias antigas para sistema unificado
    console.log("📂 Migrando categorias antigas...");
    const categoriasAntigas = await prisma.categoria.findMany({
      where: { ativo: true }
    });

    for (const categoria of categoriasAntigas) {
      const existente = await prisma.descricaoECategoria.findFirst({
        where: {
          nome: categoria.nome,
          tipo: categoria.tipo,
          tipoItem: "categoria"
        }
      });

      if (!existente) {
        await prisma.descricaoECategoria.create({
          data: {
            nome: categoria.nome,
            tipo: categoria.tipo,
            tipoItem: "categoria",
            ativo: true
          }
        });
        console.log(`✅ Categoria migrada: ${categoria.nome} (${categoria.tipo})`);
      }
    }

    // 2. Migrar descrições antigas para sistema unificado
    console.log("📝 Migrando descrições antigas...");
    const descricoesAntigas = await prisma.descricao.findMany({
      where: { ativo: true },
      include: { categoria: true }
    });

    for (const descricao of descricoesAntigas) {
      const categoria = descricao.categoria;
      if (!categoria) continue;

      const existente = await prisma.descricaoECategoria.findFirst({
        where: {
          nome: descricao.nome,
          categoria: categoria.nome,
          tipo: categoria.tipo,
          tipoItem: "descricao"
        }
      });

      if (!existente) {
        await prisma.descricaoECategoria.create({
          data: {
            nome: descricao.nome,
            categoria: categoria.nome,
            tipo: categoria.tipo,
            tipoItem: "descricao",
            ativo: true
          }
        });
        console.log(`✅ Descrição migrada: ${descricao.nome} (${categoria.nome})`);
      }
    }

    // 3. Atualizar lançamentos para usar sistema unificado
    console.log("💰 Atualizando lançamentos de caixa...");
    const lancamentosSemUnificado = await prisma.lancamentoCaixa.findMany({
      where: {
        descricaoECategoriaId: null,
        descricaoId: { not: null }
      },
      include: {
        descricao: {
          include: { categoria: true }
        }
      }
    });

    for (const lancamento of lancamentosSemUnificado) {
      if (!lancamento.descricao?.categoria) continue;

      const descricaoUnificada = await prisma.descricaoECategoria.findFirst({
        where: {
          nome: lancamento.descricao.nome,
          categoria: lancamento.descricao.categoria.nome,
          tipo: lancamento.descricao.categoria.tipo,
          tipoItem: "descricao"
        }
      });

      if (descricaoUnificada) {
        await prisma.lancamentoCaixa.update({
          where: { id: lancamento.id },
          data: { descricaoECategoriaId: descricaoUnificada.id }
        });
        console.log(`✅ Lançamento atualizado: ID ${lancamento.id}`);
      }
    }

    // 4. Verificar estatísticas da migração
    const statsUnificado = await prisma.descricaoECategoria.groupBy({
      by: ['tipoItem', 'tipo'],
      _count: { id: true }
    });

    const totalLancamentosUnificados = await prisma.lancamentoCaixa.count({
      where: { descricaoECategoriaId: { not: null } }
    });

    console.log("\n📊 Estatísticas da migração:");
    console.log("Sistema unificado:");
    for (const stat of statsUnificado) {
      console.log(`  ${stat.tipoItem} ${stat.tipo}: ${stat._count.id} itens`);
    }
    console.log(`  Lançamentos usando sistema unificado: ${totalLancamentosUnificados}`);

    console.log("\n✅ Migração concluída com sucesso!");
    return true;

  } catch (error) {
    console.error("❌ Erro na migração:", error);
    throw error;
  }
}

// Função para verificar se a migração é necessária
export async function checkMigrationNeeded() {
  const lancamentosSemUnificado = await prisma.lancamentoCaixa.count({
    where: {
      descricaoECategoriaId: null,
      descricaoId: { not: null }
    }
  });

  const categoriasAntigasAtivas = await prisma.categoria.count({
    where: { ativo: true }
  });

  const descricoesAntigasAtivas = await prisma.descricao.count({
    where: { ativo: true }
  });

  return {
    needed: lancamentosSemUnificado > 0 || categoriasAntigasAtivas > 0 || descricoesAntigasAtivas > 0,
    lancamentosSemUnificado,
    categoriasAntigasAtivas,
    descricoesAntigasAtivas
  };
}
