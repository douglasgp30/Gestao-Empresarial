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
  clienteId: z.number().positive().optional(),
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
    } = req.query;

    const where: any = {};

    // Filtros
    if (tipo) where.tipo = tipo;
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
        const [ano, mes, dia] = (dataInicio as string).split("-");
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
        const [ano, mes, dia] = (dataFim as string).split("-");
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
        cliente: true,
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

    // Verificar forma de pagamento e aplicar validações específicas
    let isBoleto = false;
    if (data.formaPagamentoId) {
      const formaPagamento = await prisma.formaPagamento.findUnique({
        where: { id: data.formaPagamentoId },
      });

      // Verificar se é cartão
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

      // Verificar se é boleto
      if (
        formaPagamento?.nome.toLowerCase().includes("boleto") ||
        formaPagamento?.nome.toLowerCase().includes("bancário")
      ) {
        isBoleto = true;
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

    // Verificar se o cliente existe (se especificado)
    let clienteIdValido = data.clienteId;
    if (data.clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: data.clienteId },
      });
      console.log(
        `[Caixa] Cliente ID ${data.clienteId}:`,
        cliente ? "EXISTS" : "NOT FOUND",
      );

      // Se o cliente não existir, definir como null para não quebrar o foreign key
      if (!cliente) {
        console.log(
          `[Caixa] Cliente ID ${data.clienteId} não encontrado. Definindo como null.`,
        );
        clienteIdValido = undefined;
      }
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
    const { data: dataFromRequest, clienteId, ...dadosLancamento } = data;

    const lancamento = await prisma.lancamentoCaixa.create({
      data: {
        ...dadosLancamento,
        clienteId: clienteIdValido,
        dataHora: dataHoraLancamento,
        // Marcar como boleto se for o caso (boletos não entram no caixa imediatamente)
        observacoes: isBoleto
          ? dadosLancamento.observacoes
            ? `${dadosLancamento.observacoes} [BOLETO - Aguardando pagamento]`
            : "[BOLETO - Aguardando pagamento]"
          : dadosLancamento.observacoes,
      },
      include: {
        descricao: true,
        subdescricao: true,
        formaPagamento: true,
        funcionario: { select: { id: true, nome: true, cargo: true } },
        setor: true,
        campanha: true,
        cliente: true,
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
    console.log(
      `[Caixa] Atualizando lançamento ID: ${id}`,
      JSON.stringify(req.body, null, 2),
    );

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID do lançamento inválido" });
    }

    // Verificar se o lançamento existe
    const lancamentoExistente = await prisma.lancamentoCaixa.findUnique({
      where: { id },
    });

    if (!lancamentoExistente) {
      return res.status(404).json({ error: "Lançamento não encontrado" });
    }

    const data = LancamentoCaixaSchema.partial().parse(req.body);
    console.log(`[Caixa] Dados validados:`, JSON.stringify(data, null, 2));

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
              "Valor recebido é obrigatório quando a forma de pagamento for cart��o",
          });
        }
      }
    }

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
        cliente: true,
      },
    });

    console.log(`[Caixa] Lançamento atualizado com sucesso:`, lancamento.id);
    res.json(lancamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Caixa] Erro de validação:", error.errors);
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
    console.log(`[Caixa] Excluindo lançamento ID: ${id}`);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID do lançamento inválido" });
    }

    // Verificar se o lançamento existe antes de excluir
    const lancamentoExistente = await prisma.lancamentoCaixa.findUnique({
      where: { id },
    });

    if (!lancamentoExistente) {
      return res.status(404).json({ error: "Lançamento não encontrado" });
    }

    await prisma.lancamentoCaixa.delete({ where: { id } });
    console.log(`[Caixa] Lançamento ${id} excluído com sucesso`);

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
        const [ano, mes, dia] = (dataInicio as string).split("-");
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
        const [ano, mes, dia] = (dataFim as string).split("-");
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

    // Buscar todas as receitas com forma de pagamento
    const receitasCompletas = await prisma.lancamentoCaixa.findMany({
      where: { ...where, tipo: "receita" },
      include: {
        formaPagamento: true,
      },
    });

    // Separar boletos de outras formas de pagamento
    const receitasBoleto = receitasCompletas.filter(
      (r) =>
        r.formaPagamento?.nome.toLowerCase().includes("boleto") ||
        r.formaPagamento?.nome.toLowerCase().includes("bancário"),
    );

    const receitasNaoBoleto = receitasCompletas.filter(
      (r) =>
        !r.formaPagamento?.nome.toLowerCase().includes("boleto") &&
        !r.formaPagamento?.nome.toLowerCase().includes("bancário"),
    );

    // Calcular totais
    const totalReceitaBruta = receitasCompletas.reduce(
      (sum, r) => sum + r.valor,
      0,
    );
    const totalReceitaLiquida = receitasNaoBoleto.reduce(
      (sum, r) => sum + (r.valorRecebido || r.valor),
      0,
    );
    const totalBoletos = receitasBoleto.reduce((sum, r) => sum + r.valor, 0);

    const despesas = await prisma.lancamentoCaixa.aggregate({
      where: { ...where, tipo: "despesa" },
      _sum: { valor: true },
    });

    const totais = {
      receitaBruta: totalReceitaBruta, // Todas as receitas incluindo boletos
      receitaLiquida: totalReceitaLiquida, // Só receitas não-boleto (que entram no caixa)
      boletos: totalBoletos, // Total em boletos pendentes
      despesas: despesas._sum.valor || 0,
      saldo: totalReceitaLiquida - (despesas._sum.valor || 0), // Saldo do caixa (sem boletos)
      // Manter campos antigos para compatibilidade
      receitas: totalReceitaLiquida,
      receitasRecebidas: totalReceitaLiquida,
    };

    res.json(totais);
  } catch (error) {
    console.error("Erro ao calcular totais:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
