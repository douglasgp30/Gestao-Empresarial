/**
 * Limpa filtros antigos do localStorage para forçar reinicialização
 * com os novos padrões (hoje para hoje)
 */
export function clearOldDateFilters() {
  try {
    // Limpar filtros antigos específicos
    const keysToRemove = [
      "dateFilters_caixa",
      "dateFilters_contas",
      "dateFilters_agendamentos",
      "dateFilters_relatorios",
      "dateFilters_dashboard",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log("🧹 Filtros de data antigos limpos com sucesso");
  } catch (error) {
    console.warn("Erro ao limpar filtros antigos:", error);
  }
}

// Executar limpeza automaticamente para forçar data correta
if (typeof window !== "undefined") {
  // Sempre limpar para aplicar data correta (14/08/2025)
  clearOldDateFilters();
  // Limpar também versões anteriores
  localStorage.removeItem("filtersCleared_v2");
  localStorage.removeItem("filtersCleared_v3");
  localStorage.setItem("filtersCleared_v4", "true");
}
