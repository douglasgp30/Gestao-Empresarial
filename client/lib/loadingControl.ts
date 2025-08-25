// Sistema de controle global para evitar loops de carregamento

class LoadingController {
  private activeLoads = new Set<string>();
  private loadTimes = new Map<string, number>();
  private readonly THROTTLE_TIME = 2000; // 2 segundos entre carregamentos do mesmo tipo

  canLoad(loadType: string): boolean {
    // Se já está carregando este tipo, não permitir
    if (this.activeLoads.has(loadType)) {
      console.log(`🚫 [LoadingControl] ${loadType} já está carregando`);
      return false;
    }

    // Verificar throttle - não permitir carregamento muito frequente
    const lastLoadTime = this.loadTimes.get(loadType);
    const now = Date.now();

    if (lastLoadTime && now - lastLoadTime < this.THROTTLE_TIME) {
      console.log(
        `⏰ [LoadingControl] ${loadType} throttled por ${this.THROTTLE_TIME - (now - lastLoadTime)}ms`,
      );
      return false;
    }

    return true;
  }

  startLoad(loadType: string): boolean {
    if (!this.canLoad(loadType)) {
      return false;
    }

    this.activeLoads.add(loadType);
    this.loadTimes.set(loadType, Date.now());
    console.log(`🔄 [LoadingControl] Iniciando carregamento: ${loadType}`);
    return true;
  }

  finishLoad(loadType: string): void {
    this.activeLoads.delete(loadType);
    console.log(`✅ [LoadingControl] Carregamento concluído: ${loadType}`);
  }

  isLoading(loadType: string): boolean {
    return this.activeLoads.has(loadType);
  }

  reset(): void {
    this.activeLoads.clear();
    this.loadTimes.clear();
    console.log(`🔄 [LoadingControl] Reset completo`);
  }

  getActiveLoads(): string[] {
    return Array.from(this.activeLoads);
  }
}

// Instância singleton
export const loadingController = new LoadingController();

// Função helper para usar com useEffect
export function useLoadingControl(
  loadType: string,
  loadFunction: () => Promise<void>,
) {
  return async () => {
    if (!loadingController.startLoad(loadType)) {
      return; // Não carregar se já está carregando ou em throttle
    }

    try {
      await loadFunction();
    } catch (error) {
      console.error(`❌ [LoadingControl] Erro em ${loadType}:`, error);
    } finally {
      loadingController.finishLoad(loadType);
    }
  };
}

// Tipos de carregamento padronizados
export const LoadTypes = {
  CAIXA_LANCAMENTOS: "caixa_lancamentos",
  CAIXA_CAMPANHAS: "caixa_campanhas",
  CLIENTES: "clientes",
  FUNCIONARIOS: "funcionarios",
  CAIXA_INICIAL: "caixa_inicial",
} as const;
