import { RequestHandler } from "express";
import { cleanFakeData } from "../lib/clean-fake-data";

export const cleanFakeDataRoute: RequestHandler = async (req, res) => {
  try {
    console.log(
      "[Clean Route] Iniciando limpeza completa de dados fictícios/void...",
    );

    // Verificar se o corpo da requisição já foi lido
    if (req.readableEnded) {
      console.log("[Clean Route] Request body already consumed");
    }

    const results = await cleanFakeData();

    // Garantir que a resposta seja enviada apenas uma vez
    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        message: "Todos os dados fictícios foram removidos com sucesso",
        data: results,
      });
    }
  } catch (error) {
    console.error("[Clean Route] Erro ao limpar dados fictícios:", error);

    // Garantir que a resposta de erro seja enviada apenas uma vez
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Erro ao limpar dados fictícios",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};
