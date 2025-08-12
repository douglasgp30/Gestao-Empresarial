import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const FuncionarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  ehTecnico: z.boolean().default(false),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  salario: z.number().optional(),
  temAcessoSistema: z.boolean().default(false),
  tipoAcesso: z.string().optional(),
  login: z.string().optional(),
  senha: z.string().optional(),
  permissoes: z.string().optional(),
});

export const getFuncionarios: RequestHandler = async (req, res) => {
  try {
    console.log("[Funcionarios] Buscando funcionários...");
    const funcionarios = await prisma.funcionario.findMany({
      select: {
        id: true,
        nome: true,
        ehTecnico: true,
        email: true,
        telefone: true,
        cargo: true,
        salario: true,
        percentualComissao: true, // Adicionar percentual de comissão
        temAcessoSistema: true,
        tipoAcesso: true,
        login: true,
        permissoes: true,
        dataCriacao: true,
        // Não incluir senha na resposta
      },
      orderBy: { nome: "asc" },
    });
    console.log(
      `[Funcionarios] Encontrados ${funcionarios.length} funcionários`,
    );
    console.log(
      "[Funcionarios] IDs dos funcionários:",
      funcionarios.map((f) => f.id),
    );
    res.json(funcionarios);
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getTecnicos: RequestHandler = async (req, res) => {
  try {
    console.log("[Tecnicos] Buscando técnicos...");
    const tecnicos = await prisma.funcionario.findMany({
      where: {
        OR: [
          { tipoAcesso: "Técnico" },
          { cargo: "Técnico" },
          { cargo: { contains: "técnico" } },
          { cargo: { contains: "Técnico" } },
        ],
      },
      select: {
        id: true,
        nome: true,
        cargo: true,
        tipoAcesso: true,
        percentualComissao: true, // Adicionar percentual de comissão
      },
      orderBy: { nome: "asc" },
    });
    console.log(`[Tecnicos] Encontrados ${tecnicos.length} técnicos`);
    console.log(
      "[Tecnicos] IDs dos técnicos:",
      tecnicos.map((t) => t.id),
    );
    res.json(tecnicos);
  } catch (error) {
    console.error("Erro ao buscar técnicos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createFuncionario: RequestHandler = async (req, res) => {
  try {
    const data = FuncionarioSchema.parse(req.body);
    const funcionario = await prisma.funcionario.create({
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cargo: true,
        salario: true,
        temAcessoSistema: true,
        tipoAcesso: true,
        login: true,
        permissoes: true,
        dataCriacao: true,
      },
    });
    res.status(201).json(funcionario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao criar funcionário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const updateFuncionario: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = FuncionarioSchema.partial().parse(req.body);

    const funcionario = await prisma.funcionario.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cargo: true,
        salario: true,
        temAcessoSistema: true,
        tipoAcesso: true,
        login: true,
        permissoes: true,
        dataCriacao: true,
      },
    });
    res.json(funcionario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao atualizar funcionário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const deleteFuncionario: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.funcionario.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
