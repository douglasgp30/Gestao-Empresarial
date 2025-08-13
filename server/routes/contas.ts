import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "@shared/api";

const router = Router();
const prisma = new PrismaClient();

const ContaLancamentoSchema = z
  .object({
    valor: z.number().positive("Valor deve ser positivo"),
    dataVencimento: z.string().transform((str) => new Date(str)),
    codigoCliente: z.number().optional(),
    codigoFornecedor: z.number().optional(),
    tipo: z.enum(["receber", "pagar"]),
    formaPg: z.number().optional(),
    observacoes: z.string().optional(),
    descricaoCategoria: z.number().optional(),
    pago: z.boolean().default(false),
    dataPagamento: z
      .string()
      .optional()
      .transform((str) => (str ? new Date(str) : undefined)),
  })
  .refine(
    (data) => {
      // Regra: tipo = receber → precisa ter codigoCliente e não pode ter codigoFornecedor
      if (data.tipo === "receber") {
        return data.codigoCliente && !data.codigoFornecedor;
      }
      // Regra: tipo = pagar → precisa ter codigoFornecedor e não pode ter codigoCliente
      if (data.tipo === "pagar") {
        return data.codigoFornecedor && !data.codigoCliente;
      }
      return true;
    },
    {
      message:
        "Contas a receber devem ter cliente, contas a pagar devem ter fornecedor",
    },
  )
  .refine(
    (data) => {
      // Regra: Se pago = true → precisa ter dataPagamento e formaPg
      if (data.pago) {
        return data.dataPagamento && data.formaPg;
      }
      // Regra: Se pago = false → dataPagamento e formaPg devem estar nulos
      return !data.dataPagamento && !data.formaPg;
    },
    {
      message: "Contas pagas devem ter data de pagamento e forma de pagamento",
    },
  );

// GET /api/contas - Listar contas com filtros
router.get("/", async (req, res) => {
  try {
    const { dataInicio, dataFim, tipo, pago, categoria } = req.query;

    const where: any = {};

    // Filtro por data de vencimento (não mais data de lançamento)
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

    // Filtro por status de pagamento
    if (pago !== undefined && pago !== "todos") {
      where.pago = pago === "true";
    }

    // Filtro por categoria
    if (categoria && categoria !== "todos") {
      where.descricaoCategoria = parseInt(categoria as string);
    }

    const contas = await prisma.contaLancamento.findMany({
      where,
      include: {
        cliente: true,
        fornecedor: true,
        formaPagamento: true,
        categoria: true,
      },
      orderBy: {
        dataVencimento: "desc",
      },
    });

    console.log("🔍 [API CONTAS] Dados encontrados:", {
      total: contas.length,
      filtros: { dataInicio, dataFim, tipo, pago, categoria },
      primeiros3: contas.slice(0, 3).map((c) => ({
        id: c.codLancamentoContas,
        tipo: c.tipo,
        valor: c.valor,
        vencimento: c.dataVencimento,
        cliente: c.cliente?.nome,
        fornecedor: c.fornecedor?.nome,
      })),
    });

    const response: ApiResponse<typeof contas> = {
      data: contas,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// POST /api/contas - Criar nova conta
router.post("/", async (req, res) => {
  try {
    console.log("🔍 [API CONTAS] Dados recebidos para criar conta:", req.body);

    const dados = ContaLancamentoSchema.parse(req.body);

    const conta = await prisma.contaLancamento.create({
      data: dados,
      include: {
        cliente: true,
        fornecedor: true,
        formaPagamento: true,
        categoria: true,
      },
    });

    console.log("✅ [API CONTAS] Conta criada com sucesso:", {
      id: conta.codLancamentoContas,
      tipo: conta.tipo,
      valor: conta.valor,
      cliente: conta.cliente?.nome,
      fornecedor: conta.fornecedor?.nome,
    });

    const response: ApiResponse<typeof conta> = {
      data: conta,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao criar conta:", error);

    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        error: "Dados inválidos",
        details: error.errors,
      };
      return res.status(400).json(response);
    }

    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// PUT /api/contas/:id - Atualizar conta
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const dados = ContaLancamentoSchema.partial().parse(req.body);

    const conta = await prisma.contaLancamento.update({
      where: { codLancamentoContas: id },
      data: dados,
      include: {
        cliente: true,
        fornecedor: true,
        formaPagamento: true,
        categoria: true,
      },
    });

    const response: ApiResponse<typeof conta> = {
      data: conta,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);

    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        error: "Dados inválidos",
        details: error.errors,
      };
      return res.status(400).json(response);
    }

    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// DELETE /api/contas/:id - Excluir conta
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.contaLancamento.delete({
      where: { codLancamentoContas: id },
    });

    const response: ApiResponse<null> = {
      data: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// PATCH /api/contas/:id/pagar - Marcar conta como paga
router.patch("/:id/pagar", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { formaPg } = req.body;

    if (!formaPg) {
      const response: ApiResponse<null> = {
        error: "Forma de pagamento é obrigatória para marcar como pago",
      };
      return res.status(400).json(response);
    }

    const conta = await prisma.contaLancamento.update({
      where: { codLancamentoContas: id },
      data: {
        pago: true,
        dataPagamento: new Date(),
        formaPg: parseInt(formaPg),
      },
      include: {
        cliente: true,
        fornecedor: true,
        formaPagamento: true,
        categoria: true,
      },
    });

    const response: ApiResponse<typeof conta> = {
      data: conta,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao marcar conta como paga:", error);
    const response: ApiResponse<null> = {
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

    const contas = await prisma.contaLancamento.findMany({ where });

    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    const totais = {
      totalPagar: contas
        .filter((c) => c.tipo === "pagar" && !c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      totalReceber: contas
        .filter((c) => c.tipo === "receber" && !c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      totalVencendoHoje: contas
        .filter((c) => {
          const vencimento = new Date(c.dataVencimento);
          vencimento.setHours(23, 59, 59, 999);
          return hoje.toDateString() === vencimento.toDateString() && !c.pago;
        })
        .reduce((sum, c) => sum + c.valor, 0),
      totalAtrasadas: contas
        .filter((c) => new Date(c.dataVencimento) < hoje && !c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      totalPagas: contas
        .filter((c) => c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      totalContasRecebidas: contas
        .filter((c) => c.tipo === "receber" && c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
      totalContasPagas: contas
        .filter((c) => c.tipo === "pagar" && c.pago)
        .reduce((sum, c) => sum + c.valor, 0),
    };

    const response: ApiResponse<typeof totais> = {
      data: totais,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao calcular totais:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// GET /api/contas/clientes - Listar clientes para dropdown
router.get("/clientes", async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        telefonePrincipal: true,
      },
    });

    const response: ApiResponse<typeof clientes> = {
      data: clientes,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// GET /api/contas/fornecedores - Listar fornecedores para dropdown
router.get("/fornecedores", async (req, res) => {
  try {
    const fornecedores = await prisma.fornecedor.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        telefone: true,
      },
    });

    const response: ApiResponse<typeof fornecedores> = {
      data: fornecedores,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar fornecedores:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

// GET /api/contas/categorias - Listar categorias para dropdown (usando tabela unificada)
router.get("/categorias", async (req, res) => {
  try {
    const categorias = await prisma.descricaoECategoria.findMany({
      where: {
        tipoItem: "categoria",
        ativo: true,
      },
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        tipo: true,
        dataCriacao: true,
      },
    });

    const response: ApiResponse<typeof categorias> = {
      data: categorias,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

export default router;
