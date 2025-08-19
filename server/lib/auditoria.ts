import { prisma } from "./database";

export interface LogAuditoriaInput {
  acao: string;
  entidade: string;
  entidadeId?: string | number;
  dadosAntigos?: any;
  dadosNovos?: any;
  descricao?: string;
  usuarioId: string | number;
  usuarioNome: string;
  usuarioLogin?: string;
  ip?: string;
  userAgent?: string;
  sessaoId?: string;
  sucesso?: boolean;
  mensagemErro?: string;
  duracaoMs?: number;
}

export class AuditoriaService {
  static async registrarLog(input: LogAuditoriaInput): Promise<void> {
    try {
      await prisma.logAuditoria.create({
        data: {
          acao: input.acao,
          entidade: input.entidade,
          entidadeId: input.entidadeId?.toString(),
          dadosAntigos: input.dadosAntigos ? JSON.stringify(input.dadosAntigos) : null,
          dadosNovos: input.dadosNovos ? JSON.stringify(input.dadosNovos) : null,
          descricao: input.descricao,
          usuarioId: input.usuarioId.toString(),
          usuarioNome: input.usuarioNome,
          usuarioLogin: input.usuarioLogin,
          ip: input.ip,
          userAgent: input.userAgent,
          sessaoId: input.sessaoId,
          sucesso: input.sucesso ?? true,
          mensagemErro: input.mensagemErro,
          duracaoMs: input.duracaoMs,
        },
      });
    } catch (error) {
      // Não quebrar a aplicação se falhar ao registrar log
      console.error("❌ [AUDITORIA] Falha ao registrar log:", error);
    }
  }

