/**
 * Formatar data para exibição em português brasileiro
 * Funciona com objetos Date, strings de data ou valores nulos/undefined
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar se é uma data válida
    if (isNaN(dateObj.getTime())) {
      console.warn('Data inválida recebida:', date);
      return "-";
    }
    
    return dateObj.toLocaleDateString("pt-BR");
  } catch (error) {
    console.warn('Erro ao formatar data:', date, error);
    return "-";
  }
}

/**
 * Formatar data e hora para exibição
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      console.warn('Data inválida recebida:', date);
      return "-";
    }
    
    return dateObj.toLocaleString("pt-BR");
  } catch (error) {
    console.warn('Erro ao formatar data e hora:', date, error);
    return "-";
  }
}

/**
 * Formatar intervalo de datas
 */
export function formatDateRange(dataInicio: Date | string, dataFim: Date | string): string {
  const inicio = formatDate(dataInicio);
  const fim = formatDate(dataFim);
  
  if (inicio === "-" || fim === "-") return "-";
  if (inicio === fim) return inicio;
  
  return `${inicio} - ${fim}`;
}
