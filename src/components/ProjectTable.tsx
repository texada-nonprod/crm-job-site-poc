import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useStatusColors } from '@/hooks/useStatusColors';
import { useColumnVisibility, ColumnId } from '@/hooks/useColumnVisibility';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Project } from '@/types';

type SortColumn =
  | 'name'
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

type SortDirection = 'asc' | 'desc' | null;

// Status display order mapping (matches ManageDropdowns configuration)
const STATUS_DISPLAY_ORDER: Record<string, number> = {
  'Active': 1,
  'Planning': 2,
  'On Hold': 3,
  'Completed': 99,
};

const getStatusOrder = (statusId: string): number => {
  return STATUS_DISPLAY_ORDER[statusId] ?? 999;
};

interface ColConfig {
  id: ColumnId;
  sortKey: SortColumn;
  header: string;
  align?: 'left' | 'right';
  render: (project: Project, helpers: RenderHelpers) => React.ReactNode;
}

interface RenderHelpers {
  getUserNames: (ids: number[]) => string;
  getCompanyById: (id: string) => { companyName: string } | undefined;
  calculateProjectRevenue: (p: Project) => number;
  getStatusColorClasses: (s: string) => string;
  getLookupLabel: (type: 'primaryStage' | 'primaryProjectType' | 'ownershipType', id: string) => string;
  formatDate: (d?: string) => string;
}

