import { useState, useEffect, useMemo } from "react";

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  order: number;
  width?: string;
}

export const useTableColumns = (
  tableName: string,
  defaultColumns: ColumnConfig[],
) => {
  const storageKey = `table-columns-${tableName}`;

  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const storedColumns = JSON.parse(stored);
        // Merge with default columns to handle new columns
        const mergedColumns = defaultColumns.map((defaultCol) => {
          const storedCol = storedColumns.find(
            (col: ColumnConfig) => col.key === defaultCol.key,
          );
          return storedCol ? { ...defaultCol, ...storedCol } : defaultCol;
        });
        // Add any new columns that weren't in storage
        const newColumns = defaultColumns.filter(
          (defaultCol) =>
            !storedColumns.some(
              (col: ColumnConfig) => col.key === defaultCol.key,
            ),
        );
        return [...mergedColumns, ...newColumns].sort(
          (a, b) => a.order - b.order,
        );
      }
      return defaultColumns;
    } catch (error) {
      console.warn("Error loading table columns from storage:", error);
      return defaultColumns;
    }
  });

  // Save to localStorage whenever columns change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(columns));
    } catch (error) {
      console.warn("Error saving table columns to storage:", error);
    }
  }, [columns, storageKey]);

  const toggleColumnVisibility = (columnKey: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col,
      ),
    );
  };

  const reorderColumns = (sourceIndex: number, destinationIndex: number) => {
    setColumns((prev) => {
      const newColumns = [...prev];
      const [removed] = newColumns.splice(sourceIndex, 1);
      newColumns.splice(destinationIndex, 0, removed);

      // Update order values
      return newColumns.map((col, index) => ({ ...col, order: index }));
    });
  };

  const resetColumns = () => {
    setColumns(defaultColumns);
  };

  const visibleColumns = useMemo(() => {
    return columns
      .filter((col) => col.visible)
      .sort((a, b) => a.order - b.order);
  }, [columns]);

  const getVisibleColumns = () => visibleColumns;

  const getColumnByKey = (key: string) => {
    return columns.find((col) => col.key === key);
  };

  return {
    columns,
    visibleColumns,
    toggleColumnVisibility,
    reorderColumns,
    resetColumns,
    getVisibleColumns,
    getColumnByKey,
  };
};
