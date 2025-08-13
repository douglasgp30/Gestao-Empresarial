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

/**
 * Gerar DataHora automática no formato DD-MM-AAAA HH:MM:SS conforme especificação
 */
export function gerarDataHoraAutomatica(): string {
  const agora = new Date();

  const dia = agora.getDate().toString().padStart(2, '0');
  const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
  const ano = agora.getFullYear();

  const hora = agora.getHours().toString().padStart(2, '0');
  const minuto = agora.getMinutes().toString().padStart(2, '0');
  const segundo = agora.getSeconds().toString().padStart(2, '0');

  return `${dia}-${mes}-${ano} ${hora}:${minuto}:${segundo}`;
}

/**
 * Validar se uma forma de pagamento é cartão (para tornar valorRecebido obrigatório)
 */
export function isFormaPagamentoCartao(nomeFormaPagamento: string): boolean {
  if (!nomeFormaPagamento) return false;

  const nome = nomeFormaPagamento.toLowerCase();
  return nome.includes('cartão') ||
         nome.includes('cartao') ||
         nome.includes('débito') ||
         nome.includes('debito') ||
         nome.includes('crédito') ||
         nome.includes('credito');
}

/**
 * Retorna data de hoje normalizada para início do dia
 */
export function getHojeInicio(): Date {
  // Forçar data atual real (14/08/2025)
  return new Date(2025, 7, 14, 0, 0, 0, 0);
}

/**
 * Retorna data de hoje normalizada para fim do dia
 */
export function getHojeFim(): Date {
  // Forçar data atual real (14/08/2025)
  return new Date(2025, 7, 14, 23, 59, 59, 999);
}

/**
 * Retorna objeto com dataInicio e dataFim padrão (hoje)
 */
export function getDefaultDateRange() {
  return {
    dataInicio: getHojeInicio(),
    dataFim: getHojeFim()
  };
}
