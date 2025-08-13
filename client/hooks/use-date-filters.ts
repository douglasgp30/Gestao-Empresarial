import { useState, useCallback } from "react";

interface DateFilters {
  dataInicio: Date;
  dataFim: Date;
}

interface UseDateFiltersOptions {
  storageKey: string; // Chave única para localStorage
}

export function useDateFilters({ storageKey }: UseDateFiltersOptions) {
  const [filters, setFilters] = useState<DateFilters>(() => {
    // Tentar recuperar do localStorage primeiro
    try {
      const stored = localStorage.getItem(`dateFilters_${storageKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          dataInicio: new Date(parsed.dataInicio),
          dataFim: new Date(parsed.dataFim),
        };
      }
    } catch {
      // Se falhar, usar padrão
    }

    // Padrão: hoje para ambos
    const hoje = new Date();
    const inicioHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      0,
      0,
      0,
      0,
    );
    const fimHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      23,
      59,
      59,
      999,
    );

    return {
      dataInicio: inicioHoje,
      dataFim: fimHoje,
    };
  });

  const updateFilters = useCallback(
    (newFilters: Partial<DateFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);

      // Persistir no localStorage
      try {
        localStorage.setItem(
          `dateFilters_${storageKey}`,
          JSON.stringify({
            dataInicio: updated.dataInicio.toISOString(),
            dataFim: updated.dataFim.toISOString(),
          }),
        );
      } catch {
        // Ignorar erros de localStorage
      }
    },
    [filters, storageKey],
  );

  const resetToToday = useCallback(() => {
    const hoje = new Date();
    const inicioHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      0,
      0,
      0,
      0,
    );
    const fimHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      23,
      59,
      59,
      999,
    );

    updateFilters({
      dataInicio: inicioHoje,
      dataFim: fimHoje,
    });
  }, [updateFilters]);

  return {
    filters,
    updateFilters,
    resetToToday,
  };
}
