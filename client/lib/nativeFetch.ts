// Salvar referência ao fetch nativo antes de qualquer interceptação
const originalFetch = window.fetch;

// Função para fazer requests sem interferência de third-party scripts
export const nativeFetch = async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  try {
    // Usar fetch original
    return await originalFetch(url, options);
  } catch (error) {
    console.error("[NativeFetch] Erro:", error);
    throw error;
  }
};

// Função para verificar se fetch foi modificado
export const isFetchIntercepted = (): boolean => {
  return (
    window.fetch !== originalFetch ||
    window.fetch.toString().includes("fullstory") ||
    window.fetch.toString().includes("fs.js")
  );
};

// Função para tentar restaurar fetch original se necessário
export const tryRestoreNativeFetch = (): void => {
  if (isFetchIntercepted()) {
    console.log(
      "[NativeFetch] Fetch interceptado detectado, tentando usar versão original",
    );
    // Não vamos sobrescrever, apenas usar nossa versão quando necessário
  }
};
