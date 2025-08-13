/**
 * Limpa filtros antigos do localStorage para forçar reinicialização
 * com os novos padrões (hoje para hoje)
 */
export function clearOldDateFilters() {
  try {
    // Limpar filtros antigos específicos
    const keysToRemove = [
      'dateFilters_caixa',
      'dateFilters_contas', 
      'dateFilters_agendamentos',
      'dateFilters_relatorios',
      'dateFilters_dashboard'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('🧹 Filtros de data antigos limpos com sucesso');
  } catch (error) {
    console.warn('Erro ao limpar filtros antigos:', error);
  }
}

// Executar limpeza automaticamente na primeira vez
if (typeof window !== 'undefined') {
  // Verificar se já foi executado
  const hasCleared = localStorage.getItem('filtersCleared_v2');
  if (!hasCleared) {
    clearOldDateFilters();
    localStorage.setItem('filtersCleared_v2', 'true');
  }
}
