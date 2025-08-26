import { RequestHandler } from "express";
import { prisma } from "../lib/database";

// Endpoint para verificar dados existentes
export const verificarLocalizacoes: RequestHandler = async (req, res) => {
  try {
    console.log("[CleanLoc] Verificando dados de localizações...");

    // Contar total por tipo
    const estatisticas = await prisma.localizacaoGeografica.groupBy({
      by: ["tipoItem"],
      _count: {
        id: true,
      },
    });

    // Buscar alguns exemplos
    const exemplosCidades = await prisma.localizacaoGeografica.findMany({
      where: { tipoItem: "cidade" },
      select: {
        id: true,
        nome: true,
        ativo: true,
        dataCriacao: true,
      },
      take: 10,
      orderBy: { dataCriacao: "desc" },
    });

    const exemplosSetores = await prisma.localizacaoGeografica.findMany({
      where: { tipoItem: "setor" },
      select: {
        id: true,
        nome: true,
        cidade: true,
        ativo: true,
        dataCriacao: true,
      },
      take: 10,
      orderBy: { dataCriacao: "desc" },
    });

    // Verificar lançamentos que usam localizações
    const lancamentosComLocalizacao = await prisma.lancamentoCaixa.count({
      where: {
        localizacaoId: {
          not: null,
        },
      },
    });

    res.json({
      success: true,
      estatisticas,
      exemplosCidades,
      exemplosSetores,
      lancamentosComLocalizacao,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CleanLoc] Erro ao verificar localizações:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao verificar dados",
      details: error.message,
    });
  }
};

// Endpoint para limpar TODOS os dados de localizações
export const limparTodasLocalizacoes: RequestHandler = async (req, res) => {
  try {
    console.log("[CleanLoc] ⚠️ LIMPANDO TODAS AS LOCALIZAÇÕES...");

    // Primeiro, remover vínculos de lançamentos
    const lancamentosAtualizados = await prisma.lancamentoCaixa.updateMany({
      where: {
        localizacaoId: {
          not: null,
        },
      },
      data: {
        localizacaoId: null,
      },
    });

    console.log(
      `[CleanLoc] ${lancamentosAtualizados.count} lançamentos desvinculados`,
    );

    // Remover vínculos de agendamentos
    const agendamentosAtualizados = await prisma.agendamento.updateMany({
      where: {
        localizacaoId: {
          not: null,
        },
      },
      data: {
        localizacaoId: null,
      },
    });

    console.log(
      `[CleanLoc] ${agendamentosAtualizados.count} agendamentos desvinculados`,
    );

    // Remover vínculos de contas
    const contasAtualizadas = await prisma.contaLancamento.updateMany({
      where: {
        localizacaoId: {
          not: null,
        },
      },
      data: {
        localizacaoId: null,
      },
    });

    console.log(`[CleanLoc] ${contasAtualizadas.count} contas desvinculadas`);

    // Agora deletar todas as localizações
    const localizacoesRemovidas = await prisma.localizacaoGeografica.deleteMany(
      {},
    );

    console.log(
      `[CleanLoc] ${localizacoesRemovidas.count} localizações removidas`,
    );

    res.json({
      success: true,
      message: "Todas as localizações foram removidas com sucesso",
      detalhes: {
        lancamentosDesvinculados: lancamentosAtualizados.count,
        agendamentosDesvinculados: agendamentosAtualizados.count,
        contasDesvinculadas: contasAtualizadas.count,
        localizacoesRemovidas: localizacoesRemovidas.count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CleanLoc] Erro ao limpar localizações:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao limpar dados",
      details: error.message,
    });
  }
};
