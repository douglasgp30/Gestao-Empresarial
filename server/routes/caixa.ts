import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const LancamentoCaixaSchema = z.object({
  data: z.string(),
  tipo: z.enum(["receita", "despesa"]),
  valor: z.number().positive("Valor deve ser positivo"),
  valorLiquido: z.number().optional(),
  comissao: z.number().optional(),
  imposto: z.number().optional(),
  valorQueEntrou: z.number().optional(),
  observacoes: z.string().optional(),
  numeroNota: z.string().optional(),
  arquivoNota: z.string().optional(),
  descricaoId: z.number().positive("Descrição é obrigatória"),
  formaPagamentoId: z.number().positive("Forma de pagamento é obrigatória"),
  funcionarioId: z.number().positive().optional(),
  setorId: z.number().positive().optional(),
  campanhaId: z.number().positive().optional()
});

export const getLancamentos: RequestHandler = async (req, res) => {
  try {
    const { 
      dataInicio, 
      dataFim, 
      tipo, 
      funcionarioId, 
      setorId, 
      campanhaId, 
      formaPagamentoId 
    } = req.query;
    
    const where: any = {};
    
    // Filtros de data baseados em dataHora string
    if (dataInicio || dataFim) {
      where.dataHora = {};
      if (dataInicio) {
        const [dia, mes, ano] = (dataInicio as string).split('-');
        where.dataHora.gte = `${dia}-${mes}-${ano} 00:00:00`;
      }
      if (dataFim) {
        const [dia, mes, ano] = (dataFim as string).split('-');
        where.dataHora.lte = `${dia}-${mes}-${ano} 23:59:59`;
      }
    }
    
    // Outros filtros
    if (tipo) where.tipo = tipo;
    if (funcionarioId) where.funcionarioId = parseInt(funcionarioId as string);
    if (setorId) where.setorId = parseInt(setorId as string);
    if (campanhaId) where.campanhaId = parseInt(campanhaId as string);
    if (formaPagamentoId) where.formaPagamentoId = parseInt(formaPagamentoId as string);
    
    const lancamentos = await prisma.lancamentoCaixa.findMany({
      where,
      include: {
        descricao: true,
        formaPagamento: true,
        funcionario: { select: { id: true, nome: true, cargo: true } },
        setor: true,
        campanha: true
      },
      orderBy: { dataHora: 'desc' }
    });
    
    res.json(lancamentos);
  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createLancamento: RequestHandler = async (req, res) => {
  try {
    const data = LancamentoCaixaSchema.parse(req.body);
    
    const lancamento = await prisma.lancamentoCaixa.create({
      data: {
        ...data,
        data: new Date(data.data)
      },
      include: {
        descricao: true,
        formaPagamento: true,
        funcionario: { select: { id: true, nome: true, cargo: true } },
        setor: true,
        campanha: true
      }
    });
    
    res.status(201).json(lancamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao criar lançamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export const updateLancamento: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = LancamentoCaixaSchema.partial().parse(req.body);
    
    const updateData: any = { ...data };
    if (data.data) updateData.data = new Date(data.data);
    
    const lancamento = await prisma.lancamentoCaixa.update({
      where: { id },
      data: updateData,
      include: {
        descricao: true,
        formaPagamento: true,
        funcionario: { select: { id: true, nome: true, cargo: true } },
        setor: true,
        campanha: true
      }
    });
    
    res.json(lancamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao atualizar lançamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export const deleteLancamento: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.lancamentoCaixa.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getTotaisCaixa: RequestHandler = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    const where: any = {};
    if (dataInicio || dataFim) {
      where.dataHora = {};
      if (dataInicio) {
        const [dia, mes, ano] = (dataInicio as string).split('-');
        where.dataHora.gte = `${dia}-${mes}-${ano} 00:00:00`;
      }
      if (dataFim) {
        const [dia, mes, ano] = (dataFim as string).split('-');
        where.dataHora.lte = `${dia}-${mes}-${ano} 23:59:59`;
      }
    }
    
    const receitas = await prisma.lancamentoCaixa.aggregate({
      where: { ...where, tipo: 'receita' },
      _sum: { valor: true, valorRecebido: true }
    });
    
    const despesas = await prisma.lancamentoCaixa.aggregate({
      where: { ...where, tipo: 'despesa' },
      _sum: { valor: true }
    });
    
    const totais = {
      receitas: receitas._sum.valor || 0,
      receitasLiquidas: receitas._sum.valorLiquido || 0,
      comissoes: receitas._sum.comissao || 0,
      despesas: despesas._sum.valor || 0,
      saldo: (receitas._sum.valorLiquido || 0) - (despesas._sum.valor || 0)
    };
    
    res.json(totais);
  } catch (error) {
    console.error('Erro ao calcular totais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
