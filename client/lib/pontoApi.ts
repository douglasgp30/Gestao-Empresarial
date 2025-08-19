import { apiService } from './apiService';
import type {
  Ponto,
  RegistroPonto,
  PontoDoFuncionario,
  FiltrosPonto,
  RelatorioPonto,
  Funcionario
} from '../../shared/types';

export interface RegistrarPontoRequest {
  funcionarioId: string;
  observacao?: string;
}

export interface RegistrarPontoAdminRequest {
  funcionarioId: string;
  data: string; // YYYY-MM-DD
  tipoBatida: "entrada" | "saida_almoco" | "retorno_almoco" | "saida";
  horario: string; // ISO string
  observacao?: string;
  usuarioEdicao: string;
}

export interface EditarPontoRequest {
  horaEntrada?: string;
  horaSaidaAlmoco?: string;
  horaRetornoAlmoco?: string;
  horaSaida?: string;
  observacao?: string;
  justificativaAtraso?: string;
  usuarioEdicao: string;
}

export interface BuscarPontosRequest {
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

export interface BuscarTodosPontosRequest {
  dataInicio?: string;
  dataFim?: string;
  funcionarioId?: string;
  status?: "todos" | "completo" | "incompleto" | "com_atraso" | "com_extras";
}

class PontoApiService {
  // Buscar ponto do funcionário para hoje
  async buscarPontoHoje(funcionarioId: string): Promise<PontoDoFuncionario> {
    try {
      const response = await apiService.get(`/api/ponto/funcionario/${funcionarioId}/hoje`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ponto de hoje:', error);
      throw error;
    }
  }

  // Registrar batida de ponto
  async registrarPonto(dados: RegistrarPontoRequest): Promise<PontoDoFuncionario> {
    try {
      const response = await apiService.post('/api/ponto/registrar', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      throw error;
    }
  }

  // Buscar histórico de pontos do funcionário
  async buscarHistoricoPonto(
    funcionarioId: string, 
    filtros: BuscarPontosRequest = {}
  ): Promise<{ pontos: Ponto[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros.page) params.append('page', filtros.page.toString());
      if (filtros.limit) params.append('limit', filtros.limit.toString());

      const response = await apiService.get(
        `/api/ponto/funcionario/${funcionarioId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de ponto:', error);
      throw error;
    }
  }

  // Buscar pontos de todos os funcionários (admin)
  async buscarTodosPontos(filtros: BuscarTodosPontosRequest = {}): Promise<Ponto[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros.funcionarioId) params.append('funcionarioId', filtros.funcionarioId);
      if (filtros.status) params.append('status', filtros.status);

      const response = await apiService.get(`/api/ponto/todos?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar todos os pontos:', error);
      throw error;
    }
  }

  // Editar ponto (admin)
  async editarPonto(pontoId: string, dados: EditarPontoRequest): Promise<Ponto> {
    try {
      const response = await apiService.put(`/api/ponto/${pontoId}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao editar ponto:', error);
      throw error;
    }
  }

  // Registrar ponto para outro funcionário (admin)
  async registrarPontoAdmin(dados: RegistrarPontoAdminRequest): Promise<Ponto> {
    try {
      const response = await apiService.post('/api/ponto/registrar-admin', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar ponto administrativo:', error);
      throw error;
    }
  }

  // Gerar relatório de ponto
  async gerarRelatorio(funcionarioId: string, dataInicio: string, dataFim: string): Promise<RelatorioPonto> {
    try {
      const params = new URLSearchParams({
        dataInicio,
        dataFim
      });

      const response = await apiService.get(
        `/api/ponto/relatorio/${funcionarioId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de ponto:', error);
      throw error;
    }
  }

  // Buscar funcionários que podem registrar ponto
  async buscarFuncionariosComPonto(): Promise<Funcionario[]> {
    try {
      const response = await apiService.get('/api/ponto/funcionarios-com-ponto');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar funcionários com ponto:', error);
      throw error;
    }
  }

  // Utilitários para formatação de horários
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

  // Verificar se funcionário pode registrar ponto hoje
  podeRegistrarPonto(proximaBatida: string): boolean {
    return proximaBatida !== "completo";
  }

  // Obter texto da próxima batida
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

  // Verificar se ponto está completo
  isPontoCompleto(ponto?: Ponto): boolean {
    if (!ponto) return false;
    return !!(ponto.horaEntrada && ponto.horaSaida);
  }

  // Verificar se funcionário está em horário de trabalho
  estaEmHorarioTrabalho(ponto?: Ponto): boolean {
    if (!ponto) return false;
    if (!ponto.horaEntrada) return false;
    if (ponto.horaSaida) return false; // Já saiu
    
    return true; // Entrou mas ainda não saiu
  }
}

export const pontoApi = new PontoApiService();
