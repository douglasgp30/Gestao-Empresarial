import { prisma } from "./database";

async function checkFuncionarios() {
  console.log("🔍 Verificando funcionários atuais no banco...");

  try {
    const funcionarios = await prisma.funcionario.findMany({
      orderBy: { dataCriacao: "asc" },
    });

    console.log(`📊 Total de funcionários: ${funcionarios.length}`);
    
    if (funcionarios.length === 0) {
      console.log("✅ Nenhum funcionário no banco - totalmente limpo!");
      return;
    }

    console.log("\n👥 Funcionários encontrados:");
    funcionarios.forEach(f => {
      console.log(`   ID ${f.id}: "${f.nome}" (${f.cargo || 'sem cargo'}) - Criado: ${f.dataCriacao}`);
      if (f.ehTecnico) console.log(`       ├─ É técnico: ${f.ehTecnico}`);
      if (f.tipoAcesso) console.log(`       ├─ Tipo acesso: ${f.tipoAcesso}`);
      if (f.temAcessoSistema) console.log(`       └─ Tem acesso sistema: ${f.temAcessoSistema}`);
    });

    // Identificar quais são legítimos vs fictícios
    const funcionariosLegitimos = ["Douglas", "Marcelinho"];
    const funcionariosFicticios = ["João Silva", "Maria Santos", "Pedro Costa", "Ana Oliveira", "Ana Lima"];

    const legitimos = funcionarios.filter(f => 
      funcionariosLegitimos.some(nome => f.nome.toLowerCase().includes(nome.toLowerCase()))
    );

    const ficticios = funcionarios.filter(f => 
      funcionariosFicticios.some(nome => f.nome.toLowerCase().includes(nome.toLowerCase()))
    );

    const outros = funcionarios.filter(f => 
      !legitimos.includes(f) && !ficticios.includes(f)
    );

    console.log(`\n✅ Funcionários LEGÍTIMOS (${legitimos.length}):`);
    legitimos.forEach(f => {
      console.log(`   • "${f.nome}" (ID: ${f.id})`);
    });

    console.log(`\n❌ Funcionários FICTÍCIOS a remover (${ficticios.length}):`);
    ficticios.forEach(f => {
      console.log(`   • "${f.nome}" (ID: ${f.id})`);
    });

    console.log(`\n❓ Funcionários OUTROS (${outros.length}):`);
    outros.forEach(f => {
      console.log(`   • "${f.nome}" (ID: ${f.id}) - VERIFICAR SE É LEGÍTIMO`);
    });

    if (ficticios.length > 0) {
      console.log(`\n🗑️ Removendo ${ficticios.length} funcionários fictícios...`);
      
      await prisma.funcionario.deleteMany({
        where: {
          id: {
            in: ficticios.map(f => f.id)
          }
        }
      });

      console.log(`✅ ${ficticios.length} funcionários fictícios removidos!`);
    }

    // Verificar resultado final
    const funcionariosFinais = await prisma.funcionario.findMany({
      orderBy: { nome: "asc" },
    });

    console.log(`\n📋 RESULTADO FINAL:`);
    console.log(`   Total: ${funcionariosFinais.length} funcionários`);
    funcionariosFinais.forEach(f => {
      console.log(`   • "${f.nome}" (ID: ${f.id})`);
    });

  } catch (error) {
    console.error("❌ Erro ao verificar funcionários:", error);
    throw error;
  }
}

// Executar diretamente
checkFuncionarios()
  .then(() => {
    console.log("\n🎉 Verificação concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Erro na verificação:", error);
    process.exit(1);
  });
