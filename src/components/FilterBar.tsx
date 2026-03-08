import { useData } from '@/contexts/DataContext';
import { DIVISIONS } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';

export const FilterBar = () => {
  const { filters, setFilters, users, projects } = useData();
  const sortedUsers = [...users].sort((a, b) => a.lastName.localeCompare(b.lastName));
  const uniqueStatuses = Array.from(new Set(projects.map(p => p.statusId))).sort();

  const assigneeOptions = sortedUsers.map(user => ({
    value: user.id.toString(),
    label: `${user.lastName}, ${user.firstName}`,
  }));

  const divisionOptions = DIVISIONS.map(d => ({
    value: d.code,
    label: `${d.code} - ${d.name}`,
  }));

  const statusOptions = uniqueStatuses.map(status => ({
    value: status,
    label: status,
  }));

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label>Assignee</Label>
          <MultiSelectFilter
            label="Assignees"
            options={assigneeOptions}
            selected={filters.assigneeIds}
            onSelectionChange={(values) => setFilters({ ...filters, assigneeIds: values })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label>Division</Label>
          <MultiSelectFilter
            label="Divisions"
            options={divisionOptions}
            selected={filters.divisions}
            onSelectionChange={(values) => setFilters({ ...filters, divisions: values })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <MultiSelectFilter
            label="Statuses"
            options={statusOptions}
            selected={filters.statuses}
            onSelectionChange={(values) => setFilters({ ...filters, statuses: values })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gc">General Contractor</Label>
          <Input id="gc" placeholder="Search GC name..." value={filters.generalContractor} onChange={(e) => setFilters({ ...filters, generalContractor: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label className="opacity-0">Completed</Label>
          <div className="flex items-center space-x-2 h-10">
            <Switch id="hideCompleted" checked={filters.hideCompleted} onCheckedChange={(checked) => setFilters({ ...filters, hideCompleted: checked })} />
            <Label htmlFor="hideCompleted" className="text-sm font-normal cursor-pointer">Hide Completed</Label>
          </div>
        </div>
      </div>
    </Card>
  );
};
