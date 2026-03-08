import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useStatusColors } from '@/hooks/useStatusColors';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Project } from '@/types';

type SortColumn = 'name' | 'address' | 'assignee' | 'owner' | 'status' | 'revenue';
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

export const ProjectTable = () => {
  const navigate = useNavigate();
  const { getFilteredProjects, getUserNames, calculateProjectRevenue, getCompanyById } = useData();
  const { getStatusColorClasses } = useStatusColors();
  const [sortColumn, setSortColumn] = useState<SortColumn | null>('status');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredProjects = getFilteredProjects();

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
          `${b.address.city}, ${b.address.state}`
        );
        break;
      case 'assignee':
        comparison = getUserNames(a.assigneeIds).localeCompare(getUserNames(b.assigneeIds));
        break;
      case 'owner': {
        const ownerA = a.projectOwner?.companyId ? getCompanyById(a.projectOwner.companyId)?.companyName || '' : '';
        const ownerB = b.projectOwner?.companyId ? getCompanyById(b.projectOwner.companyId)?.companyName || '' : '';
        comparison = ownerA.localeCompare(ownerB);
        break;
      }
        break;
      case 'status':
        comparison = getStatusOrder(a.statusId) - getStatusOrder(b.statusId);
        break;
      case 'revenue':
        comparison = calculateProjectRevenue(a) - calculateProjectRevenue(b);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />;
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
            <TableHead 
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Project Name
                <SortIcon column="name" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('address')}
            >
              <div className="flex items-center">
                Address
                <SortIcon column="address" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('assignee')}
            >
              <div className="flex items-center">
                Assignee
                <SortIcon column="assignee" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('owner')}
            >
              <div className="flex items-center">
                Owner
                <SortIcon column="owner" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                Status
                <SortIcon column="status" />
              </div>
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('revenue')}
            >
              <div className="flex items-center justify-end">
                Revenue
                <SortIcon column="revenue" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No projects found matching the current filters.
              </TableCell>
            </TableRow>
          ) : (
            sortedProjects.map(project => (
              <TableRow 
                key={project.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.address.city}, {project.address.state}</TableCell>
                <TableCell>{getUserNames(project.assigneeIds)}</TableCell>
                <TableCell>{project.projectOwner?.companyId ? getCompanyById(project.projectOwner.companyId)?.companyName || '—' : '—'}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClasses(project.statusId)}`}>
                    {project.statusId}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${calculateProjectRevenue(project).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
