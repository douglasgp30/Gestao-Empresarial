// Utilitários para desenvolvimento
export const isDevelopment = import.meta.env.DEV;

export const isHotReloading = () => {
  // Detectar se estamos em hot reload baseado na presença de query params específicos
  const url = window.location.href;
  return url.includes('reload=') || url.includes('?t=') || url.includes('&t=');
};

export const shouldSkipAutoLoad = () => {
  return isDevelopment && isHotReloading();
};

// Delay específico para desenvolvimento para evitar sobrecarga
export const getDevDelay = (baseDelay: number = 1000): number => {
  if (!isDevelopment) return 0;
  return Math.random() * baseDelay + baseDelay; // Delay aleatório entre 1-2x o valor base
};

console.log('[DevUtils] Ambiente:', {
  isDevelopment,
  isHotReloading: isHotReloading(),
  shouldSkipAutoLoad: shouldSkipAutoLoad()
});
