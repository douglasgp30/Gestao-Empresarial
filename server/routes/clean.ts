import { RequestHandler } from "express";
import { cleanFakeData } from "../lib/clean-fake-data";

export const cleanFakeDataRoute: RequestHandler = async (req, res) => {
  try {
    console.log("[Clean Route] Iniciando limpeza completa de dados fictícios/void...");
    const results = await cleanFakeData();
    res.json({
      success: true,
      message: "Todos os dados fictícios foram removidos com sucesso",
      data: results,
    });
  } catch (error) {
    console.error("[Clean Route] Erro ao limpar dados fictícios:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao limpar dados fictícios",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};
