import { RequestHandler } from "express";
import { prisma } from "../lib/database";

export const initBasicData: RequestHandler = async (req, res) => {
  try {
    console.log("🚀 Inicializando dados básicos do sistema...");

    // Criar funcionários básicos se não existirem
    const funcionariosExistentes = await prisma.funcionario.count();
    if (funcionariosExistentes === 0) {
      const funcionarios = await Promise.all([
        prisma.funcionario.create({
          data: {
            nome: "João Técnico",
            email: "joao.tecnico@empresa.com",
            telefone: "(31) 99999-0001",
            tipoAcesso: "Técnico",
            ehTecnico: true,
            dataCriacao: new Date(),
          },
        }),
        prisma.funcionario.create({
          data: {
            nome: "Maria Técnica",
            email: "maria.tecnica@empresa.com", 
            telefone: "(31) 99999-0002",
            tipoAcesso: "Técnico",
            ehTecnico: true,
            dataCriacao: new Date(),
          },
        }),
        prisma.funcionario.create({
          data: {
            nome: "Pedro Administrador",
            email: "pedro.admin@empresa.com",
            telefone: "(31) 99999-0003", 
            tipoAcesso: "Administrador",
            ehTecnico: false,
            dataCriacao: new Date(),
          },
        }),
        prisma.funcionario.create({
          data: {
            nome: "Ana Técnica",
            email: "ana.tecnica@empresa.com",
            telefone: "(31) 99999-0004",
            tipoAcesso: "Técnico", 
            ehTecnico: true,
            dataCriacao: new Date(),
          },
        }),
      ]);

      console.log(`✅ ${funcionarios.length} funcionários criados`);
    } else {
      console.log(`ℹ️ ${funcionariosExistentes} funcionários já existem`);
    }

    // Verificar formas de pagamento
    const formasPagamento = await prisma.formaPagamento.findMany();
    console.log(`ℹ️ ${formasPagamento.length} formas de pagamento encontradas`);

    // Verificar campanhas
    const campanhas = await prisma.campanha.count();
    if (campanhas === 0) {
      const campaignData = await Promise.all([
        prisma.campanha.create({
          data: {
            nome: "Promoção Verão",
            descricao: "Campanha de verão com desconto especial",
            dataInicio: new Date(),
            ativa: true,
          },
        }),
        prisma.campanha.create({
          data: {
            nome: "Black Friday",
            descricao: "Descontos especiais da Black Friday",
            dataInicio: new Date(),
            ativa: true,
          },
        }),
      ]);
      console.log(`✅ ${campaignData.length} campanhas criadas`);
    } else {
      console.log(`ℹ️ ${campanhas} campanhas já existem`);
    }

    // Resumo final
    const resumo = {
      funcionarios: await prisma.funcionario.count(),
      formasPagamento: await prisma.formaPagamento.count(),
      campanhas: await prisma.campanha.count(),
      clientes: await prisma.cliente.count(),
      categorias: await prisma.descricaoECategoria.count({
        where: { tipoItem: "categoria" },
      }),
      descricoes: await prisma.descricaoECategoria.count({
        where: { tipoItem: "descricao" },
      }),
    };

    console.log("📊 RESUMO DOS DADOS:", resumo);

    res.json({
      success: true,
      message: "Dados básicos inicializados com sucesso",
      data: resumo,
    });
  } catch (error) {
    console.error("❌ Erro ao inicializar dados básicos:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao inicializar dados básicos",
      details: error.message,
    });
  }
};
