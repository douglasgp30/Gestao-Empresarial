import { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/database";

// Schema de validação baseado no padrão de DescricaoECategoria
const LocalizacaoGeograficaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipoItem: z.enum(["cidade", "setor"], {
    errorMap: () => ({ message: "Tipo deve ser 'cidade' ou 'setor'" }),
  }),
  cidade: z.string().optional(), // Nome da cidade pai (apenas para setores)
  ativo: z.boolean().default(true),
});

// Listar todas as localizações geográficas
export const getLocalizacoesGeograficas: RequestHandler = async (req, res) => {
  try {
    const { tipo, ativo, cidade } = req.query;

    const where: any = {};

    if (tipo) {
      where.tipoItem = tipo;
    }

    if (ativo !== undefined) {
      where.ativo = ativo === "true";
    }

    if (cidade && tipo === "setor") {
      where.cidade = cidade;
    }

    const localizacoes = await prisma.localizacaoGeografica.findMany({
      where,
      orderBy: [
        { tipoItem: "asc" }, // Cidades primeiro
        { cidade: "asc" }, // Depois por cidade
        { nome: "asc" }, // Depois por nome
      ],
    });

    console.log(
      `[LocalizacoesGeograficas] Encontradas ${localizacoes.length} localizações`,
    );
    res.json(localizacoes);
  } catch (error) {
    console.error("Erro ao buscar localizações geográficas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Listar apenas cidades ativas (para usar em formulários)
export const getCidades: RequestHandler = async (req, res) => {
  try {
    const { todas } = req.query;

    const where: any = {
      tipoItem: "cidade",
    };

    // Por padrão, retorna apenas cidades ativas (para uso em formulários)
    // Use ?todas=true para retornar todas as cidades
    if (todas !== "true") {
      where.ativo = true;
    }

    const cidades = await prisma.localizacaoGeografica.findMany({
      where,
      orderBy: [{ nome: "asc" }],
    });

    console.log(
      `[LocalizacoesGeograficas] Encontradas ${cidades.length} cidades ${todas === "true" ? "(todas)" : "(ativas)"}`,
    );
    res.json(cidades);
  } catch (error) {
    console.error("Erro ao buscar cidades:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Listar setores (opcionalmente filtrados por cidade)
export const getSetores: RequestHandler = async (req, res) => {
  try {
    const { cidade } = req.query;

    const where: any = {
      tipoItem: "setor",
      ativo: true,
    };

    if (cidade) {
      where.cidade = cidade;
    }

    const setores = await prisma.localizacaoGeografica.findMany({
      where,
      orderBy: [{ cidade: "asc" }, { nome: "asc" }],
    });

    console.log(
      `[LocalizacoesGeograficas] Encontrados ${setores.length} setores`,
    );
    res.json(setores);
  } catch (error) {
    console.error("Erro ao buscar setores:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Criar nova localização geográfica
export const createLocalizacaoGeografica: RequestHandler = async (req, res) => {
  try {
    console.log(
      "[LocalizacoesGeograficas] Dados recebidos:",
      JSON.stringify(req.body, null, 2),
    );

    const data = LocalizacaoGeograficaSchema.parse(req.body);

    // Validações específicas
    if (data.tipoItem === "setor" && !data.cidade) {
      return res.status(400).json({
        error: "Setores devem ter uma cidade associada",
      });
    }

    if (data.tipoItem === "cidade" && data.cidade) {
      return res.status(400).json({
        error: "Cidades não devem ter cidade pai",
      });
    }

    // Verificar se já existe
    const existente = await prisma.localizacaoGeografica.findFirst({
      where: {
        nome: data.nome,
        tipoItem: data.tipoItem,
        cidade: data.cidade || null,
        ativo: true,
      },
    });

    if (existente) {
      const local =
        data.tipoItem === "setor" ? `na cidade "${data.cidade}"` : "";
      return res.status(400).json({
        error: `Já existe ${data.tipoItem === "cidade" ? "uma cidade" : "um setor"} "${data.nome}" ${local}`,
      });
    }

    // Verificar se a cidade pai existe (para setores)
    if (data.tipoItem === "setor") {
      const cidadePai = await prisma.localizacaoGeografica.findFirst({
        where: {
          nome: data.cidade!,
          tipoItem: "cidade",
          ativo: true,
        },
      });

      if (!cidadePai) {
        return res.status(400).json({
          error: `Cidade "${data.cidade}" não encontrada`,
        });
      }
    }

    const localizacao = await prisma.localizacaoGeografica.create({
      data,
    });

    console.log(
      "[LocalizacoesGeograficas] Localização criada com sucesso:",
      localizacao,
    );
    res.status(201).json(localizacao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error("Erro ao criar localização geográfica:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

// Atualizar localização geográfica
export const updateLocalizacaoGeografica: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = LocalizacaoGeograficaSchema.partial().parse(req.body);

    const localizacao = await prisma.localizacaoGeografica.update({
      where: { id },
      data,
    });

    console.log(
      "[LocalizacoesGeograficas] Localização atualizada:",
      localizacao,
    );
    res.json(localizacao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error("Erro ao atualizar localização geográfica:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

// Excluir localização geográfica (soft delete)
export const deleteLocalizacaoGeografica: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const item = await prisma.localizacaoGeografica.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({
        error: "Localização não encontrada",
      });
    }

    // Cidades de Goiás são pré-cadastradas e não devem ser excluídas
    if (item.tipoItem === "cidade") {
      return res.status(400).json({
        error: `Não é possível excluir a cidade "${item.nome}". As cidades são pré-cadastradas no sistema. Use a função ativar/desativar para controlar quais cidades aparecem nas opções.`,
      });
    }

    // Verificar se há lançamentos vinculados
    const lancamentosVinculados = await prisma.lancamentoCaixa.findMany({
      where: {
        localizacaoId: id,
      },
      take: 1, // Só precisamos saber se existe pelo menos um
    });

    if (lancamentosVinculados.length > 0) {
      return res.status(400).json({
        error: `Não é possível excluir ${item.tipoItem === "cidade" ? "a cidade" : "o setor"} "${item.nome}" pois existem lançamentos vinculados`,
      });
    }

    // Soft delete
    await prisma.localizacaoGeografica.update({
      where: { id },
      data: { ativo: false },
    });

    console.log(
      `[LocalizacoesGeograficas] ${item.tipoItem} "${item.nome}" marcada como inativa`,
    );
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir localização geográfica:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
