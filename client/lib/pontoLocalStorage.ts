import type {
  Ponto,
  PontoDoFuncionario,
  RelatorioPonto,
  Funcionario
} from '../../shared/types';

// Chave para armazenar pontos no localStorage
const PONTOS_STORAGE_KEY = 'pontos';

// Auxiliares para trabalhar com localStorage
function salvarPontos(pontos: Ponto[]): void {
  try {
    localStorage.setItem(PONTOS_STORAGE_KEY, JSON.stringify(pontos));
  } catch (error) {
    console.error('Erro ao salvar pontos no localStorage:', error);
  }
}

function carregarPontos(): Ponto[] {
  try {
    const pontos = localStorage.getItem(PONTOS_STORAGE_KEY);
    if (!pontos) return [];

    const pontosParseados = JSON.parse(pontos);

    // Converter strings de data de volta para Date objects
    return pontosParseados.map((ponto: any) => ({
      ...ponto,
      data: ponto.data ? new Date(ponto.data) : ponto.data,
      horaEntrada: ponto.horaEntrada ? new Date(ponto.horaEntrada) : ponto.horaEntrada,
      horaSaidaAlmoco: ponto.horaSaidaAlmoco ? new Date(ponto.horaSaidaAlmoco) : ponto.horaSaidaAlmoco,
      horaRetornoAlmoco: ponto.horaRetornoAlmoco ? new Date(ponto.horaRetornoAlmoco) : ponto.horaRetornoAlmoco,
      horaSaida: ponto.horaSaida ? new Date(ponto.horaSaida) : ponto.horaSaida,
      dataEdicao: ponto.dataEdicao ? new Date(ponto.dataEdicao) : ponto.dataEdicao,
      dataCriacao: ponto.dataCriacao ? new Date(ponto.dataCriacao) : ponto.dataCriacao,
    }));
  } catch (error) {
    console.error('Erro ao carregar pontos do localStorage:', error);
    return [];
  }
}

function gerarId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Funções para cálculos de ponto
function calcularHorasTrabalhadas(ponto: Ponto): number {
  if (!ponto.horaEntrada || !ponto.horaSaida) {
    return 0;
  }

  const entrada = new Date(ponto.horaEntrada);
  const saida = new Date(ponto.horaSaida);
  
  let totalMinutos = (saida.getTime() - entrada.getTime()) / (1000 * 60);

  // Descontar tempo de almoço se houver
  if (ponto.horaSaidaAlmoco && ponto.horaRetornoAlmoco) {
    const saidaAlmoco = new Date(ponto.horaSaidaAlmoco);
    const retornoAlmoco = new Date(ponto.horaRetornoAlmoco);
    const minutosAlmoco = (retornoAlmoco.getTime() - saidaAlmoco.getTime()) / (1000 * 60);
    totalMinutos -= minutosAlmoco;
  }

  return Math.max(0, totalMinutos / 60); // Retorna em horas decimais
}

function calcularAtraso(horaEntrada: Date | string, horaInicioExpediente: string = "08:00"): number {
  // Garantir que horaEntrada é um Date object
  const entrada = horaEntrada instanceof Date ? horaEntrada : new Date(horaEntrada);

  const [hora, minuto] = horaInicioExpediente.split(':');
  const inicioExpediente = new Date(entrada);
  inicioExpediente.setHours(parseInt(hora), parseInt(minuto), 0, 0);

  if (entrada <= inicioExpediente) {
    return 0;
  }

  return Math.floor((entrada.getTime() - inicioExpediente.getTime()) / (1000 * 60));
}

function calcularHorasExtras(totalHoras: number, cargaHorariaDiaria: number = 8): number {
  return Math.max(0, totalHoras - cargaHorariaDiaria);
}

