/**
 * Dados básicos iniciais para configurar o sistema após criação do primeiro administrador
 */

export interface DadosBasicosIniciais {
  formasPagamento: Array<{
    id: string;
    nome: string;
    ativo: boolean;
    tipo: "dinheiro" | "cartao" | "pix" | "transferencia" | "boleto" | "outros";
    descricao?: string;
  }>;
  categorias: Array<{
    id: string;
    nome: string;
    tipo: "receita" | "despesa";
    cor: string;
    icone?: string;
  }>;
  configuracoes: {
    empresa: {
      nome: string;
      configurada: boolean;
    };
    sistema: {
      moedaPadrao: string;
      formatoData: string;
      fusoHorario: string;
      primeiroAcesso: boolean;
    };
  };
}

export function obterDadosBasicosIniciais(): DadosBasicosIniciais {
  return {
    formasPagamento: [
      {
        id: "1",
        nome: "Dinheiro",
        ativo: true,
        tipo: "dinheiro",
        descricao: "Pagamento em dinheiro/espécie",
      },
      {
        id: "2",
        nome: "PIX",
        ativo: true,
        tipo: "pix",
        descricao: "Transferência instantânea via PIX",
      },
      {
        id: "3",
        nome: "Cartão de Débito",
        ativo: true,
        tipo: "cartao",
        descricao: "Pagamento via cartão de débito",
      },
      {
        id: "4",
        nome: "Cartão de Crédito",
        ativo: true,
        tipo: "cartao",
        descricao: "Pagamento via cartão de crédito",
      },
      {
        id: "5",
        nome: "Boleto Bancário",
        ativo: true,
        tipo: "boleto",
        descricao: "Pagamento via boleto bancário",
      },
      {
        id: "6",
        nome: "Transferência Bancária",
        ativo: true,
        tipo: "transferencia",
        descricao: "Transferência bancária TED/DOC",
      },
    ],

    categorias: [
      // Categorias de Receita
      {
        id: "1",
        nome: "Serviços Prestados",
        tipo: "receita",
        cor: "#10b981",
      },
      {
        id: "2",
        nome: "Vendas",
        tipo: "receita",
        cor: "#3b82f6",
      },
      {
        id: "3",
        nome: "Consultoria",
        tipo: "receita",
        cor: "#8b5cf6",
      },
      {
        id: "4",
        nome: "Outras Receitas",
        tipo: "receita",
        cor: "#06b6d4",
      },

      // Categorias de Despesa
      {
        id: "5",
        nome: "Material de Escritório",
        tipo: "despesa",
        cor: "#ef4444",
      },
      {
        id: "6",
        nome: "Combustível",
        tipo: "despesa",
        cor: "#f97316",
      },
      {
        id: "7",
        nome: "Alimentação",
        tipo: "despesa",
        cor: "#eab308",
      },
      {
        id: "8",
        nome: "Internet/Telefone",
        tipo: "despesa",
        cor: "#84cc16",
      },
      {
        id: "9",
        nome: "Energia Elétrica",
        tipo: "despesa",
        cor: "#06b6d4",
      },
      {
        id: "10",
        nome: "Aluguel",
        tipo: "despesa",
        cor: "#6366f1",
      },
      {
        id: "11",
        nome: "Outras Despesas",
        tipo: "despesa",
        cor: "#8b5cf6",
      },
    ],

    configuracoes: {
      empresa: {
        nome: "Minha Empresa",
        configurada: false,
      },
      sistema: {
        moedaPadrao: "BRL",
        formatoData: "dd/MM/yyyy",
        fusoHorario: "America/Sao_Paulo",
        primeiroAcesso: true,
      },
    },
  };
}

export async function configurarDadosBasicosIniciais(): Promise<boolean> {
  try {
    console.log(
      "🚫 [dadosBasicosIniciais] FUNÇÃO DESABILITADA - Conforme solicitação do usuário, nenhum dado será criado automaticamente",
    );

    // 🚫 REMOVIDO: Toda criação automática de dados conforme solicitação do usuário
    // O sistema deve iniciar completamente vazio

    // APENAS criar formas de pagamento se não existirem (usuário pediu para manter)
    const formasPagamentoExistentes = localStorage.getItem("formas_pagamento");
    if (!formasPagamentoExistentes) {
      const dadosBasicos = obterDadosBasicosIniciais();
      localStorage.setItem(
        "formas_pagamento",
        JSON.stringify(dadosBasicos.formasPagamento),
      );
      console.log(
        "✅ [dadosBasicosIniciais] Apenas formas de pagamento criadas conforme solicitado",
      );
    }

    console.log(
      "✅ [dadosBasicosIniciais] Sistema vazio configurado conforme solicitado!",
    );
    return true;
  } catch (error) {
    console.error("❌ Erro ao configurar sistema vazio:", error);
    return false;
  }
}
