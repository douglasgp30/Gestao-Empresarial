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
      logsHoje,
      usuariosAtivos,
      acoesFrequentes
    ] = await Promise.all([
      prisma.logAuditoria.count(),
      prisma.logAuditoria.count({
        where: {
          dataHora: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.logAuditoria.groupBy({
        by: ['usuarioId', 'usuarioNome'],
        where: {
          dataHora: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
          }
        },
        _count: true,
      }),
      prisma.logAuditoria.groupBy({
        by: ['acao'],
        _count: true,
        orderBy: {
          _count: {
            acao: 'desc'
          }
        },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      logsHoje,
      usuariosAtivos: usuariosAtivos.length,
      acoesFrequentes,
    };
  }
}

// Função helper para extrair informações da requisição
export function extrairInfoRequisicao(req: any) {
  return {
    ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
    sessaoId: req.sessionID || req.headers['x-session-id'],
  };
}

// Middleware para auditoria automática
export function middlewareAuditoria(
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
