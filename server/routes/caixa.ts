import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";
import { AuditoriaService, extrairInfoRequisicao } from "../lib/auditoria";

// Testar conexão com banco na inicialização
console.log(
  "[Caixa Routes] Arquivo caixa.ts carregado, Prisma importado:",
  !!prisma,
);

// Função utilitária para normalizar strings (remove acentos e converte para minúscula)
function normalizeString(str: any = ""): string {
  if (!str) return "";
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Função para verificar se forma de pagamento é boleto (padronizada com frontend)
function isFormaPagamentoBoleto(formaPagamento: any): boolean {
  if (!formaPagamento) return false;

  const nome = formaPagamento.nome || formaPagamento;
  const nomeNormalizado = normalizeString(nome);
  return (
    nomeNormalizado.includes("boleto") ||
    (nomeNormalizado.includes("bancario") &&
      !nomeNormalizado.includes("transferencia"))
  );
}

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

  // Campos de integração
  codigoExterno: z.string().optional(),
  codigoServico: z.string().optional(),
  sistemaOrigem: z.string().optional(),

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
    ids.formaPagamentoId = parseInt(data.formaPagamentoId);
    console.log(
      `[Caixa] FormaPagamento ID: ${data.formaPagamentoId} -> ${ids.formaPagamentoId}`,
    );
  }

  // Resolver técnico responsável - melhorado para aceitar ID ou nome
  if (data.tecnicoResponsavel && !data.funcionarioId) {
    let funcionario = null;
    const possivelId = parseInt(String(data.tecnicoResponsavel));

    // Tentar primeiro por ID
    if (!Number.isNaN(possivelId)) {
      funcionario = await prisma.funcionario.findUnique({
        where: { id: possivelId },
      });
    }

    // Se não encontrou por ID, tentar por nome
    if (!funcionario) {
      funcionario = await prisma.funcionario.findFirst({
        where: {
          nome: { contains: String(data.tecnicoResponsavel) },
        },
      });
    }

    if (funcionario) {
      ids.funcionarioId = funcionario.id;
      console.log(
        `[Caixa] Funcionario resolvido: ${data.tecnicoResponsavel} -> ${funcionario.nome} (${funcionario.id})`,
      );
    } else {
      console.log(
        `[Caixa] Funcionario não encontrado: ${data.tecnicoResponsavel}`,
      );
    }
  } else if (data.funcionarioId) {
    ids.funcionarioId = parseInt(data.funcionarioId);
    console.log(
      `[Caixa] Funcionario ID: ${data.funcionarioId} -> ${ids.funcionarioId}`,
    );
  }

  // Resolver setor (agora usando LocalizacaoGeografica)
  if (data.setor && !data.localizacaoId) {
    const setor = await prisma.localizacaoGeografica.findFirst({
      where: {
        id: parseInt(data.setor),
        tipoItem: "setor",
        ativo: true,
      },
    });
    if (setor) {
      ids.localizacaoId = setor.id;
    }
  } else if (data.localizacaoId) {
    ids.localizacaoId = data.localizacaoId;
  } else if (data.setorId) {
    // Backward compatibility
    ids.localizacaoId = data.setorId;
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
    console.log("[Caixa API] GET /api/caixa - Iniciando busca de lançamentos");
    console.log("[Caixa API] Query params:", req.query);

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
    if (setorId) where.localizacaoId = parseInt(setorId as string);
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
        localizacao: true, // INCLUIR para resolver campos de setor vazios
        campanha: true,
        cliente: true,
      },
      orderBy: { id: "desc" },
    });

    console.log(`[Caixa API] Encontrados ${lancamentos.length} lançamentos`);
    console.log("[Caixa API] Enviando resposta JSON...");

    res.json(lancamentos);
  } catch (error) {
    console.error("[Caixa API] Erro ao buscar lançamentos:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
};

export const createLancamento: RequestHandler = async (req, res) => {
  try {
    console.log("[Caixa] Criando lançamento...");
    console.log("[Caixa] Body keys:", Object.keys(req.body || {}));

    const data = LancamentoCaixaSchema.parse(req.body);
    console.log("[Caixa] Validação bem-sucedida, dados processados");

    // Resolver IDs de entidades
    const ids = await resolverIds(data);
    console.log("[Caixa] IDs resolvidos, continuando...");

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

    // Verificar forma de pagamento e aplicar validações espec��ficas
    let isBoleto = false;
    if (ids.formaPagamentoId) {
      const formaPagamento = await prisma.formaPagamento.findUnique({
        where: { id: ids.formaPagamentoId },
      });

      // Verificar se é cart��o
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

      // Verificar se é boleto usando função padronizada
      if (isFormaPagamentoBoleto(formaPagamento)) {
        isBoleto = true;
      }
    }

    // Calcular comissão e valor para empresa automaticamente
    let comissaoCalculada = 0;
    let valorParaEmpresaCalculado = 0;

    if (data.tipo === "receita") {
      // Para receitas, calcular valor para empresa
      const valorRecebido = data.valorRecebido || data.valor;
      const valorLiquidoEfetivo = data.valorLiquido || valorRecebido;

      // Calcular comissão se há técnico responsável
      if (ids.funcionarioId && valorLiquidoEfetivo > 0) {
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
            funcionario.percentualComissao ||
            funcionario.percentualServico ||
            0;
          if (percentual > 0) {
            comissaoCalculada = valorLiquidoEfetivo * (percentual / 100);
            console.log(
              `[Caixa] Comissão calculada: ${funcionario.nome} - ${percentual}% sobre R$ ${valorLiquidoEfetivo.toFixed(2)} = R$ ${comissaoCalculada.toFixed(2)}`,
            );
          } else {
            console.log(
              `[Caixa] Técnico ${funcionario.nome} sem percentual de comissão definido`,
            );
          }
        } else {
          console.log(
            `[Caixa] Funcionário com ID ${ids.funcionarioId} não encontrado`,
          );
        }
      } else if (!ids.funcionarioId) {
        console.log(
          `[Caixa] Receita sem técnico responsável - comissão será R$ 0,00`,
        );
      }

      // Valor para empresa = valor líquido - comissão
      valorParaEmpresaCalculado = valorLiquidoEfetivo - comissaoCalculada;

      console.log(
        `[Caixa] Valor para empresa calculado: R$ ${valorParaEmpresaCalculado.toFixed(2)}`,
      );
    }

    // Validar forma de pagamento (obrigatório)
    console.log("[Caixa] Validando forma de pagamento...");
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
          `[Caixa] Cliente ID ${data.clienteId} n��o encontrado. Definindo como null.`,
        );
        clienteIdValido = null;
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

    // Preparar dados para criação usando apenas IDs validados
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

      // Campos de integração
      codigoExterno: data.codigoExterno || data.codigoServico,
      sistemaOrigem: data.sistemaOrigem,
    };

    // Observação removida - não é necessário duplicar informação que já tem coluna própria

    // Adicionar apenas IDs que foram validados e existem
    if (ids.formaPagamentoId) {
      dadosLancamento.formaPagamentoId = ids.formaPagamentoId;
    }

    // Revalidar funcionário antes de adicionar
    if (ids.funcionarioId) {
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: ids.funcionarioId },
      });
      if (funcionario) {
        dadosLancamento.funcionarioId = ids.funcionarioId;
        console.log(
          `[Caixa] Funcionário ID ${ids.funcionarioId} validado e adicionado`,
        );
      } else {
        console.log(
          `[Caixa] Funcionário ID ${ids.funcionarioId} não encontrado, removendo`,
        );
      }
    }

    // Revalidar localização antes de adicionar
    if (ids.localizacaoId) {
      const localizacao = await prisma.localizacaoGeografica.findUnique({
        where: { id: ids.localizacaoId },
      });
      if (localizacao) {
        dadosLancamento.localizacaoId = ids.localizacaoId;
        console.log(
          `[Caixa] Localizaç��o ID ${ids.localizacaoId} validada e adicionada`,
        );
      } else {
        console.log(
          `[Caixa] Localização ID ${ids.localizacaoId} não encontrada, removendo`,
        );
      }
    }

    // Revalidar campanha antes de adicionar
    if (ids.campanhaId) {
      const campanha = await prisma.campanha.findUnique({
        where: { id: ids.campanhaId },
      });
      if (campanha) {
        dadosLancamento.campanhaId = ids.campanhaId;
        console.log(
          `[Caixa] Campanha ID ${ids.campanhaId} validada e adicionada`,
        );
      } else {
        console.log(
          `[Caixa] Campanha ID ${ids.campanhaId} não encontrada, removendo`,
        );
      }
    }

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

    // Resolver legacy descricaoId se não fornecido mas há uma descrição
    if (!dadosLancamento.descricaoId && data.descricao) {
      console.log("[Caixa] Resolvendo descricao legacy para:", data.descricao);

      // Sanitizar descri��ão - evitar nomes apenas numéricos
      let nomeDescricao = data.descricao;
      if (/^\d+$/.test(nomeDescricao)) {
        console.log("[Caixa] Descrição numérica detectada, usando nome padrão");
        nomeDescricao = "Serviço (importado)";
      }

      let descricaoRegistro = await prisma.descricao.findFirst({
        where: {
          nome: { contains: nomeDescricao },
          tipo: data.tipo || "receita",
        },
      });
      if (!descricaoRegistro) {
        descricaoRegistro = await prisma.descricao.create({
          data: {
            nome: nomeDescricao,
            tipo: data.tipo || "receita",
          },
        });
        console.log("[Caixa] Criada nova Descricao id:", descricaoRegistro.id);
      } else {
        console.log(
          "[Caixa] Usando Descricao existente id:",
          descricaoRegistro.id,
        );
      }
      dadosLancamento.descricaoId = descricaoRegistro.id;
    }

    // Se ainda não há descricaoId, criar uma descrição padrão
    if (!dadosLancamento.descricaoId) {
      console.log("[Caixa] Criando descrição padrão para lançamento");
      const descricaoDefault = await prisma.descricao.create({
        data: {
          nome: "Lançamento genérico",
          tipo: data.tipo || "receita",
        },
      });
      dadosLancamento.descricaoId = descricaoDefault.id;
      console.log("[Caixa] Criada descrição padrão id:", descricaoDefault.id);
    }

    // Verificar se há formaPagamentoId (obrigatório)
    if (!dadosLancamento.formaPagamentoId) {
      console.log(
        "[Caixa] FormaPagamentoId não fornecido, criando forma padrão",
      );
      const formaPagamentoDefault = await prisma.formaPagamento.create({
        data: { nome: "Dinheiro" },
      });
      dadosLancamento.formaPagamentoId = formaPagamentoDefault.id;
      console.log(
        "[Caixa] Criada forma de pagamento padrão id:",
        formaPagamentoDefault.id,
      );
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
        localizacao: true, // INCLUIR para resolver campos de setor vazios
        campanha: true,
        cliente: true,
      },
    });

    console.log("[Caixa] Lançamento criado com sucesso:", lancamento.id);

    // Registrar auditoria
    if (req.user) {
      const infoRequisicao = extrairInfoRequisicao(req);
      await AuditoriaService.registrarLog({
        acao: "CREATE",
        entidade: "lancamentos_caixa",
        entidadeId: lancamento.id,
        dadosNovos: dadosLancamento,
        descricao: `Criou lançamento de ${data.tipo} no valor de R$ ${data.valor}`,
        usuarioId: req.user.id,
        usuarioNome: req.user.nome || req.user.nomeCompleto,
        usuarioLogin: req.user.login,
        ...infoRequisicao,
      });
    }

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
        localizacao: true, // INCLUIR para resolver campos de setor vazios
        campanha: true,
        cliente: true,
      },
    });

    console.log(`[Caixa] Lançamento atualizado com sucesso:`, lancamento.id);

    // Registrar auditoria
    if (req.user) {
      const infoRequisicao = extrairInfoRequisicao(req);
      await AuditoriaService.registrarLog({
        acao: "UPDATE",
        entidade: "lancamentos_caixa",
        entidadeId: id,
        dadosAntigos: lancamentoExistente,
        dadosNovos: dadosAtualizacao,
        descricao: `Editou lançamento de ${lancamentoExistente.tipo} no valor de R$ ${lancamentoExistente.valor}`,
        usuarioId: req.user.id,
        usuarioNome: req.user.nome || req.user.nomeCompleto,
        usuarioLogin: req.user.login,
        ...infoRequisicao,
      });
    }

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
    console.log(`🗑️ [Caixa DELETE] Iniciando exclusão do lançamento ID: ${id}`);
    console.log(`🗑️ [Caixa DELETE] Request method: ${req.method}`);
    console.log(`🗑�� [Caixa DELETE] Request URL: ${req.url}`);

    if (isNaN(id)) {
      console.log(`❌ [Caixa DELETE] ID inválido: ${req.params.id}`);
      return res.status(400).json({ error: "ID do lançamento inválido" });
    }

    // Verificar se o lançamento existe antes de excluir
    console.log(`🔍 [Caixa DELETE] Verificando se lançamento ${id} existe...`);
    const lancamentoExistente = await prisma.lancamentoCaixa.findUnique({
      where: { id },
    });

    if (!lancamentoExistente) {
      console.log(`❌ [Caixa DELETE] Lançamento ${id} não encontrado`);
      return res.status(404).json({ error: "Lançamento não encontrado" });
    }

    console.log(`📄 [Caixa DELETE] Lançamento encontrado:`, {
      id: lancamentoExistente.id,
      tipo: lancamentoExistente.tipo,
      valor: lancamentoExistente.valor,
    });

    console.log(`🗑️ [Caixa DELETE] Executando delete no banco...`);
    await prisma.lancamentoCaixa.delete({ where: { id } });
    console.log(
      `✅ [Caixa DELETE] Lançamento ${id} excluído com sucesso do banco`,
    );

    // Registrar auditoria (se não der erro)
    try {
      if (req.user) {
        console.log(`📝 [Caixa DELETE] Registrando auditoria...`);
        const infoRequisicao = extrairInfoRequisicao(req);
        await AuditoriaService.registrarLog({
          acao: "DELETE",
          entidade: "lancamentos_caixa",
          entidadeId: id,
          dadosAntigos: lancamentoExistente,
          descricao: `Excluiu lançamento de ${lancamentoExistente.tipo} no valor de R$ ${lancamentoExistente.valor}`,
          usuarioId: req.user.id,
          usuarioNome: req.user.nome || req.user.nomeCompleto,
          usuarioLogin: req.user.login,
          ...infoRequisicao,
        });
        console.log(`📝 [Caixa DELETE] Auditoria registrada com sucesso`);
      }
    } catch (auditoriaError) {
      console.warn(
        `⚠️ [Caixa DELETE] Erro na auditoria (não crítico):`,
        auditoriaError,
      );
    }

    console.log(`🎉 [Caixa DELETE] Respondendo com status 204 (No Content)`);
    res.status(204).send();
  } catch (error) {
    console.error("❌ [Caixa DELETE] Erro ao excluir lançamento:", error);
    console.error("❌ [Caixa DELETE] Stack trace:", error.stack);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
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

    console.log(
      `[Totais Caixa] Analisando ${receitasCompletas.length} receitas para cálculo de saldo`,
    );

    // Separar receitas por tipo
    const receitasBoletoNaoPagos = receitasCompletas.filter((r) => {
      const isBoleto = isFormaPagamentoBoleto(r.formaPagamento);
      const temObservacaoBoleto = r.observacoes?.includes(
        "[BOLETO - Aguardando pagamento]",
      );
      const sistemaOrigemBoleto = r.observacoes?.includes("caixa_boleto");

      return isBoleto || temObservacaoBoleto || sistemaOrigemBoleto;
    });

    const receitasRecebimentoBoleto = receitasCompletas.filter((r) => {
      return (
        r.categoria === "Recebimento de Boletos" ||
        r.observacoes?.includes("Recebimento automático de boleto") ||
        r.observacoes?.includes("contas_boleto_pago")
      );
    });

    const receitasNormais = receitasCompletas.filter((r) => {
      const isBoleto = isFormaPagamentoBoleto(r.formaPagamento);
      const temObservacaoBoleto = r.observacoes?.includes(
        "[BOLETO - Aguardando pagamento]",
      );
      const sistemaOrigemBoleto = r.observacoes?.includes("caixa_boleto");
      const isRecebimentoBoleto =
        r.categoria === "Recebimento de Boletos" ||
        r.observacoes?.includes("Recebimento automático de boleto");

      return (
        !isBoleto &&
        !temObservacaoBoleto &&
        !sistemaOrigemBoleto &&
        !isRecebimentoBoleto
      );
    });

    console.log(
      `[Totais Caixa] Breakdown - Normais: ${receitasNormais.length}, Boletos não pagos: ${receitasBoletoNaoPagos.length}, Recebimentos de boleto: ${receitasRecebimentoBoleto.length}`,
    );

    // Calcular totais
    const totalReceitaBruta = receitasCompletas.reduce(
      (sum, r) => sum + r.valor,
      0,
    );

    // Receitas que efetivamente entraram no caixa (normais + recebimentos de boleto)
    const receitasQueEntraramNoCaixa = [
      ...receitasNormais,
      ...receitasRecebimentoBoleto,
    ];
    const totalReceitaLiquida = receitasQueEntraramNoCaixa.reduce(
      (sum, r) => sum + (r.valorRecebido || r.valor),
      0,
    );

    // Boletos ainda não pagos (receita bruta informativa)
    const totalBoletosNaoPagos = receitasBoletoNaoPagos.reduce(
      (sum, r) => sum + r.valor,
      0,
    );

    // Calcular comissões (apenas receitas que entraram no caixa)
    const totalComissoes = receitasQueEntraramNoCaixa.reduce(
      (sum, r) => sum + (r.comissao || 0),
      0,
    );

    // Buscar despesas
    const despesas = await prisma.lancamentoCaixa.aggregate({
      where: { ...where, tipo: "despesa" },
      _sum: { valor: true },
    });

    const totalDespesas = despesas._sum.valor || 0;

    // Calcular saldo real (só o que efetivamente entrou - despesas - comissões)
    const saldoReal = totalReceitaLiquida - totalDespesas - totalComissoes;

    const totais = {
      // Totais detalhados
      receitaBruta: totalReceitaBruta, // Todas as receitas incluindo boletos não pagos
      receitaLiquida: totalReceitaLiquida, // Só receitas que entraram no caixa
      boletosNaoPagos: totalBoletosNaoPagos, // Boletos aguardando pagamento
      receitasNormais: receitasNormais.reduce(
        (sum, r) => sum + (r.valorRecebido || r.valor),
        0,
      ),
      receitasRecebimentoBoleto: receitasRecebimentoBoleto.reduce(
        (sum, r) => sum + (r.valorRecebido || r.valor),
        0,
      ),
      comissoes: totalComissoes,
      despesas: totalDespesas,
      saldo: saldoReal, // Saldo real do caixa

      // Campos para compatibilidade
      receitas: totalReceitaLiquida,
      receitasRecebidas: totalReceitaLiquida,
      boletos: totalBoletosNaoPagos, // Para compatibilidade
    };

    console.log(`[Totais Caixa] Resultado final:`, {
      receitaBruta: totais.receitaBruta,
      receitaLiquida: totais.receitaLiquida,
      boletosNaoPagos: totais.boletosNaoPagos,
      despesas: totais.despesas,
      saldoReal: totais.saldo,
    });

    res.json(totais);
  } catch (error) {
    console.error("Erro ao calcular totais:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
