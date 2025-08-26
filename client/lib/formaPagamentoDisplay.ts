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

  // Mapeamento exato conforme solicitado pelo usuário:
  // Pix, Boleto, Dinheiro, C/ Débito, C/ Crédito, Transferência

  if (n.includes("transferencia")) {
    return "Transferência";
  }

  if (n.includes("boleto")) {
    return "Boleto";
  }

  if (n.includes("cartao") && n.includes("debito")) {
    return "C/ Débito";
  }

  if (n.includes("cartao") && n.includes("credito")) {
    return "C/ Crédito";
  }

  if (n.includes("pix")) {
    return "Pix";
  }

  if (n.includes("dinheiro")) {
    return "Dinheiro";
  }

  // Se não encontrar mapeamento específico, usar o nome original
  if (typeof fp === "object" && fp.nome) return fp.nome;

  // Se for ID numérico -> mostrar "N/A"
  if (/^\d+$/.test(nomeRaw.trim())) return "N/A";

  return nomeRaw;
}
