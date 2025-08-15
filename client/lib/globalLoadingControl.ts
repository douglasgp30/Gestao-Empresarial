// Controle global de carregamento para evitar sobrecarga durante hot reload
class GlobalLoadingControl {
  private isHotReloading: boolean = false;
  private loadingBlocked: boolean = false;
  private loadingStates: Map<string, boolean> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5000; // 5 segundos

  constructor() {
    // Detectar hot reload através da URL
    this.checkHotReload();

    // Monitorar mudanças na URL
    if (typeof window !== "undefined") {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = (...args) => {
        originalPushState.apply(window.history, args);
        this.checkHotReload();
      };

      window.history.replaceState = (...args) => {
        originalReplaceState.apply(window.history, args);
        this.checkHotReload();
      };

      // Também monitorar popstate
      window.addEventListener("popstate", () => {
        this.checkHotReload();
      });
    }
  }

  private checkHotReload() {
    if (typeof window === "undefined") return;

    const url = window.location.href;
    this.isHotReloading =
      url.includes("reload=") || url.includes("?t=") || url.includes("&t=");

    if (this.isHotReloading) {
      console.log(
        "🔥 [GlobalLoadingControl] Hot reload detectado, bloqueando carregamentos por 10s",
      );
      this.loadingBlocked = true;

      // Desbloquear após 10 segundos
      setTimeout(() => {
        this.loadingBlocked = false;
        console.log("✅ [GlobalLoadingControl] Carregamentos desbloqueados");
      }, 10000);
    }
  }

  shouldSkipLoading(contextName: string = "Unknown"): boolean {
    if (this.loadingBlocked) {
      console.log(
        `⏸️ [GlobalLoadingControl] Bloqueando carregamento para ${contextName} (hot reload em progresso)`,
      );
      return true;
    }
    return false;
  }

  getLoadingDelay(baseDelay: number = 1000): number {
    if (!this.isHotReloading) return Math.random() * 200; // Delay menor em produção

    // Em desenvolvimento, delays maiores e mais espaçados
    return Math.random() * baseDelay + baseDelay * 0.5;
  }

  // Verificar se um contexto já está carregando
  isContextLoading(contextName: string): boolean {
    return this.loadingStates.get(contextName) || false;
  }

  // Marcar contexto como carregando
  setContextLoading(contextName: string, isLoading: boolean) {
    this.loadingStates.set(contextName, isLoading);
    if (!isLoading) {
      // Limpar cache antigo quando terminar carregamento
      this.cleanOldCache();
    }
  }

  // Verificar cache
  getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // Salvar no cache
  setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Limpar cache antigo
  private cleanOldCache() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  forceUnblock() {
    this.loadingBlocked = false;
    this.isHotReloading = false;
    this.loadingStates.clear();
    this.cache.clear();
    console.log(
      "🔓 [GlobalLoadingControl] Carregamentos forçadamente desbloqueados",
    );
  }
}

export const globalLoadingControl = new GlobalLoadingControl();

// Exportar função de conveniência
export const shouldSkipLoading = (contextName: string = "Unknown") =>
  globalLoadingControl.shouldSkipLoading(contextName);

export const getLoadingDelay = (baseDelay: number = 1000) =>
  globalLoadingControl.getLoadingDelay(baseDelay);
