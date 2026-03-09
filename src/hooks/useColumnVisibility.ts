import { useState, useCallback } from 'react';

export type ColumnId =
  | 'address'
  | 'assignee'
  | 'owner'
  | 'status'
  | 'revenue'
  | 'valuation'
  | 'primaryStage'
  | 'projectType'
  | 'ownershipType'
  | 'bidDate'
  | 'targetStartDate'
  | 'targetCompletionDate'
  | 'externalRef';

export const ALL_COLUMN_IDS: ColumnId[] = [
  'address',
  'assignee',
  'owner',
  'status',
  'revenue',
  'valuation',
  'primaryStage',
  'projectType',
  'ownershipType',
  'bidDate',
  'targetStartDate',
  'targetCompletionDate',
  'externalRef',
];

const STORAGE_KEY = 'crm-project-columns';

const DEFAULT_VISIBLE: ColumnId[] = ['address', 'assignee', 'owner', 'status', 'revenue'];

function loadFromStorage(): ColumnId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any invalid column IDs
        return parsed.filter((id): id is ColumnId => ALL_COLUMN_IDS.includes(id));
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_VISIBLE;
}

export function useColumnVisibility() {
  const [visibleColumns, setVisibleColumnsState] = useState<ColumnId[]>(loadFromStorage);

  const persist = useCallback((columns: ColumnId[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  }, []);

  const setVisibleColumns = useCallback((columns: ColumnId[]) => {
    setVisibleColumnsState(columns);
    persist(columns);
  }, [persist]);

  const toggleColumn = useCallback((id: ColumnId) => {
    setVisibleColumnsState(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      persist(next);
      return next;
    });
  }, [persist]);

  const isVisible = useCallback(
    (id: ColumnId) => visibleColumns.includes(id),
    [visibleColumns],
  );

  /** Move a column from one index to another within the visible list */
  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    setVisibleColumnsState(prev => {
      if (fromIndex < 0 || fromIndex >= prev.length) return prev;
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      if (fromIndex === toIndex) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      persist(next);
      return next;
    });
  }, [persist]);

  return { visibleColumns, setVisibleColumns, toggleColumn, isVisible, moveColumn };
}
