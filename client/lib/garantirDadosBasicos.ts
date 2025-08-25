// Função para garantir que sempre há dados básicos no localStorage

export function garantirDadosBasicos() {
  console.log("🔧 [GarantirDados] Verificando dados básicos...");

  // Dados básicos garantidos
  const dadosBasicos = {
    campanhas: [
      {
        id: "1",
        nome: "Campanha Principal",
        descricao: "Campanha principal da empresa",
      },
      {
        id: "2",
        nome: "Sem Campanha",
        descricao: "Lançamentos sem campanha específica",
      },
      { id: "3", nome: "Promoções", descricao: "Campanhas promocionais" },
    ],

    clientes: [
      {
        id: "1",
        nome: "Cliente Exemplo",
        telefonePrincipal: "(62) 99999-9999",
        email: "cliente@exemplo.com",
        complemento: "Centro, Goiânia",
        dataCriacao: new Date().toISOString(),
      },
      {
        id: "2",
        nome: "Empresa ABC",
        telefonePrincipal: "(62) 88888-8888",
        email: "contato@abc.com",
        complemento: "Setor Oeste, Goiânia",
        dataCriacao: new Date().toISOString(),
      },
    ],

    lancamentos: [
      {
        id: "1",
        tipo: "receita",
        valor: 500.0,
        valorLiquido: 450.0,
        comissao: 50.0,
        descricao: { nome: "Serviço de manutenção" },
        categoria: "Serviços",
        formaPagamento: { id: "1", nome: "Dinheiro" },
        tecnicoResponsavel: { id: "1", nome: "Técnico Padrão" },
        cliente: { id: "1", nome: "Cliente Exemplo" },
        campanha: { id: "1", nome: "Campanha Principal" },
        data: new Date().toISOString(),
        dataHora: new Date().toISOString(),
        dataCriacao: new Date().toISOString(),
        funcionarioId: "1",
      },
      {
        id: "2",
        tipo: "despesa",
        valor: 100.0,
        descricao: { nome: "Combustível" },
        categoria: "Operacional",
        formaPagamento: { id: "1", nome: "Dinheiro" },
        data: new Date().toISOString(),
        dataHora: new Date().toISOString(),
        dataCriacao: new Date().toISOString(),
        funcionarioId: "1",
      },
    ],

    descricoesECategorias: [
      {
        id: "cat_receita_1",
        tipoItem: "categoria",
        tipo: "receita",
        categoria: "Serviços",
        nome: "Serviços",
        ativo: true,
        dataCriacao: new Date().toISOString(),
      },
      {
        id: "cat_receita_2",
        tipoItem: "categoria",
        tipo: "receita",
        categoria: "Produtos",
        nome: "Produtos",
        ativo: true,
        dataCriacao: new Date().toISOString(),
      },
      {
        id: "desc_receita_1",
        tipoItem: "descricao",
        tipo: "receita",
        categoria: "Serviços",
        nome: "Manutenção",
        ativo: true,
        dataCriacao: new Date().toISOString(),
      },
      {
        id: "desc_receita_2",
        tipoItem: "descricao",
        tipo: "receita",
        categoria: "Serviços",
        nome: "Instalação",
        ativo: true,
        dataCriacao: new Date().toISOString(),
      },
      {
        id: "cat_despesa_1",
        tipoItem: "categoria",
        tipo: "despesa",
        categoria: "Operacional",
        nome: "Operacional",
        ativo: true,
        dataCriacao: new Date().toISOString(),
      },
      {
        id: "desc_despesa_1",
        tipoItem: "descricao",
        tipo: "despesa",
        categoria: "Operacional",
        nome: "Combustível",
        ativo: true,
        dataCriacao: new Date().toISOString(),
      },
    ],

    localizacoes: [
      {
        id: 1,
        tipoItem: "cidade",
        nome: "Goiânia",
        cidade: "Goiânia",
        ativo: true,
        dataCriacao: new Date().toISOString(),
      },
      {
        id: 2,
        tipoItem: "cidade",
        nome: "Aparecida de Goiânia",
        cidade: "Aparecida de Goiânia",
        ativo: true,
        dataCriacao: new Date().toISOString(),
      },
      {
        id: 3,
        tipoItem: "setor",
        nome: "Setor Central",
        cidade: "Goiânia",
        ativo: true,
        dataCriacao: new Date().toISOString(),
      },
      {
        id: 4,
        tipoItem: "setor",
        nome: "Setor Oeste",
        cidade: "Goiânia",
        ativo: true,
        dataCriacao: new Date().toISOString(),
      },
    ],

    formasPagamento: [
      { id: "1", nome: "Dinheiro" },
      { id: "2", nome: "Cartão de Débito" },
      { id: "3", nome: "Cartão de Crédito" },
      { id: "4", nome: "PIX" },
      { id: "5", nome: "Boleto Bancário" },
    ],
  };

  try {
    // Verificar e criar campanhas se necessário
    const campanhas = localStorage.getItem("campanhas");
    if (!campanhas || JSON.parse(campanhas).length === 0) {
      localStorage.setItem("campanhas", JSON.stringify(dadosBasicos.campanhas));
      console.log("✅ [GarantirDados] Campanhas básicas criadas");
    }

    // Verificar e criar clientes se necessário
    const clientes = localStorage.getItem("clientes");
    if (!clientes || JSON.parse(clientes).length === 0) {
      localStorage.setItem("clientes", JSON.stringify(dadosBasicos.clientes));
      console.log("✅ [GarantirDados] Clientes básicos criados");
    }

    // Verificar e criar lançamentos se necessário
    const lancamentos = localStorage.getItem("lancamentos_caixa");
    if (!lancamentos || JSON.parse(lancamentos).length === 0) {
      localStorage.setItem(
        "lancamentos_caixa",
        JSON.stringify(dadosBasicos.lancamentos),
      );
      console.log("✅ [GarantirDados] Lançamentos básicos criados");
    }

    // Verificar e criar descrições/categorias se necessário
    const descricoes = localStorage.getItem("descricoes_e_categorias");
    if (!descricoes || JSON.parse(descricoes).length === 0) {
      localStorage.setItem(
        "descricoes_e_categorias",
        JSON.stringify(dadosBasicos.descricoesECategorias),
      );
      console.log("✅ [GarantirDados] Descrições/categorias básicas criadas");
    }

    // Verificar e criar localizações se necessário
    const localizacoes = localStorage.getItem("localizacoes_geograficas");
    if (!localizacoes || JSON.parse(localizacoes).length === 0) {
      localStorage.setItem(
        "localizacoes_geograficas",
        JSON.stringify(dadosBasicos.localizacoes),
      );
      console.log("✅ [GarantirDados] Localizações básicas criadas");
    }

    // Verificar e criar formas de pagamento se necessário
    const formas = localStorage.getItem("formas_pagamento");
    if (!formas || JSON.parse(formas).length === 0) {
      localStorage.setItem(
        "formas_pagamento",
        JSON.stringify(dadosBasicos.formasPagamento),
      );
      console.log("✅ [GarantirDados] Formas de pagamento básicas criadas");
    }

    console.log("✅ [GarantirDados] Verificação concluída com sucesso");
    return true;
  } catch (error) {
    console.error("❌ [GarantirDados] Erro ao garantir dados básicos:", error);
    return false;
  }
}

// Executar automaticamente na importação
garantirDadosBasicos();
