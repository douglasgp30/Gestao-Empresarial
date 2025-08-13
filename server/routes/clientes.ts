import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const ClienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().optional(),
  email: z.string().email().optional().nullable(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
});

export const getClientes: RequestHandler = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: "asc" },
    });

    res.json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createCliente: RequestHandler = async (req, res) => {
  try {
    console.log("[Clientes] Dados recebidos:", JSON.stringify(req.body, null, 2));
    const data = ClienteSchema.parse(req.body);

    const cliente = await prisma.cliente.create({
      data,
    });

    console.log("[Clientes] Cliente criado:", cliente);
    res.status(201).json(cliente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Clientes] Erro de validação:", error.errors);
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao criar cliente:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const updateCliente: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Clientes] Atualizando cliente ID: ${id}`, JSON.stringify(req.body, null, 2));
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID do cliente inválido" });
    }

    // Verificar se o cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExistente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const data = ClienteSchema.partial().parse(req.body);
    
    const cliente = await prisma.cliente.update({
      where: { id },
      data,
    });

    console.log(`[Clientes] Cliente atualizado:`, cliente);
    res.json(cliente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Clientes] Erro de validação:", error.errors);
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao atualizar cliente:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const deleteCliente: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Clientes] Excluindo cliente ID: ${id}`);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID do cliente inválido" });
    }

    // Verificar se o cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExistente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    await prisma.cliente.delete({ where: { id } });
    console.log(`[Clientes] Cliente ${id} excluído com sucesso`);
    
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
