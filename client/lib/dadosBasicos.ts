/**
 * Dados básicos padronizados para o sistema
 * Fonte única da verdade para formas de pagamento e outros defaults
 */

export const FORMAS_PAGAMENTO_PADRAO = [
  {
    id: "1",
    nome: "Dinheiro",
    descricao: "Pagamento em dinheiro",
    dataCriacao: new Date(),
  },
  {
    id: "2", 
    nome: "PIX",
    descricao: "Pagamento via PIX",
    dataCriacao: new Date(),
  },
  {
    id: "3",
    nome: "Cartão de Débito", 
    descricao: "Pagamento com cartão de débito",
    dataCriacao: new Date(),
  },
  {
    id: "4",
    nome: "Cartão de Crédito",
    descricao: "Pagamento com cartão de crédito", 
    dataCriacao: new Date(),
  },
  {
    id: "5",
    nome: "Boleto Bancário",
    descricao: "Pagamento via boleto bancário",
    dataCriacao: new Date(),
  },
];

export const CATEGORIAS_RECEITA_PADRAO = [
  "Serviços",
  "Produtos", 
  "Consultoria",
  "Manutenção",
];

export const CATEGORIAS_DESPESA_PADRAO = [
  "Fornecedores",
  "Funcionários",
  "Impostos",
  "Despesas Operacionais",
];
