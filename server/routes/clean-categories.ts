import { RequestHandler } from "express";
import { prisma } from "../lib/database";

export const cleanCategories: RequestHandler = async (req, res) => {
  try {
    console.log("[CLEAN] Limpando categorias e descrições não desejadas...");

    // Remover todas as categorias e descrições da tabela unificada
    const deletedCount = await prisma.descricaoECategoria.deleteMany({});
    console.log(
      `[CLEAN] Removidos ${deletedCount.count} itens da tabela unificada`,
    );

    // Verificar total final
    const finalCount = await prisma.descricaoECategoria.count();

    res.json({
      success: true,
      message: `Tabela unificada limpa! ${deletedCount.count} itens removidos.`,
      stats: {
        removed: deletedCount.count,
        remaining: finalCount,
      },
    });
  } catch (error) {
    console.error("[CLEAN] Erro ao limpar dados:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

export const listCategories: RequestHandler = async (req, res) => {
  try {
    const items = await prisma.descricaoECategoria.findMany({
      orderBy: [{ tipoItem: "asc" }, { tipo: "asc" }, { nome: "asc" }],
    });

    const categorias = items.filter((item) => item.tipoItem === "categoria");
    const descricoes = items.filter((item) => item.tipoItem === "descricao");

    res.json({
      success: true,
      total: items.length,
      data: items,
      stats: {
        categorias: categorias.length,
        descricoes: descricoes.length,
        receitas: items.filter((item) => item.tipo === "receita").length,
        despesas: items.filter((item) => item.tipo === "despesa").length,
      },
    });
  } catch (error) {
    console.error("[LIST] Erro ao listar dados:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};
