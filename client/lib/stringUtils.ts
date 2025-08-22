/**
 * Utilitários para normalização e manipulação de strings
 * Resolve problemas de encoding e acentuação
 */

/**
 * Normaliza string removendo acentos e convertendo para minúscula
 * Útil para comparações independentes de acentuação
 */
export function normalizeString(str: any = ""): string {
  if (!str) return "";

  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Verifica se forma de pagamento é cartão (com ou sem acentos)
 */
export function isFormaPagamentoCartao(formaPagamento: any): boolean {
  if (!formaPagamento) return false;

  let nome = "";
  if (typeof formaPagamento === "object" && formaPagamento.nome) {
    nome = formaPagamento.nome;
  } else if (typeof formaPagamento === "string") {
    nome = formaPagamento;
  } else {
    return false;
  }

  const nomeNormalizado = normalizeString(nome);
  return nomeNormalizado.includes("cartao");
}

/**
 * Verifica se forma de pagamento é boleto (com ou sem acentos)
 */
export function isFormaPagamentoBoleto(formaPagamento: any): boolean {
  if (!formaPagamento) return false;

  let nome = "";
  if (typeof formaPagamento === "object" && formaPagamento.nome) {
    nome = formaPagamento.nome;
  } else if (typeof formaPagamento === "string") {
    nome = formaPagamento;
  } else {
    return false;
  }

  const nomeNormalizado = normalizeString(nome);
  return (
    nomeNormalizado.includes("boleto") ||
    (nomeNormalizado.includes("bancario") && !nomeNormalizado.includes("transferencia"))
  );
}

/**
 * Formata moeda de forma segura, lidando com valores null/undefined
 */
export function formatCurrencySafe(value: any): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  const numValue = Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
}

/**
 * Extrai nome seguro de objeto ou string
 */
export function extractSafeName(item: any, fallback: string = "-"): string {
  if (!item) return fallback;

  if (typeof item === "object") {
    return item.nome || item.name || fallback;
  }

  if (typeof item === "string") {
    // Se for apenas um ID numérico, retornar fallback
    if (/^\d+$/.test(item.trim())) {
      return fallback;
    }
    return item;
  }

  return fallback;
}
