import { RequestHandler } from "express";
import { addLegitimateEmployees } from "../lib/add-legitimate-employees";

export const addLegitimateEmployeesRoute: RequestHandler = async (req, res) => {
  try {
    console.log("[API] Adicionando funcionários legítimos...");

    const result = await addLegitimateEmployees();

    res.json({
      success: true,
      message: "Funcionários legítimos adicionados com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("[API] Erro ao adicionar funcionários legítimos:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao adicionar funcionários legítimos",
      details: error.message,
    });
  }
};
