import { RequestHandler } from "express";
import { z } from "zod";
import {
  migrateCidadesGoias,
  ativarCidade,
  listarCidadesAtivas,
  listarTodasCidades,
} from "../lib/migrate-cidades-goias";
import { prisma } from "../lib/database";

// Schema para ativar/desativar cidade
const AtivarCidadeSchema = z.object({
  nome: z.string().min(1, "Nome da cidade é obrigatório"),
  ativo: z.boolean(),
});

// Executar migração completa das cidades de Goiás
export const executarMigracaoCidades: RequestHandler = async (req, res) => {
  try {
    console.log("[CidadesGoias] Iniciando migração...");
    
    const resultado = await migrateCidadesGoias();
    
    res.json({
      success: true,
      message: "Migração executada com sucesso!",
      ...resultado,
    });
  } catch (error) {
    console.error("[CidadesGoias] Erro na migração:", error);
    res.status(500).json({
      error: "Erro ao executar migração",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

// Listar todas as cidades (ativas e inativas)
export const listarCidades: RequestHandler = async (req, res) => {
  try {
    const { ativas } = req.query;
    
    let cidades;
    if (ativas === "true") {
      cidades = await listarCidadesAtivas();
    } else {
      cidades = await listarTodasCidades();
    }

    console.log(`[CidadesGoias] Retornando ${cidades.length} cidades`);
    res.json(cidades);
  } catch (error) {
    console.error("[CidadesGoias] Erro ao listar cidades:", error);
    res.status(500).json({
      error: "Erro ao listar cidades",
    });
  }
};

// Ativar/desativar cidade
export const toggleCidade: RequestHandler = async (req, res) => {
  try {
    const data = AtivarCidadeSchema.parse(req.body);
    console.log(`[CidadesGoias] ${data.ativo ? "Ativando" : "Desativando"} cidade: ${data.nome}`);
    
    const resultado = await prisma.localizacaoGeografica.updateMany({
      where: {
        nome: data.nome,
        tipoItem: "cidade",
      },
      data: {
        ativo: data.ativo,
      },
    });

    if (resultado.count === 0) {
      return res.status(404).json({
        error: `Cidade "${data.nome}" não encontrada`,
      });
    }

    console.log(`[CidadesGoias] Cidade "${data.nome}" ${data.ativo ? "ativada" : "desativada"} com sucesso`);
    
    res.json({
      success: true,
      message: `Cidade "${data.nome}" ${data.ativo ? "ativada" : "desativada"} com sucesso`,
      cidade: data.nome,
      ativo: data.ativo,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors,
      });
    }

    console.error("[CidadesGoias] Erro ao ativar/desativar cidade:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

// Listar setores de uma cidade específica
export const listarSetoresPorCidade: RequestHandler = async (req, res) => {
  try {
    const { nomeCidade } = req.params;
    
    const setores = await prisma.localizacaoGeografica.findMany({
      where: {
        tipoItem: "setor",
        cidade: nomeCidade,
        ativo: true,
      },
      orderBy: { nome: "asc" },
    });

    console.log(`[CidadesGoias] Encontrados ${setores.length} setores para a cidade ${nomeCidade}`);
    res.json(setores);
  } catch (error) {
    console.error("[CidadesGoias] Erro ao listar setores:", error);
    res.status(500).json({
      error: "Erro ao listar setores",
    });
  }
};

// Criar novo setor para uma cidade
export const criarSetor: RequestHandler = async (req, res) => {
  try {
    const { nomeCidade } = req.params;
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        error: "Nome do setor é obrigatório",
      });
    }

    // Verificar se a cidade existe e está ativa
    const cidade = await prisma.localizacaoGeografica.findFirst({
      where: {
        nome: nomeCidade,
        tipoItem: "cidade",
        ativo: true,
      },
    });

    if (!cidade) {
      return res.status(400).json({
        error: `Cidade "${nomeCidade}" não encontrada ou inativa`,
      });
    }

    // Verificar se já existe setor com esse nome na cidade
    const setorExistente = await prisma.localizacaoGeografica.findFirst({
      where: {
        nome: nome.trim(),
        tipoItem: "setor",
        cidade: nomeCidade,
        ativo: true,
      },
    });

    if (setorExistente) {
      return res.status(400).json({
        error: `Já existe um setor "${nome.trim()}" na cidade "${nomeCidade}"`,
      });
    }

    // Criar o setor
    const novoSetor = await prisma.localizacaoGeografica.create({
      data: {
        nome: nome.trim(),
        tipoItem: "setor",
        cidade: nomeCidade,
        ativo: true,
      },
    });

    console.log(`[CidadesGoias] Setor "${nome.trim()}" criado para a cidade "${nomeCidade}"`);
    
    res.status(201).json({
      success: true,
      message: `Setor "${nome.trim()}" criado com sucesso`,
      setor: novoSetor,
    });
  } catch (error) {
    console.error("[CidadesGoias] Erro ao criar setor:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

// Excluir setor
export const excluirSetor: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const setorId = parseInt(id);

    if (isNaN(setorId)) {
      return res.status(400).json({
        error: "ID do setor inválido",
      });
    }

    // Verificar se o setor existe
    const setor = await prisma.localizacaoGeografica.findUnique({
      where: { id: setorId },
    });

    if (!setor || setor.tipoItem !== "setor") {
      return res.status(404).json({
        error: "Setor não encontrado",
      });
    }

    // Verificar se há lançamentos vinculados
    const lancamentosVinculados = await prisma.lancamentoCaixa.findFirst({
      where: { localizacaoId: setorId },
    });

    if (lancamentosVinculados) {
      return res.status(400).json({
        error: `Não é possível excluir o setor "${setor.nome}" pois existem lançamentos vinculados`,
      });
    }

    // Verificar se há agendamentos vinculados
    const agendamentosVinculados = await prisma.agendamento.findFirst({
      where: { localizacaoId: setorId },
    });

    if (agendamentosVinculados) {
      return res.status(400).json({
        error: `Não é possível excluir o setor "${setor.nome}" pois existem agendamentos vinculados`,
      });
    }

    // Verificar se há contas vinculadas
    const contasVinculadas = await prisma.contaLancamento.findFirst({
      where: { localizacaoId: setorId },
    });

    if (contasVinculadas) {
      return res.status(400).json({
        error: `Não é possível excluir o setor "${setor.nome}" pois existem contas vinculadas`,
      });
    }

    // Fazer soft delete
    await prisma.localizacaoGeografica.update({
      where: { id: setorId },
      data: { ativo: false },
    });

    console.log(`[CidadesGoias] Setor "${setor.nome}" marcado como inativo`);
    
    res.json({
      success: true,
      message: `Setor "${setor.nome}" excluído com sucesso`,
    });
  } catch (error) {
    console.error("[CidadesGoias] Erro ao excluir setor:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};
