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

    // Verificar o content-type para decidir como processar
    const contentType = responseClone.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // Se é JSON, tentar parse JSON
      const errorData = await responseClone.json();
      console.log('🔵 DEBUG parseErrorResponse - errorData:', JSON.stringify(errorData, null, 2));

      if (errorData && typeof errorData.error === 'string' && errorData.error.trim()) {
        console.log('🔵 DEBUG parseErrorResponse - Retornando errorData.error:', errorData.error);
        return errorData.error;
      }

      // Se não tem campo error, tentar outras propriedades comuns
      if (errorData && typeof errorData.message === 'string' && errorData.message.trim()) {
        console.log('🔵 DEBUG parseErrorResponse - Retornando errorData.message:', errorData.message);
        return errorData.message;
      }

      // Se tem errorData mas sem campos úteis, tentar stringify
      if (errorData && Object.keys(errorData).length > 0) {
        console.log('🔵 DEBUG parseErrorResponse - Retornando JSON.stringify:', JSON.stringify(errorData));
        return JSON.stringify(errorData);
      }

      console.log('🔵 DEBUG parseErrorResponse - Retornando defaultMessage');
      return defaultMessage;
    } else {
      // Se não é JSON, ler como texto
      const textData = await responseClone.text();

      if (textData && textData.trim()) {
        return textData;
      }

      return defaultMessage;
    }
  } catch (parseError) {
    console.log('🟡 Error parsing response body:', parseError);
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
export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  
  return response;
}
