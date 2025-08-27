import { prisma } from "./database";

export async function addLegitimateEmployees() {
  try {
    console.log("🔧 Adicionando funcionários legítimos: Douglas e Marcelinho");

    // Check if Douglas already exists
    const existingDouglas = await prisma.funcionario.findFirst({
      where: { nome: { contains: "Douglas", mode: "insensitive" } }
    });

    if (!existingDouglas) {
      console.log("📝 Criando Douglas (Administrador)...");
      const douglas = await prisma.funcionario.create({
        data: {
          nome: "Douglas",
          login: "douglas",
          senha: "123456",
          temAcessoSistema: true,
          tipoAcesso: "Administrador",
          ehTecnico: false,
          email: "douglas@sistema.com",
          telefone: "",
          cargo: "Administrador",
          salario: 5000.00,
          percentualComissao: 0,
          permissoes: JSON.stringify({
            acessarDashboard: true,
            verCaixa: true,
            lancarReceita: true,
            lancarDespesa: true,
            editarLancamentos: true,
            verContas: true,
            lancarContasPagar: true,
            lancarContasReceber: true,
            marcarContasPagas: true,
            acessarConfiguracoes: true,
            fazerBackupManual: true,
            gerarRelatorios: true,
            verCadastros: true,
            gerenciarFuncionarios: true,
            alterarPermissoes: true,
            acessarAgendamentos: true,
            criarAgendamento: true,
            editarAgendamento: true,
            excluirAgendamento: true,
          })
        }
      });
      console.log(`✅ Douglas criado com ID: ${douglas.id}`);
    } else {
      console.log(`ℹ️ Douglas já existe com ID: ${existingDouglas.id}`);
    }

    // Check if Marcelinho already exists
    const existingMarcelinho = await prisma.funcionario.findFirst({
      where: { nome: { contains: "Marcelinho", mode: "insensitive" } }
    });

    if (!existingMarcelinho) {
      console.log("📝 Criando Marcelinho (Técnico)...");
      const marcelinho = await prisma.funcionario.create({
        data: {
          nome: "Marcelinho",
          login: "marcelinho",
          senha: "123456",
          temAcessoSistema: true,
          tipoAcesso: "Técnico",
          ehTecnico: true,
          email: "marcelinho@sistema.com",
          telefone: "",
          cargo: "Técnico",
          salario: 2500.00,
          percentualComissao: 10,
          permissoes: JSON.stringify({
            acessarDashboard: true,
            verCaixa: false,
            lancarReceita: false,
            lancarDespesa: false,
            editarLancamentos: false,
            verContas: false,
            lancarContasPagar: false,
            lancarContasReceber: false,
            marcarContasPagas: false,
            acessarConfiguracoes: false,
            fazerBackupManual: false,
            gerarRelatorios: false,
            verCadastros: false,
            gerenciarFuncionarios: false,
            alterarPermissoes: false,
            acessarAgendamentos: true,
            criarAgendamento: true,
            editarAgendamento: true,
            excluirAgendamento: false,
          })
        }
      });
      console.log(`✅ Marcelinho criado com ID: ${marcelinho.id}`);
    } else {
      console.log(`ℹ️ Marcelinho já existe com ID: ${existingMarcelinho.id}`);
    }

    // Get final count and list
    const allEmployees = await prisma.funcionario.findMany({
      select: {
        id: true,
        nome: true,
        login: true,
        tipoAcesso: true,
        ehTecnico: true
      },
      orderBy: { nome: "asc" }
    });

    console.log(`\n📊 Total de funcionários: ${allEmployees.length}`);
    allEmployees.forEach(emp => {
      console.log(`- ${emp.nome} (ID: ${emp.id}, Login: ${emp.login}, Tipo: ${emp.tipoAcesso}${emp.ehTecnico ? ', Técnico' : ''})`);
    });

    return {
      success: true,
      total: allEmployees.length,
      employees: allEmployees
    };

  } catch (error) {
    console.error("❌ Erro ao adicionar funcionários legítimos:", error);
    throw error;
  }
}
