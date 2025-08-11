import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const SetorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória")
});

export const getSetores: RequestHandler = async (req, res) => {
  try {
    const { cidade } = req.query;
    const where: any = {};

    if (cidade) where.cidade = cidade as string;
    
    const setores = await prisma.setor.findMany({
      where,
      orderBy: [{ cidade: 'asc' }, { nome: 'asc' }]
    });
    res.json(setores);
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getCidades: RequestHandler = async (req, res) => {
  try {
    const cidades = await prisma.setor.findMany({
      select: { cidade: true },
      distinct: ['cidade'],
      orderBy: { cidade: 'asc' }
    });
    
    const cidadesSimples = cidades.map(item => item.cidade);
    res.json(cidadesSimples);
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createSetor: RequestHandler = async (req, res) => {
  try {
    const data = SetorSchema.parse(req.body);
    const setor = await prisma.setor.create({ data });
    res.status(201).json(setor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao criar setor:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export const updateSetor: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = SetorSchema.partial().parse(req.body);
    
    const setor = await prisma.setor.update({
      where: { id },
      data
    });
    res.json(setor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao atualizar setor:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export const deleteSetor: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.setor.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir setor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
