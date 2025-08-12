import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Importar rotas do banco de dados
import {
  getCampanhas,
  createCampanha,
  updateCampanha,
  deleteCampanha,
} from "./routes/campanhas";

import {
  getDescricoes,
  createDescricao,
  updateDescricao,
  deleteDescricao,
} from "./routes/descricoes";

import {
  getFormasPagamento,
  createFormaPagamento,
  updateFormaPagamento,
  deleteFormaPagamento,
} from "./routes/formas-pagamento";

import {
  getFuncionarios,
  getTecnicos,
  createFuncionario,
  updateFuncionario,
  deleteFuncionario,
} from "./routes/funcionarios";

import {
  getSetores,
  getCidades,
  createSetor,
  updateSetor,
  deleteSetor,
} from "./routes/setores";

import {
  getLancamentos,
  createLancamento,
  updateLancamento,
  deleteLancamento,
  getTotaisCaixa,
} from "./routes/caixa";

import contasRouter from "./routes/contas";
import { cleanFakeDataRoute } from "./routes/clean";

export function createServer(): Express {
  console.log('[Server] Criando servidor Express...');
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Middleware de log apenas para APIs (não assets estáticos)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[Server] ${req.method} ${req.path}`);
    }
    next();
  });

  // Rotas existentes
  app.get("/api/ping", (req, res) => {
    console.log('[Server] Ping recebido');
    res.json({ message: "pong", timestamp: new Date().toISOString() });
  });

  // Endpoint temporário de debug
  app.get("/api/debug/db-status", async (req, res) => {
    try {
      const { prisma } = await import("./lib/database");

      const counts = {
        descricoes: await prisma.descricao.count(),
        formasPagamento: await prisma.formaPagamento.count(),
        funcionarios: await prisma.funcionario.count(),
        setores: await prisma.setor.count(),
        campanhas: await prisma.campanha.count(),
        lancamentos: await prisma.lancamentoCaixa.count(),
      };

      const samples = {
        descricoes: await prisma.descricao.findMany({ take: 3 }),
        formasPagamento: await prisma.formaPagamento.findMany({ take: 3 }),
        funcionarios: await prisma.funcionario.findMany({ take: 3, select: { id: true, nome: true, tipoAcesso: true } }),
      };

      res.json({ counts, samples });
    } catch (error) {
      console.error('[Debug] Erro ao verificar status do banco:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint para criar dados básicos
  app.post("/api/debug/seed-basic-data", async (req, res) => {
    try {
      const { seedBasicData } = await import("./lib/seed-basic-data");
      await seedBasicData();
      res.json({ message: "Dados básicos criados com sucesso!" });
    } catch (error) {
      console.error('[Debug] Erro ao criar dados básicos:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Limpeza de dados fictícios
  app.post("/api/clean-fake-data", cleanFakeDataRoute);
  app.get("/api/demo", handleDemo);

  // Rotas de Campanhas
  app.get("/api/campanhas", getCampanhas);
  app.post("/api/campanhas", createCampanha);
  app.put("/api/campanhas/:id", updateCampanha);
  app.delete("/api/campanhas/:id", deleteCampanha);

  // Rotas de Descrições
  app.get("/api/descricoes", getDescricoes);
  app.post("/api/descricoes", createDescricao);
  app.put("/api/descricoes/:id", updateDescricao);
  app.delete("/api/descricoes/:id", deleteDescricao);

  // Rotas de Formas de Pagamento
  app.get("/api/formas-pagamento", getFormasPagamento);
  app.post("/api/formas-pagamento", createFormaPagamento);
  app.put("/api/formas-pagamento/:id", updateFormaPagamento);
  app.delete("/api/formas-pagamento/:id", deleteFormaPagamento);

  // Rotas de Funcionários
  app.get("/api/funcionarios", getFuncionarios);
  app.get("/api/tecnicos", getTecnicos);
  app.post("/api/funcionarios", createFuncionario);
  app.put("/api/funcionarios/:id", updateFuncionario);
  app.delete("/api/funcionarios/:id", deleteFuncionario);

  // Rotas de Setores e Cidades
  app.get("/api/setores", getSetores);
  app.get("/api/cidades", getCidades);
  app.post("/api/setores", createSetor);
  app.put("/api/setores/:id", updateSetor);
  app.delete("/api/setores/:id", deleteSetor);

  // Rotas de Caixa
  app.get("/api/caixa/lancamentos", getLancamentos);
  app.get("/api/caixa/totais", getTotaisCaixa);
  app.post("/api/caixa/lancamentos", createLancamento);
  app.put("/api/caixa/lancamentos/:id", updateLancamento);
  app.delete("/api/caixa/lancamentos/:id", deleteLancamento);

  // Rotas de Contas
  app.use("/api/contas", contasRouter);

  console.log('[Server] Servidor Express configurado com sucesso');
  return app;
}

const app = createServer();
const port = process.env.PORT || 8080;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}
