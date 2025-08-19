import { RequestHandler, Router } from "express";
import { AuditoriaService } from "../lib/auditoria";
import { z } from "zod";

const router = Router();

// Schema para filtros de busca
const FiltrosAuditoriaSchema = z.object({
  usuarioId: z.string().optional(),
  entidade: z.string().optional(),
  acao: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  limite: z.coerce.number().min(1).max(1000).optional(),
  pagina: z.coerce.number().min(1).optional(),
});

// GET /api/auditoria - Listar logs de auditoria (apenas para administradores)
const getLogs: RequestHandler = async (req, res) => {
  try {
    // Mock user for testing - TODO: Implement proper authentication
    if (!req.user) {
      req.user = { tipoAcesso: "Administrador", id: "1", nome: "Admin" };
    }

    // Verificar se o usuário é administrador
    if (!req.user || req.user.tipoAcesso !== "Administrador") {
      return res.status(403).json({
        error: "Acesso negado. Apenas administradores podem visualizar logs de auditoria."
      });
    }

    const filtros = FiltrosAuditoriaSchema.parse(req.query);
    
    // Converter strings de data para Date objects
    const filtrosProcessados = {
      ...filtros,
      dataInicio: filtros.dataInicio ? new Date(filtros.dataInicio) : undefined,
      dataFim: filtros.dataFim ? new Date(filtros.dataFim) : undefined,
    };

    const resultado = await AuditoriaService.buscarLogs(filtrosProcessados);

    res.json({
      data: resultado.logs,
      total: resultado.total,
      pagina: resultado.pagina,
      totalPaginas: resultado.totalPaginas,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Parâmetros inválidos",
        details: error.errors 
      });
    }
    
    console.error("Erro ao buscar logs de auditoria:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// GET /api/auditoria/estatisticas - Obter estatísticas dos logs
const getEstatisticas: RequestHandler = async (req, res) => {
  try {
    // Mock user for testing - TODO: Implement proper authentication
    if (!req.user) {
      req.user = { tipoAcesso: "Administrador", id: "1", nome: "Admin" };
    }

    // Verificar se o usuário é administrador
    if (!req.user || req.user.tipoAcesso !== "Administrador") {
      return res.status(403).json({
        error: "Acesso negado. Apenas administradores podem visualizar estatísticas de auditoria."
      });
    }

    const estatisticas = await AuditoriaService.obterEstatisticas();
    res.json(estatisticas);
  } catch (error) {
    console.error("Erro ao obter estatísticas de auditoria:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// GET /api/auditoria/entidades - Listar entidades disponíveis para filtro
const getEntidades: RequestHandler = async (req, res) => {
  try {
    // Mock user for testing - TODO: Implement proper authentication
    if (!req.user) {
      req.user = { tipoAcesso: "Administrador", id: "1", nome: "Admin" };
    }

    // Verificar se o usuário é administrador
    if (!req.user || req.user.tipoAcesso !== "Administrador") {
      return res.status(403).json({
        error: "Acesso negado."
      });
    }

    const entidades = [
      "Funcionario",
      "Cliente",
      "LancamentoCaixa",
      "Conta",
      "Agendamento",
      "Campanha",
      "Fornecedor"
    ];

    res.json(entidades);
  } catch (error) {
    console.error("Erro ao obter entidades:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// GET /api/auditoria/acoes - Listar ações disponíveis para filtro
const getAcoes: RequestHandler = async (req, res) => {
  try {
    // Mock user for testing - TODO: Implement proper authentication
    if (!req.user) {
      req.user = { tipoAcesso: "Administrador", id: "1", nome: "Admin" };
    }

    // Verificar se o usuário é administrador
    if (!req.user || req.user.tipoAcesso !== "Administrador") {
      return res.status(403).json({
        error: "Acesso negado."
      });
    }

    const acoes = [
      "criar",
      "atualizar",
      "excluir",
      "login",
      "logout",
      "visualizar",
      "exportar"
    ];

    res.json(acoes);
  } catch (error) {
    console.error("Erro ao obter ações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Rotas
router.get("/logs", getLogs);
router.get("/stats", getEstatisticas);
router.get("/entidades", getEntidades);
router.get("/acoes", getAcoes);

export default router;
