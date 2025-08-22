// Helpers para normalização e exibição de dados do Caixa

// Função para extrair ID ou string de forma segura
export const getIdOrString = (value: any): string => {
  if (value == null) return "";
  if (typeof value === "object") {
    return value.id?.toString() || value.nome || "";
  }
  return value.toString();
};

// Função para extrair nome de exibição de forma segura
export const getDisplayName = (value: any): string => {
  if (value == null) return "";
  if (typeof value === "object") {
    return value.nome || value.nomeCompleto || value.id?.toString() || "";
  }
  return value.toString();
};

// Função para extrair nome de forma de pagamento
export const getFormaPagamentoNome = (fp: any, formasPagamento: any[] = []): string => {
  if (!fp) return "N/A";

  // Se é um objeto snapshot, usar o nome
  if (typeof fp === "object" && fp.nome) {
    return fp.nome;
  }

  // Se é string/ID, buscar pelo ID na lista
  if (typeof fp === "string" || typeof fp === "number") {
    const forma = formasPagamento.find(
      (f) => f.id?.toString() === fp.toString(),
    );
    return forma?.nome || "N/A";
  }

  return "N/A";
};

// Função para extrair nome do setor com cidade
export const getSetorNome = (setor: any, setores: any[] = []): string => {
  if (!setor) return "";

  // Se é um objeto snapshot, montar nome completo
  if (typeof setor === "object" && setor.nome) {
    return `${setor.nome}${setor.cidade ? ` - ${setor.cidade}` : ""}`;
  }

  // Se é string/ID, buscar pelo ID na lista
  if (typeof setor === "string" || typeof setor === "number") {
    const setorEncontrado = setores.find(
      (s) => s.id?.toString() === setor.toString(),
    );
    if (setorEncontrado) {
      const cidade =
        typeof setorEncontrado.cidade === "object"
          ? setorEncontrado.cidade?.nome
          : setorEncontrado.cidade;
      return `${setorEncontrado.nome}${cidade ? ` - ${cidade}` : ""}`;
    }
  }

  return "";
};

// Função para extrair nome do técnico
export const getTecnicoNome = (tecnico: any, tecnicos: any[] = []): string => {
  if (!tecnico) return "";

  // Se é um objeto snapshot, usar o nome
  if (typeof tecnico === "object" && tecnico.nome) {
    return tecnico.nome;
  }

  // Se é string/ID, buscar pelo ID na lista
  if (typeof tecnico === "string" || typeof tecnico === "number") {
    const tecnicoEncontrado = tecnicos.find(
      (t) => t.id?.toString() === tecnico.toString(),
    );
    if (tecnicoEncontrado) {
      return tecnicoEncontrado.nome || tecnicoEncontrado.nomeCompleto || "";
    }
  }

  return "";
};

// Função para extrair nome da campanha
export const getCampanhaNome = (campanha: any, campanhas: any[] = []): string => {
  if (!campanha) return "";

  // Se é um objeto snapshot, usar o nome
  if (typeof campanha === "object" && campanha.nome) {
    return campanha.nome;
  }

  // Se é string/ID, buscar pelo ID na lista
  if (typeof campanha === "string" || typeof campanha === "number") {
    const campanhaEncontrada = campanhas.find(
      (c) => c.id?.toString() === campanha.toString(),
    );
    if (campanhaEncontrada) {
      return campanhaEncontrada.nome;
    }
  }

  return "";
};

// Função para extrair nome do cliente
export const getClienteNome = (cliente: any, clientes: any[] = []): string => {
  if (!cliente) return "";

  // Se é um objeto snapshot, usar o nome
  if (typeof cliente === "object" && cliente.nome) {
    return cliente.nome;
  }

  // Se é string/ID, buscar pelo ID na lista
  if (typeof cliente === "string" || typeof cliente === "number") {
    const clienteEncontrado = clientes.find(
      (c) => c.id?.toString() === cliente.toString(),
    );
    if (clienteEncontrado) {
      return clienteEncontrado.nome;
    }
  }

  return "";
};

// Função para extrair descrição de exibição
export const getDescricaoDisplay = (lancamento: any): string => {
  const descricao = lancamento.descricao;
  
  if (!descricao) return "N/A";

  // Se é um objeto com nome
  if (typeof descricao === "object" && descricao.nome) {
    return descricao.nome;
  }

  // Se é string direta
  if (typeof descricao === "string" && descricao) {
    return descricao;
  }

  return "N/A";
};

// Função para comparar filtros de forma robusta
export const matchesFilter = (
  fieldValue: any,
  filterValue: string | undefined,
  items: any[] = []
): boolean => {
  if (!filterValue || filterValue === "todas" || filterValue === "todos") {
    return true;
  }

  const fieldId = getIdOrString(fieldValue);
  return fieldId === filterValue.toString();
};

// Função para extrair valor para ordenação
export const getSortValue = (lancamento: any, field: string, items: any[] = []): any => {
  switch (field) {
    case "data":
      return new Date(lancamento.data).getTime();
    case "tipo":
      return lancamento.tipo;
    case "valor":
      return lancamento.valorLiquido || lancamento.valor;
    case "formaPagamento":
      return getFormaPagamentoNome(lancamento.formaPagamento, items);
    case "tecnicoResponsavel":
      return getTecnicoNome(lancamento.tecnicoResponsavel, items);
    case "setor":
      return getSetorNome(lancamento.setor, items);
    case "cidade":
      return lancamento.cidade || "";
    default:
      return "";
  }
};