  static async buscarLogs(filtros?: {
    usuarioId?: string;
    entidade?: string;
    acao?: string;
    dataInicio?: Date;
    dataFim?: Date;
    limite?: number;
    pagina?: number;
  }) {
    const where: any = {};
    
    if (filtros?.usuarioId) where.usuarioId = filtros.usuarioId;
    if (filtros?.entidade) where.entidade = filtros.entidade;
    if (filtros?.acao) where.acao = filtros.acao;
    
    if (filtros?.dataInicio || filtros?.dataFim) {
      where.dataHora = {};
      if (filtros.dataInicio) where.dataHora.gte = filtros.dataInicio;
      if (filtros.dataFim) where.dataHora.lte = filtros.dataFim;
    }

    const limite = filtros?.limite || 100;
    const offset = ((filtros?.pagina || 1) - 1) * limite;

    const [logs, total] = await Promise.all([
      prisma.logAuditoria.findMany({
        where,
        orderBy: { dataHora: "desc" },
        take: limite,
        skip: offset,
      }),
      prisma.logAuditoria.count({ where }),
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        dadosAntigos: log.dadosAntigos ? JSON.parse(log.dadosAntigos) : null,
        dadosNovos: log.dadosNovos ? JSON.parse(log.dadosNovos) : null,
      })),
      total,
      pagina: filtros?.pagina || 1,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  static async obterEstatisticas() {
    const [
      totalLogs,
      logsPorAcao,
      logsPorEntidade,
      logsPorUsuario
    ] = await Promise.all([
      prisma.logAuditoria.count(),
      prisma.logAuditoria.groupBy({
        by: ['acao'],
        _count: {
          acao: true
        },
        orderBy: {
          _count: {
            acao: 'desc'
          }
        },
        take: 10,
      }),
      prisma.logAuditoria.groupBy({
        by: ['entidade'],
        _count: {
          entidade: true
        },
        orderBy: {
          _count: {
            entidade: 'desc'
          }
        },
        take: 10,
      }),
      prisma.logAuditoria.groupBy({
        by: ['usuarioNome'],
        _count: {
          usuarioNome: true
        },
        orderBy: {
          _count: {
            usuarioNome: 'desc'
          }
        },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      logsPorAcao: logsPorAcao.map(item => ({
        acao: item.acao,
        total: item._count.acao
      })),
      logsPorEntidade: logsPorEntidade.map(item => ({
        entidade: item.entidade,
        total: item._count.entidade
      })),
      logsPorUsuario: logsPorUsuario.map(item => ({
        usuarioNome: item.usuarioNome,
        total: item._count.usuarioNome
      })),
    };
  }
}

// Função helper para extrair informações da requisição
// Função helper para extrair informações da requisição
export function extrairInfoRequisicao(req: any) {
  return {
    ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
    sessaoId: req.sessionID || req.headers['x-session-id'],
  };
}

// Função helper para traduzir ações para português
function traduzirAcao(acao: string): string {
  const traducoes: Record<string, string> = {
    'criar': 'criar',
    'create': 'criar',
    'atualizar': 'atualizar',
    'update': 'atualizar',
    'excluir': 'excluir',
    'delete': 'excluir',
    'login': 'fazer login',
    'logout': 'fazer logout',
    'visualizar': 'visualizar',
    'view': 'visualizar',
    'exportar': 'exportar',
    'export': 'exportar'
  };

  return traducoes[acao.toLowerCase()] || acao;
}

// Middleware para auditoria com handler customizado
export function middlewareAuditoria(
  entidade: string,
  acao: string,
  handler: (req: any, res: any) => Promise<any>,
  errorHandler?: (error: any, req: any, res: any) => void
) {
  return async (req: any, res: any) => {
    const inicioTempo = Date.now();
    const infoRequisicao = extrairInfoRequisicao(req);

    try {
      const resultado = await handler(req, res);
      const duracaoMs = Date.now() - inicioTempo;

      // Registrar log de sucesso
      if (req.user) {
        AuditoriaService.registrarLog({
          acao,
          entidade,
          entidadeId: resultado?.entidadeId,
          dadosAntigos: resultado?.dadosAntigos,
          dadosNovos: resultado?.dadosNovos,
          descricao: resultado?.descricao || `${acao} em ${entidade}`,
          usuarioId: req.user.id,
          usuarioNome: req.user.nome || req.user.nomeCompleto,
          usuarioLogin: req.user.login,
          ...infoRequisicao,
          sucesso: true,
          duracaoMs,
        });
      }
    } catch (error) {
      const duracaoMs = Date.now() - inicioTempo;

      // Registrar log de erro
      if (req.user) {
        AuditoriaService.registrarLog({
          acao,
          entidade,
          entidadeId: req.params?.id,
          descricao: `Falha ao ${acao.toLowerCase()} ${entidade}`,
          usuarioId: req.user.id,
          usuarioNome: req.user.nome || req.user.nomeCompleto,
          usuarioLogin: req.user.login,
          ...infoRequisicao,
          sucesso: false,
          mensagemErro: error instanceof Error ? error.message : String(error),
          duracaoMs,
        });
      }

      // Usar error handler customizado ou padrão
      if (errorHandler) {
        errorHandler(error, req, res);
      } else {
        console.error(`Erro em ${acao} ${entidade}:`, error);
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  };
}

// Middleware simples para auditoria automática (compatibilidade)
export function middlewareAuditoriaSimples(
  acao: string,
  entidade: string,
  obterDescricao?: (dados: any) => string
) {
  return async (req: any, res: any, next: any) => {
    const inicioTempo = Date.now();
    const infoRequisicao = extrairInfoRequisicao(req);

    // Interceptar o response para capturar dados
    const originalSend = res.send;
    res.send = function(data: any) {
      const duracaoMs = Date.now() - inicioTempo;

      // Registrar log após a operação
      if (req.user) {
        const descricao = obterDescricao ? obterDescricao(req.body) : `${acao} em ${entidade}`;

        AuditoriaService.registrarLog({
          acao,
          entidade,
          entidadeId: req.params.id,
          dadosNovos: req.body,
          descricao,
          usuarioId: req.user.id,
          usuarioNome: req.user.nome || req.user.nomeCompleto,
          usuarioLogin: req.user.login,
          ...infoRequisicao,
          sucesso: res.statusCode < 400,
          duracaoMs,
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
}