export const ProjectTable = () => {
  const navigate = useNavigate();
  const {
    getFilteredProjects,
    getUserNames,
    calculateProjectRevenue,
    getCompanyById,
    getLookupLabel,
  } = useData();
  const { getStatusColorClasses } = useStatusColors();
  const { visibleColumns, isVisible } = useColumnVisibility();
  const [sortColumn, setSortColumn] = useState<SortColumn | null>('status');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredProjects = getFilteredProjects();

  const formatDate = (d?: string): string => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const helpers: RenderHelpers = {
    getUserNames,
    getCompanyById: getCompanyById as any,
    calculateProjectRevenue,
    getStatusColorClasses,
    getLookupLabel,
    formatDate,
  };

  const COLUMN_DEFS: ColConfig[] = [
    {
      id: 'address',
      sortKey: 'address',
      header: 'Address',
      render: (p) => `${p.address.city}, ${p.address.state}`,
    },
    {
      id: 'assignee',
      sortKey: 'assignee',
      header: 'Assignee',
      render: (p, h) => h.getUserNames(p.assigneeIds),
    },
    {
      id: 'owner',
      sortKey: 'owner',
      header: 'Owner',
      render: (p, h) =>
        p.projectOwner?.companyId
          ? h.getCompanyById(p.projectOwner.companyId)?.companyName || '—'
          : '—',
    },
    {
      id: 'status',
      sortKey: 'status',
      header: 'Status',
      render: (p, h) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${h.getStatusColorClasses(p.statusId)}`}
        >
          {p.statusId}
        </span>
      ),
    },
    {
      id: 'revenue',
      sortKey: 'revenue',
      header: 'Revenue',
      align: 'right',
      render: (p, h) => `$${Math.round(h.calculateProjectRevenue(p)).toLocaleString('en-US')}`,
    },
    {
      id: 'valuation',
      sortKey: 'valuation',
      header: 'Valuation',
      align: 'right',
      render: (p) => (p.valuation != null ? `$${p.valuation.toLocaleString('en-US')}` : '—'),
    },
    {
      id: 'primaryStage',
      sortKey: 'primaryStage',
      header: 'Primary Stage',
      render: (p, h) => (p.primaryStageId ? h.getLookupLabel('primaryStage', p.primaryStageId) : '—'),
    },
    {
      id: 'projectType',
      sortKey: 'projectType',
      header: 'Project Type',
      render: (p, h) =>
        p.primaryProjectTypeId ? h.getLookupLabel('primaryProjectType', p.primaryProjectTypeId) : '—',
    },
    {
      id: 'ownershipType',
      sortKey: 'ownershipType',
      header: 'Ownership Type',
      render: (p, h) =>
        p.ownershipTypeId ? h.getLookupLabel('ownershipType', p.ownershipTypeId) : '—',
    },
    {
      id: 'bidDate',
      sortKey: 'bidDate',
      header: 'Bid Date',
      render: (p, h) => h.formatDate(p.bidDate),
    },
    {
      id: 'targetStartDate',
      sortKey: 'targetStartDate',
      header: 'Target Start',
      render: (p, h) => h.formatDate(p.targetStartDate),
    },
    {
      id: 'targetCompletionDate',
      sortKey: 'targetCompletionDate',
      header: 'Target Completion',
      render: (p, h) => h.formatDate(p.targetCompletionDate),
    },
    {
      id: 'externalRef',
      sortKey: 'externalRef',
      header: 'External Reference',
      render: (p) => p.externalReference?.name || '—',
    },
  ];

  // Respect user's column order from visibleColumns
  const activeColumns = visibleColumns
    .map(id => COLUMN_DEFS.find(c => c.id === id))
    .filter((c): c is ColConfig => c !== undefined);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;

    let comparison = 0;

    switch (sortColumn) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'address':
        comparison = `${a.address.city}, ${a.address.state}`.localeCompare(
          `${b.address.city}, ${b.address.state}`,
        );
        break;
      case 'assignee':
        comparison = getUserNames(a.assigneeIds).localeCompare(getUserNames(b.assigneeIds));
        break;
      case 'owner': {
        const ownerA = a.projectOwner?.companyId
          ? getCompanyById(a.projectOwner.companyId)?.companyName || ''
          : '';
        const ownerB = b.projectOwner?.companyId
          ? getCompanyById(b.projectOwner.companyId)?.companyName || ''
          : '';
        comparison = ownerA.localeCompare(ownerB);
        break;
      }
      case 'status':
        comparison = getStatusOrder(a.statusId) - getStatusOrder(b.statusId);
        break;
      case 'revenue':
        comparison = calculateProjectRevenue(a) - calculateProjectRevenue(b);
        break;
      case 'valuation':
        comparison = (a.valuation ?? 0) - (b.valuation ?? 0);
        break;
      case 'primaryStage': {
        const labelA = a.primaryStageId ? getLookupLabel('primaryStage', a.primaryStageId) : '';
        const labelB = b.primaryStageId ? getLookupLabel('primaryStage', b.primaryStageId) : '';
        comparison = labelA.localeCompare(labelB);
        break;
      }
      case 'projectType': {
        const labelA = a.primaryProjectTypeId
          ? getLookupLabel('primaryProjectType', a.primaryProjectTypeId)
          : '';
        const labelB = b.primaryProjectTypeId
          ? getLookupLabel('primaryProjectType', b.primaryProjectTypeId)
          : '';
        comparison = labelA.localeCompare(labelB);
        break;
      }
      case 'ownershipType': {
        const labelA = a.ownershipTypeId ? getLookupLabel('ownershipType', a.ownershipTypeId) : '';
        const labelB = b.ownershipTypeId ? getLookupLabel('ownershipType', b.ownershipTypeId) : '';
        comparison = labelA.localeCompare(labelB);
        break;
      }
      case 'bidDate':
        comparison = (a.bidDate ?? '').localeCompare(b.bidDate ?? '');
        break;
      case 'targetStartDate':
        comparison = (a.targetStartDate ?? '').localeCompare(b.targetStartDate ?? '');
        break;
      case 'targetCompletionDate':
        comparison = (a.targetCompletionDate ?? '').localeCompare(b.targetCompletionDate ?? '');
        break;
      case 'externalRef':
        comparison = (a.externalReference?.name ?? '').localeCompare(
          b.externalReference?.name ?? '',
        );
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return (
        <ArrowUpDown className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
      );
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1" />;
    }
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            {/* Project Name — always visible */}
            <TableHead
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Project Name
                <SortIcon column="name" />
              </div>
            </TableHead>

            {activeColumns.map((col) => (
              <TableHead
                key={col.id}
                className={`cursor-pointer select-none group hover:bg-muted/50 ${
                  col.align === 'right' ? 'text-right' : ''
                }`}
                onClick={() => handleSort(col.sortKey)}
              >
                <div
                  className={`flex items-center ${col.align === 'right' ? 'justify-end' : ''}`}
                >
                  {col.header}
                  <SortIcon column={col.sortKey} />
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={1 + activeColumns.length}
                className="text-center text-muted-foreground py-8"
              >
                No projects found matching the current filters.
              </TableCell>
            </TableRow>
          ) : (
            sortedProjects.map((project) => (
              <TableRow
                key={project.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <TableCell className="font-medium">{project.name}</TableCell>
                {activeColumns.map((col) => (
                  <TableCell
                    key={col.id}
                    className={col.align === 'right' ? 'text-right font-medium' : ''}
                  >
                    {col.render(project, helpers)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
