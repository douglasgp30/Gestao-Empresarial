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
  data: z.string().optional(), // Data no formato YYYY-MM-DD

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
    console.log(
      "[Caixa] Dados recebidos para criar lançamento:",
      JSON.stringify(req.body, null, 2),
    );
    const data = LancamentoCaixaSchema.parse(req.body);
    console.log("[Caixa] Dados após validação:", JSON.stringify(data, null, 2));

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

    // Verificar se os IDs de relacionamento existem
    console.log("[Caixa] Verificando se os IDs de relacionamento existem...");

    if (data.descricaoId) {
      const descricao = await prisma.descricao.findUnique({
        where: { id: data.descricaoId },
      });
      console.log(
        `[Caixa] Descrição ID ${data.descricaoId}:`,
        descricao ? "EXISTS" : "NOT FOUND",
      );
    }

    if (data.formaPagamentoId) {
      const formaPagamento = await prisma.formaPagamento.findUnique({
        where: { id: data.formaPagamentoId },
      });
      console.log(
        `[Caixa] Forma Pagamento ID ${data.formaPagamentoId}:`,
        formaPagamento ? "EXISTS" : "NOT FOUND",
      );
    }

    if (data.funcionarioId) {
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: data.funcionarioId },
      });
      console.log(
        `[Caixa] Funcionário ID ${data.funcionarioId}:`,
        funcionario ? "EXISTS" : "NOT FOUND",
      );
    }

    if (data.setorId) {
      const setor = await prisma.setor.findUnique({
        where: { id: data.setorId },
      });
      console.log(
        `[Caixa] Setor ID ${data.setorId}:`,
        setor ? "EXISTS" : "NOT FOUND",
      );
    }

    if (data.campanhaId) {
      const campanha = await prisma.campanha.findUnique({
        where: { id: data.campanhaId },
      });
      console.log(
        `[Caixa] Campanha ID ${data.campanhaId}:`,
        campanha ? "EXISTS" : "NOT FOUND",
      );
    }

    console.log("[Caixa] Tentando criar lançamento no banco...");

    // Usar a data enviada pelo frontend ou a data atual como fallback
    let dataHoraLancamento: Date;
    if (req.body.data) {
      // Se uma data específica foi enviada, usar ela às 12:00 para evitar problemas de timezone
      const [ano, mes, dia] = req.body.data.split("-");
      dataHoraLancamento = new Date(
        parseInt(ano),
        parseInt(mes) - 1,
        parseInt(dia),
        12,
        0,
        0,
      );
      console.log(
        "[Caixa] Usando data do frontend:",
        req.body.data,
        "->",
        dataHoraLancamento,
      );
    } else {
      // Fallback para data/hora atual
      dataHoraLancamento = gerarDataHora();
      console.log("[Caixa] Usando data atual:", dataHoraLancamento);
    }

    // Remover o campo 'data' do objeto que vai para o Prisma (ele não existe no schema)
    const { data: dataFromRequest, ...dadosLancamento } = data;

    const lancamento = await prisma.lancamentoCaixa.create({
      data: {
        ...dadosLancamento,
        dataHora: dataHoraLancamento,
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
