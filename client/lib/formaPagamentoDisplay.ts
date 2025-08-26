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

/**
 * Ordena as formas de pagamento na ordem específica solicitada:
 * 1. Pix, 2. Boleto, 3. Dinheiro, 4. C/ Débito, 5. C/ Crédito, 6. Transferência
 */
export function ordenarFormasPagamento(formas: any[]): any[] {
  if (!Array.isArray(formas)) return [];

  const ordem = [
    "pix",
    "boleto",
    "dinheiro",
    "cartao.*debito",
    "cartao.*credito",
    "transferencia"
  ];

  return formas.sort((a, b) => {
    const nomeA = normalizeString(typeof a === "object" ? a.nome || "" : String(a || ""));
    const nomeB = normalizeString(typeof b === "object" ? b.nome || "" : String(b || ""));

    // Encontrar posição de cada forma na ordem desejada
    const posA = ordem.findIndex(pattern =>
      pattern.includes(".*")
        ? new RegExp(pattern).test(nomeA)
        : nomeA.includes(pattern)
    );
    const posB = ordem.findIndex(pattern =>
      pattern.includes(".*")
        ? new RegExp(pattern).test(nomeB)
        : nomeB.includes(pattern)
    );

    // Se ambos encontrados, ordenar pela posição
    if (posA !== -1 && posB !== -1) {
      return posA - posB;
    }

    // Se só um encontrado, colocar o encontrado primeiro
    if (posA !== -1) return -1;
    if (posB !== -1) return 1;

    // Se nenhum encontrado, ordenar alfabeticamente
    return nomeA.localeCompare(nomeB);
  });
}
