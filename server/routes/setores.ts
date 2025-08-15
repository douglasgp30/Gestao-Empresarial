import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const SetorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cidadeId: z.number().int().positive("ID da cidade é obrigatório"),
});

export const getSetores: RequestHandler = async (req, res) => {
  try {
    const { cidade } = req.query;
    const where: any = { ativo: true };

    // Filtrar por cidade se especificado
    if (cidade) {
      // Tentar buscar pela nova estrutura primeiro
      try {
        const cidadeObj = await prisma.cidade.findFirst({
          where: { nome: cidade as string }
        });
        if (cidadeObj) {
          where.cidadeId = cidadeObj.id;
        }
      } catch (error) {
        // Fallback para estrutura antiga
        where.cidade = cidade as string;
      }
    }

    // Buscar setores com dados da cidade incluídos
    try {
      const setores = await prisma.setor.findMany({
        where,
        include: {
          cidade: true,
        },
        orderBy: [{ cidade: { nome: "asc" } }, { nome: "asc" }],
      });

      console.log(`[Setores] Encontrados ${setores.length} setores com nova estrutura`);
      res.json(setores);
    } catch (includeError) {
      // Fallback para estrutura antiga
      console.log("[Setores] Usando estrutura antiga de setores");
      const setores = await prisma.setor.findMany({
        where: cidade ? { cidade: cidade as string, ativo: true } : { ativo: true },
        orderBy: [{ cidade: "asc" }, { nome: "asc" }],
      });
      res.json(setores);
    }
  } catch (error) {
    console.error("Erro ao buscar setores:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getCidades: RequestHandler = async (req, res) => {
  try {
    // Tentar usar a nova tabela de cidades
    const cidades = await prisma.cidade.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: { setores: true },
        },
      },
    });

    console.log(`[Cidades] Encontradas ${cidades.length} cidades`);
    res.json(cidades);
  } catch (error) {
    console.error("Erro ao buscar cidades:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createSetor: RequestHandler = async (req, res) => {
  try {
    console.log("[Setores] Dados recebidos para criar setor:", JSON.stringify(req.body, null, 2));
    const data = SetorSchema.parse(req.body);
    console.log("[Setores] Dados após validação:", JSON.stringify(data, null, 2));

    // Verificar se a cidade existe
    const cidade = await prisma.cidade.findUnique({
      where: { id: data.cidadeId },
    });

    if (!cidade) {
      return res.status(400).json({ error: "Cidade não encontrada" });
    }

    // Verificar se já existe um setor com esse nome nesta cidade
    const setorExistente = await prisma.setor.findFirst({
      where: {
        cidadeId: data.cidadeId,
        nome: {
          equals: data.nome,
          mode: "insensitive",
        },
        ativo: true,
      },
    });

    if (setorExistente) {
      return res.status(400).json({
        error: `Já existe um setor "${data.nome}" na cidade "${cidade.nome}"`,
      });
    }

    const setor = await prisma.setor.create({
      data,
      include: {
        cidade: true,
      },
    });
    res.status(201).json(setor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao criar setor:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const updateSetor: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = SetorSchema.partial().parse(req.body);

    const setor = await prisma.setor.update({
      where: { id },
      data,
    });
    res.json(setor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao atualizar setor:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const deleteSetor: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Soft delete - apenas marcar como inativo
    await prisma.setor.update({
      where: { id },
      data: { ativo: false },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir setor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const deleteCidade: RequestHandler = async (req, res) => {
  try {
    const cidade = decodeURIComponent(req.params.cidade);

    // Verificar se existem setores vinculados a esta cidade
    const setoresVinculados = await prisma.setor.findMany({
      where: { cidade },
    });

    if (setoresVinculados.length > 0) {
      const nomesSetores = setoresVinculados.map((s) => s.nome).join(", ");
      return res.status(400).json({
        error: `Não é possível excluir a cidade "${cidade}" pois existem ${setoresVinculados.length} setor(es) vinculado(s): ${nomesSetores}. Remova ou realoque estes setores primeiro.`,
      });
    }

    // Se chegou aqui, pode excluir (na verdade não há uma tabela de cidades,
    // então não há nada para excluir fisicamente)
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir cidade:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
