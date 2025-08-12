// Serviço para comunicação com a API

const API_BASE = '/api';

// Tipos para as respostas da API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
}

// Função utilitária para fazer requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    console.log(`[ApiService] Fazendo requisição para: ${API_BASE}${endpoint}`);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`[ApiService] Resposta recebida: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ApiService] Erro HTTP ${response.status}:`, errorData);
      return { error: errorData.error || `Erro HTTP ${response.status}`, details: errorData.details };
    }

    // Status 204 (No Content) não tem corpo de resposta
    if (response.status === 204) {
      console.log(`[ApiService] Resposta 204 - No Content`);
      return { data: null };
    }

    const data = await response.json();
    console.log(`[ApiService] Dados recebidos:`, data);
    return { data };
  } catch (error) {
    console.error('[ApiService] Erro na comunicação:', error);

    // Verificar se é um erro de rede
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return { error: 'Servidor não disponível. Verifique se o backend está rodando.' };
    }

    return { error: 'Erro de comunicação com o servidor' };
  }
}

// === CAMPANHAS ===
export const campanhasApi = {
  listar: () => apiRequest<any[]>('/campanhas'),
  criar: (campanha: any) => apiRequest<any>('/campanhas', {
    method: 'POST',
    body: JSON.stringify(campanha)
  }),
  atualizar: (id: number, campanha: any) => apiRequest<any>(`/campanhas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(campanha)
  }),
  excluir: (id: number) => apiRequest<void>(`/campanhas/${id}`, {
    method: 'DELETE'
  })
};

// === DESCRIÇÕES ===
export const descricoesApi = {
  listar: (tipo?: string) => {
    const query = tipo ? `?tipo=${tipo}` : '';
    return apiRequest<any[]>(`/descricoes${query}`);
  },
  criar: (descricao: any) => apiRequest<any>('/descricoes', {
    method: 'POST',
    body: JSON.stringify(descricao)
  }),
  atualizar: (id: number, descricao: any) => apiRequest<any>(`/descricoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(descricao)
  }),
  excluir: (id: number) => apiRequest<void>(`/descricoes/${id}`, {
    method: 'DELETE'
  })
};

// === FORMAS DE PAGAMENTO ===
export const formasPagamentoApi = {
  listar: (ativas?: boolean) => {
    const query = ativas !== undefined ? `?ativas=${ativas}` : '';
    return apiRequest<any[]>(`/formas-pagamento${query}`);
  },
  criar: (forma: any) => apiRequest<any>('/formas-pagamento', {
    method: 'POST',
    body: JSON.stringify(forma)
  }),
  atualizar: (id: number, forma: any) => apiRequest<any>(`/formas-pagamento/${id}`, {
    method: 'PUT',
    body: JSON.stringify(forma)
  }),
  excluir: (id: number) => apiRequest<void>(`/formas-pagamento/${id}`, {
    method: 'DELETE'
  })
};

// === FUNCIONÁRIOS/TÉCNICOS ===
export const funcionariosApi = {
  listar: () => apiRequest<any[]>('/funcionarios'),
  listarTecnicos: () => apiRequest<any[]>('/tecnicos'),
  criar: (funcionario: any) => apiRequest<any>('/funcionarios', {
    method: 'POST',
    body: JSON.stringify(funcionario)
  }),
  atualizar: (id: number, funcionario: any) => apiRequest<any>(`/funcionarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(funcionario)
  }),
  excluir: (id: number) => apiRequest<void>(`/funcionarios/${id}`, {
    method: 'DELETE'
  })
};

// === SETORES ===
export const setoresApi = {
  listar: (ativos?: boolean, cidade?: string) => {
    const params = new URLSearchParams();
    if (ativos !== undefined) params.append('ativos', String(ativos));
    if (cidade) params.append('cidade', cidade);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<any[]>(`/setores${query}`);
  },
  listarCidades: () => apiRequest<string[]>('/cidades'),
  criar: (setor: any) => apiRequest<any>('/setores', {
    method: 'POST',
    body: JSON.stringify(setor)
  }),
  atualizar: (id: number, setor: any) => apiRequest<any>(`/setores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(setor)
  }),
  excluir: (id: number) => apiRequest<void>(`/setores/${id}`, {
    method: 'DELETE'
  })
};

// === CAIXA ===
export const caixaApi = {
  listarLancamentos: (filtros?: {
    dataInicio?: string;
    dataFim?: string;
    tipo?: string;
    funcionarioId?: number;
    setorId?: number;
    campanhaId?: number;
    formaPagamentoId?: number;
  }) => {
    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<any[]>(`/caixa/lancamentos${query}`);
  },
  
  obterTotais: (dataInicio?: string, dataFim?: string) => {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<any>(`/caixa/totais${query}`);
  },
  
  criarLancamento: (lancamento: any) => apiRequest<any>('/caixa/lancamentos', {
    method: 'POST',
    body: JSON.stringify(lancamento)
  }),
  
  atualizarLancamento: (id: number, lancamento: any) => apiRequest<any>(`/caixa/lancamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(lancamento)
  }),
  
  excluirLancamento: (id: number) => apiRequest<void>(`/caixa/lancamentos/${id}`, {
    method: 'DELETE'
  })
};
