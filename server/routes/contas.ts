import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "@shared/api";

const router = Router();
const prisma = new PrismaClient();

const ContaSchema = z.object({
  tipo: z.enum(["pagar", "receber"]),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.number().positive("Valor deve ser positivo"),
  dataVencimento: z.string().transform((str) => new Date(str)),
  dataPagamento: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  status: z.enum(["pendente", "pago", "atrasado"]).default("pendente"),
  observacoes: z.string().optional(),
  categoria: z.string().optional(),
});

// GET /api/contas - Listar contas com filtros
router.get("/", async (req, res) => {
  try {
    const { dataInicio, dataFim, tipo, status, categoria } = req.query;

    const where: any = {};

    // Filtro por data de vencimento
    if (dataInicio || dataFim) {
      where.dataVencimento = {};
      if (dataInicio) {
        where.dataVencimento.gte = new Date(dataInicio as string);
      }
      if (dataFim) {
        where.dataVencimento.lte = new Date(dataFim as string);
      }
    }

    // Filtro por tipo
    if (tipo && tipo !== "ambos") {
      where.tipo = tipo;
    }

    // Filtro por status
    if (status && status !== "todos") {
      where.status = status;
    }

    // Filtro por categoria
    if (categoria && categoria !== "todos") {
      where.categoria = categoria;
    }

    const contas = await prisma.conta.findMany({
      where,
      orderBy: {
        dataVencimento: "desc",
      },
    });
    console.log("[Server] Contas encontradas:", contas.length, contas);

    const response: ApiResponse<typeof contas> = {
      success: true,
      data: contas,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// POST /api/contas - Criar nova conta
router.post("/", async (req, res) => {
  try {
    const dados = ContaSchema.parse(req.body);

    console.log("[Server] Dados recebidos para criação:", dados);
    const conta = await prisma.conta.create({
      data: dados,
    });
    console.log("[Server] Conta criada:", conta);

    const response: ApiResponse<typeof conta> = {
      success: true,
      data: conta,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao criar conta:", error);

    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      };
      return res.status(400).json(response);
    }

    const response: ApiResponse<null> = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// PUT /api/contas/:id - Atualizar conta
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const dados = ContaSchema.partial().parse(req.body);

    const conta = await prisma.conta.update({
      where: { id },
      data: dados,
    });

    const response: ApiResponse<typeof conta> = {
      success: true,
      data: conta,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);

    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      };
      return res.status(400).json(response);
    }

    const response: ApiResponse<null> = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// DELETE /api/contas/:id - Excluir conta
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.conta.delete({
      where: { id },
    });

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// PATCH /api/contas/:id/pagar - Marcar conta como paga
router.patch("/:id/pagar", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const conta = await prisma.conta.update({
      where: { id },
      data: {
        status: "pago",
        dataPagamento: new Date(),
      },
    });

    const response: ApiResponse<typeof conta> = {
      success: true,
      data: conta,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao marcar conta como paga:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// GET /api/contas/totais - Obter totais para dashboard
router.get("/totais", async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    const where: any = {};
    if (dataInicio || dataFim) {
      where.dataVencimento = {};
      if (dataInicio) {
        where.dataVencimento.gte = new Date(dataInicio as string);
      }
      if (dataFim) {
        where.dataVencimento.lte = new Date(dataFim as string);
      }
    }

    const contas = await prisma.conta.findMany({ where });

    const totais = {
      totalPagar: contas
        .filter((c) => c.tipo === "pagar" && c.status !== "pago")
        .reduce((sum, c) => sum + c.valor, 0),
      totalReceber: contas
        .filter((c) => c.tipo === "receber" && c.status !== "pago")
        .reduce((sum, c) => sum + c.valor, 0),
      totalVencendoHoje: contas
        .filter((c) => {
          const hoje = new Date();
          const vencimento = new Date(c.dataVencimento);
          return (
            hoje.toDateString() === vencimento.toDateString() &&
            c.status !== "pago"
          );
        })
        .reduce((sum, c) => sum + c.valor, 0),
      totalAtrasadas: contas
        .filter(
          (c) => new Date(c.dataVencimento) < new Date() && c.status !== "pago",
        )
        .reduce((sum, c) => sum + c.valor, 0),
      totalPagas: contas
        .filter((c) => c.status === "pago")
        .reduce((sum, c) => sum + c.valor, 0),
      totalContasRecebidas: contas
        .filter((c) => c.tipo === "receber" && c.status === "pago")
        .reduce((sum, c) => sum + c.valor, 0),
      totalContasPagas: contas
        .filter((c) => c.tipo === "pagar" && c.status === "pago")
        .reduce((sum, c) => sum + c.valor, 0),
    };

    const response: ApiResponse<typeof totais> = {
      success: true,
      data: totais,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao calcular totais:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

export default router;
