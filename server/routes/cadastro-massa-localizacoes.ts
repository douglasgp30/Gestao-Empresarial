import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

// Schema para cadastro em massa de cidades
const CadastroMassaCidadesSchema = z.object({
  cidades: z.array(z.string().min(1, "Nome da cidade não pode estar vazio")),
});

// Schema para cadastro em massa de setores
const CadastroMassaSetoresSchema = z.object({
  cidadeId: z.number().positive("ID da cidade deve ser um número positivo"),
  setores: z.array(z.string().min(1, "Nome do setor não pode estar vazio")),
});

// POST /api/localizacoes/cadastro-massa/cidades
export const cadastrarCidadesEmMassa: RequestHandler = async (req, res) => {
  try {
    console.log(
      "[CadastroMassa] Recebidos dados para cadastro de cidades:",
      req.body,
    );

    const { cidades } = CadastroMassaCidadesSchema.parse(req.body);

    console.log(`[CadastroMassa] Processando ${cidades.length} cidades...`);

    const resultados = {
      criadas: [],
      existentes: [],
      erros: [],
    };

    for (const nomeCidade of cidades) {
      try {
        // Verificar se a cidade já existe
        const cidadeExistente = await prisma.localizacaoGeografica.findFirst({
          where: {
            nome: nomeCidade.trim(),
            tipoItem: "cidade",
          },
        });

        if (cidadeExistente) {
          resultados.existentes.push({
            nome: nomeCidade.trim(),
            id: cidadeExistente.id,
            ativo: cidadeExistente.ativo,
          });
          continue;
        }

        // Criar nova cidade
        const novaCidade = await prisma.localizacaoGeografica.create({
          data: {
            nome: nomeCidade.trim(),
            tipoItem: "cidade",
            ativo: true,
          },
        });

        resultados.criadas.push({
          id: novaCidade.id,
          nome: novaCidade.nome,
        });

        console.log(
          `[CadastroMassa] Cidade criada: ${novaCidade.nome} (ID: ${novaCidade.id})`,
        );
      } catch (error) {
        console.error(
          `[CadastroMassa] Erro ao criar cidade ${nomeCidade}:`,
          error,
        );
        resultados.erros.push({
          nome: nomeCidade.trim(),
          erro: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Processamento concluído: ${resultados.criadas.length} criadas, ${resultados.existentes.length} já existiam, ${resultados.erros.length} erros`,
      resultados,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      });
    }

    console.error("[CadastroMassa] Erro geral no cadastro de cidades:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
};

// POST /api/localizacoes/cadastro-massa/setores
export const cadastrarSetoresEmMassa: RequestHandler = async (req, res) => {
  try {
    console.log(
      "[CadastroMassa] Recebidos dados para cadastro de setores:",
      req.body,
    );

    const { cidadeId, setores } = CadastroMassaSetoresSchema.parse(req.body);

    // Verificar se a cidade existe
    const cidade = await prisma.localizacaoGeografica.findUnique({
      where: {
        id: cidadeId,
      },
    });

    if (!cidade || cidade.tipoItem !== "cidade") {
      return res.status(400).json({
        success: false,
        error: "Cidade não encontrada ou inválida",
      });
    }

    if (!cidade.ativo) {
      return res.status(400).json({
        success: false,
        error:
          "A cidade está inativa. Ative a cidade antes de adicionar setores.",
      });
    }

    console.log(
      `[CadastroMassa] Processando ${setores.length} setores para cidade ${cidade.nome}...`,
    );

    const resultados = {
      criados: [],
      existentes: [],
      erros: [],
    };

    for (const nomeSetor of setores) {
      try {
        // Verificar se o setor já existe nesta cidade
        const setorExistente = await prisma.localizacaoGeografica.findFirst({
          where: {
            nome: nomeSetor.trim(),
            tipoItem: "setor",
            cidade: cidade.nome, // Usando nome da cidade por enquanto
          },
        });

        if (setorExistente) {
          resultados.existentes.push({
            nome: nomeSetor.trim(),
            id: setorExistente.id,
            ativo: setorExistente.ativo,
          });
          continue;
        }

        // Criar novo setor
        const novoSetor = await prisma.localizacaoGeografica.create({
          data: {
            nome: nomeSetor.trim(),
            tipoItem: "setor",
            cidade: cidade.nome, // Por enquanto usando nome, depois vamos ajustar para ID
            ativo: true,
          },
        });

        resultados.criados.push({
          id: novoSetor.id,
          nome: novoSetor.nome,
          cidade: novoSetor.cidade,
        });

        console.log(
          `[CadastroMassa] Setor criado: ${novoSetor.nome} em ${cidade.nome} (ID: ${novoSetor.id})`,
        );
      } catch (error) {
        console.error(
          `[CadastroMassa] Erro ao criar setor ${nomeSetor}:`,
          error,
        );
        resultados.erros.push({
          nome: nomeSetor.trim(),
          erro: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Processamento concluído para cidade ${cidade.nome}: ${resultados.criados.length} setores criados, ${resultados.existentes.length} já existiam, ${resultados.erros.length} erros`,
      cidade: {
        id: cidade.id,
        nome: cidade.nome,
      },
      resultados,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      });
    }

    console.error("[CadastroMassa] Erro geral no cadastro de setores:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
};

// DELETE /api/localizacoes/:id/com-protecao - Exclusão com verificação de dependências
export const excluirComProtecao: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Buscar o item
    const item = await prisma.localizacaoGeografica.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item não encontrado",
      });
    }

    console.log(
      `[ExclusaoProtegida] Tentando excluir ${item.tipoItem}: ${item.nome}`,
    );

    // Se for cidade, verificar se tem setores
    if (item.tipoItem === "cidade") {
      const setoresVinculados = await prisma.localizacaoGeografica.count({
        where: {
          tipoItem: "setor",
          cidade: item.nome,
          ativo: true,
        },
      });

      if (setoresVinculados > 0) {
        return res.status(400).json({
          success: false,
          error: `Não é possível excluir a cidade "${item.nome}" pois existem ${setoresVinculados} setor(es) cadastrado(s) nela. Exclua os setores primeiro.`,
          dependencias: {
            tipo: "setores",
            quantidade: setoresVinculados,
          },
        });
      }
    }

    // Verificar se tem lançamentos vinculados
    const lancamentosVinculados = await prisma.lancamentoCaixa.count({
      where: {
        localizacaoId: item.id,
      },
    });

    if (lancamentosVinculados > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível excluir ${item.tipoItem === "cidade" ? "a cidade" : "o setor"} "${item.nome}" pois existem ${lancamentosVinculados} lançamento(s) do caixa vinculado(s).`,
        dependencias: {
          tipo: "lancamentos",
          quantidade: lancamentosVinculados,
        },
      });
    }

    // Verificar agendamentos
    const agendamentosVinculados = await prisma.agendamento.count({
      where: {
        localizacaoId: item.id,
      },
    });

    if (agendamentosVinculados > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível excluir ${item.tipoItem === "cidade" ? "a cidade" : "o setor"} "${item.nome}" pois existem ${agendamentosVinculados} agendamento(s) vinculado(s).`,
        dependencias: {
          tipo: "agendamentos",
          quantidade: agendamentosVinculados,
        },
      });
    }

    // Se chegou até aqui, pode excluir
    await prisma.localizacaoGeografica.delete({
      where: { id },
    });

    console.log(
      `[ExclusaoProtegida] ${item.tipoItem} "${item.nome}" excluído com sucesso`,
    );

    res.json({
      success: true,
      message: `${item.tipoItem === "cidade" ? "Cidade" : "Setor"} "${item.nome}" excluído com sucesso`,
      item: {
        id: item.id,
        nome: item.nome,
        tipo: item.tipoItem,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ExclusaoProtegida] Erro ao excluir:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
};
