import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const DescricaoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  categoria: z.string().optional(),
  tipo: z.enum(["receita", "despesa"]).default("receita")
});

export const getDescricoes: RequestHandler = async (req, res) => {
  try {
    const { tipo } = req.query;
    const where = tipo ? { tipo: tipo as string } : {};
    
    const descricoes = await prisma.descricao.findMany({
      where,
      orderBy: { nome: 'asc' }
    });
    res.json(descricoes);
  } catch (error) {
    console.error('Erro ao buscar descrições:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createDescricao: RequestHandler = async (req, res) => {
  try {
    const data = DescricaoSchema.parse(req.body);
    const descricao = await prisma.descricao.create({ data });
    res.status(201).json(descricao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao criar descrição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export const updateDescricao: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = DescricaoSchema.partial().parse(req.body);
    
    const descricao = await prisma.descricao.update({
      where: { id },
      data
    });
    res.json(descricao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao atualizar descrição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export const deleteDescricao: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.descricao.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir descrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
