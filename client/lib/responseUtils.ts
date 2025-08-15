/**
 * Faz parsing seguro de uma resposta de erro HTTP
 * @param response - A resposta HTTP de erro
 * @returns Promise<string> - Mensagem de erro extraída
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  const defaultMessage = `Erro HTTP ${response.status}: ${response.statusText}`;

  try {
    // Clonar a resposta para não consumir o stream original
    const responseClone = response.clone();

    // Tentar JSON primeiro, independente do content-type
    try {
      const errorData = await responseClone.json();

      if (
        errorData &&
        typeof errorData.error === "string" &&
        errorData.error.trim()
      ) {
        return errorData.error;
      }

      // Se não tem campo error, tentar outras propriedades comuns
      if (
        errorData &&
        typeof errorData.message === "string" &&
        errorData.message.trim()
      ) {
        return errorData.message;
      }

      // Se tem errorData mas sem campos úteis, tentar stringify
      if (errorData && Object.keys(errorData).length > 0) {
        return JSON.stringify(errorData);
      }
    } catch (jsonError) {
      // Se não conseguiu fazer parse JSON, tentar como texto
      const textData = await response.clone().text();

      if (textData && textData.trim()) {
        return textData;
      }
    }
    return defaultMessage;
  } catch (parseError) {
    console.log("🔴 Error parsing response body:", parseError);
    // Retornar mensagem padrão se não conseguir fazer parse
    return defaultMessage;
  }
}

/**
 * Wrapper para fetch que automaticamente trata erros HTTP
 * @param url - URL para fazer a requisição
 * @param options - Opções do fetch
 * @returns Promise<Response> - A resposta se bem-sucedida
 * @throws Error - Com mensagem de erro parsed se houver erro HTTP
 */
export async function safeFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  return response;
}
