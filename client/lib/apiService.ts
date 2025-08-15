// Serviço para comunicação com a API

const API_BASE = "/api";

// Tipos para as respostas da API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
}

// Função utilitária para fazer requests com retry
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 2,
): Promise<ApiResponse<T>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(
        `[ApiService] Fazendo requisição para: ${API_BASE}${endpoint} (tentativa ${attempt + 1})`,
      );

      // Adicionar timeout para evitar travamentos - aumentado para 30s durante hot reload
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout para evitar falhas durante reload

      // Tentar usar fetch nativo se FullStory interceptou
      const nativeFetch = window.fetch;
      let fetchToUse = nativeFetch;

      // Verificar se fetch foi modificado (possivelmente pelo FullStory)
      if (nativeFetch.toString().includes('fullstory') || nativeFetch.toString().includes('fs.js')) {
        console.log(`[ApiService] Fetch interceptado detectado, tentando abordagem alternativa...`);
      }

      const response = await fetchToUse(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      console.log(
        `[ApiService] Resposta recebida: ${response.status} ${response.statusText}`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[ApiService] Erro HTTP ${response.status}:`, errorData);
        return {
          error: errorData.error || `Erro HTTP ${response.status}`,
          details: errorData.details,
        };
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
      console.error(
        `[ApiService] Erro na comunicação (tentativa ${attempt + 1}):`,
        error,
      );

      // Verificar se é um erro relacionado ao FullStory
      const isFullStoryError = error instanceof TypeError &&
        (error.stack?.includes("fullstory.com") ||
         error.stack?.includes("fs.js") ||
         error.message.includes("Failed to fetch"));

      // Se é erro do FullStory e não é a última tentativa, aguardar e tentar novamente
      if (isFullStoryError && attempt < retries) {
        console.log(`[ApiService] Erro de third-party detectado, aguardando antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1))); // Delay progressivo
        continue;
      }

      // Se é a última tentativa, retornar o erro
      if (attempt === retries) {
        if (isFullStoryError) {
          return {
            error: "Problema de conectividade. Recarregue a página se o problema persistir.",
          };
        }

        if (error.name === "AbortError") {
          return {
            error: "Requisição expirou. Tente novamente.",
          };
        }

        return { error: "Erro de comunicação com o servidor" };
      }

      // Aguardar antes de tentar novamente (backoff exponencial aumentado)
      const delay = Math.pow(2, attempt) * 2000; // Aumentado para 2s, 4s, 8s...
      console.log(
        `[ApiService] Aguardando ${delay}ms antes da próxima tentativa...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { error: "Erro de comunicação com o servidor" };
}

// === CAMPANHAS ===
export const campanhasApi = {
  listar: () => apiRequest<any[]>("/campanhas"),
  criar: (campanha: any) =>
    apiRequest<any>("/campanhas", {
      method: "POST",
      body: JSON.stringify(campanha),
    }),
  atualizar: (id: number, campanha: any) =>
    apiRequest<any>(`/campanhas/${id}`, {
      method: "PUT",
      body: JSON.stringify(campanha),
    }),
  excluir: (id: number) =>
    apiRequest<void>(`/campanhas/${id}`, {
      method: "DELETE",
    }),
};

// === DESCRIÇÕES ===
export const descricoesApi = {
  listar: (tipo?: string) => {
    const query = tipo ? `?tipo=${tipo}` : "";
    return apiRequest<any[]>(`/descricoes${query}`);
  },
  criar: (descricao: any) =>
    apiRequest<any>("/descricoes", {
      method: "POST",
      body: JSON.stringify(descricao),
    }),
  atualizar: (id: number, descricao: any) =>
    apiRequest<any>(`/descricoes/${id}`, {
      method: "PUT",
      body: JSON.stringify(descricao),
    }),
  excluir: (id: number) =>
    apiRequest<void>(`/descricoes/${id}`, {
      method: "DELETE",
    }),
};

// === FORMAS DE PAGAMENTO ===
export const formasPagamentoApi = {
  listar: (ativas?: boolean) => {
    const query = ativas !== undefined ? `?ativas=${ativas}` : "";
    return apiRequest<any[]>(`/formas-pagamento${query}`);
  },
  criar: (forma: any) =>
    apiRequest<any>("/formas-pagamento", {
      method: "POST",
      body: JSON.stringify(forma),
    }),
  atualizar: (id: number, forma: any) =>
    apiRequest<any>(`/formas-pagamento/${id}`, {
      method: "PUT",
      body: JSON.stringify(forma),
    }),
  excluir: (id: number) =>
    apiRequest<void>(`/formas-pagamento/${id}`, {
      method: "DELETE",
    }),
};

// === FUNCIONÁRIOS/TÉCNICOS ===
export const funcionariosApi = {
  listar: () => apiRequest<any[]>("/funcionarios"),
  listarTecnicos: () => apiRequest<any[]>("/tecnicos"),
  criar: (funcionario: any) =>
    apiRequest<any>("/funcionarios", {
      method: "POST",
      body: JSON.stringify(funcionario),
    }),
  atualizar: (id: number, funcionario: any) =>
    apiRequest<any>(`/funcionarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(funcionario),
    }),
  excluir: (id: number) =>
    apiRequest<void>(`/funcionarios/${id}`, {
      method: "DELETE",
    }),
};

