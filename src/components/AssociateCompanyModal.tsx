import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, ChevronsUpDown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RoleMultiSelect, getRoleLabel } from '@/components/RoleMultiSelect';

interface AssociateCompanyModalProps {
  projectId: number;
  currentCompanyNames: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const isProspect = (companyId: string) => companyId.startsWith('$');

export const AssociateCompanyModal = ({ projectId, currentCompanyNames, open, onOpenChange }: AssociateCompanyModalProps) => {
  const { projects, addProjectCompany } = useData();
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [primaryContactId, setPrimaryContactId] = useState<number | null>(null);
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

  const selectedCompanyObj = useMemo(() => {
    return availableCompanies.find((c: any) => c.companyName === selectedCompany);
  }, [availableCompanies, selectedCompany]);

  const companyContacts = useMemo(() => {
    return selectedCompanyObj?.companyContacts || [];
  }, [selectedCompanyObj]);


  const toggleContact = (contactId: number) => {
    setSelectedContactIds(prev => {
      const next = prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId];
      // If we unchecked the primary contact, clear primary
      if (!next.includes(primaryContactId as number)) {
        setPrimaryContactId(null);
      }
      return next;
    });
  };

  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value === selectedCompany ? '' : value);
    setSelectedContactIds([]);
    setPrimaryContactId(null);
    setComboboxOpen(false);
  };

  const resetForm = () => {
    setSelectedCompany('');
    setSelectedRoles([]);
    setSelectedContactIds([]);
    setPrimaryContactId(null);
    setComboboxOpen(false);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || selectedRoles.length === 0) {
      toast({ title: "Missing Information", description: "Please select a company and at least one role.", variant: "destructive" });
      return;
    }
    const company = selectedCompanyObj;
    if (!company) return;

    const roleDescriptions = selectedRoles.map(id => getRoleLabel(id));
    const allContacts = company.companyContacts || [];
    const contactsToInclude = selectedContactIds.length > 0
      ? allContacts.filter((c: any) => selectedContactIds.includes(c.id))
      : allContacts.length > 0 ? allContacts : [{ id: 1, name: 'Contact Required', phone: '', email: '' }];

    // Mark primary contact
    const finalContacts = contactsToInclude.map((c: any) => ({ ...c }));

    const companyData: any = {
      companyId: company.companyId || `ASSOC-${Date.now()}`,
      companyName: company.companyName,
      roleId: selectedRoles[0],
      roleDescription: roleDescriptions[0],
      roleIds: selectedRoles,
      roleDescriptions,
      isPrimaryContact: primaryContactId !== null,
      companyContacts: finalContacts,
    };
    if (primaryContactId !== null) {
      companyData.primaryContactIndex = finalContacts.findIndex((c: any) => c.id === primaryContactId);
    }
    addProjectCompany(projectId, companyData);
    toast({ title: "Success", description: `${company.companyName} associated as ${roleDescriptions.join(', ')}.` });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Associate Existing Company</DialogTitle>
          <DialogDescription>Associate a known company (prospect or customer) to this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {availableCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No companies available. All companies from other projects are already associated.</p>
            ) : (
              <>
                {/* Company Selection */}
                <div className="grid gap-2">
                  <Label htmlFor="company">Company *</Label>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button id="company" variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between">
                        {selectedCompany || "Select a company..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
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
                                <CommandItem key={company.companyName} value={company.companyName} onSelect={handleCompanyChange}>
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

                {/* Multi-Role Selection */}
                <div className="grid gap-2">
                  <Label>Role(s) *</Label>
                  <RoleMultiSelect
                    selectedRoles={selectedRoles}
                    onRolesChange={setSelectedRoles}
                    placeholder="Select role(s)..."
                    required
                  />
                </div>

                {/* Contact Selection (optional, shown after company selected) */}
                {selectedCompany && companyContacts.length > 0 && (
                  <div className="grid gap-2">
                    <Label className="text-sm">Contacts <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                      {companyContacts.map((contact: any) => {
                        const isSelected = selectedContactIds.includes(contact.id);
                        const isPrimary = primaryContactId === contact.id;
                        return (
                          <div key={contact.id} className="flex items-center gap-3 px-3 py-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleContact(contact.id)}
                            />
                            <button
                              type="button"
                              disabled={!isSelected}
                              onClick={() => setPrimaryContactId(isPrimary ? null : contact.id)}
                              className={cn(
                                "shrink-0 transition-colors",
                                isSelected ? "cursor-pointer" : "cursor-not-allowed opacity-30",
                                isPrimary ? "text-amber-500" : "text-muted-foreground hover:text-amber-400"
                              )}
                              title={isPrimary ? "Remove as primary" : "Set as primary contact"}
                            >
                              <Star className={cn("h-4 w-4", isPrimary && "fill-current")} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{contact.name}</p>
                              {contact.title && <p className="text-xs text-muted-foreground truncate">{contact.title}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={availableCompanies.length === 0}>Associate Company</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
