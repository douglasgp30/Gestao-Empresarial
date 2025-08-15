import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const SetorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cidadeId: z.number().int().positive("ID da cidade é obrigatório"),
});

export const getSetores: RequestHandler = async (req, res) => {
  try {
    const { cidadeId } = req.query;
    const where: any = { ativo: true };

    if (cidadeId) where.cidadeId = parseInt(cidadeId as string);

    const setores = await prisma.setor.findMany({
      where,
      include: {
        cidade: true,
      },
      orderBy: [{ cidade: { nome: "asc" } }, { nome: "asc" }],
    });
    res.json(setores);
  } catch (error) {
    console.error("Erro ao buscar setores:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getCidades: RequestHandler = async (req, res) => {
  try {
    const cidades = await prisma.cidade.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
    res.json(cidades);
  } catch (error) {
    console.error("Erro ao buscar cidades:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createSetor: RequestHandler = async (req, res) => {
  try {
    const data = SetorSchema.parse(req.body);
    const setor = await prisma.setor.create({ data });
    res.status(201).json(setor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao criar setor:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const updateSetor: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = SetorSchema.partial().parse(req.body);

    const setor = await prisma.setor.update({
      where: { id },
      data,
    });
    res.json(setor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao atualizar setor:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const deleteSetor: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.setor.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir setor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const deleteCidade: RequestHandler = async (req, res) => {
  try {
    const cidade = decodeURIComponent(req.params.cidade);

    // Verificar se existem setores vinculados a esta cidade
    const setoresVinculados = await prisma.setor.findMany({
      where: { cidade },
    });

    if (setoresVinculados.length > 0) {
      const nomesSetores = setoresVinculados.map(s => s.nome).join(", ");
      return res.status(400).json({
        error: `Não é possível excluir a cidade "${cidade}" pois existem ${setoresVinculados.length} setor(es) vinculado(s): ${nomesSetores}. Remova ou realoque estes setores primeiro.`,
      });
    }

    // Se chegou aqui, pode excluir (na verdade não há uma tabela de cidades,
    // então não há nada para excluir fisicamente)
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir cidade:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
