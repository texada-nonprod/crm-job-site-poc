import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type ColumnId, ALL_COLUMN_IDS } from '@/hooks/useColumnVisibility';

const STORAGE_KEY = 'crm-project-columns';
const DEFAULT_VISIBLE: ColumnId[] = ['address', 'assignee', 'owner', 'status', 'wonRevenue', 'pipelineRevenue'];

function loadFromStorage(): ColumnId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((id): id is ColumnId => ALL_COLUMN_IDS.includes(id));
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_VISIBLE;
}

interface ColumnVisibilityValue {
  visibleColumns: ColumnId[];
  setVisibleColumns: (columns: ColumnId[]) => void;
  toggleColumn: (id: ColumnId) => void;
  isVisible: (id: ColumnId) => boolean;
  moveColumn: (fromIndex: number, toIndex: number) => void;
}

const ColumnVisibilityContext = createContext<ColumnVisibilityValue | null>(null);

export const ColumnVisibilityProvider = ({ children }: { children: ReactNode }) => {
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

  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    setVisibleColumnsState(prev => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length || fromIndex === toIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      persist(next);
      return next;
    });
  }, [persist]);

  return (
    <ColumnVisibilityContext.Provider value={{ visibleColumns, setVisibleColumns, toggleColumn, isVisible, moveColumn }}>
      {children}
    </ColumnVisibilityContext.Provider>
  );
};

export function useColumnVisibilityContext(): ColumnVisibilityValue {
  const ctx = useContext(ColumnVisibilityContext);
  if (!ctx) throw new Error('useColumnVisibilityContext must be used within ColumnVisibilityProvider');
  return ctx;
}
