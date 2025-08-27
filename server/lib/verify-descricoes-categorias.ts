import { prisma } from "./database";

async function verifyDescricoesCategorias() {
  console.log("🔍 Verificando descrições e categorias no banco de dados...");

  try {
    // Buscar todos os registros
    const todos = await prisma.descricaoECategoria.findMany({
      orderBy: [
        { tipoItem: "asc" },
        { tipo: "asc" },
        { nome: "asc" },
      ],
    });

    console.log(`📊 Total de registros na tabela DescricaoECategoria: ${todos.length}`);

    if (todos.length === 0) {
      console.log("❌ Tabela está vazia! Criando dados de exemplo...");
      
      // Criar dados básicos de exemplo
      const dadosExemplo = [
        // Categorias
        { nome: "Serviços", tipo: "receita", tipoItem: "categoria", ativo: true },
        { nome: "Vendas", tipo: "receita", tipoItem: "categoria", ativo: true },
        { nome: "Despesas Operacionais", tipo: "despesa", tipoItem: "categoria", ativo: true },
        { nome: "Materiais", tipo: "despesa", tipoItem: "categoria", ativo: true },
        
        // Descrições de receita
        { nome: "Instalação", tipo: "receita", tipoItem: "descricao", categoria: "Serviços", ativo: true },
        { nome: "Manutenção", tipo: "receita", tipoItem: "descricao", categoria: "Serviços", ativo: true },
        { nome: "Reparo", tipo: "receita", tipoItem: "descricao", categoria: "Serviços", ativo: true },
        { nome: "Produto Vendido", tipo: "receita", tipoItem: "descricao", categoria: "Vendas", ativo: true },
        
        // Descrições de despesa
        { nome: "Combustível", tipo: "despesa", tipoItem: "descricao", categoria: "Despesas Operacionais", ativo: true },
        { nome: "Material de Consumo", tipo: "despesa", tipoItem: "descricao", categoria: "Materiais", ativo: true },
        { nome: "Ferramentas", tipo: "despesa", tipoItem: "descricao", categoria: "Materiais", ativo: true },
      ];

      for (const item of dadosExemplo) {
        await prisma.descricaoECategoria.create({
          data: item,
        });
      }

      console.log(`✅ Criados ${dadosExemplo.length} registros de exemplo`);
      
      // Buscar novamente para mostrar o resultado
      const novos = await prisma.descricaoECategoria.findMany({
        orderBy: [
          { tipoItem: "asc" },
          { tipo: "asc" },
          { nome: "asc" },
        ],
      });
      
      console.log(`📊 Total após criação: ${novos.length} registros`);
      
      return;
    }

    // Mostrar análise dos dados existentes
    console.log("\n📋 Análise dos registros existentes:");
    
    const categorias = todos.filter(item => item.tipoItem === "categoria");
    const descricoes = todos.filter(item => item.tipoItem === "descricao");
    const ativos = todos.filter(item => item.ativo);
    const inativos = todos.filter(item => !item.ativo);
    
    console.log(`  • Categorias: ${categorias.length}`);
    console.log(`  • Descrições: ${descricoes.length}`);
    console.log(`  • Ativos: ${ativos.length}`);
    console.log(`  • Inativos: ${inativos.length}`);

    // Mostrar categorias
    if (categorias.length > 0) {
      console.log("\n📁 Categorias encontradas:");
      categorias.forEach(cat => {
        console.log(`   ID ${cat.id}: "${cat.nome}" (${cat.tipo}) - ${cat.ativo ? "Ativo" : "Inativo"}`);
      });
    }

    // Mostrar descrições (primeiras 10)
    if (descricoes.length > 0) {
      console.log("\n📄 Descrições encontradas (primeiras 10):");
      descricoes.slice(0, 10).forEach(desc => {
        console.log(`   ID ${desc.id}: "${desc.nome}" (${desc.tipo}${desc.categoria ? `, categoria: ${desc.categoria}` : ""}) - ${desc.ativo ? "Ativo" : "Inativo"}`);
      });
      if (descricoes.length > 10) {
        console.log(`   ... e mais ${descricoes.length - 10} descrições`);
      }
    }

    // Verificar por tipo
    const receitas = todos.filter(item => item.tipo === "receita");
    const despesas = todos.filter(item => item.tipo === "despesa");
    
    console.log(`\n💰 Por tipo:`);
    console.log(`  • Receitas: ${receitas.length} (${receitas.filter(r => r.ativo).length} ativos)`);
    console.log(`  • Despesas: ${despesas.length} (${despesas.filter(d => d.ativo).length} ativos)`);

  } catch (error) {
    console.error("❌ Erro ao verificar descrições e categorias:", error);
    throw error;
  }
}

// Executar diretamente
verifyDescricoesCategorias()
  .then(() => {
    console.log("\n🎉 Verificação concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Erro na verificação:", error);
    process.exit(1);
  });
