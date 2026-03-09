import { useState, useCallback } from 'react';

export type ColumnId =
  | 'address'
  | 'assignee'
  | 'owner'
  | 'status'
  | 'wonRevenue'
  | 'pipelineRevenue'
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
  'wonRevenue',
  'pipelineRevenue',
  'valuation',
  'primaryStage',
  'projectType',
  'ownershipType',
  'bidDate',
  'targetStartDate',
  'targetCompletionDate',
  'externalRef',
];

// Re-export the context-based hook so existing imports keep working
export { useColumnVisibilityContext as useColumnVisibility } from '@/contexts/ColumnVisibilityContext';
