// client/lib/normalizeLancamento.ts
export function normalizeSetorValue(rawSetor: any) {
  // Retorna objeto { id?: string, nome?: string, cidade?: string } ou undefined
  if (!rawSetor) return undefined;

  // Se já for objeto com nome
  if (typeof rawSetor === "object") {
    const nome = rawSetor.nome || rawSetor.name || undefined;
    const cidade =
      typeof rawSetor.cidade === "object"
        ? rawSetor.cidade?.nome
        : rawSetor.cidade || undefined;
    const id = rawSetor.id?.toString?.() || undefined;
    return { id, nome, cidade };
  }

  // Se for string "id" (apenas número) -> manter id
  if (typeof rawSetor === "string") {
    const s = rawSetor.trim();
    // Caso legacy "Nome - Cidade"
    if (s.includes(" - ")) {
      const [nome, cidade] = s.split(" - ").map((x) => x.trim());
      return { nome: nome || undefined, cidade: cidade || undefined };
    }
    // Se string numérica (id)
    if (/^\d+$/.test(s)) {
      return { id: s, nome: undefined, cidade: undefined };
    }
    // Caso seja somente nome do setor
    return { nome: s };
  }

  return undefined;
}

export function extractSetorNome(rawSetor: any) {
  const norm = normalizeSetorValue(rawSetor);
  return norm?.nome || "";
}

export function extractSetorCidade(rawSetor: any, fallbackCidade?: any) {
  const norm = normalizeSetorValue(rawSetor);
  return (
    norm?.cidade || (typeof fallbackCidade === "string" ? fallbackCidade : "")
  );
}

export function extractCategoriaNome(lanc: any) {
  // Pode estar em lanc.categoria (string), lanc.categoria.nome (obj), lanc.descricaoECategoria, lanc.descricao?.categoria
  if (!lanc) return "";
  const c = lanc.categoria;
  if (c && typeof c === "string" && c.trim() !== "") return c;
  if (c && typeof c === "object" && (c.nome || c.name)) return c.nome || c.name;
  // Possível campo unified descricoes_e_categorias
  if (lanc.descricaoECategoria && lanc.descricaoECategoria.categoria)
    return lanc.descricaoECategoria.categoria;
  if (
    lanc.descricao &&
    typeof lanc.descricao === "object" &&
    lanc.descricao.categoria
  )
    return lanc.descricao.categoria;
  // fallback
  return "";
}

export function normalizeComissao(raw: any) {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    // transformar "-" ou "" em undefined
    const s = raw.trim();
    if (s === "-" || s === "" || s.toLowerCase() === "n/a") return undefined;
    const n = parseFloat(s.replace(",", "."));
    if (!isNaN(n)) return n;
  }
  return undefined;
}

export function isFilterActive(value: any) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") {
    const s = value.toLowerCase().trim();
    return s !== "todos" && s !== "todas" && s !== "";
  }
  return true;
}
