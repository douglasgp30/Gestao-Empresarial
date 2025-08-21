import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { runMigration, checkMigration } from "./routes/migrate";
import { seedUnifiedData } from "./routes/seed-unified-data";
import { cleanCategories, listCategories } from "./routes/clean-categories";

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
  getLancamentos,
  createLancamento,
  updateLancamento,
  deleteLancamento,
  getTotaisCaixa,
} from "./routes/caixa";

import contasRouter from "./routes/contas";
import { cleanFakeDataRoute } from "./routes/clean";
import descricoesECategoriasRouter from "./routes/descricoes-e-categorias";
import auditoriaRouter from "./routes/auditoria";
import pontoRouter from "./routes/ponto";
import {
  getLocalizacoesGeograficas,
  getCidades,
  getSetores,
  createLocalizacaoGeografica,
  updateLocalizacaoGeografica,
  deleteLocalizacaoGeografica,
} from "./routes/localizacoes-geograficas";

import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "./routes/clientes";

import {
  executarMigracaoCidades,
  listarCidades,
  toggleCidade,
  listarSetoresPorCidade,
  criarSetor,
  excluirSetor,
} from "./routes/cidades-goias";

export function createServer(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Middleware de log apenas para APIs (não assets estáticos)
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      console.log(`[Server] ${req.method} ${req.path}`);
    }
    next();
  });

  // Rotas existentes
  app.get("/api/ping", (req, res) => {
    console.log("[Server] Ping recebido");
    res.json({ message: "pong", timestamp: new Date().toISOString() });
  });

  // Rota de health check
  app.get("/api/health", (req, res) => {
    console.log("[Server] Health check recebido");
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  });

  // Rota de teste para debug do caixa
  app.get("/api/caixa/test", async (req, res) => {
    try {
      console.log("[Server] Teste do caixa recebido");
      const { prisma } = await import("./lib/database");

      // Testar conexão com banco
      const count = await prisma.lancamentoCaixa.count();
      console.log(`[Server] Total de lançamentos no banco: ${count}`);

      res.json({
        status: "ok",
        message: "Rota de teste do caixa funcionando",
        totalLancamentos: count,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Server] Erro no teste do caixa:", error);
      res.status(500).json({
        status: "error",
        message: "Erro no teste do caixa",
        error: error.message,
      });
    }
  });

  // Rota simplificada de debug para caixa
  app.get("/api/caixa/debug", async (req, res) => {
    try {
      console.log("[Server DEBUG] Rota debug do caixa acessada");
      res.setHeader("Content-Type", "application/json");

      const { prisma } = await import("./lib/database");

      // Busca simples sem filtros
      const lancamentos = await prisma.lancamentoCaixa.findMany({
        take: 5,
        orderBy: { id: "desc" },
        select: {
          id: true,
          valor: true,
          tipo: true,
          dataHora: true,
        },
      });

      console.log(
        `[Server DEBUG] Encontrados ${lancamentos.length} lançamentos`,
      );

      const resultado = {
        success: true,
        message: "Debug da rota caixa",
        count: lancamentos.length,
        data: lancamentos,
        timestamp: new Date().toISOString(),
      };

      res.json(resultado);
    } catch (error) {
      console.error("[Server DEBUG] Erro:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack,
      });
    }
  });

  // Limpeza de dados fictícios - rota especial sem middleware de body parsing extra
  app.post(
    "/api/clean-fake-data",
    (req, res, next) => {
      // Garantir que o body não seja lido múltiplas vezes
      console.log(
        "[Middleware] Clean route accessed, body readable:",
        req.readable,
      );
      next();
    },
    cleanFakeDataRoute,
  );
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

  // Debug endpoint para ver funcionários duplicados
  app.get("/api/debug/funcionarios", async (req, res) => {
    try {
      const funcionarios = await prisma.funcionario.findMany({
        select: {
          id: true,
          nome: true,
          ehTecnico: true,
          email: true,
          login: true,
          dataCriacao: true,
        },
        orderBy: { nome: "asc" },
      });
      console.log("[Debug] Funcionários encontrados:", JSON.stringify(funcionarios, null, 2));
      res.json(funcionarios);
    } catch (error) {
      console.error("Erro ao buscar funcionários para debug:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rotas de Localização Geográfica (Cidades e Setores unificados)
  app.get("/api/localizacoes-geograficas", getLocalizacoesGeograficas);
  app.get("/api/cidades", getCidades);
  app.get("/api/setores", getSetores);
  app.post("/api/localizacoes-geograficas", createLocalizacaoGeografica);
  app.put("/api/localizacoes-geograficas/:id", updateLocalizacaoGeografica);
  app.delete("/api/localizacoes-geograficas/:id", deleteLocalizacaoGeografica);

  // Rota de migração (apenas para desenvolvimento)
  app.post("/api/migrate/separate-cities", async (req, res) => {
    try {
      console.log("[API] Iniciando migração manual...");

      // Verificar se a tabela cidade existe e tem dados
      const cidades = await prisma.cidade.findMany();
      if (cidades.length > 0) {
        return res.json({ message: "Migração já foi executada anteriormente" });
      }

      // Buscar setores existentes
      const setores = await prisma.setor.findMany();
      const cidadesUnicas = [...new Set(setores.map((s) => s.cidade))];

      console.log(
        `[API] Encontradas ${cidadesUnicas.length} cidades únicas:`,
        cidadesUnicas,
      );

      // Criar cidades
      const cidadesCriadas = [];
      for (const nomeCidade of cidadesUnicas) {
        const cidade = await prisma.cidade.create({
          data: { nome: nomeCidade, ativo: true },
        });
        cidadesCriadas.push(cidade);
      }

      console.log(`[API] ${cidadesCriadas.length} cidades criadas`);

      res.json({
        message: "Migração concluída com sucesso!",
        cidadesCriadas: cidadesCriadas.length,
      });
    } catch (error) {
      console.error("Erro na migração:", error);
      res.status(500).json({ error: "Erro na migração: " + error.message });
    }
  });

  // Middleware de debug para rotas POST do caixa
  const debugCaixaMiddleware = (req: any, res: any, next: any) => {
    console.log("[Debug Caixa] Middleware executado");
    console.log("[Debug Caixa] Method:", req.method);
    console.log("[Debug Caixa] Content-Type:", req.get("content-type"));
    console.log("[Debug Caixa] Content-Length:", req.get("content-length"));

    // Se for POST/PUT e não há body, pode haver um problema
    if ((req.method === "POST" || req.method === "PUT") && !req.body) {
      console.warn("[Debug Caixa] ⚠️ Body está vazio para método", req.method);
    }

    next();
  };

  // Rotas de Caixa
  app.get("/api/caixa", getLancamentos);
  app.get("/api/caixa/lancamentos", getLancamentos); // Manter compatibilidade
  app.get("/api/caixa/totais", getTotaisCaixa);

  // Rota alternativa para criação que contorna o problema do body stream
  app.post("/api/caixa/criar", debugCaixaMiddleware, async (req, res) => {
    try {
      console.log("[Caixa Criar] Rota alternativa para criação");

      // Clonar o body para evitar problemas de stream
      const bodyData = { ...req.body };

      // Criar uma nova requisição simulada para o createLancamento
      const mockReq = {
        ...req,
        body: bodyData,
      };

      return await createLancamento(mockReq as any, res);
    } catch (error) {
      console.error("[Caixa Criar] Erro na rota alternativa:", error);
      res
        .status(500)
        .json({ error: "Erro interno do servidor", details: error.message });
    }
  });

  app.post("/api/caixa", debugCaixaMiddleware, createLancamento);
  app.post("/api/caixa/lancamentos", debugCaixaMiddleware, createLancamento); // Manter compatibilidade
  app.put("/api/caixa/:id", debugCaixaMiddleware, updateLancamento);
  app.put("/api/caixa/lancamentos/:id", debugCaixaMiddleware, updateLancamento); // Manter compatibilidade
  app.delete("/api/caixa/:id", deleteLancamento);
  app.delete("/api/caixa/lancamentos/:id", deleteLancamento); // Manter compatibilidade

  // Rotas de Contas
  app.use("/api/contas", contasRouter);

  // Rotas de Descrições e Categorias Unificadas
  app.use("/api/descricoes-e-categorias", descricoesECategoriasRouter);

  // Rotas de Auditoria (apenas para administradores)
  app.use("/api/auditoria", auditoriaRouter);

  // Rotas de Controle de Ponto
  app.use("/api/ponto", pontoRouter);

  // Rotas de Clientes
  app.get("/api/clientes", getClientes);
  app.post("/api/clientes", createCliente);
  app.put("/api/clientes/:id", updateCliente);
  app.delete("/api/clientes/:id", deleteCliente);

  // Rotas de Cidades de Goiás
  app.post("/api/cidades-goias/migrar", executarMigracaoCidades);
  app.get("/api/cidades-goias", listarCidades);
  app.post("/api/cidades-goias/toggle", toggleCidade);
  app.get("/api/cidades-goias/:nomeCidade/setores", listarSetoresPorCidade);
  app.post("/api/cidades-goias/:nomeCidade/setores", criarSetor);
  app.delete("/api/cidades-goias/setores/:id", excluirSetor);

  // Migração para sistema unificado
  app.post("/api/migrate/unified-descriptions", runMigration);
  app.get("/api/migrate/check", checkMigration);
  app.post("/api/seed/unified-data", seedUnifiedData);

  // Limpeza de dados
  app.delete("/api/clean/categories", cleanCategories);
  app.get("/api/clean/categories", listCategories);

  return app;
}

const app = createServer();
const port = process.env.PORT || 8080;

// Só fazer listen quando não estiver sendo usado pelo Vite (desenvolvimento)
if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "development") {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}
