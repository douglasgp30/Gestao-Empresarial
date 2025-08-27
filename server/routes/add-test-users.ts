import { RequestHandler } from "express";
import { prisma } from "../lib/database";

export const addTestUsers: RequestHandler = async (req, res) => {
  try {
    console.log("👥 Adicionando usuários de teste...");

    const testUsers = [
      {
        nome: "João Silva",
        email: "joao.silva@empresa.com",
        telefone: "(31) 99999-1001",
        tipoAcesso: "Técnico",
        ehTecnico: true,
        percentualComissao: 30,
        temAcessoSistema: true,
      },
      {
        nome: "Maria Santos",
        email: "maria.santos@empresa.com",
        telefone: "(31) 99999-1002",
        tipoAcesso: "Técnico",
        ehTecnico: true,
        percentualComissao: 35,
        temAcessoSistema: true,
      },
      {
        nome: "Pedro Costa",
        email: "pedro.costa@empresa.com",
        telefone: "(31) 99999-1003",
        tipoAcesso: "Administrador",
        ehTecnico: false,
        percentualComissao: 0,
        temAcessoSistema: true,
      },
      {
        nome: "Ana Oliveira",
        email: "ana.oliveira@empresa.com",
        telefone: "(31) 99999-1004",
        tipoAcesso: "Técnico",
        ehTecnico: true,
        percentualComissao: 40,
        temAcessoSistema: true,
      },
    ];

    const createdUsers = [];
    for (const user of testUsers) {
      const existing = await prisma.funcionario.findFirst({
        where: { nome: user.nome },
      });

      if (!existing) {
        const created = await prisma.funcionario.create({
          data: {
            ...user,
            dataCriacao: new Date(),
          },
        });
        createdUsers.push(created);
      } else {
        console.log(`ℹ️ Usuário ${user.nome} já existe`);
      }
    }

    console.log(`✅ ${createdUsers.length} novos usuários criados`);

    // Verificar total final
    const totalFuncionarios = await prisma.funcionario.count();
    const totalTecnicos = await prisma.funcionario.count({
      where: { ehTecnico: true },
    });

    res.json({
      success: true,
      message: `${createdUsers.length} usuários de teste adicionados`,
      data: {
        created: createdUsers.length,
        totalFuncionarios,
        totalTecnicos,
        newUsers: createdUsers.map((u) => ({
          id: u.id,
          nome: u.nome,
          ehTecnico: u.ehTecnico,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Erro ao adicionar usuários de teste:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao adicionar usuários de teste",
      details: error.message,
    });
  }
};
