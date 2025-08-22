import { DescricaoECategoria } from "@shared/types";

// Função para criar dados básicos de descrições e categorias
export function criarDadosBasicosDescricoes(): DescricaoECategoria[] {
  const agora = new Date();
  return [
    // Categorias de Receita
    {
      id: 1,
      nome: "Serviços",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "categoria",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: 2, 
      nome: "Vendas",
      categoria: "Vendas",
      tipo: "receita",
      tipoItem: "categoria",
      ativo: true,
      dataCriacao: agora,
    },
    // Descrições de Serviços
    {
      id: 3,
      nome: "Desentupimento",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: 4,
      nome: "Limpeza de Caixa D'Água",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: 5,
      nome: "Instalação Hidráulica",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: 6,
      nome: "Reparo de Encanamento",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: 7,
      nome: "Detecção de Vazamentos",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    // Descrições de Vendas
    {
      id: 8,
      nome: "Material Hidráulico",
      categoria: "Vendas",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: 9,
      nome: "Equipamentos",
      categoria: "Vendas",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    // Categorias de Despesa
    {
      id: 10,
      nome: "Operacional",
      categoria: "Operacional",
      tipo: "despesa",
      tipoItem: "categoria",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: 11,
      nome: "Administrativo",
      categoria: "Administrativo",
      tipo: "despesa",
      tipoItem: "categoria",
      ativo: true,
      dataCriacao: agora,
    },
    // Descrições de Despesas Operacionais
    {
      id: 12,
      nome: "Combustível",
      categoria: "Operacional",
      tipo: "despesa",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: 13,
      nome: "Material de Trabalho",
      categoria: "Operacional",
      tipo: "despesa",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    // Descrições de Despesas Administrativas
    {
      id: 14,
      nome: "Aluguel",
      categoria: "Administrativo",
      tipo: "despesa",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: 15,
      nome: "Energia Elétrica",
      categoria: "Administrativo",
      tipo: "despesa",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    }
  ];
}
