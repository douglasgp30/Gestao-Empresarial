import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

// Schema com validação customizada para valorRecebido
const LancamentoCaixaSchema = z.object({
  valor: z.number().positive("Valor deve ser positivo"),
  valorRecebido: z.number().optional(),
  valorLiquido: z.number().optional(),
  comissao: z.number().optional(),
  imposto: z.number().optional(),
  observacoes: z.string().optional(),
  numeroNota: z.string().optional(),
  arquivoNota: z.string().optional(),
  conta: z.enum(["empresa", "pessoal"]).default("empresa"),
  tipo: z.enum(["receita", "despesa"], {
    required_error: "Tipo é obrigatório",
  }),

  // Campos obrigatórios
  descricaoId: z.number().positive("Descrição é obrigatória"),
  formaPagamentoId: z.number().positive("Forma de pagamento é obrigatória"),

  // Campos opcionais
  subdescricaoId: z.number().positive().optional(),
  funcionarioId: z.number().positive().optional(),
  setorId: z.number().positive().optional(),
  campanhaId: z.number().positive().optional(),
});

// Função para gerar dataHora no formato DD-MM-AAAA HH:MM:SS
function gerarDataHora(): Date {
  return new Date();
}

export const getLancamentos: RequestHandler = async (req, res) => {
  try {
    const {
      dataInicio,
      dataFim,
      tipo,
      funcionarioId,
      setorId,
      campanhaId,
      formaPagamentoId,
      descricaoId,
      subdescricaoId,
      conta,
    } = req.query;

    const where: any = {};

    // Filtros
    if (tipo) where.tipo = tipo;
    if (conta) where.conta = conta;
    if (funcionarioId) where.funcionarioId = parseInt(funcionarioId as string);
    if (setorId) where.setorId = parseInt(setorId as string);
    if (campanhaId) where.campanhaId = parseInt(campanhaId as string);
    if (formaPagamentoId)
      where.formaPagamentoId = parseInt(formaPagamentoId as string);
    if (descricaoId) where.descricaoId = parseInt(descricaoId as string);
    if (subdescricaoId)
      where.subdescricaoId = parseInt(subdescricaoId as string);

    // Filtros de data baseados em dataHora DateTime
    if (dataInicio || dataFim) {
      where.dataHora = {};
      if (dataInicio) {
        const [dia, mes, ano] = (dataInicio as string).split("-");
        where.dataHora.gte = new Date(
          parseInt(ano),
          parseInt(mes) - 1,
          parseInt(dia),
          0,
          0,
          0,
        );
      }
      if (dataFim) {
        const [dia, mes, ano] = (dataFim as string).split("-");
        where.dataHora.lte = new Date(
          parseInt(ano),
          parseInt(mes) - 1,
          parseInt(dia),
          23,
          59,
          59,
        );
      }
    }

    const lancamentos = await prisma.lancamentoCaixa.findMany({
      where,
      include: {
        descricao: true,
        subdescricao: true,
        formaPagamento: true,
        funcionario: { select: { id: true, nome: true, cargo: true } },
        setor: true,
        campanha: true,
      },
      orderBy: { id: "desc" },
    });

    res.json(lancamentos);
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createLancamento: RequestHandler = async (req, res) => {
  try {
    const data = LancamentoCaixaSchema.parse(req.body);

    // Validação customizada para valorRecebido quando forma de pagamento for cartão
    if (data.formaPagamentoId) {
      const formaPagamento = await prisma.formaPagamento.findUnique({
        where: { id: data.formaPagamentoId },
      });

      if (
        formaPagamento?.nome.toLowerCase().includes("cartão") ||
        formaPagamento?.nome.toLowerCase().includes("cartao")
      ) {
        if (!data.valorRecebido || data.valorRecebido <= 0) {
          return res.status(400).json({
            error:
              "Valor recebido é obrigatório quando a forma de pagamento for cartão",
          });
        }
      }
    }

    const lancamento = await prisma.lancamentoCaixa.create({
      data: {
        ...data,
        dataHora: gerarDataHora(),
      },
      include: {
        descricao: true,
        subdescricao: true,
        formaPagamento: true,
        funcionario: { select: { id: true, nome: true, cargo: true } },
        setor: true,
        campanha: true,
      },
    });

    res.status(201).json(lancamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao criar lançamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const updateLancamento: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = LancamentoCaixaSchema.partial().parse(req.body);

    const lancamento = await prisma.lancamentoCaixa.update({
      where: { id },
      data,
      include: {
        descricao: true,
        subdescricao: true,
        formaPagamento: true,
        funcionario: { select: { id: true, nome: true, cargo: true } },
        setor: true,
        campanha: true,
      },
    });

    res.json(lancamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao atualizar lançamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const deleteLancamento: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.lancamentoCaixa.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir lançamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getTotaisCaixa: RequestHandler = async (req, res) => {
  try {
    const { dataInicio, dataFim, conta } = req.query;

    const where: any = {};
    if (conta) where.conta = conta;

    // Filtros de data baseados em dataHora DateTime
    if (dataInicio || dataFim) {
      where.dataHora = {};
      if (dataInicio) {
        const [dia, mes, ano] = (dataInicio as string).split("-");
        where.dataHora.gte = new Date(
          parseInt(ano),
          parseInt(mes) - 1,
          parseInt(dia),
          0,
          0,
          0,
        );
      }
      if (dataFim) {
        const [dia, mes, ano] = (dataFim as string).split("-");
        where.dataHora.lte = new Date(
          parseInt(ano),
          parseInt(mes) - 1,
          parseInt(dia),
          23,
          59,
          59,
        );
      }
    }

    const receitas = await prisma.lancamentoCaixa.aggregate({
      where: { ...where, tipo: "receita" },
      _sum: { valor: true, valorRecebido: true },
    });

    const despesas = await prisma.lancamentoCaixa.aggregate({
      where: { ...where, tipo: "despesa" },
      _sum: { valor: true },
    });

    const totais = {
      receitas: receitas._sum.valor || 0,
      receitasRecebidas: receitas._sum.valorRecebido || 0,
      despesas: despesas._sum.valor || 0,
      saldo:
        (receitas._sum.valorRecebido || receitas._sum.valor || 0) -
        (despesas._sum.valor || 0),
    };

    res.json(totais);
  } catch (error) {
    console.error("Erro ao calcular totais:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
