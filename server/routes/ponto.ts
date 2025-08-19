import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { middlewareAuditoriaSimples } from '../lib/auditoria';

const router = Router();
const prisma = new PrismaClient();

// Auxiliar para calcular horas trabalhadas
function calcularHorasTrabalhadas(ponto: any): number {
  if (!ponto.horaEntrada || !ponto.horaSaida) {
    return 0;
  }

  const entrada = new Date(ponto.horaEntrada);
  const saida = new Date(ponto.horaSaida);

  let totalMinutos = (saida.getTime() - entrada.getTime()) / (1000 * 60);

  // Se vendeu almoço, não desconta tempo de almoço
  if (ponto.vendeuAlmoco) {
    return Math.max(0, totalMinutos / 60); // Retorna em horas decimais
  }

  // Descontar tempo de almoço se houver e não vendeu
  if (ponto.horaSaidaAlmoco && ponto.horaRetornoAlmoco) {
    const saidaAlmoco = new Date(ponto.horaSaidaAlmoco);
    const retornoAlmoco = new Date(ponto.horaRetornoAlmoco);
    const minutosAlmoco = (retornoAlmoco.getTime() - saidaAlmoco.getTime()) / (1000 * 60);
    totalMinutos -= minutosAlmoco;
  }

  return Math.max(0, totalMinutos / 60); // Retorna em horas decimais
}

// Auxiliar para calcular atraso
function calcularAtraso(horaEntrada: Date, horaInicioExpediente: string = "08:00"): number {
  const [hora, minuto] = horaInicioExpediente.split(':');
  const inicioExpediente = new Date(horaEntrada);
  inicioExpediente.setHours(parseInt(hora), parseInt(minuto), 0, 0);

  if (horaEntrada <= inicioExpediente) {
    return 0;
  }

  return Math.floor((horaEntrada.getTime() - inicioExpediente.getTime()) / (1000 * 60));
}

// Auxiliar para calcular horas extras e saldo
function calcularSaldoEHorasExtras(totalHoras: number, jornadaDiaria: number = 8): { horasExtras: number; saldoHoras: number } {
  const saldoHoras = totalHoras - jornadaDiaria;
  const horasExtras = Math.max(0, saldoHoras);

  return { horasExtras, saldoHoras };
}

// Auxiliar para determinar próxima batida
function determinarProximaBatida(ponto: any): string {
  if (!ponto) return "entrada";
  if (!ponto.horaEntrada) return "entrada";

  // Se vendeu almoço, pula direto para saída
  if (ponto.vendeuAlmoco) {
    if (!ponto.horaSaida) return "saida";
    return "completo";
  }

  // Fluxo normal com almoço
  if (!ponto.horaSaidaAlmoco) return "saida_almoco";
  if (!ponto.horaRetornoAlmoco) return "retorno_almoco";
  if (!ponto.horaSaida) return "saida";
  return "completo";
}

