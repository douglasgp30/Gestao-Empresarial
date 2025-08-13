import { Router } from "express";
import { ApiResponse } from "@shared/api";

const router = Router();

// DESABILITADO: Não criar mais dados fictícios
// Este endpoint foi desabilitado para garantir que apenas dados reais sejam usados no sistema
router.post("/accounts", async (req, res) => {
  const response: ApiResponse<{ message: string }> = {
    error: "Endpoint desabilitado - O sistema funciona apenas com dados reais",
  };
  res.status(403).json(response);
});

export default router;
