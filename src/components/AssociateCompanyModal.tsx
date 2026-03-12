import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssociateCompanyModalProps {
  projectId: number;
  currentCompanyNames: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_OPTIONS = [
  { id: 'SUB_PLUMBING', label: 'Plumbing Subcontractor' }, { id: 'SUB_ELECTRICAL', label: 'Electrical Subcontractor' },
  { id: 'SUB_HVAC', label: 'HVAC Subcontractor' }, { id: 'SUB_CONCRETE', label: 'Concrete Subcontractor' },
  { id: 'SUB_FRAMING', label: 'Framing Subcontractor' }, { id: 'SUB_ROOFING', label: 'Roofing Subcontractor' },
  { id: 'SUB_DRYWALL', label: 'Drywall Subcontractor' }, { id: 'SUB_PAINTING', label: 'Painting Subcontractor' },
  { id: 'SUB_FLOORING', label: 'Flooring Subcontractor' }, { id: 'SUPPLIER', label: 'Supplier' },
  { id: 'ARCHITECT', label: 'Architect' }, { id: 'ENGINEER', label: 'Engineer' }, { id: 'OTHER', label: 'Other' },
];

const isProspect = (companyId: string) => companyId.startsWith('$');

export const AssociateCompanyModal = ({ projectId, currentCompanyNames, open, onOpenChange }: AssociateCompanyModalProps) => {
  const { projects, addProjectCompany } = useData();
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableCompanies = useMemo(() => {
    const companiesMap = new Map();
    projects.forEach(project => {
      project.projectCompanies.forEach(company => {
        if (!currentCompanyNames.includes(company.companyName) && !companiesMap.has(company.companyName)) companiesMap.set(company.companyName, company);
      });
    });
    return Array.from(companiesMap.values()).sort((a: any, b: any) => a.companyName.localeCompare(b.companyName));
  }, [projects, currentCompanyNames]);

  const filteredCompanies = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return availableCompanies.filter((c: any) => c.companyName.toLowerCase().includes(query)).slice(0, 20);
  }, [availableCompanies, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !selectedRole) { toast({ title: "Missing Information", description: "Please select both a company and a role.", variant: "destructive" }); return; }
    const company = availableCompanies.find((c: any) => c.companyName === selectedCompany);
    const roleOption = ROLE_OPTIONS.find(r => r.id === selectedRole);
    if (!company || !roleOption) return;
    const allContacts = company.companyContacts || [];
    addProjectCompany(projectId, {
      companyId: company.companyId || `ASSOC-${Date.now()}`, companyName: company.companyName, roleId: selectedRole, roleDescription: roleOption.label, isPrimaryContact,
      companyContacts: allContacts.length > 0 ? allContacts : [{ id: 1, name: 'Contact Required', phone: '', email: '' }]
    });
    toast({ title: "Success", description: `${company.companyName} associated as ${roleOption.label}.` });
    setSelectedCompany(''); setSelectedRole(''); setIsPrimaryContact(false); setComboboxOpen(false); setSearchQuery(''); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>Associate Existing Company</DialogTitle><DialogDescription>Associate a known company (prospect or customer) to this project.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {availableCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No companies available. All companies from other projects are already associated.</p>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company *</Label>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild><Button id="company" variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between">{selectedCompany || "Select a company..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50">
                      <Command shouldFilter={false}>
                        <CommandInput placeholder="Search companies..." value={searchQuery} onValueChange={setSearchQuery} />
                        <CommandList>
                          {searchQuery.length < 2 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">Type at least 2 characters to search...</div>
                          ) : filteredCompanies.length === 0 ? (
                            <CommandEmpty>No company found.</CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {filteredCompanies.map((company: any) => (
                                <CommandItem key={company.companyName} value={company.companyName} onSelect={(v) => { setSelectedCompany(v === selectedCompany ? "" : v); setComboboxOpen(false); }}>
                                  <Check className={cn("mr-2 h-4 w-4", selectedCompany === company.companyName ? "opacity-100" : "opacity-0")} />
                                  <span className="flex-1">{company.companyName}</span>
                                  {isProspect(company.companyId || '') && <Badge className="bg-amber-500/15 text-amber-700 border-amber-300 text-[10px] px-1.5 py-0 ml-2">Prospect</Badge>}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">{ROLE_OPTIONS.map((role) => (<SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="primary" checked={isPrimaryContact} onCheckedChange={(checked) => setIsPrimaryContact(checked === true)} />
                  <Label htmlFor="primary" className="text-sm font-normal cursor-pointer">Set as primary contact for this role</Label>
                </div>
              </>
            )}
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={availableCompanies.length === 0}>Associate Company</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
