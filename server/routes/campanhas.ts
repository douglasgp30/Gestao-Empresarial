import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const CampanhaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  ativa: z.boolean().default(true),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional()
});

export const getCampanhas: RequestHandler = async (req, res) => {
  try {
    const campanhas = await prisma.campanha.findMany({
      orderBy: { nome: 'asc' }
    });
    res.json(campanhas);
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createCampanha: RequestHandler = async (req, res) => {
  try {
    const data = CampanhaSchema.parse(req.body);
    const campanha = await prisma.campanha.create({
      data: {
        ...data,
        dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
        dataFim: data.dataFim ? new Date(data.dataFim) : null
      }
    });
    res.status(201).json(campanha);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao criar campanha:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export const updateCampanha: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = CampanhaSchema.partial().parse(req.body);
    
    const campanha = await prisma.campanha.update({
      where: { id },
      data: {
        ...data,
        dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
        dataFim: data.dataFim ? new Date(data.dataFim) : undefined
      }
    });
    res.json(campanha);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao atualizar campanha:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export const deleteCampanha: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.campanha.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
