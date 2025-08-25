// Script para verificar e popular localStorage com dados básicos
console.log("🔍 Verificando dados no localStorage...");

// Verificar dados existentes
const campanhas = localStorage.getItem("campanhas");
const lancamentos = localStorage.getItem("lancamentos_caixa");
const clientes = localStorage.getItem("clientes");
const descricoes = localStorage.getItem("descricoes_e_categorias");
const localizacoes = localStorage.getItem("localizacoes_geograficas");
const formasPagamento = localStorage.getItem("formas_pagamento");

console.log("📊 Estado atual do localStorage:");
console.log("- Campanhas:", campanhas ? JSON.parse(campanhas).length + " itens" : "Vazio");
console.log("- Lançamentos:", lancamentos ? JSON.parse(lancamentos).length + " itens" : "Vazio");
console.log("- Clientes:", clientes ? JSON.parse(clientes).length + " itens" : "Vazio");
console.log("- Descrições:", descricoes ? JSON.parse(descricoes).length + " itens" : "Vazio");
console.log("- Localizações:", localizacoes ? JSON.parse(localizacoes).length + " itens" : "Vazio");
console.log("- Formas Pagamento:", formasPagamento ? JSON.parse(formasPagamento).length + " itens" : "Vazio");

// Dados básicos garantidos
const dadosBasicos = {
  campanhas: [
    { id: "1", nome: "Campanha Principal", descricao: "Campanha principal da empresa" },
    { id: "2", nome: "Sem Campanha", descricao: "Lançamentos sem campanha específica" },
    { id: "3", nome: "Promoções", descricao: "Campanhas promocionais" }
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
    }
  ],

  lancamentos: [
    {
      id: "1",
      tipo: "receita",
      valor: 500.00,
      valorLiquido: 450.00,
      comissao: 50.00,
      descricao: { nome: "Serviço de manutenção" },
      categoria: "Serviços",
      formaPagamento: { id: "1", nome: "Dinheiro" },
      tecnicoResponsavel: { id: "1", nome: "Técnico Padrão" },
      cliente: { id: "1", nome: "Cliente Exemplo" },
      campanha: { id: "1", nome: "Campanha Principal" },
      data: new Date().toISOString(),
      dataHora: new Date().toISOString(),
      dataCriacao: new Date().toISOString(),
      funcionarioId: "1"
    },
    {
      id: "2",
      tipo: "despesa",
      valor: 100.00,
      descricao: { nome: "Combustível" },
      categoria: "Operacional",
      formaPagamento: { id: "1", nome: "Dinheiro" },
      data: new Date().toISOString(),
      dataHora: new Date().toISOString(),
      dataCriacao: new Date().toISOString(),
      funcionarioId: "1"
    }
  ],

  descricoesECategorias: [
    { id: "cat_receita_1", tipoItem: "categoria", tipo: "receita", categoria: "Serviços", nome: "Serviços", ativo: true, dataCriacao: new Date().toISOString() },
    { id: "cat_receita_2", tipoItem: "categoria", tipo: "receita", categoria: "Produtos", nome: "Produtos", ativo: true, dataCriacao: new Date().toISOString() },
    { id: "desc_receita_1", tipoItem: "descricao", tipo: "receita", categoria: "Serviços", nome: "Manutenção", ativo: true, dataCriacao: new Date().toISOString() },
    { id: "desc_receita_2", tipoItem: "descricao", tipo: "receita", categoria: "Serviços", nome: "Instalação", ativo: true, dataCriacao: new Date().toISOString() },
    { id: "cat_despesa_1", tipoItem: "categoria", tipo: "despesa", categoria: "Operacional", nome: "Operacional", ativo: true, dataCriacao: new Date().toISOString() },
    { id: "desc_despesa_1", tipoItem: "descricao", tipo: "despesa", categoria: "Operacional", nome: "Combustível", ativo: true, dataCriacao: new Date().toISOString() },
  ],

  localizacoes: [
    { id: 1, tipoItem: "cidade", nome: "Goiânia", cidade: "Goiânia", ativo: true, dataCriacao: new Date().toISOString() },
    { id: 2, tipoItem: "cidade", nome: "Aparecida de Goiânia", cidade: "Aparecida de Goiânia", ativo: true, dataCriacao: new Date().toISOString() },
    { id: 3, tipoItem: "setor", nome: "Setor Central", cidade: "Goiânia", ativo: true, dataCriacao: new Date().toISOString() },
    { id: 4, tipoItem: "setor", nome: "Setor Oeste", cidade: "Goiânia", ativo: true, dataCriacao: new Date().toISOString() },
  ],

  formasPagamento: [
    { id: "1", nome: "Dinheiro" },
    { id: "2", nome: "Cartão de Débito" },
    { id: "3", nome: "Cartão de Crédito" },
    { id: "4", nome: "PIX" },
    { id: "5", nome: "Boleto Bancário" },
  ]
};

