/**
 * Faz parsing seguro de uma resposta de erro HTTP
 * @param response - A resposta HTTP de erro
 * @returns Promise<string> - Mensagem de erro extraída
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  const defaultMessage = `Erro HTTP ${response.status}: ${response.statusText}`;

  try {
    // Verificar o content-type para decidir como processar
    const contentType = response.headers.get('content-type') || '';
    console.log('🔵 parseErrorResponse - Content-Type:', contentType);

    if (contentType.includes('application/json')) {
      // Se é JSON, tentar parse JSON
      const errorData = await response.json();
      console.log('🔵 parseErrorResponse - Dados JSON:', JSON.stringify(errorData, null, 2));

      if (errorData && errorData.error) {
        console.log('🔵 parseErrorResponse - Retornando errorData.error:', errorData.error);
        return errorData.error;
      }

      // Se não tem campo error, tentar outras propriedades comuns
      if (errorData && errorData.message) {
        console.log('🔵 parseErrorResponse - Retornando errorData.message:', errorData.message);
        return errorData.message;
      }

      console.log('🔵 parseErrorResponse - Sem error/message, retornando default');
      return defaultMessage;
    } else {
      // Se não é JSON, ler como texto
      const textData = await response.text();
      console.log('🔵 parseErrorResponse - Dados texto:', textData);

      if (textData && textData.trim()) {
        return textData;
      }

      return defaultMessage;
    }
  } catch (parseError) {
    console.log('🔴 parseErrorResponse - Erro no parse:', parseError);
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
