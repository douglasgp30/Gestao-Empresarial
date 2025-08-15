import { RequestHandler } from "express";
import { prisma } from "../lib/database";

export const seedUnifiedData: RequestHandler = async (req, res) => {
  try {
    console.log("[SEED] Criando dados unificados de teste...");

    // Verificar se já existem dados
    const existingCount = await prisma.descricaoECategoria.count();

    if (existingCount > 0) {
      console.log(
        `[SEED] Já existem ${existingCount} dados na tabela unificada`,
      );
      return res.json({
        success: true,
        message: `Já existem ${existingCount} dados na tabela unificada`,
        existing: existingCount,
      });
    }

    // Dados para criar
    const categorias = [
      {
        nome: "Serviços",
        tipo: "receita" as const,
        tipoItem: "categoria" as const,
      },
      {
        nome: "Produtos",
        tipo: "receita" as const,
        tipoItem: "categoria" as const,
      },
      {
        nome: "Consultoria",
        tipo: "receita" as const,
        tipoItem: "categoria" as const,
      },
    ];

    const descricoes = [
      {
        nome: "Conserto de Celular",
        tipo: "receita" as const,
        tipoItem: "descricao" as const,
        categoria: "Serviços",
      },
      {
        nome: "Troca de Tela",
        tipo: "receita" as const,
        tipoItem: "descricao" as const,
        categoria: "Serviços",
      },
      {
        nome: "Instalação de Software",
        tipo: "receita" as const,
        tipoItem: "descricao" as const,
        categoria: "Serviços",
      },
      {
        nome: "Venda de Capinha",
        tipo: "receita" as const,
        tipoItem: "descricao" as const,
        categoria: "Produtos",
      },
      {
        nome: "Venda de Película",
        tipo: "receita" as const,
        tipoItem: "descricao" as const,
        categoria: "Produtos",
      },
      {
        nome: "Venda de Carregador",
        tipo: "receita" as const,
        tipoItem: "descricao" as const,
        categoria: "Produtos",
      },
      {
        nome: "Análise Técnica",
        tipo: "receita" as const,
        tipoItem: "descricao" as const,
        categoria: "Consultoria",
      },
      {
        nome: "Consultoria em TI",
        tipo: "receita" as const,
        tipoItem: "descricao" as const,
        categoria: "Consultoria",
      },
    ];

    // Criar categorias
    console.log("[SEED] Criando categorias...");
    for (const categoria of categorias) {
      const created = await prisma.descricaoECategoria.create({
        data: {
          ...categoria,
          ativo: true,
        },
      });
      console.log(
        `[SEED] Categoria criada: ${created.nome} (ID: ${created.id})`,
      );
    }

    // Criar descrições
    console.log("[SEED] Criando descrições...");
    for (const descricao of descricoes) {
      const created = await prisma.descricaoECategoria.create({
        data: {
          ...descricao,
          ativo: true,
        },
      });
      console.log(
        `[SEED] Descrição criada: ${created.nome} (${created.categoria}) - ID: ${created.id}`,
      );
    }

    // Verificar resultado final
    const totalCriados = await prisma.descricaoECategoria.count();
    const categoriasCriadas = await prisma.descricaoECategoria.count({
      where: { tipoItem: "categoria" },
    });
    const descricoesCriadas = await prisma.descricaoECategoria.count({
      where: { tipoItem: "descricao" },
    });

    console.log(`[SEED] Dados criados com sucesso!`);
    console.log(
      `[SEED] Total: ${totalCriados} | Categorias: ${categoriasCriadas} | Descrições: ${descricoesCriadas}`,
    );

    res.json({
      success: true,
      message: "Dados unificados criados com sucesso!",
      stats: {
        total: totalCriados,
        categorias: categoriasCriadas,
        descricoes: descricoesCriadas,
      },
    });
  } catch (error) {
    console.error("[SEED] Erro ao criar dados:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};
