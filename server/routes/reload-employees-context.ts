import { RequestHandler } from "express";
import { reloadEmployeesInContext } from "../lib/reload-employees-context";

export const reloadEmployeesContextRoute: RequestHandler = async (req, res) => {
  try {
    console.log("[API] Recarregando context de funcionários...");

    const result = await reloadEmployeesInContext();

    res.json({
      success: true,
      message: "Context de funcionários recarregado com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("[API] Erro ao recarregar context:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao recarregar context de funcionários",
      details: error.message,
    });
  }
};