// Função para popular dados básicos
function popularDadosBasicos() {
  console.log("🔧 Populando dados básicos no localStorage...");
  
  // Forçar dados básicos
  localStorage.setItem("campanhas", JSON.stringify(dadosBasicos.campanhas));
  localStorage.setItem("clientes", JSON.stringify(dadosBasicos.clientes));
  localStorage.setItem("lancamentos_caixa", JSON.stringify(dadosBasicos.lancamentos));
  localStorage.setItem("descricoes_e_categorias", JSON.stringify(dadosBasicos.descricoesECategorias));
  localStorage.setItem("localizacoes_geograficas", JSON.stringify(dadosBasicos.localizacoes));
  localStorage.setItem("formas_pagamento", JSON.stringify(dadosBasicos.formasPagamento));
  
  console.log("✅ Dados básicos populados com sucesso!");
  console.log("📊 Resumo:");
  console.log(`- ${dadosBasicos.campanhas.length} campanhas`);
  console.log(`- ${dadosBasicos.clientes.length} clientes`);
  console.log(`- ${dadosBasicos.lancamentos.length} lançamentos`);
  console.log(`- ${dadosBasicos.descricoesECategorias.length} descrições/categorias`);
  console.log(`- ${dadosBasicos.localizacoes.length} localizações`);
  console.log(`- ${dadosBasicos.formasPagamento.length} formas de pagamento`);
}

// Função para limpar localStorage
function limparLocalStorage() {
  console.log("🗑️ Limpando localStorage...");
  localStorage.removeItem("campanhas");
  localStorage.removeItem("clientes");
  localStorage.removeItem("lancamentos_caixa");
  localStorage.removeItem("descricoes_e_categorias");
  localStorage.removeItem("localizacoes_geograficas");
  localStorage.removeItem("formas_pagamento");
  console.log("✅ localStorage limpo!");
}

// Disponibilizar globalmente
window.popularDadosBasicos = popularDadosBasicos;
window.limparLocalStorage = limparLocalStorage;
window.verificarLocalStorage = () => {
  console.log("📊 Estado atual do localStorage:");
  console.log("- Campanhas:", localStorage.getItem("campanhas"));
  console.log("- Lançamentos:", localStorage.getItem("lancamentos_caixa"));
  console.log("- Clientes:", localStorage.getItem("clientes"));
  console.log("- Descrições:", localStorage.getItem("descricoes_e_categorias"));
  console.log("- Localizações:", localStorage.getItem("localizacoes_geograficas"));
  console.log("- Formas Pagamento:", localStorage.getItem("formas_pagamento"));
};

// Popular automaticamente se estiver vazio
if (!campanhas || !lancamentos || !clientes) {
  console.log("🎯 Dados insuficientes detectados, populando automaticamente...");
  popularDadosBasicos();
}

export { popularDadosBasicos, limparLocalStorage };
