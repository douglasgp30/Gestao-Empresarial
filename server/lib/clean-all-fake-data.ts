import { prisma } from "./database";

async function cleanAllFakeData() {
  console.log("��� LIMPANDO TODOS OS DADOS FICTÍCIOS CRIADOS...");

  try {
    // 1. LIMPAR FUNCIONÁRIOS FICTÍCIOS
    console.log("\n1️⃣ Removendo funcionários fictícios...");
    
    const funcionarios = await prisma.funcionario.findMany({
      orderBy: { dataCriacao: "desc" },
    });

    console.log(`📊 Total de funcionários no banco: ${funcionarios.length}`);
    
    // Identificar funcionários fictícios pelos nomes/dados que criei
    const funcionariosFicticios = [
      "João Silva", "Maria Santos", "Pedro Costa", "Ana Lima", 
      "Ana Oliveira", "Marcelinho", "Admin Sistema", "Técnico 1", "Técnico 2"
    ];

    const funcionariosParaRemover = funcionarios.filter(f => 
      funcionariosFicticios.some(nome => f.nome.includes(nome) || nome.includes(f.nome))
    );

    console.log(`❌ Funcionários fictícios identificados (${funcionariosParaRemover.length}):`);
    funcionariosParaRemover.forEach(f => {
      console.log(`   ID ${f.id}: "${f.nome}" (${f.cargo || 'sem cargo'}) - Criado: ${f.dataCriacao}`);
    });

    if (funcionariosParaRemover.length > 0) {
      await prisma.funcionario.deleteMany({
        where: {
          id: {
            in: funcionariosParaRemover.map(f => f.id)
          }
        }
      });
      console.log(`✅ ${funcionariosParaRemover.length} funcionários fictícios removidos!`);
    }

    // 2. LIMPAR DESCRIÇÕES E CATEGORIAS FICTÍCIAS
    console.log("\n2️⃣ Removendo descrições e categorias fictícias...");
    
    const descricoesCategorias = await prisma.descricaoECategoria.findMany({
      orderBy: { dataCriacao: "desc" },
    });

    console.log(`📊 Total de descrições/categorias no banco: ${descricoesCategorias.length}`);

    // Identificar dados fictícios que podem ter sido criados
    const dadosFicticios = [
      // Categorias fictícias
      "Serviços", "Vendas", "Despesas Operacionais", "Materiais", "Marketing", "Operacional",
      // Descrições fictícias  
      "Instalação", "Manutenção", "Reparo", "Produto Vendido", "Combustível", 
      "Material de Consumo", "Ferramentas", "Treinamento", "Suporte Técnico",
      "Licenças", "Venda de Software", "Salário CLT", "Pro-labore", "IRPJ", "CSLL",
      "Aluguel", "Energia Elétrica", "Google Ads", "Facebook Ads"
    ];

    const dadosParaRemover = descricoesCategorias.filter(item => 
      dadosFicticios.some(nome => item.nome.includes(nome) || nome.includes(item.nome))
    );

    console.log(`❌ Descrições/categorias fictícias identificadas (${dadosParaRemover.length}):`);
    dadosParaRemover.forEach(item => {
      console.log(`   ID ${item.id}: "${item.nome}" (${item.tipo}, ${item.tipoItem}) - Criado: ${item.dataCriacao}`);
    });

    if (dadosParaRemover.length > 0) {
      await prisma.descricaoECategoria.deleteMany({
        where: {
          id: {
            in: dadosParaRemover.map(item => item.id)
          }
        }
      });
      console.log(`✅ ${dadosParaRemover.length} descrições/categorias fictícias removidas!`);
    }

    // 3. VERIFICAR RESULTADO FINAL
    console.log("\n3️⃣ Verificando resultado final...");
    
    const funcionariosRestantes = await prisma.funcionario.findMany({
      orderBy: { nome: "asc" },
    });
    
    const descricoesCategoriastantes = await prisma.descricaoECategoria.findMany({
      orderBy: [{ tipoItem: "asc" }, { nome: "asc" }],
    });

    console.log(`\n📋 ESTADO FINAL:`);
    console.log(`   Funcionários restantes: ${funcionariosRestantes.length}`);
    console.log(`   Descrições/Categorias restantes: ${descricoesCategoriastantes.length}`);

    if (funcionariosRestantes.length > 0) {
      console.log(`\n👥 Funcionários REAIS mantidos:`);
      funcionariosRestantes.forEach(f => {
        console.log(`   • "${f.nome}" (${f.cargo || 'sem cargo'})`);
      });
    } else {
      console.log(`\n✅ Nenhum funcionário no banco - limpo!`);
    }

    if (descricoesCategoriastantes.length > 0) {
      console.log(`\n📁 Descrições/Categorias REAIS mantidas:`);
      descricoesCategoriastantes.forEach(item => {
        console.log(`   • "${item.nome}" (${item.tipo}, ${item.tipoItem})`);
      });
    } else {
      console.log(`\n✅ Nenhuma descrição/categoria no banco - limpo!`);
    }

    // 4. REMOVER TAMBÉM DO LOCALSTORAGE (OPCIONAL - PRECISA SER FEITO NO FRONTEND)
    console.log(`\n💡 IMPORTANTE: Para completar a limpeza, limpe também o localStorage no navegador:`);
    console.log(`   - localStorage.removeItem('funcionarios')`);
    console.log(`   - localStorage.removeItem('descricoes_e_categorias')`);

  } catch (error) {
    console.error("❌ Erro durante a limpeza:", error);
    throw error;
  }
}

// Executar diretamente
cleanAllFakeData()
  .then(() => {
    console.log("\n🎉 LIMPEZA COMPLETA! Todos os dados fictícios foram removidos.");
    console.log("🔄 Recarregue a aplicação para ver as mudanças.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Erro na limpeza:", error);
    process.exit(1);
  });
