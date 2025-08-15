// Sistema de throttling específico para contextos
class ContextThrottle {
  private throttles: Map<string, NodeJS.Timeout> = new Map();
  private lastExecutions: Map<string, number> = new Map();
  private readonly DEFAULT_DELAY = 2000; // 2 segundos

  // Executar função com throttling
  execute<T>(
    key: string,
    fn: () => Promise<T> | T,
    delay: number = this.DEFAULT_DELAY
  ): Promise<T> | null {
    const now = Date.now();
    const lastExecution = this.lastExecutions.get(key) || 0;
    
    // Se executou recentemente, ignorar
    if (now - lastExecution < delay) {
      console.log(`🛑 [ContextThrottle] Bloqueando execução de ${key} (throttled)`);
      return null;
    }

    // Limpar throttle anterior se existir
    const existingThrottle = this.throttles.get(key);
    if (existingThrottle) {
      clearTimeout(existingThrottle);
    }

    // Registrar execução
    this.lastExecutions.set(key, now);
    console.log(`✅ [ContextThrottle] Executando ${key}`);

    // Executar função
    const result = fn();
    
    // Se for Promise, aguardar conclusão
    if (result instanceof Promise) {
      return result.finally(() => {
        // Criar novo throttle após execução
        const timeout = setTimeout(() => {
          this.throttles.delete(key);
        }, delay);
        this.throttles.set(key, timeout);
      });
    }

    // Criar throttle para execução síncrona
    const timeout = setTimeout(() => {
      this.throttles.delete(key);
    }, delay);
    this.throttles.set(key, timeout);

    return Promise.resolve(result);
  }

  // Verificar se está throttled
  isThrottled(key: string, delay: number = this.DEFAULT_DELAY): boolean {
    const now = Date.now();
    const lastExecution = this.lastExecutions.get(key) || 0;
    return now - lastExecution < delay;
  }

  // Forçar reset de throttle
  reset(key: string): void {
    const throttle = this.throttles.get(key);
    if (throttle) {
      clearTimeout(throttle);
      this.throttles.delete(key);
    }
    this.lastExecutions.delete(key);
    console.log(`🔄 [ContextThrottle] Reset throttle para ${key}`);
  }

  // Limpar todos os throttles
  clear(): void {
    for (const throttle of this.throttles.values()) {
      clearTimeout(throttle);
    }
    this.throttles.clear();
    this.lastExecutions.clear();
    console.log(`🧹 [ContextThrottle] Todos os throttles limpos`);
  }
}

export const contextThrottle = new ContextThrottle();
