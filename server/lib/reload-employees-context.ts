import { prisma } from "./database";

export async function reloadEmployeesInContext() {
  try {
    console.log("🔄 Recarregando funcionários para sincronizar context...");
    
    // Get current employees from database
    const dbEmployees = await prisma.funcionario.findMany({
      select: {
        id: true,
        nome: true,
        login: true,
        tipoAcesso: true,
        ehTecnico: true,
        temAcessoSistema: true,
        email: true,
        telefone: true,
        cargo: true,
        salario: true,
        percentualComissao: true,
        permissoes: true,
        dataCriacao: true
      },
      orderBy: { nome: "asc" }
    });

    console.log(`📊 Funcionários no banco: ${dbEmployees.length}`);
    dbEmployees.forEach(emp => {
      console.log(`- ${emp.nome} (ID: ${emp.id}, Login: ${emp.login})`);
    });

    // Clear localStorage to force reload from API
    console.log("🗑️ Limpando localStorage para forçar reload da API...");
    
    return {
      success: true,
      message: "Context reload preparado - localStorage será limpo",
      employees: dbEmployees,
      clearLocalStorage: true
    };

  } catch (error) {
    console.error("❌ Erro ao recarregar funcionários:", error);
    throw error;
  }
}
