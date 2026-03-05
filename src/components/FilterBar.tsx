import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';

export const FilterBar = () => {
  const { filters, setFilters, salesReps, projects } = useData();
  const sortedSalesReps = [...salesReps].sort((a, b) => a.lastname.localeCompare(b.lastname));
  const uniqueStatuses = Array.from(new Set(projects.map(p => p.statusId))).sort();

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salesRep">Sales Rep</Label>
          <Select value={filters.salesRepId || "all"} onValueChange={(value) => setFilters({ ...filters, salesRepId: value === "all" ? "" : value })}>
            <SelectTrigger id="salesRep"><SelectValue placeholder="All Sales Reps" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Sales Reps</SelectItem>{sortedSalesReps.map(rep => (<SelectItem key={rep.salesrepid} value={rep.salesrepid.toString()}>{rep.lastname}, {rep.firstname}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="division">Division</Label>
          <Select value={filters.division || "all"} onValueChange={(value) => setFilters({ ...filters, division: value === "all" ? "" : value })}>
            <SelectTrigger id="division"><SelectValue placeholder="All Divisions" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Divisions</SelectItem><SelectItem value="G">G - General Line</SelectItem><SelectItem value="C">C - Compact</SelectItem><SelectItem value="P">P - Paving</SelectItem><SelectItem value="R">R - Heavy Rents</SelectItem><SelectItem value="S">S - Power Systems</SelectItem><SelectItem value="V">V - Rental Services</SelectItem><SelectItem value="X">X - Power Rental</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}>
            <SelectTrigger id="status"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Statuses</SelectItem>{uniqueStatuses.map(status => (<SelectItem key={status} value={status}>{status}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gc">General Contractor</Label>
          <Input id="gc" placeholder="Search GC name..." value={filters.generalContractor} onChange={(e) => setFilters({ ...filters, generalContractor: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label className="opacity-0">Completed</Label>
          <div className="flex items-center space-x-2 h-10"><Switch id="hideCompleted" checked={filters.hideCompleted} onCheckedChange={(checked) => setFilters({ ...filters, hideCompleted: checked })} /><Label htmlFor="hideCompleted" className="text-sm font-normal cursor-pointer">Hide Completed</Label></div>
        </div>
      </div>
    </Card>
  );
};
