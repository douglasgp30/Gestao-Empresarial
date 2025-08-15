import { RequestHandler, Router } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";


const CidadeSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// GET /api/cidades - Listar todas as cidades
export const getCidades: RequestHandler = async (req, res) => {
  try {
    const cidades = await prisma.cidade.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: { setores: true },
        },
      },
    });

    const response: ApiResponse<typeof cidades> = { data: cidades };
    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar cidades:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

// POST /api/cidades - Criar nova cidade
export const createCidade: RequestHandler = async (req, res) => {
  try {
    console.log("[Cidades] Dados recebidos para criar cidade:", JSON.stringify(req.body, null, 2));
    const data = CidadeSchema.parse(req.body);
    console.log("[Cidades] Dados após validação:", JSON.stringify(data, null, 2));

    // Verificar se já existe uma cidade com esse nome (SQLite case insensitive by default)
    const cidadeExistente = await prisma.cidade.findFirst({
      where: {
        nome: data.nome,
      },
    });

    if (cidadeExistente) {
      const response: ApiResponse<null> = {
        error: `Já existe uma cidade com o nome "${data.nome}"`,
      };
      return res.status(400).json(response);
    }

    const cidade = await prisma.cidade.create({ data });

    console.log("[Cidades] Cidade criada com sucesso:", cidade);
    const response: ApiResponse<typeof cidade> = { data: cidade };
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        error:
          "Dados inválidos: " + error.errors.map((e) => e.message).join(", "),
      };
      res.status(400).json(response);
    } else {
      console.error("Erro ao criar cidade:", error);
      const response: ApiResponse<null> = {
        error: "Erro interno do servidor",
      };
      res.status(500).json(response);
    }
  }
};

// PUT /api/cidades/:id - Atualizar cidade
export const updateCidade: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = CidadeSchema.partial().parse(req.body);

    // Se está atualizando o nome, verificar se não existe outro com esse nome
    if (data.nome) {
      const cidadeExistente = await prisma.cidade.findFirst({
        where: {
          id: { not: id },
          nome: data.nome,
        },
      });

      if (cidadeExistente) {
        const response: ApiResponse<null> = {
          error: `Já existe uma cidade com o nome "${data.nome}"`,
        };
        return res.status(400).json(response);
      }
    }

    const cidade = await prisma.cidade.update({
      where: { id },
      data,
    });

    const response: ApiResponse<typeof cidade> = { data: cidade };
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        error:
          "Dados inválidos: " + error.errors.map((e) => e.message).join(", "),
      };
      res.status(400).json(response);
    } else {
      console.error("Erro ao atualizar cidade:", error);
      const response: ApiResponse<null> = {
        error: "Erro interno do servidor",
      };
      res.status(500).json(response);
    }
  }
};

// DELETE /api/cidades/:id - Desativar cidade (soft delete)
export const deleteCidade: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verificar se a cidade existe
    const cidade = await prisma.cidade.findUnique({
      where: { id },
    });

    if (!cidade) {
      const response: ApiResponse<null> = {
        error: "Cidade não encontrada",
      };
      return res.status(404).json(response);
    }

    // Verificar se existem setores vinculados a esta cidade
    const setoresVinculados = await prisma.setor.findMany({
      where: {
        cidadeId: id,
        ativo: true,
      },
    });

    if (setoresVinculados.length > 0) {
      const nomesSetores = setoresVinculados.map((s) => s.nome).join(", ");
      const response: ApiResponse<null> = {
        error: `Não é possível excluir a cidade "${cidade.nome}" pois existem ${setoresVinculados.length} setor(es) vinculado(s): ${nomesSetores}. Remova ou realoque estes setores primeiro.`,
      };
      return res.status(400).json(response);
    }

    // Soft delete - apenas marcar como inativo
    await prisma.cidade.update({
      where: { id },
      data: { ativo: false },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao desativar cidade:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

// Rotas
// Routes are exported individually and registered in server/index.ts
