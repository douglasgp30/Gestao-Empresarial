// Gerenciador de carregamento para evitar múltiplas chamadas simultâneas
class LoadingManager {
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 5000; // 5 segundos

  async executeWithControl<T>(
    key: string,
    loader: () => Promise<T>,
    useCache: boolean = true
  ): Promise<T> {
    // Verificar cache primeiro
    if (useCache) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log(`[LoadingManager] Usando cache para: ${key}`);
        return cached.data;
      }
    }

    // Verificar se já existe uma requisição em andamento
    if (this.loadingPromises.has(key)) {
      console.log(`[LoadingManager] Aguardando requisição em andamento: ${key}`);
      return this.loadingPromises.get(key)!;
    }

    // Criar nova requisição
    console.log(`[LoadingManager] Iniciando nova requisição: ${key}`);
    const promise = loader()
      .then((result) => {
        // Armazenar no cache
        if (useCache) {
          this.cache.set(key, { data: result, timestamp: Date.now() });
        }
        return result;
      })
      .finally(() => {
        // Remover da lista de promises em andamento
        this.loadingPromises.delete(key);
      });

    this.loadingPromises.set(key, promise);
    return promise;
  }

  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  isLoading(key: string): boolean {
    return this.loadingPromises.has(key);
  }
}

export const loadingManager = new LoadingManager();
