import { RequestHandler } from "express";
import { cleanFakeData } from "../lib/clean-fake-data";

export const cleanFakeDataRoute: RequestHandler = async (req, res) => {
  try {
    console.log("[Clean Route] Iniciando limpeza de dados fictícios...");
    await cleanFakeData();
    res.json({
      success: true,
      message: "Dados fictícios removidos com sucesso",
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
