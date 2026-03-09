import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useStatusColors } from '@/hooks/useStatusColors';
import { useColumnVisibility, ColumnId } from '@/hooks/useColumnVisibility';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnVisibilitySelector } from '@/components/ColumnVisibilitySelector';
import { FilterModal } from '@/components/FilterModal';
import { ActiveFilterBadges } from '@/components/ActiveFilterBadges';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
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

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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
  const { visibleColumns } = useColumnVisibility();
  const [sortColumn, setSortColumn] = useState<SortColumn | null>('status');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = getFilteredProjects();
  const searchedProjects = searchQuery
    ? filteredProjects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredProjects;

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

  const sortedProjects = [...searchedProjects].sort((a, b) => {
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedProjects.length]);

  // Pagination calculations
  const totalProjects = sortedProjects.length;
  const totalPages = Math.ceil(totalProjects / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalProjects);
  const paginatedProjects = sortedProjects.slice(startIndex, endIndex);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

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
    <Card className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
        <p className="text-sm text-muted-foreground shrink-0">
          {totalProjects} project{totalProjects !== 1 ? 's' : ''} total
        </p>
        <div className="relative shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="h-8 w-48 pl-8 text-sm"
          />
        </div>
        <div className="flex-1 min-w-0">
          <ActiveFilterBadges />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowFilterModal(true)}>
            <Filter className="h-4 w-4 mr-1.5" />
            Filters
          </Button>
          <ColumnVisibilitySelector />
        </div>
      </div>
      
      <div className="relative w-full flex-1 min-h-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Project Name — always visible */}
              <TableHead
                className="cursor-pointer select-none group hover:bg-muted"
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
                  className={`cursor-pointer select-none group hover:bg-muted ${
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
            {paginatedProjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={1 + activeColumns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  No projects found matching the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProjects.map((project) => (
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
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {totalProjects > 0 
              ? `Showing ${startIndex + 1}–${endIndex} of ${totalProjects}`
              : 'No results'
            }
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <FilterModal open={showFilterModal} onOpenChange={setShowFilterModal} />
    </Card>
  );
};
