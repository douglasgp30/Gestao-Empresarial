import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

// Schema com validação customizada incluindo sistema unificado
const LancamentoCaixaSchema = z.object({
  valor: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().positive("Valor deve ser positivo")),
  valorRecebido: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number())
    .optional(),
  valorLiquido: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number())
    .optional(),
  comissao: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number())
    .optional(),
  imposto: z.union([z.number(), z.string()]).pipe(z.coerce.number()).optional(),
  observacoes: z.string().optional(),
  numeroNota: z.string().optional(),
  arquivoNota: z.string().optional(),
  tipo: z.enum(["receita", "despesa"], {
    required_error: "Tipo é obrigatório",
  }),
  data: z.string().optional(), // Data no formato YYYY-MM-DD

  // Sistema unificado
  categoria: z.string().optional(),
  descricao: z.string().optional(),

  // Campos obrigatórios
  formaPagamentoId: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().positive())
    .optional(),
  formaPagamento: z.string().optional(), // Para compatibilidade

  // Campos opcionais
  subdescricaoId: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().positive())
    .optional(),
  funcionarioId: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().positive())
    .optional(),
  tecnicoResponsavel: z.string().optional(), // Para compatibilidade
  setorId: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().positive())
    .optional(),
  setor: z.string().optional(), // Para compatibilidade
  campanhaId: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().positive())
    .optional(),
  campanha: z.string().optional(), // Para compatibilidade
  clienteId: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().positive())
    .optional(),
});

// Função para gerar dataHora no formato DD-MM-AAAA HH:MM:SS
function gerarDataHora(): Date {
  return new Date();
}

// Função para resolver ID de descrição/categoria usando sistema unificado
async function resolverDescricaoECategoria(
  categoria: string,
  descricao: string,
  tipo: "receita" | "despesa",
) {
  try {
    // Buscar ou criar a descrição no sistema unificado
    let descricaoItem = await prisma.descricaoECategoria.findFirst({
      where: {
        nome: descricao,
        categoria: categoria,
        tipo: tipo,
        tipoItem: "descricao",
        ativo: true,
      },
    });

    if (!descricaoItem) {
      // Criar nova descrição
      descricaoItem = await prisma.descricaoECategoria.create({
        data: {
          nome: descricao,
          categoria: categoria,
          tipo: tipo,
          tipoItem: "descricao",
          ativo: true,
        },
      });
    }

    return descricaoItem.id;
  } catch (error) {
    console.error("Erro ao resolver descrição e categoria:", error);
    return null;
  }
}

