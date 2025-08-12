import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const FormaPagamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  ativa: z.boolean().default(true),
});

export const getFormasPagamento: RequestHandler = async (req, res) => {
  try {
    const formasPagamento = await prisma.formaPagamento.findMany({
      orderBy: { nome: "asc" },
    });
    res.json(formasPagamento);
  } catch (error) {
    console.error("Erro ao buscar formas de pagamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createFormaPagamento: RequestHandler = async (req, res) => {
  try {
    const data = FormaPagamentoSchema.parse(req.body);
    const formaPagamento = await prisma.formaPagamento.create({ data });
    res.status(201).json(formaPagamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao criar forma de pagamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const updateFormaPagamento: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = FormaPagamentoSchema.partial().parse(req.body);

    const formaPagamento = await prisma.formaPagamento.update({
      where: { id },
      data,
    });
    res.json(formaPagamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao atualizar forma de pagamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const deleteFormaPagamento: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.formaPagamento.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir forma de pagamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
