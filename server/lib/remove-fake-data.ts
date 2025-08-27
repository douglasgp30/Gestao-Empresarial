import { prisma } from "./database";

async function removeFakeData() {
  console.log("🔍 Identificando dados fictícios criados pelo script...");

  try {
    // Buscar todos os registros para análise
    const todos = await prisma.descricaoECategoria.findMany({
      orderBy: { dataCriacao: "desc" },
    });

    console.log(`📊 Total de registros: ${todos.length}`);

    // Identificar dados que foram criados pelo script (mais recentes)
    // Os dados fictícios que criei são estes:
    const dadosFicticios = [
      "Serviços", "Vendas", "Despesas Operacionais", "Materiais",
      "Instalação", "Manutenção", "Reparo", "Produto Vendido",
      "Combustível", "Material de Consumo", "Ferramentas"
    ];

    const paraRemover = todos.filter(item => 
      dadosFicticios.includes(item.nome)
    );

    console.log(`\n❌ Dados fictícios identificados para remoção (${paraRemover.length}):`);
    paraRemover.forEach(item => {
      console.log(`   ID ${item.id}: "${item.nome}" (${item.tipo}, ${item.tipoItem}) - Criado: ${item.dataCriacao}`);
    });

    const dadosReais = todos.filter(item => 
      !dadosFicticios.includes(item.nome)
    );

    console.log(`\n✅ Dados reais do usuário mantidos (${dadosReais.length}):`);
    dadosReais.forEach(item => {
      console.log(`   ID ${item.id}: "${item.nome}" (${item.tipo}, ${item.tipoItem}) - Criado: ${item.dataCriacao}`);
    });

    if (paraRemover.length > 0) {
      console.log(`\n🗑️ Removendo ${paraRemover.length} registros fictícios...`);
      
      const idsParaRemover = paraRemover.map(item => item.id);
      
      await prisma.descricaoECategoria.deleteMany({
        where: {
          id: {
            in: idsParaRemover
          }
        }
      });

      console.log(`✅ ${paraRemover.length} registros fictícios removidos com sucesso!`);
    } else {
      console.log("\n✅ Nenhum dado fictício encontrado para remoção.");
    }

    // Verificar resultado final
    const restantes = await prisma.descricaoECategoria.findMany({
      orderBy: [
        { tipoItem: "asc" },
        { nome: "asc" },
      ],
    });

    console.log(`\n📋 Estado final:`);
    console.log(`   Total de registros: ${restantes.length}`);
    console.log(`   Categorias: ${restantes.filter(i => i.tipoItem === "categoria").length}`);
    console.log(`   Descrições: ${restantes.filter(i => i.tipoItem === "descricao").length}`);

    if (restantes.length > 0) {
      console.log(`\n📋 Seus dados reais restantes:`);
      restantes.forEach(item => {
        console.log(`   • "${item.nome}" (${item.tipo}, ${item.tipoItem})`);
      });
    }

  } catch (error) {
    console.error("❌ Erro ao remover dados fictícios:", error);
    throw error;
  }
}

// Executar diretamente
removeFakeData()
  .then(() => {
    console.log("\n🎉 Limpeza de dados fictícios concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Erro na limpeza:", error);
    process.exit(1);
  });
