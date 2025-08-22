/**
 * Script para migrar localStorage corrigindo problemas de encoding
 * Execute no console do navegador para normalizar formas de pagamento
 */

import { FORMAS_PAGAMENTO_PADRAO } from "./dadosBasicos";

export function migrarFormasPagamento() {
  console.log("🔄 Iniciando migração de formas de pagamento...");

  // Mapa de correções
  const mapaCorrecoes = {
    "Cartao de Debito": "Cartão de Débito",
    "Cartao de Credito": "Cartão de Crédito",
    "Boleto Bancario": "Boleto Bancário",
    "Cartão de Débito": "Cartão de Débito", // já correto
    "Cartão de Crédito": "Cartão de Crédito", // já correto
    "Boleto Bancário": "Boleto Bancário", // já correto
  };

  // Backup primeiro
  const backup = localStorage.getItem("formas_pagamento");
  if (backup) {
    localStorage.setItem("formas_pagamento_backup", backup);
    console.log("✅ Backup criado: formas_pagamento_backup");
  }

  // Migrar
  try {
    const raw = localStorage.getItem("formas_pagamento");
    if (!raw) {
      console.log(
        "⚠️ Nenhuma forma de pagamento encontrada, criando padrões...",
      );
      localStorage.setItem(
        "formas_pagamento",
        JSON.stringify(FORMAS_PAGAMENTO_PADRAO),
      );
      console.log("✅ Formas padrão criadas");
      return;
    }

    const formas = JSON.parse(raw);
    if (!Array.isArray(formas)) {
      throw new Error("Dados inválidos");
    }

    // Aplicar correções
    const formasCorrigidas = formas.map((forma: any) => ({
      ...forma,
      nome: mapaCorrecoes[forma.nome] || forma.nome,
    }));

    // Garantir que todas as formas padrão existam
    const idsExistentes = new Set(formasCorrigidas.map((f: any) => f.id));
    FORMAS_PAGAMENTO_PADRAO.forEach((formaPadrao) => {
      if (!idsExistentes.has(formaPadrao.id)) {
        formasCorrigidas.push(formaPadrao);
        console.log(`➕ Adicionada forma faltante: ${formaPadrao.nome}`);
      }
    });

    localStorage.setItem("formas_pagamento", JSON.stringify(formasCorrigidas));
    console.log("✅ Migração concluída com sucesso!");
    console.log(
      "📊 Formas de pagamento atualizadas:",
      formasCorrigidas.map((f: any) => f.nome),
    );

    return {
      sucesso: true,
      formasCorrigidas: formasCorrigidas.length,
      backup: !!backup,
    };
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    console.log("🔄 Criando formas padrão...");
    localStorage.setItem(
      "formas_pagamento",
      JSON.stringify(FORMAS_PAGAMENTO_PADRAO),
    );

    return {
      sucesso: false,
      erro: error.message,
      formasRecriadas: true,
    };
  }
}

// Função para executar no console do navegador
export function executarMigracaoConsole() {
  // Para executar direto no console
  if (typeof window !== "undefined") {
    return migrarFormasPagamento();
  }
}

// Auto-executar se for script direto no console
if (typeof window !== "undefined" && !window.__migracao_executada) {
  window.__migracao_executada = true;
  executarMigracaoConsole();
}