// === SETORES ===
export const setoresApi = {
  listar: (ativos?: boolean, cidade?: string) => {
    const params = new URLSearchParams();
    if (ativos !== undefined) params.append("ativos", String(ativos));
    if (cidade) params.append("cidade", cidade);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any[]>(`/setores${query}`);
  },
  listarCidades: () => apiRequest<string[]>("/cidades"),
  criar: (setor: any) =>
    apiRequest<any>("/setores", {
      method: "POST",
      body: JSON.stringify(setor),
    }),
  atualizar: (id: number, setor: any) =>
    apiRequest<any>(`/setores/${id}`, {
      method: "PUT",
      body: JSON.stringify(setor),
    }),
  excluir: (id: number) =>
    apiRequest<void>(`/setores/${id}`, {
      method: "DELETE",
    }),
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
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any[]>(`/caixa/lancamentos${query}`);
  },

  obterTotais: (dataInicio?: string, dataFim?: string) => {
    const params = new URLSearchParams();
    if (dataInicio) params.append("dataInicio", dataInicio);
    if (dataFim) params.append("dataFim", dataFim);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any>(`/caixa/totais${query}`);
  },

  criarLancamento: (lancamento: any) =>
    apiRequest<any>("/caixa/lancamentos", {
      method: "POST",
      body: JSON.stringify(lancamento),
    }),

  atualizarLancamento: (id: number, lancamento: any) =>
    apiRequest<any>(`/caixa/lancamentos/${id}`, {
      method: "PUT",
      body: JSON.stringify(lancamento),
    }),

  excluirLancamento: (id: number) =>
    apiRequest<void>(`/caixa/lancamentos/${id}`, {
      method: "DELETE",
    }),
};

// === CLIENTES ===
export const clientesApi = {
  listar: () => apiRequest<any[]>("/clientes"),
  criar: (cliente: any) =>
    apiRequest<any>("/clientes", {
      method: "POST",
      body: JSON.stringify(cliente),
    }),
  atualizar: (id: number, cliente: any) =>
    apiRequest<any>(`/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(cliente),
    }),
  excluir: (id: number) =>
    apiRequest<void>(`/clientes/${id}`, {
      method: "DELETE",
    }),
};

// === CONTAS ===
export const contasApi = {
  listar: (filtros?: any) => {
    const params = new URLSearchParams();
    if (filtros) {
      Object.keys(filtros).forEach((key) => {
        if (filtros[key] !== undefined && filtros[key] !== null) {
          params.append(key, filtros[key].toString());
        }
      });
    }
    const queryString = params.toString();
    return apiRequest<any[]>(`/contas${queryString ? `?${queryString}` : ""}`);
  },
  criar: (dados: any) =>
    apiRequest("/contas", {
      method: "POST",
      body: JSON.stringify(dados),
    }),
  atualizar: (id: number, dados: any) =>
    apiRequest(`/contas/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    }),
  excluir: (id: number) =>
    apiRequest(`/contas/${id}`, {
      method: "DELETE",
    }),
  marcarComoPaga: (id: number) =>
    apiRequest(`/contas/${id}/pagar`, {
      method: "PATCH",
    }),
  obterTotais: (filtros?: any) => {
    const params = new URLSearchParams();
    if (filtros) {
      Object.keys(filtros).forEach((key) => {
        if (filtros[key] !== undefined && filtros[key] !== null) {
          params.append(key, filtros[key].toString());
        }
      });
    }
    const queryString = params.toString();
    return apiRequest<any>(
      `/contas/totais${queryString ? `?${queryString}` : ""}`,
    );
  },
};

// === GENERAL API SERVICE ===
// Main apiService object for general HTTP methods
export const apiService = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),
  patch: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, {
      method: "DELETE",
    }),
};
