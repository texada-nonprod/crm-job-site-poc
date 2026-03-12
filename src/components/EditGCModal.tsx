import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronsUpDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectCompany } from '@/types';
import { ManageCompanyContactsModal } from './ManageCompanyContactsModal';

interface EditGCModalProps {
  projectId: number;
  currentGC: ProjectCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditGCModal = ({ projectId, currentGC, open, onOpenChange }: EditGCModalProps) => {
  const { projects, updateProjectCompany } = useData();
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState(currentGC.companyName);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [showManageContacts, setShowManageContacts] = useState(false);
  const [workingCompany, setWorkingCompany] = useState<ProjectCompany>(currentGC);

  const getAllCompanyContacts = (companyName: string) => {
    const contactsMap = new Map<string, typeof currentGC.companyContacts[0]>();
    projects.forEach(project => {
      project.projectCompanies.forEach(company => {
        if (company.companyName === companyName) {
          company.companyContacts.forEach(contact => {
            if (!contactsMap.has(contact.email)) contactsMap.set(contact.email, contact);
          });
        }
      });
    });
    return Array.from(contactsMap.values());
  };

  const availableCompanies = useMemo(() => {
    const companiesMap = new Map();
    projects.forEach(project => {
      project.projectCompanies.forEach(company => {
        if ((company.roleIds?.includes('GC') || company.roleId === 'GC') && !companiesMap.has(company.companyName)) companiesMap.set(company.companyName, company);
      });
    });
    return Array.from(companiesMap.values()).sort((a: ProjectCompany, b: ProjectCompany) => a.companyName.localeCompare(b.companyName));
  }, [projects]);

  useEffect(() => { if (open) { setSelectedCompany(currentGC.companyName); setWorkingCompany(currentGC); } }, [open, currentGC]);

  const handleCompanyChange = (companyName: string) => {
    setSelectedCompany(companyName);
    const company = availableCompanies.find((c: ProjectCompany) => c.companyName === companyName);
    if (company) setWorkingCompany({ ...company, roleId: 'GC', roleDescription: 'General Contractor', isPrimaryContact: true });
  };

  const handleSaveContacts = (updatedCompany: ProjectCompany) => { setWorkingCompany(updatedCompany); setShowManageContacts(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) { toast({ title: "Missing Information", description: "Please select a company.", variant: "destructive" }); return; }
    if (!workingCompany.companyContacts || workingCompany.companyContacts.length === 0) { toast({ title: "Missing Information", description: "At least one contact is required.", variant: "destructive" }); return; }
    updateProjectCompany(projectId, currentGC.companyName, { ...workingCompany, companyName: selectedCompany, roleId: 'GC', roleDescription: 'General Contractor', isPrimaryContact: true });
    toast({ title: "Success", description: "General Contractor updated successfully." });
    onOpenChange(false);
  };

  const primaryContact = workingCompany.companyContacts?.[workingCompany.primaryContactIndex || 0];
  const contactCount = workingCompany.companyContacts?.length || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Edit General Contractor</DialogTitle><DialogDescription>Change the GC company or manage contacts.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company *</Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild><Button id="company" variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between">{selectedCompany || "Select a company..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50">
                    <Command><CommandInput placeholder="Search companies..." /><CommandList><CommandEmpty>No company found.</CommandEmpty><CommandGroup>
                      {availableCompanies.map((company: ProjectCompany) => (
                        <CommandItem key={company.companyName} value={company.companyName} onSelect={(v) => { handleCompanyChange(v); setComboboxOpen(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", selectedCompany === company.companyName ? "opacity-100" : "opacity-0")} />{company.companyName}
                        </CommandItem>
                      ))}
                    </CommandGroup></CommandList></Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Contacts ({contactCount})</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowManageContacts(true)}><Users className="h-4 w-4 mr-2" />Manage Contacts</Button>
                </div>
                {primaryContact ? (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Primary: {primaryContact.name}</p>
                    {primaryContact.title && <p className="text-xs text-muted-foreground">{primaryContact.title}</p>}
                    <p className="text-xs text-muted-foreground">{primaryContact.phone}</p>
                    <a href={`mailto:${primaryContact.email}`} className="text-xs text-primary hover:underline">{primaryContact.email}</a>
                    {contactCount > 1 && <p className="text-xs text-muted-foreground mt-2">+ {contactCount - 1} more contact{contactCount > 2 ? 's' : ''}</p>}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No contacts assigned</p>}
              </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ManageCompanyContactsModal company={workingCompany} allCompanyContacts={getAllCompanyContacts(workingCompany.companyName)} open={showManageContacts} onOpenChange={setShowManageContacts} onSave={handleSaveContacts} countryCode={projects.find(p => p.id === projectId)?.address?.country || 'US'} />
    </>
  );
};
