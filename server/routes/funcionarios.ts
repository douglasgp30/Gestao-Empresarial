import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";
import { middlewareAuditoria } from "../lib/auditoria";

const FuncionarioSchema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório"),
    ehTecnico: z.boolean().default(false),
    percentualComissao: z.number().optional(),
    email: z.string().email().optional().or(z.literal("")),
    telefone: z.string().optional(),
    cargo: z.string().optional(),
    salario: z.number().optional(),
    temAcessoSistema: z.boolean().default(false),
    tipoAcesso: z.string().optional(),
    login: z.string().optional().or(z.literal("")),
    senha: z.string().optional().or(z.literal("")),
    permissoes: z.string().optional(),
  })
  .transform((data) => {
    // Transform empty strings to undefined/null for database
    return {
      ...data,
      email: data.email === "" ? null : data.email,
      login: data.login === "" ? null : data.login,
      senha: data.senha === "" ? null : data.senha,
    };
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
        ehTecnico: true,
      },
      select: {
        id: true,
        nome: true,
        ehTecnico: true,
        cargo: true,
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

export const createFuncionario: RequestHandler = middlewareAuditoria(
  'Funcionario',
  'criar',
  async (req, res) => {
    const data = FuncionarioSchema.parse(req.body);
    const funcionario = await prisma.funcionario.create({
      data,
      select: {
        id: true,
        nome: true,
        ehTecnico: true,
        percentualComissao: true,
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
    return { entidadeId: funcionario.id.toString(), dadosNovos: funcionario };
  },
  // Tratamento de erros específico para funcionários
  (error, req, res) => {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else if (error && typeof error === "object" && "code" in error) {
      // Handle Prisma errors
      if (error.code === "P2002") {
        const target = (error as any).meta?.target;
        if (target && target.includes("login")) {
          res
            .status(400)
            .json({
              error: "Este login já está sendo usado por outro funcionário",
            });
          return;
        }
        if (target && target.includes("email")) {
          res
            .status(400)
            .json({
              error: "Este email já está sendo usado por outro funcionário",
            });
          return;
        }
        res.status(400).json({ error: "Dados já existem no sistema" });
      } else {
        console.error("Erro ao criar funcionário:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    } else {
      console.error("Erro ao criar funcionário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

export const updateFuncionario: RequestHandler = middlewareAuditoria(
  'Funcionario',
  'update',
  async (req, res) => {
    const id = parseInt(req.params.id);
    const data = FuncionarioSchema.partial().parse(req.body);

    // Buscar dados antigos
    const funcionarioAntigo = await prisma.funcionario.findUnique({
      where: { id },
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
    return {
      entidadeId: funcionario.id.toString(),
      dadosAntigos: funcionarioAntigo,
      dadosNovos: funcionario
    };
  },
  (error, req, res) => {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao atualizar funcionário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

export const deleteFuncionario: RequestHandler = middlewareAuditoria(
  'Funcionario',
  'delete',
  async (req, res) => {
    const id = parseInt(req.params.id);

    // Buscar dados antes de excluir
    const funcionarioAntigo = await prisma.funcionario.findUnique({
      where: { id },
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

    await prisma.funcionario.delete({ where: { id } });
    res.status(204).send();
    return {
      entidadeId: id.toString(),
      dadosAntigos: funcionarioAntigo
    };
  },
  (error, req, res) => {
    console.error("Erro ao excluir funcionário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
);