// GET /api/ponto/funcionario/:funcionarioId/hoje
// Buscar ponto do funcionário para hoje
router.get('/funcionario/:funcionarioId/hoje', async (req, res) => {
  try {
    const { funcionarioId } = req.params;

    // Verificar se funcionarioId é um número ou string
    const funcionarioIdNumber = parseInt(funcionarioId);
    if (isNaN(funcionarioIdNumber)) {
      // Se não é um número, o sistema está usando IDs baseados em localStorage
      // Retornar dados default para funcionários de localStorage
      console.log(`[Ponto] Funcionário ${funcionarioId} não é numérico, usando dados default`);

      const proximaBatida = "entrada";

      res.json({
        success: true,
        data: {
          ponto: null,
          proximaBatida,
          podeRegistrar: proximaBatida !== "completo"
        }
      });
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const ponto = await prisma.ponto.findUnique({
      where: {
        funcionarioId_data: {
          funcionarioId: funcionarioIdNumber,
          data: hoje
        }
      },
      include: {
        funcionario: true
      }
    });

    const proximaBatida = determinarProximaBatida(ponto);

    res.json({
      success: true,
      data: {
        ponto,
        proximaBatida,
        podeRegistrar: proximaBatida !== "completo"
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ponto de hoje:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/ponto/registrar
// Registrar batida de ponto
router.post('/registrar', middlewareAuditoriaSimples('PONTO_CREATE'), async (req, res) => {
  try {
    const { funcionarioId, observacao } = req.body;

    // Verificar se funcionarioId é um número
    const funcionarioIdNumber = parseInt(funcionarioId);
    if (isNaN(funcionarioIdNumber)) {
      // Sistema está usando IDs baseados em localStorage
      console.log(`[Ponto] Tentativa de registrar ponto para funcionário não-numérico: ${funcionarioId}`);
      return res.status(400).json({
        success: false,
        error: 'Sistema de ponto não suporta funcionários baseados em localStorage ainda. Entre em contato com o administrador.'
      });
    }

    const agora = new Date();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Verificar se funcionário pode registrar ponto
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: funcionarioIdNumber }
    });

    if (!funcionario || !funcionario.registraPonto) {
      return res.status(403).json({
        success: false,
        error: 'Funcionário não autorizado a registrar ponto'
      });
    }

    // Buscar ou criar registro do dia
    let ponto = await prisma.ponto.findUnique({
      where: {
        funcionarioId_data: {
          funcionarioId: funcionarioIdNumber,
          data: hoje
        }
      }
    });

    const proximaBatida = determinarProximaBatida(ponto);

    if (proximaBatida === "completo") {
      return res.status(400).json({
        success: false,
        error: 'Ponto completo para hoje'
      });
    }

    // Preparar dados para update/create
    const dadosUpdate: any = { observacao };

    switch (proximaBatida) {
      case "entrada":
        dadosUpdate.horaEntrada = agora;
        break;
      case "saida_almoco":
        dadosUpdate.horaSaidaAlmoco = agora;
        break;
      case "retorno_almoco":
        dadosUpdate.horaRetornoAlmoco = agora;
        break;
      case "saida":
        dadosUpdate.horaSaida = agora;
        break;
    }

    // Criar ou atualizar registro
    if (ponto) {
      ponto = await prisma.ponto.update({
        where: { id: ponto.id },
        data: dadosUpdate
      });
    } else {
      ponto = await prisma.ponto.create({
        data: {
          funcionarioId: parseInt(funcionarioId),
          data: hoje,
          ...dadosUpdate
        }
      });
    }

    // Calcular estatísticas se for saída final
    if (proximaBatida === "saida") {
      const totalHoras = calcularHorasTrabalhadas(ponto);
      const atraso = ponto.horaEntrada ? calcularAtraso(ponto.horaEntrada) : 0;
      const horasExtras = calcularHorasExtras(totalHoras);

      ponto = await prisma.ponto.update({
        where: { id: ponto.id },
        data: {
          totalHoras,
          atraso,
          horasExtras
        }
      });
    }

    const novaBatida = determinarProximaBatida(ponto);

    res.json({
      success: true,
      data: {
        ponto,
        proximaBatida: novaBatida,
        podeRegistrar: novaBatida !== "completo",
        batidaRegistrada: proximaBatida
      }
    });

  } catch (error) {
    console.error('Erro ao registrar ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/ponto/funcionario/:funcionarioId
// Buscar histórico de pontos do funcionário
router.get('/funcionario/:funcionarioId', async (req, res) => {
  try {
    const { funcionarioId } = req.params;
    const { dataInicio, dataFim, page = 1, limit = 50 } = req.query;

    const where: any = {
      funcionarioId: parseInt(funcionarioId)
    };

    if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio as string),
        lte: new Date(dataFim as string)
      };
    }

    const [pontos, total] = await Promise.all([
      prisma.ponto.findMany({
        where,
        include: {
          funcionario: true
        },
        orderBy: { data: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string)
      }),
      prisma.ponto.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        pontos,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico de pontos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/ponto/todos
// Buscar pontos de todos os funcionários (somente admin)
router.get('/todos', async (req, res) => {
  try {
    const { dataInicio, dataFim, funcionarioId, status } = req.query;

    const where: any = {};

    if (funcionarioId) {
      where.funcionarioId = parseInt(funcionarioId as string);
    }

    if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio as string),
        lte: new Date(dataFim as string)
      };
    }

    let pontos = await prisma.ponto.findMany({
      where,
      include: {
        funcionario: true
      },
      orderBy: [{ data: 'desc' }, { funcionarioId: 'asc' }]
    });

    // Filtrar por status se especificado
    if (status && status !== 'todos') {
      pontos = pontos.filter(ponto => {
        switch (status) {
          case 'completo':
            return ponto.horaEntrada && ponto.horaSaida;
          case 'incompleto':
            return !ponto.horaEntrada || !ponto.horaSaida;
          case 'com_atraso':
            return ponto.atraso && ponto.atraso > 0;
          case 'com_extras':
            return ponto.horasExtras && ponto.horasExtras > 0;
          default:
            return true;
        }
      });
    }

    res.json({
      success: true,
      data: pontos
    });

  } catch (error) {
    console.error('Erro ao buscar pontos de todos funcionários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/ponto/:id
// Editar ponto (somente admin)
router.put('/:id', middlewareAuditoriaSimples('PONTO_UPDATE'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      horaEntrada, 
      horaSaidaAlmoco, 
      horaRetornoAlmoco, 
      horaSaida, 
      observacao,
      justificativaAtraso,
      usuarioEdicao 
    } = req.body;

    const dadosUpdate: any = {
      observacao,
      justificativaAtraso,
      editadoPorAdmin: true,
      usuarioEdicao,
      dataEdicao: new Date()
    };

    // Converter strings de hora para Date se fornecidas
    if (horaEntrada) {
      dadosUpdate.horaEntrada = new Date(horaEntrada);
    }
    if (horaSaidaAlmoco) {
      dadosUpdate.horaSaidaAlmoco = new Date(horaSaidaAlmoco);
    }
    if (horaRetornoAlmoco) {
      dadosUpdate.horaRetornoAlmoco = new Date(horaRetornoAlmoco);
    }
    if (horaSaida) {
      dadosUpdate.horaSaida = new Date(horaSaida);
    }

    let ponto = await prisma.ponto.update({
      where: { id: parseInt(id) },
      data: dadosUpdate
    });

    // Recalcular estatísticas
    const totalHoras = calcularHorasTrabalhadas(ponto);
    const atraso = ponto.horaEntrada ? calcularAtraso(ponto.horaEntrada) : 0;
    const horasExtras = calcularHorasExtras(totalHoras);

    ponto = await prisma.ponto.update({
      where: { id: parseInt(id) },
      data: {
        totalHoras,
        atraso,
        horasExtras
      }
    });

    res.json({
      success: true,
      data: ponto
    });

  } catch (error) {
    console.error('Erro ao editar ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/ponto/registrar-admin
// Registrar ponto para outro funcionário (somente admin)
router.post('/registrar-admin', middlewareAuditoriaSimples('PONTO_ADMIN_CREATE'), async (req, res) => {
  try {
    const { 
      funcionarioId, 
      data, 
      tipoBatida, 
      horario, 
      observacao,
      usuarioEdicao 
    } = req.body;

    const dataPonto = new Date(data);
    dataPonto.setHours(0, 0, 0, 0);

    // Buscar ou criar registro do dia
    let ponto = await prisma.ponto.findUnique({
      where: {
        funcionarioId_data: {
          funcionarioId: parseInt(funcionarioId),
          data: dataPonto
        }
      }
    });

    const dadosUpdate: any = {
      observacao,
      editadoPorAdmin: true,
      usuarioEdicao,
      dataEdicao: new Date()
    };

    // Definir horário baseado no tipo de batida
    const horarioBatida = new Date(horario);
    switch (tipoBatida) {
      case "entrada":
        dadosUpdate.horaEntrada = horarioBatida;
        break;
      case "saida_almoco":
        dadosUpdate.horaSaidaAlmoco = horarioBatida;
        break;
      case "retorno_almoco":
        dadosUpdate.horaRetornoAlmoco = horarioBatida;
        break;
      case "saida":
        dadosUpdate.horaSaida = horarioBatida;
        break;
    }

    // Criar ou atualizar registro
    if (ponto) {
      ponto = await prisma.ponto.update({
        where: { id: ponto.id },
        data: dadosUpdate
      });
    } else {
      ponto = await prisma.ponto.create({
        data: {
          funcionarioId: parseInt(funcionarioId),
          data: dataPonto,
          ...dadosUpdate
        }
      });
    }

    // Recalcular estatísticas
    const totalHoras = calcularHorasTrabalhadas(ponto);
    const atraso = ponto.horaEntrada ? calcularAtraso(ponto.horaEntrada) : 0;
    const horasExtras = calcularHorasExtras(totalHoras);

    ponto = await prisma.ponto.update({
      where: { id: ponto.id },
      data: {
        totalHoras,
        atraso,
        horasExtras
      }
    });

    res.json({
      success: true,
      data: ponto
    });

  } catch (error) {
    console.error('Erro ao registrar ponto administrativo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/ponto/relatorio/:funcionarioId
// Gerar relatório de ponto do funcionário
router.get('/relatorio/:funcionarioId', async (req, res) => {
  try {
    const { funcionarioId } = req.params;
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        success: false,
        error: 'Data de início e fim são obrigatórias'
      });
    }

    const funcionario = await prisma.funcionario.findUnique({
      where: { id: parseInt(funcionarioId) }
    });

    if (!funcionario) {
      return res.status(404).json({
        success: false,
        error: 'Funcionário não encontrado'
      });
    }

    const pontos = await prisma.ponto.findMany({
      where: {
        funcionarioId: parseInt(funcionarioId),
        data: {
          gte: new Date(dataInicio as string),
          lte: new Date(dataFim as string)
        }
      },
      orderBy: { data: 'asc' }
    });

    // Calcular estatísticas
    const estatisticas = {
      totalDiasTrabalhados: pontos.filter(p => p.horaEntrada && p.horaSaida).length,
      totalHorasTrabalhadas: pontos.reduce((acc, p) => acc + (p.totalHoras || 0), 0),
      totalHorasExtras: pontos.reduce((acc, p) => acc + (p.horasExtras || 0), 0),
      totalMinutosAtraso: pontos.reduce((acc, p) => acc + (p.atraso || 0), 0),
      diasComAtraso: pontos.filter(p => p.atraso && p.atraso > 0).length,
      diasComHorasExtras: pontos.filter(p => p.horasExtras && p.horasExtras > 0).length,
      mediaHorasDiarias: 0
    };

    if (estatisticas.totalDiasTrabalhados > 0) {
      estatisticas.mediaHorasDiarias = estatisticas.totalHorasTrabalhadas / estatisticas.totalDiasTrabalhados;
    }

    res.json({
      success: true,
      data: {
        funcionario,
        periodo: {
          dataInicio: new Date(dataInicio as string),
          dataFim: new Date(dataFim as string)
        },
        pontos,
        estatisticas
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/ponto/funcionarios-com-ponto
// Buscar funcionários que podem registrar ponto
router.get('/funcionarios-com-ponto', async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      where: {
        registraPonto: true
      },
      select: {
        id: true,
        nome: true,
        cargo: true,
        registraPonto: true
      },
      orderBy: { nome: 'asc' }
    });

    res.json({
      success: true,
      data: funcionarios
    });

  } catch (error) {
    console.error('Erro ao buscar funcionários com ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