function determinarProximaBatida(ponto?: Ponto): string {
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

export class PontoLocalStorageService {
  // Buscar ponto do funcionário para hoje
  async buscarPontoHoje(funcionarioId: string): Promise<PontoDoFuncionario> {
    const pontos = carregarPontos();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const ponto = pontos.find(p => 
      p.funcionarioId === funcionarioId && 
      new Date(p.data).getTime() === hoje.getTime()
    );

    const proximaBatida = determinarProximaBatida(ponto);

    return {
      ponto,
      proximaBatida,
      podeRegistrar: proximaBatida !== "completo"
    };
  }

  // Registrar batida de ponto
  async registrarPonto(funcionarioId: string, observacao?: string): Promise<PontoDoFuncionario> {
    const pontos = carregarPontos();
    const agora = new Date();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Buscar ponto existente para hoje
    let pontoIndex = pontos.findIndex(p => 
      p.funcionarioId === funcionarioId && 
      new Date(p.data).getTime() === hoje.getTime()
    );

    let ponto: Ponto;

    if (pontoIndex >= 0) {
      ponto = pontos[pontoIndex];
    } else {
      // Criar novo ponto
      ponto = {
        id: gerarId(),
        funcionarioId,
        data: hoje,
        observacao,
        dataCriacao: agora
      };
      pontos.push(ponto);
      pontoIndex = pontos.length - 1;
    }

    const proximaBatida = determinarProximaBatida(ponto);

    if (proximaBatida === "completo") {
      throw new Error('Ponto completo para hoje');
    }

    // Atualizar ponto com nova batida
    switch (proximaBatida) {
      case "entrada":
        ponto.horaEntrada = agora;
        break;
      case "saida_almoco":
        ponto.horaSaidaAlmoco = agora;
        break;
      case "retorno_almoco":
        ponto.horaRetornoAlmoco = agora;
        break;
      case "saida":
        ponto.horaSaida = agora;
        break;
    }

    // Se foi registrada a saída, calcular estatísticas
    if (proximaBatida === "saida") {
      ponto.totalHoras = calcularHorasTrabalhadas(ponto);
      ponto.atraso = ponto.horaEntrada ? calcularAtraso(ponto.horaEntrada) : 0;
      ponto.horasExtras = calcularHorasExtras(ponto.totalHoras || 0);
    }

    // Atualizar observação se fornecida
    if (observacao) {
      ponto.observacao = observacao;
    }

    // Salvar alterações
    pontos[pontoIndex] = ponto;
    salvarPontos(pontos);

    const novaBatida = determinarProximaBatida(ponto);

    return {
      ponto,
      proximaBatida: novaBatida,
      podeRegistrar: novaBatida !== "completo",
      batidaRegistrada: proximaBatida
    };
  }

  // Buscar histórico de pontos do funcionário
  async buscarHistoricoPonto(
    funcionarioId: string, 
    dataInicio: Date, 
    dataFim: Date
  ): Promise<Ponto[]> {
    const pontos = carregarPontos();
    
    return pontos.filter(p => {
      if (p.funcionarioId !== funcionarioId) return false;

      const dataPonto = p.data instanceof Date ? p.data : new Date(p.data);
      return dataPonto >= dataInicio && dataPonto <= dataFim;
    }).sort((a, b) => {
      const dataA = a.data instanceof Date ? a.data : new Date(a.data);
      const dataB = b.data instanceof Date ? b.data : new Date(b.data);
      return dataB.getTime() - dataA.getTime();
    });
  }

  // Buscar funcionários que podem registrar ponto
  async buscarFuncionariosComPonto(): Promise<Funcionario[]> {
    try {
      const funcionariosStorage = localStorage.getItem('funcionarios');
      if (!funcionariosStorage) return [];

      const funcionarios = JSON.parse(funcionariosStorage);
      return funcionarios.filter((f: Funcionario) => f.registraPonto && f.ativo);
    } catch (error) {
      console.error('Erro ao buscar funcionários com ponto:', error);
      return [];
    }
  }

  // Gerar relatório de ponto
  async gerarRelatorio(
    funcionarioId: string, 
    dataInicio: Date, 
    dataFim: Date
  ): Promise<RelatorioPonto> {
    // Buscar funcionário
    const funcionariosStorage = localStorage.getItem('funcionarios');
    const funcionarios = funcionariosStorage ? JSON.parse(funcionariosStorage) : [];
    const funcionario = funcionarios.find((f: Funcionario) => f.id === funcionarioId);

    if (!funcionario) {
      throw new Error('Funcionário não encontrado');
    }

    // Buscar pontos do período
    const pontos = await this.buscarHistoricoPonto(funcionarioId, dataInicio, dataFim);

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

    return {
      funcionario,
      periodo: { dataInicio, dataFim },
      pontos,
      estatisticas
    };
  }

  // Buscar todos os pontos (admin)
  async buscarTodosPontos(
    dataInicio?: Date, 
    dataFim?: Date, 
    funcionarioId?: string
  ): Promise<Ponto[]> {
    const pontos = carregarPontos();
    
    return pontos.filter(p => {
      // Filtrar por funcionário se especificado
      if (funcionarioId && p.funcionarioId !== funcionarioId) {
        return false;
      }
      
      // Filtrar por período se especificado
      if (dataInicio && dataFim) {
        const dataPonto = p.data instanceof Date ? p.data : new Date(p.data);
        if (dataPonto < dataInicio || dataPonto > dataFim) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const dataA = a.data instanceof Date ? a.data : new Date(a.data);
      const dataB = b.data instanceof Date ? b.data : new Date(b.data);
      return dataB.getTime() - dataA.getTime();
    });
  }

  // Editar ponto (admin)
  async editarPonto(pontoId: string, dados: Partial<Ponto>): Promise<Ponto> {
    const pontos = carregarPontos();
    const pontoIndex = pontos.findIndex(p => p.id === pontoId);
    
    if (pontoIndex === -1) {
      throw new Error('Ponto não encontrado');
    }

    // Atualizar ponto
    const ponto = { ...pontos[pontoIndex], ...dados };
    
    // Recalcular estatísticas se necessário
    if (ponto.horaEntrada && ponto.horaSaida) {
      ponto.totalHoras = calcularHorasTrabalhadas(ponto);
      ponto.atraso = calcularAtraso(ponto.horaEntrada);
      ponto.horasExtras = calcularHorasExtras(ponto.totalHoras);
    }

    pontos[pontoIndex] = ponto;
    salvarPontos(pontos);
    
    return ponto;
  }

  // Utilitários para formatação (compatibilidade com pontoApi)
  formatarHorario(data: Date | string): string {
    if (!data) return '--:--';
    
    const date = typeof data === 'string' ? new Date(data) : data;
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatarData(data: Date | string): string {
    if (!data) return '--/--/----';
    
    const date = typeof data === 'string' ? new Date(data) : data;
    return date.toLocaleDateString('pt-BR');
  }

  formatarDuracaoHoras(horas: number): string {
    if (!horas || horas === 0) return '0h 0min';
    
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    
    return `${horasInteiras}h ${minutos}min`;
  }

  formatarMinutos(minutos: number): string {
    if (!minutos || minutos === 0) return '0min';
    
    const horasInteiras = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    if (horasInteiras === 0) {
      return `${minutosRestantes}min`;
    }
    
    return `${horasInteiras}h ${minutosRestantes}min`;
  }

  obterTextoBatida(proximaBatida: string): string {
    switch (proximaBatida) {
      case "entrada":
        return "Registrar Entrada";
      case "saida_almoco":
        return "Registrar Saída para Almoço";
      case "retorno_almoco":
        return "Registrar Retorno do Almoço";
      case "saida":
        return "Registrar Saída";
      case "completo":
        return "Ponto Completo";
      default:
        return "Registrar Ponto";
    }
  }
}

export const pontoLocalStorage = new PontoLocalStorageService();
