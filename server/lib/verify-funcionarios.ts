import { prisma } from "./database";

async function verifyFuncionarios() {
  console.log("🔍 Verificando funcionários no banco de dados...");

  try {
    // Buscar todos os funcionários
    const todos = await prisma.funcionario.findMany({
      orderBy: { nome: "asc" },
    });

    console.log(`📊 Total de funcionários na tabela: ${todos.length}`);

    if (todos.length === 0) {
      console.log("❌ Tabela funcionários está vazia! Criando dados de exemplo...");
      
      // Criar funcionários de exemplo
      const funcionariosExemplo = [
        {
          nome: "João Silva",
          ehTecnico: true,
          percentualComissao: 30,
          cargo: "Técnico Senior",
          temAcessoSistema: true,
          tipoAcesso: "Técnico",
        },
        {
          nome: "Maria Santos",
          ehTecnico: true,
          percentualComissao: 25,
          cargo: "Técnico Junior", 
          temAcessoSistema: true,
          tipoAcesso: "Técnico",
        },
        {
          nome: "Pedro Costa",
          ehTecnico: false,
          percentualComissao: 0,
          cargo: "Administrador",
          temAcessoSistema: true,
          tipoAcesso: "Administrador",
        },
        {
          nome: "Ana Lima",
          ehTecnico: true,
          percentualComissao: 20,
          cargo: "Técnico",
          temAcessoSistema: false,
          tipoAcesso: "Técnico",
        },
      ];

      for (const funcionario of funcionariosExemplo) {
        await prisma.funcionario.create({
          data: funcionario,
        });
      }

      console.log(`✅ Criados ${funcionariosExemplo.length} funcionários de exemplo`);
      
      // Buscar novamente para mostrar o resultado
      const novos = await prisma.funcionario.findMany({
        orderBy: { nome: "asc" },
      });
      
      console.log(`📊 Total após criação: ${novos.length} funcionários`);
      
      return;
    }

    // Mostrar análise dos dados existentes
    console.log("\n📋 Análise dos funcionários existentes:");
    
    const tecnicos = todos.filter(f => f.ehTecnico || f.tipoAcesso === "Técnico");
    const administradores = todos.filter(f => f.tipoAcesso === "Administrador");
    const comAcesso = todos.filter(f => f.temAcessoSistema);
    const semAcesso = todos.filter(f => !f.temAcessoSistema);
    
    console.log(`  • Total: ${todos.length}`);
    console.log(`  • Técnicos: ${tecnicos.length}`);
    console.log(`  • Administradores: ${administradores.length}`);
    console.log(`  • Com acesso ao sistema: ${comAcesso.length}`);
    console.log(`  • Sem acesso ao sistema: ${semAcesso.length}`);

    // Mostrar todos os funcionários
    console.log("\n👥 Funcionários encontrados:");
    todos.forEach(func => {
      const badges = [];
      if (func.ehTecnico) badges.push("TÉCNICO");
      if (func.temAcessoSistema) badges.push("ACESSO_SISTEMA");
      if (func.tipoAcesso) badges.push(`TIPO:${func.tipoAcesso}`);
      
      console.log(`   ID ${func.id}: "${func.nome}" ${badges.length > 0 ? `[${badges.join(", ")}]` : ""}`);
      if (func.cargo) console.log(`      Cargo: ${func.cargo}`);
      if (func.percentualComissao) console.log(`      Comissão: ${func.percentualComissao}%`);
    });

    // Verificar especificamente os técnicos
    if (tecnicos.length > 0) {
      console.log("\n🔧 Técnicos específicos:");
      tecnicos.forEach(tec => {
        console.log(`   ID ${tec.id}: "${tec.nome}" (ehTecnico: ${tec.ehTecnico}, tipoAcesso: ${tec.tipoAcesso})`);
      });
    } else {
      console.log("\n❌ PROBLEMA: Nenhum técnico encontrado!");
      console.log("   Para os Filtros Avançados funcionarem, é necessário ter pelo menos um funcionário com:");
      console.log("   - ehTecnico = true, OU");
      console.log("   - tipoAcesso = 'Técnico'");
    }

  } catch (error) {
    console.error("❌ Erro ao verificar funcionários:", error);
    throw error;
  }
}

// Executar diretamente
verifyFuncionarios()
  .then(() => {
    console.log("\n🎉 Verificação de funcionários concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Erro na verificação:", error);
    process.exit(1);
  });
