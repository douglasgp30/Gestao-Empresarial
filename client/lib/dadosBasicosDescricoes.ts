import { DescricaoECategoria } from "@shared/types";

// Função para criar dados básicos de descrições e categorias
export function criarDadosBasicosDescricoes(): DescricaoECategoria[] {
  const agora = new Date();
  return [
    // Categorias de Receita
    {
      id: "cat-receita-1",
      nome: "Serviços",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "categoria",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: "cat-receita-2", 
      nome: "Vendas",
      categoria: "Vendas",
      tipo: "receita",
      tipoItem: "categoria",
      ativo: true,
      dataCriacao: agora,
    },
    // Descrições de Serviços
    {
      id: "desc-servico-1",
      nome: "Desentupimento",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: "desc-servico-2",
      nome: "Limpeza de Caixa D'Água",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: "desc-servico-3",
      nome: "Instalação Hidráulica",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: "desc-servico-4",
      nome: "Reparo de Encanamento",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: "desc-servico-5",
      nome: "Detecção de Vazamentos",
      categoria: "Serviços",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    // Descrições de Vendas
    {
      id: "desc-venda-1",
      nome: "Material Hidráulico",
      categoria: "Vendas",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: "desc-venda-2",
      nome: "Equipamentos",
      categoria: "Vendas",
      tipo: "receita",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    // Categorias de Despesa
    {
      id: "cat-despesa-1",
      nome: "Operacional",
      categoria: "Operacional",
      tipo: "despesa",
      tipoItem: "categoria",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: "cat-despesa-2",
      nome: "Administrativo",
      categoria: "Administrativo",
      tipo: "despesa",
      tipoItem: "categoria",
      ativo: true,
      dataCriacao: agora,
    },
    // Descrições de Despesas Operacionais
    {
      id: "desc-op-1",
      nome: "Combustível",
      categoria: "Operacional",
      tipo: "despesa",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: "desc-op-2",
      nome: "Material de Trabalho",
      categoria: "Operacional",
      tipo: "despesa",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    // Descrições de Despesas Administrativas
    {
      id: "desc-admin-1",
      nome: "Aluguel",
      categoria: "Administrativo",
      tipo: "despesa",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    },
    {
      id: "desc-admin-2",
      nome: "Energia Elétrica",
      categoria: "Administrativo",
      tipo: "despesa",
      tipoItem: "descricao",
      ativo: true,
      dataCriacao: agora,
    }
  ];
}
