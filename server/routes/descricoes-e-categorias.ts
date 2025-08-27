import { RequestHandler, Router } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const router = Router();

// Schema de validação para criação/atualização
const DescricaoECategoriaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["receita", "despesa"]),
  tipoItem: z.enum(["descricao", "categoria"]),
  categoria: z.string().optional(),
  ativo: z.boolean().default(true),
});

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// GET /api/descricoes-e-categorias - Listar todos os itens
const getDescricoesECategorias: RequestHandler = async (req, res) => {
  try {
    console.log("[DescricoesECategorias] Buscando itens...");
    const { tipo, tipoItem, ativo } = req.query;

    const where: any = {};

    if (tipo && typeof tipo === "string") {
      where.tipo = tipo;
    }

    if (tipoItem && typeof tipoItem === "string") {
      where.tipoItem = tipoItem;
    }

    if (ativo !== undefined) {
      where.ativo = ativo === "true";
    } else {
      where.ativo = true; // Por padrão, apenas itens ativos
    }

    console.log("[DescricoesECategorias] Filtros aplicados:", where);

    const items = await prisma.descricaoECategoria.findMany({
      where,
      orderBy: [
        { tipoItem: "asc" }, // Categorias primeiro
        { nome: "asc" },
      ],
    });

    console.log(`[DescricoesECategorias] Encontrados ${items.length} itens`);
    console.log("[DescricoesECategorias] Resumo:", {
      categorias: items.filter((i) => i.tipoItem === "categoria").length,
      descricoes: items.filter((i) => i.tipoItem === "descricao").length,
      receitas: items.filter((i) => i.tipo === "receita").length,
      despesas: items.filter((i) => i.tipo === "despesa").length,
    });

    const response: ApiResponse<typeof items> = { data: items };
    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar descrições e categorias:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

// GET /api/descricoes-e-categorias/categorias - Listar apenas categorias
const getCategorias: RequestHandler = async (req, res) => {
  try {
    const { tipo } = req.query;

    const where: any = {
      tipoItem: "categoria",
      ativo: true,
    };

    if (tipo && typeof tipo === "string") {
      where.tipo = tipo;
    }

    const categorias = await prisma.descricaoECategoria.findMany({
      where,
      orderBy: { nome: "asc" },
    });

    const response: ApiResponse<typeof categorias> = { data: categorias };
    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

// GET /api/descricoes-e-categorias/descricoes - Listar apenas descrições
const getDescricoes: RequestHandler = async (req, res) => {
  try {
    const { tipo, categoria } = req.query;

    const where: any = {
      tipoItem: "descricao",
      ativo: true,
    };

    if (tipo && typeof tipo === "string") {
      where.tipo = tipo;
    }

    if (categoria && typeof categoria === "string") {
      where.categoria = categoria;
    }

    const descricoes = await prisma.descricaoECategoria.findMany({
      where,
      orderBy: { nome: "asc" },
    });

    const response: ApiResponse<typeof descricoes> = { data: descricoes };
    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar descrições:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

// POST /api/descricoes-e-categorias - Criar novo item
const createDescricaoECategoria: RequestHandler = async (req, res) => {
  try {
    console.log(
      "[DescricaoECategoria] Dados recebidos:",
      JSON.stringify(req.body, null, 2),
    );
    const data = DescricaoECategoriaSchema.parse(req.body);

    const item = await prisma.descricaoECategoria.create({ data });

    const response: ApiResponse<typeof item> = { data: item };
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "[DescricaoECategoria] Erro de validação Zod:",
        error.errors,
      );
      console.error(
        "[DescricaoECategoria] Dados que causaram erro:",
        JSON.stringify(req.body, null, 2),
      );
      const response: ApiResponse<null> = {
        error:
          "Dados inválidos: " +
          error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
      };
      res.status(400).json(response);
    } else {
      console.error("Erro ao criar item:", error);
      const response: ApiResponse<null> = {
        error: "Erro interno do servidor",
      };
      res.status(500).json(response);
    }
  }
};

// PUT /api/descricoes-e-categorias/:id - Atualizar item
const updateDescricaoECategoria: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = DescricaoECategoriaSchema.partial().parse(req.body);

    const item = await prisma.descricaoECategoria.update({
      where: { id },
      data,
    });

    const response: ApiResponse<typeof item> = { data: item };
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        error:
          "Dados inválidos: " + error.errors.map((e) => e.message).join(", "),
      };
      res.status(400).json(response);
    } else {
      console.error("Erro ao atualizar item:", error);
      const response: ApiResponse<null> = {
        error: "Erro interno do servidor",
      };
      res.status(500).json(response);
    }
  }
};