// Função para resolver IDs de entidades
async function resolverIds(data: any) {
  const ids: any = {};

  // Resolver forma de pagamento
  if (data.formaPagamento && !data.formaPagamentoId) {
    const formaPagamento = await prisma.formaPagamento.findFirst({
      where: { nome: { contains: data.formaPagamento } },
    });
    if (formaPagamento) {
      ids.formaPagamentoId = formaPagamento.id;
    }
  } else if (data.formaPagamentoId) {
    ids.formaPagamentoId = data.formaPagamentoId;
  }

  // Resolver técnico responsável
  if (data.tecnicoResponsavel && !data.funcionarioId) {
    const funcionario = await prisma.funcionario.findFirst({
      where: { id: parseInt(data.tecnicoResponsavel) },
    });
    if (funcionario) {
      ids.funcionarioId = funcionario.id;
    }
  } else if (data.funcionarioId) {
    ids.funcionarioId = data.funcionarioId;
  }

  // Resolver setor (agora usando LocalizacaoGeografica)
  if (data.setor && !data.setorId) {
    const setor = await prisma.localizacaoGeografica.findFirst({
      where: {
        id: parseInt(data.setor),
        tipoItem: "setor",
        ativo: true
      },
    });
    if (setor) {
      ids.setorId = setor.id;
    }
  } else if (data.setorId) {
    ids.setorId = data.setorId;
  }

  // Resolver campanha
  if (data.campanha && !data.campanhaId) {
    const campanha = await prisma.campanha.findFirst({
      where: { nome: { contains: data.campanha } },
    });
    if (campanha) {
      ids.campanhaId = campanha.id;
    }
  } else if (data.campanhaId) {
    ids.campanhaId = data.campanhaId;
  }

  return ids;
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
      categoria,
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

    // Filtro por categoria usando sistema unificado
    if (categoria && categoria !== "todas") {
      where.descricaoECategoria = {
        categoria: categoria,
      };
    }

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
        descricaoECategoria: true, // Incluir sistema unificado
        subdescricao: true,
        formaPagamento: true,
        funcionario: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            percentualComissao: true,
            percentualServico: true,
          },
        },

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

    // Resolver IDs de entidades
    const ids = await resolverIds(data);
    console.log("[Caixa] IDs resolvidos:", ids);

    // Resolver descrição e categoria usando sistema unificado
    let descricaoECategoriaId = null;
    if (data.categoria && data.descricao) {
      descricaoECategoriaId = await resolverDescricaoECategoria(
        data.categoria,
        data.descricao,
        data.tipo,
      );
      console.log("[Caixa] DescricaoECategoria ID:", descricaoECategoriaId);
    }

    // Verificar forma de pagamento e aplicar validações específicas
    let isBoleto = false;
    if (ids.formaPagamentoId) {
      const formaPagamento = await prisma.formaPagamento.findUnique({
        where: { id: ids.formaPagamentoId },
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

    // Calcular comissão automaticamente se há técnico responsável
    let comissaoCalculada = data.comissao || 0;
    if (ids.funcionarioId && data.valorLiquido && data.tipo === "receita") {
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: ids.funcionarioId },
        select: {
          percentualComissao: true,
          percentualServico: true,
          nome: true,
        },
      });

      if (funcionario) {
        const percentual =
          funcionario.percentualComissao || funcionario.percentualServico || 0;
        if (percentual > 0) {
          comissaoCalculada = data.valorLiquido * (percentual / 100);
          console.log(
            `[Caixa] Comissão calculada automaticamente: ${funcionario.nome} - ${percentual}% = R$ ${comissaoCalculada.toFixed(2)}`,
          );
        }
      }
    }

    // Verificar se os IDs de relacionamento existem
    console.log("[Caixa] Verificando se os IDs de relacionamento existem...");

    if (ids.formaPagamentoId) {
      const formaPagamento = await prisma.formaPagamento.findUnique({
        where: { id: ids.formaPagamentoId },
      });
      console.log(
        `[Caixa] Forma Pagamento ID ${ids.formaPagamentoId}:`,
        formaPagamento ? "EXISTS" : "NOT FOUND",
      );
      if (!formaPagamento) {
        return res
          .status(400)
          .json({ error: "Forma de pagamento não encontrada" });
      }
    }

    if (ids.funcionarioId) {
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: ids.funcionarioId },
      });
      console.log(
        `[Caixa] Funcionário ID ${ids.funcionarioId}:`,
        funcionario ? "EXISTS" : "NOT FOUND",
      );
    }

    if (ids.setorId) {
      const setor = await prisma.setor.findUnique({
        where: { id: ids.setorId },
      });
      console.log(
        `[Caixa] Setor ID ${ids.setorId}:`,
        setor ? "EXISTS" : "NOT FOUND",
      );
    }

    if (ids.campanhaId) {
      const campanha = await prisma.campanha.findUnique({
        where: { id: ids.campanhaId },
      });
      console.log(
        `[Caixa] Campanha ID ${ids.campanhaId}:`,
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

    // Preparar dados para criação
    const dadosLancamento: any = {
      valor: data.valor,
      valorRecebido: data.valorRecebido,
      valorLiquido: data.valorLiquido,
      comissao: comissaoCalculada, // Usar comissão calculada
      imposto: data.imposto,
      observacoes: data.observacoes,
      numeroNota: data.numeroNota,
      arquivoNota: data.arquivoNota,
      tipo: data.tipo,
      dataHora: dataHoraLancamento,
      clienteId: clienteIdValido,
      ...ids, // Adicionar IDs resolvidos
    };

    // Adicionar sistema unificado se disponível
    if (descricaoECategoriaId) {
      dadosLancamento.descricaoECategoriaId = descricaoECategoriaId;
    }

    // Marcar como boleto se for o caso (boletos não entram no caixa imediatamente)
    if (isBoleto) {
      dadosLancamento.observacoes = dadosLancamento.observacoes
        ? `${dadosLancamento.observacoes} [BOLETO - Aguardando pagamento]`
        : "[BOLETO - Aguardando pagamento]";
    }

    const lancamento = await prisma.lancamentoCaixa.create({
      data: dadosLancamento,
      include: {
        descricao: true,
        descricaoECategoria: true, // Incluir sistema unificado
        subdescricao: true,
        formaPagamento: true,
        funcionario: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            percentualComissao: true,
            percentualServico: true,
          },
        },

        campanha: true,
        cliente: true,
      },
    });

    console.log("[Caixa] Lançamento criado com sucesso:", lancamento.id);
    res.status(201).json(lancamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Caixa] Erro de validação Zod:", error.errors);
      console.error(
        "[Caixa] Dados que causaram erro:",
        JSON.stringify(req.body, null, 2),
      );
      res.status(400).json({
        error:
          "Dados inválidos: " +
          error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
        details: error.errors,
      });
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

    // Resolver IDs de entidades
    const ids = await resolverIds(data);

    // Validação customizada para valorRecebido quando forma de pagamento for cartão
    if (ids.formaPagamentoId) {
      const formaPagamento = await prisma.formaPagamento.findUnique({
        where: { id: ids.formaPagamentoId },
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

    // Recalcular comissão se necessário
    let dadosAtualizacao: any = { ...data, ...ids };
    if (ids.funcionarioId && data.valorLiquido && data.tipo === "receita") {
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: ids.funcionarioId },
        select: {
          percentualComissao: true,
          percentualServico: true,
          nome: true,
        },
      });

      if (funcionario) {
        const percentual =
          funcionario.percentualComissao || funcionario.percentualServico || 0;
        if (percentual > 0) {
          dadosAtualizacao.comissao = data.valorLiquido * (percentual / 100);
          console.log(
            `[Caixa] Comissão recalculada: ${funcionario.nome} - ${percentual}% = R$ ${dadosAtualizacao.comissao.toFixed(2)}`,
          );
        }
      }
    }

    const lancamento = await prisma.lancamentoCaixa.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        descricao: true,
        descricaoECategoria: true,
        subdescricao: true,
        formaPagamento: true,
        funcionario: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            percentualComissao: true,
            percentualServico: true,
          },
        },

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
    const { dataInicio, dataFim } = req.query;

    const where: any = {};

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
        funcionario: { select: { nome: true } },
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

    // Calcular comissões (apenas receitas não-boleto)
    const totalComissoes = receitasNaoBoleto.reduce(
      (sum, r) => sum + (r.comissao || 0),
      0,
    );

    const despesas = await prisma.lancamentoCaixa.aggregate({
      where: { ...where, tipo: "despesa" },
      _sum: { valor: true },
    });

    const totais = {
      receitaBruta: totalReceitaBruta, // Todas as receitas incluindo boletos
      receitaLiquida: totalReceitaLiquida, // Só receitas não-boleto (que entram no caixa)
      boletos: totalBoletos, // Total em boletos pendentes
      comissoes: totalComissoes, // Total de comissões pagas
      despesas: despesas._sum.valor || 0,
      saldo: totalReceitaLiquida - (despesas._sum.valor || 0) - totalComissoes, // Saldo final
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
