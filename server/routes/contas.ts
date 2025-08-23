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

    // Campos para integração com Caixa
    codigoServico: z.string().optional(),
    categoria: z.string().optional(),
    descricao: z.string().optional(),
    lancamentoCaixaId: z.union([z.string(), z.number()]).optional(),
    sistemaOrigem: z.string().optional(),
    status: z.string().optional(),
    prioridadePagamento: z.string().optional(),

    // Campos adicionais do schema Prisma
    valorOriginal: z.number().optional(),
    valorLiquido: z.number().optional(),
    numeroDocumento: z.string().optional(),
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

    // Preparar dados para criação com mapeamento correto
    const dadosParaCriacao: any = {
      // Remover campo 'valor' que não existe no schema
      dataVencimento: dados.dataVencimento,
      codigoCliente: dados.codigoCliente,
      codigoFornecedor: dados.codigoFornecedor,
      tipo: dados.tipo,
      formaPagamentoId: dados.formaPg, // Corrigir nome do campo
      observacoes: dados.observacoes,
      categoriaId: dados.descricaoCategoria, // Corrigir nome do campo

      // Status de pagamento
      status: dados.pago ? "pago" : "pendente",
      dataPagamento: dados.dataPagamento,

      // Campos de valor corretos do schema
      valorOriginal: dados.valorOriginal || dados.valor,
      valorLiquido: dados.valorLiquido || dados.valor,
      valorPago: dados.pago ? (dados.valorOriginal || dados.valor) : 0,
      valorRestante: dados.pago ? 0 : (dados.valorOriginal || dados.valor),

      // Campos adicionais
      prioridadePagamento: dados.prioridadePagamento || "normal",
      codigoExterno: dados.codigoServico,
      sistemaOrigem: dados.sistemaOrigem || "manual",
      numeroDocumento: dados.numeroDocumento,

      // Campos de observações estendidas
      observacoesInternas:
        dados.categoria && dados.descricao
          ? `Categoria: ${dados.categoria} | Descrição: ${dados.descricao}${dados.lancamentoCaixaId ? ` | Caixa ID: ${dados.lancamentoCaixaId}` : ""}`
          : dados.lancamentoCaixaId
            ? `Lançamento Caixa ID: ${dados.lancamentoCaixaId}`
            : undefined,
    };

    console.log(
      "🔍 [API CONTAS] Dados preparados para criação:",
      dadosParaCriacao,
    );

    const conta = await prisma.contaLancamento.create({
      data: dadosParaCriacao,
      include: {
        cliente: true,
        fornecedor: true,
        formaPagamento: true,
        categoria: true,
      },
    });

    console.log("✅ [API CONTAS] Conta criada com sucesso:", {
      id: conta.id,
      tipo: conta.tipo,
      valorOriginal: conta.valorOriginal,
      valorLiquido: conta.valorLiquido,
      status: conta.status,
      sistemaOrigem: conta.sistemaOrigem,
      cliente: conta.cliente?.nome,
      fornecedor: conta.fornecedor?.nome,
      codigoExterno: conta.codigoExterno,
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
    const { formaPg, dataPagamento } = req.body;

    if (!formaPg) {
      const response: ApiResponse<null> = {
        error: "Forma de pagamento é obrigatória para marcar como pago",
      };
      return res.status(400).json(response);
    }

    console.log("🔍 [API CONTAS] Marcando conta como paga:", {
      id,
      formaPg,
      dataPagamento,
    });

    // Buscar a conta antes de atualizar para verificar se é boleto
    const contaAntiga = await prisma.contaLancamento.findUnique({
      where: { id },
      include: {
        cliente: true,
        fornecedor: true,
      },
    });

    if (!contaAntiga) {
      const response: ApiResponse<null> = {
        error: "Conta não encontrada",
      };
      return res.status(404).json(response);
    }

    // Atualizar conta como paga
    const dataPagamentoFinal = dataPagamento
      ? new Date(dataPagamento)
      : new Date();

    const conta = await prisma.contaLancamento.update({
      where: { id },
      data: {
        pago: true,
        dataPagamento: dataPagamentoFinal,
        formaPg: parseInt(formaPg),
        status: "pago",
        valorPago: contaAntiga.valor,
        valorRestante: 0,
      },
      include: {
        cliente: true,
        fornecedor: true,
        formaPagamento: true,
        categoria: true,
      },
    });

    console.log("✅ [API CONTAS] Conta marcada como paga:", {
      id: conta.id,
      tipo: conta.tipo,
      valor: conta.valor,
      cliente: conta.cliente?.nome,
    });

    // Se for conta a receber e veio do sistema de caixa (boleto), criar lançamento automático no caixa
    if (
      conta.tipo === "receber" &&
      (conta.sistemaOrigem === "caixa_boleto" || conta.codigoExterno)
    ) {
      try {
        console.log(
          "🔄 [API CONTAS] Criando lançamento automático no caixa para boleto pago...",
        );

        const dadosLancamentoCaixa = {
          valor: conta.valor,
          valorRecebido: conta.valorPago || conta.valor,
          valorLiquido: conta.valorLiquido || conta.valor,
          tipo: "receita",
          data: dataPagamentoFinal.toISOString().split("T")[0],
          categoria: "Recebimento de Boletos",
          descricao: `Boleto pago - ${conta.cliente?.nome || "Cliente"}`,
          formaPagamentoId: conta.formaPg,
          clienteId: conta.codigoCliente,
          observacoes: `Recebimento automático de boleto. Conta #${conta.id}${conta.observacoes ? ` | Obs original: ${conta.observacoes}` : ""}`,
          codigoServico: conta.codigoExterno,
          sistemaOrigem: "contas_boleto_pago",
        };

        console.log(
          "🔍 [API CONTAS] Dados para lançamento no caixa:",
          dadosLancamentoCaixa,
        );

        // Fazer requisição para API do caixa usando URL relativa
        const responseCaixa = await fetch("/api/caixa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosLancamentoCaixa),
        });

        if (responseCaixa.ok) {
          const lancamentoCriado = await responseCaixa.json();
          console.log(
            "✅ [API CONTAS] Lançamento criado automaticamente no caixa:",
            lancamentoCriado.id,
          );

          // Atualizar conta com referência ao lançamento do caixa
          await prisma.contaLancamento.update({
            where: { id },
            data: {
              observacoesInternas:
                `${conta.observacoesInternas || ""} | Lançamento Caixa ID: ${lancamentoCriado.id}`.trim(),
            },
          });
        } else {
          const errorCaixa = await responseCaixa.text();
          console.error(
            "❌ [API CONTAS] Erro ao criar lançamento no caixa:",
            errorCaixa,
          );
        }
      } catch (errorCaixa) {
        console.error(
          "❌ [API CONTAS] Erro na integração com caixa:",
          errorCaixa,
        );
        // Não falhar a operação principal se houver erro na integra��ão
      }
    }

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

// POST /api/contas/fornecedores - Criar novo fornecedor
router.post("/fornecedores", async (req, res) => {
  try {
    console.log(
      "🔍 [API CONTAS] Dados recebidos para criar fornecedor:",
      req.body,
    );

    const { nome, telefone, email, endereco } = req.body;

    // Validação básica
    if (!nome || typeof nome !== "string" || !nome.trim()) {
      const response: ApiResponse<null> = {
        error: "Nome do fornecedor é obrigatório",
      };
      return res.status(400).json(response);
    }

    const fornecedor = await prisma.fornecedor.create({
      data: {
        nome: nome.trim(),
        telefone: telefone || null,
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        dataCriacao: true,
      },
    });

    console.log("✅ [API CONTAS] Fornecedor criado com sucesso:", {
      id: fornecedor.id,
      nome: fornecedor.nome,
    });

    const response: ApiResponse<typeof fornecedor> = {
      data: fornecedor,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao criar fornecedor:", error);
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

// GET /api/contas/teste-integracao - Endpoint para testar integração caixa-contas
router.get("/teste-integracao", async (req, res) => {
  try {
    console.log("🧪 [API CONTAS] Testando integração...");

    // Buscar contas de boleto
    const contasBoleto = await prisma.contaLancamento.findMany({
      where: {
        OR: [
          { sistemaOrigem: "caixa_boleto" },
          { observacoes: { contains: "BOLETO AUTOMÁTICO" } },
        ],
      },
      include: {
        cliente: true,
      },
      orderBy: { dataCriacao: "desc" },
      take: 10,
    });

    // Buscar lançamentos de boleto no caixa
    const lancamentosBoleto = await prisma.lancamentoCaixa.findMany({
      where: {
        OR: [
          { categoria: "Recebimento de Boletos" },
          { observacoes: { contains: "BOLETO - Aguardando pagamento" } },
        ],
      },
      include: {
        formaPagamento: true,
        cliente: true,
      },
      orderBy: { dataHora: "desc" },
      take: 10,
    });

    const resultado = {
      contasBoleto: contasBoleto.map((c) => ({
        id: c.id,
        valor: c.valor,
        cliente: c.cliente?.nome,
        vencimento: c.dataVencimento,
        pago: c.pago,
        sistemaOrigem: c.sistemaOrigem,
        status: c.status,
      })),
      lancamentosBoleto: lancamentosBoleto.map((l) => ({
        id: l.id,
        valor: l.valor,
        categoria: l.categoria,
        cliente: l.cliente?.nome,
        formaPagamento: l.formaPagamento?.nome,
        observacoes: l.observacoes?.substring(0, 100),
      })),
      estatisticas: {
        totalContasBoleto: contasBoleto.length,
        totalLancamentosBoleto: lancamentosBoleto.length,
        contasBoletoPagas: contasBoleto.filter((c) => c.pago).length,
        contasBoletoAguardando: contasBoleto.filter((c) => !c.pago).length,
      },
    };

    console.log("🧪 [API CONTAS] Resultado do teste:", resultado.estatisticas);

    const response: ApiResponse<typeof resultado> = {
      data: resultado,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro no teste de integração:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

export default router;
