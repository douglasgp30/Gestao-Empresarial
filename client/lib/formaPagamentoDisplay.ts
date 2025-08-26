import { normalizeString } from "./stringUtils";

/**
 * Retorna um nome amigável para exibição de forma de pagamento,
 * baseado no nome interno armazenado (objeto ou string).
 *
 * IMPORTANTE: Isso é apenas para exibição no UI. Não altera valores armazenados.
 * Preserva todas as referências internas e lógica existente.
 */
export function getFormaPagamentoDisplayName(fp: any): string {
  if (!fp) return "-";
  
  const nomeRaw = typeof fp === "object" ? fp.nome || "" : String(fp || "");
  const n = normalizeString(nomeRaw);

  // Mapeamento normalizado para exibição
  if (n.includes("transferencia")) {
    // Interno pode ser 'Transferência Bancária' no DB; mostrar mais curto no UI
    return "Transferência";
  }

  // Manter Boleto como "Boleto Bancário" 
  if (n.includes("boleto")) {
    return "Boleto Bancário";
  }

  // Cartões mantém como estão
  if (n.includes("cartao")) {
    if (typeof fp === "object" && fp.nome) return fp.nome;
    return nomeRaw;
  }

  // PIX, Dinheiro, etc. mantém originais
  if (typeof fp === "object" && fp.nome) return fp.nome;
  
  // Se for ID numérico -> mostrar "N/A"
  if (/^\d+$/.test(nomeRaw.trim())) return "N/A";
  
  return nomeRaw;
}
