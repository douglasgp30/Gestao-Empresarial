// Sistema de cache específico para APIs para reduzir chamadas repetitivas
class ApiCache {
  private cache: Map<string, { data: any; timestamp: number; expiry: number }> =
    new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  // Tempo de cache por tipo de dados (em ms)
  private readonly cacheTimes = {
    entidades: 30000, // 30 segundos para entidades
    lancamentos: 10000, // 10 segundos para lançamentos
    default: 15000, // 15 segundos padrão
  };

  private getCacheTime(key: string): number {
    if (
      key.includes("entidades") ||
      key.includes("funcionarios") ||
      key.includes("formas-pagamento") ||
      key.includes("localizacoes")
    ) {
      return this.cacheTimes.entidades;
    }
    if (key.includes("lancamentos")) {
      return this.cacheTimes.lancamentos;
    }
    return this.cacheTimes.default;
  }

  // Verificar se existe cache válido
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 [ApiCache] Cache hit para ${key}`);
    return cached.data;
  }

  // Salvar no cache
  set(key: string, data: any): void {
    const expiry = this.getCacheTime(key);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
    console.log(
      `�� [ApiCache] Cache salvo para ${key} (expira em ${expiry}ms)`,
    );
  }

  // Verificar se há requisição pendente
  getPendingRequest(key: string): Promise<any> | null {
    return this.pendingRequests.get(key) || null;
  }

  // Marcar requisição como pendente
  setPendingRequest(key: string, promise: Promise<any>): void {
    this.pendingRequests.set(key, promise);

    // Limpar quando finalizar
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  // Executar com cache
  async executeWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    forceRefresh = false,
  ): Promise<T> {
    // Verificar cache primeiro
    if (!forceRefresh) {
      const cached = this.get(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Verificar se já há requisição pendente
    const pending = this.getPendingRequest(key);
    if (pending) {
      console.log(`⏳ [ApiCache] Aguardando requisição pendente para ${key}`);
      return pending;
    }

    // Fazer nova requisição
    console.log(`🔄 [ApiCache] Nova requisição para ${key}`);
    const promise = fetcher();
    this.setPendingRequest(key, promise);

    try {
      const result = await promise;
      this.set(key, result);
      return result;
    } catch (error) {
      console.error(`❌ [ApiCache] Erro na requisição ${key}:`, error);
      throw error;
    }
  }

  // Limpar cache expirado
  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.timestamp + cached.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Limpar tudo
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Invalidar cache específico
  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new ApiCache();

// Limpar cache expirado a cada minuto
if (typeof window !== "undefined") {
  setInterval(() => {
    apiCache.cleanup();
  }, 60000);
}
