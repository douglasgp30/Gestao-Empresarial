import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";
import { middlewareAuditoria } from "../lib/auditoria";

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

export const createCliente: RequestHandler = middlewareAuditoria(
  'Cliente',
  'criar',
  async (req, res) => {
    console.log(
      "[Clientes] Dados recebidos:",
      JSON.stringify(req.body, null, 2),
    );
    const data = ClienteSchema.parse(req.body);

    const cliente = await prisma.cliente.create({
      data,
    });

    console.log("[Clientes] Cliente criado:", cliente);
    res.status(201).json(cliente);
    return { entidadeId: cliente.id.toString(), dadosNovos: cliente };
  },
  (error, req, res) => {
    if (error instanceof z.ZodError) {
      console.error("[Clientes] Erro de validação:", error.errors);
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao criar cliente:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

export const updateCliente: RequestHandler = middlewareAuditoria(
  'Cliente',
  'update',
  async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(
      `[Clientes] Atualizando cliente ID: ${id}`,
      JSON.stringify(req.body, null, 2),
    );

    if (isNaN(id)) {
      throw new Error("ID do cliente inválido");
    }

    // Verificar se o cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExistente) {
      throw new Error("Cliente não encontrado");
    }

    const data = ClienteSchema.partial().parse(req.body);

    const cliente = await prisma.cliente.update({
      where: { id },
      data,
    });

    console.log(`[Clientes] Cliente atualizado:`, cliente);
    res.json(cliente);
    return {
      entidadeId: cliente.id.toString(),
      dadosAntigos: clienteExistente,
      dadosNovos: cliente
    };
  },
  (error, req, res) => {
    if (error instanceof z.ZodError) {
      console.error("[Clientes] Erro de validação:", error.errors);
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else if (error.message === "ID do cliente inválido") {
      res.status(400).json({ error: "ID do cliente inválido" });
    } else if (error.message === "Cliente não encontrado") {
      res.status(404).json({ error: "Cliente não encontrado" });
    } else {
      console.error("Erro ao atualizar cliente:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

export const deleteCliente: RequestHandler = middlewareAuditoria(
  'Cliente',
  'delete',
  async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`[Clientes] Excluindo cliente ID: ${id}`);

    if (isNaN(id)) {
      throw new Error("ID do cliente inválido");
    }

    // Verificar se o cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExistente) {
      throw new Error("Cliente não encontrado");
    }

    await prisma.cliente.delete({ where: { id } });
    console.log(`[Clientes] Cliente ${id} excluído com sucesso`);

    res.status(204).send();
    return {
      entidadeId: id.toString(),
      dadosAntigos: clienteExistente
    };
  },
  (error, req, res) => {
    if (error.message === "ID do cliente inválido") {
      res.status(400).json({ error: "ID do cliente inválido" });
    } else if (error.message === "Cliente não encontrado") {
      res.status(404).json({ error: "Cliente não encontrado" });
    } else {
      console.error("Erro ao excluir cliente:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);