// DELETE /api/descricoes-e-categorias/:id?force=true - Desativar item (soft delete)
const deleteDescricaoECategoria: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const force = req.query.force === "true";

    console.log(`🗑️ [Delete] Tentando excluir item ${id}, force: ${force}`);

    // Buscar o item que será excluído
    const item = await prisma.descricaoECategoria.findUnique({
      where: { id },
    });

    if (!item) {
      const response: ApiResponse<null> = {
        error: "Item não encontrado",
      };
      return res.status(404).json(response);
    }

    if (!force) {
      // Verificação normal - bloquear se houver dependências

      // Verificar se existem lançamentos que usam este item
      const lancamentosVinculados = await prisma.lancamentoCaixa.findMany({
        where: {
          descricaoECategoriaId: item.id,
        },
        select: {
          id: true,
          dataHora: true,
          valor: true,
          tipo: true,
        },
        take: 5, // Limitar para mostrar apenas alguns exemplos
      });

      if (lancamentosVinculados.length > 0) {
        const exemplos = lancamentosVinculados
          .map(
            (l) =>
              `#${l.id} (${l.tipo}: R$ ${l.valor.toFixed(2)} em ${l.dataHora.toLocaleDateString("pt-BR")})`,
          )
          .join(", ");

        const tipoTexto =
          item.tipoItem === "categoria" ? "categoria" : "descrição";
        const errorMessage = `Não é possível excluir a ${tipoTexto} "${item.nome}" pois existem ${lancamentosVinculados.length} lançamento(s) do caixa vinculado(s). Exemplos: ${exemplos}${lancamentosVinculados.length > 5 ? " e outros..." : ""}. Para excluir forçadamente, clique em "Excluir Mesmo Assim".`;

        const response: ApiResponse<null> = {
          error: errorMessage,
        };

        console.log("🔴 Enviando erro de lançamentos vinculados:", response);
        return res.status(400).json(response);
      }

      // Se for uma categoria, verificar se existem descrições que dependem dela
      if (item.tipoItem === "categoria") {
        const descricoesVinculadas = await prisma.descricaoECategoria.findMany({
          where: {
            tipoItem: "descricao",
            categoria: item.nome,
            ativo: true,
          },
        });

        if (descricoesVinculadas.length > 0) {
          const nomesDescricoes = descricoesVinculadas
            .map((d) => d.nome)
            .join(", ");

          const errorMessage = `Não é possível excluir a categoria "${item.nome}" pois existem ${descricoesVinculadas.length} descrição(ões) vinculada(s): ${nomesDescricoes}. Para excluir forçadamente e desativar essas descrições, clique em "Excluir Mesmo Assim".`;

          const response: ApiResponse<null> = {
            error: errorMessage,
          };

          console.log(
            "🔴 Enviando erro de dependência de descrições:",
            response,
          );
          return res.status(400).json(response);
        }
      }
    } else {
      // Exclusão forçada - remover dependências primeiro
      console.log(
        "⚠️ [Delete] Exclusão forçada ativada - removendo dependências",
      );

      // Se houver lançamentos vinculados, remover a vinculação (tornar NULL)
      const lancamentosCount = await prisma.lancamentoCaixa.count({
        where: { descricaoECategoriaId: item.id },
      });

      if (lancamentosCount > 0) {
        await prisma.lancamentoCaixa.updateMany({
          where: { descricaoECategoriaId: item.id },
          data: { descricaoECategoriaId: null },
        });
        console.log(
          `🔗 [Delete] ${lancamentosCount} lançamentos desvinculados`,
        );
      }

      // Se for categoria, desativar todas as descrições vinculadas
      if (item.tipoItem === "categoria") {
        const descricoesCount = await prisma.descricaoECategoria.count({
          where: {
            tipoItem: "descricao",
            categoria: item.nome,
            ativo: true,
          },
        });

        if (descricoesCount > 0) {
          await prisma.descricaoECategoria.updateMany({
            where: {
              tipoItem: "descricao",
              categoria: item.nome,
              ativo: true,
            },
            data: { ativo: false },
          });
          console.log(
            `📝 [Delete] ${descricoesCount} descrições vinculadas desativadas`,
          );
        }
      }
    }

    // Soft delete - marcar como inativo
    await prisma.descricaoECategoria.update({
      where: { id },
      data: { ativo: false },
    });

    console.log(
      `✅ [Delete] Item ${item.nome} (${item.tipoItem}) desativado com sucesso`,
    );

    // Status 204 não deve retornar JSON
    res.status(204).send();
  } catch (error) {
    console.error("🔴 Erro ao desativar item:", error);
    console.error("🔴 Error type:", typeof error);
    console.error("���� Error details:", error);

    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

// Rotas
router.get("/", getDescricoesECategorias);
router.get("/categorias", getCategorias);
router.get("/descricoes", getDescricoes);
router.post("/", createDescricaoECategoria);
router.put("/:id", updateDescricaoECategoria);
router.delete("/:id", deleteDescricaoECategoria);

export default router;
