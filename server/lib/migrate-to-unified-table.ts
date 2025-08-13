import { prisma } from "./database";

export async function migrateToUnifiedTable() {
  console.log("🚀 Iniciando migração para tabela unificada...");

  try {
    // 1. Migrar categorias existentes
    console.log("📋 Migrando categorias...");
    const categorias = await prisma.categoria.findMany();

    for (const categoria of categorias) {
      await prisma.descricaoECategoria.create({
        data: {
          nome: categoria.nome,
          tipo: categoria.tipo,
          tipoItem: "categoria",
          categoria: null,
          ativo: true,
          dataCriacao: categoria.dataCriacao,
        },
      });
    }
    console.log(`✅ ${categorias.length} categorias migradas`);

    // 2. Migrar descrições existentes
    console.log("📝 Migrando descrições...");
    const descricoes = await prisma.descricao.findMany();

    for (const descricao of descricoes) {
      await prisma.descricaoECategoria.create({
        data: {
          nome: descricao.nome,
          tipo: descricao.tipo,
          tipoItem: "descricao",
          categoria: descricao.categoria,
          ativo: true,
          dataCriacao: descricao.dataCriacao,
        },
      });
    }
    console.log(`✅ ${descricoes.length} descrições migradas`);

    // 3. Atualizar referências em LancamentoCaixa
    console.log("💰 Atualizando referências no Caixa...");
    const lancamentos = await prisma.lancamentoCaixa.findMany({
      include: {
        descricao: true,
      },
    });

    for (const lancamento of lancamentos) {
      // Encontrar a descrição correspondente na nova tabela
      const descricaoUnificada = await prisma.descricaoECategoria.findFirst({
        where: {
          nome: lancamento.descricao.nome,
          tipo: lancamento.descricao.tipo,
          tipoItem: "descricao",
        },
      });

      if (descricaoUnificada) {
        await prisma.lancamentoCaixa.update({
          where: { id: lancamento.id },
          data: { descricaoECategoriaId: descricaoUnificada.id },
        });
      }
    }
    console.log(`✅ ${lancamentos.length} lançamentos do caixa atualizados`);

    // 4. Atualizar referências em ContaLancamento
    console.log("🏦 Atualizando referências nas Contas...");
    const contas = await prisma.contaLancamento.findMany({
      include: {
        categoria: true,
      },
    });

    for (const conta of contas) {
      if (conta.categoria) {
        // Encontrar a categoria correspondente na nova tabela
        const categoriaUnificada = await prisma.descricaoECategoria.findFirst({
          where: {
            nome: conta.categoria.nome,
            tipo: conta.categoria.tipo,
            tipoItem: "categoria",
          },
        });

        if (categoriaUnificada) {
          await prisma.contaLancamento.update({
            where: { id: conta.id },
            data: { descricaoECategoriaId: categoriaUnificada.id },
          });
        }
      }
    }
    console.log(`✅ ${contas.length} contas atualizadas`);

    console.log("🎉 Migração para tabela unificada concluída com sucesso!");

    return {
      success: true,
      categoriasMigradas: categorias.length,
      descricoesMigradas: descricoes.length,
      lancamentosAtualizados: lancamentos.length,
      contasAtualizadas: contas.length,
    };
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
    throw error;
  }
}

// Script para executar a migração
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  migrateToUnifiedTable()
    .then((result) => {
      console.log("Resultado da migração:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro na migração:", error);
      process.exit(1);
    });
}
