import { RequestHandler, Router } from "express";
import { prisma } from "../lib/database";
import { z } from "zod";

const router = Router();

const LoginSchema = z.object({
  login: z.string().min(1, "Login é obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { login, senha } = LoginSchema.parse(req.body);

    const funcionario = await prisma.funcionario.findFirst({
      where: {
        login: login.trim().toLowerCase(),
        temAcessoSistema: true,
      },
      select: {
        id: true,
        nome: true,
        login: true,
        tipoAcesso: true,
        temAcessoSistema: true,
        senha: true,
        permissoes: true,
      },
    });

    if (!funcionario || !funcionario.senha || funcionario.senha !== senha) {
      return res.status(401).json({ error: "Login ou senha inválidos" });
    }

    res.json({
      id: funcionario.id,
      nomeCompleto: funcionario.nome,
      login: funcionario.login,
      tipoAcesso: funcionario.tipoAcesso || "Operador",
      permissaoAcesso: funcionario.temAcessoSistema,
      permissoes: funcionario.permissoes ? JSON.parse(funcionario.permissoes) : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors,
      });
    }

    console.error("[Auth] Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

router.post("/login", loginHandler);

export default router;
