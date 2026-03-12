import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CompanyContact, ProjectCompany, getCompanyRoles } from '@/types';
import { Star, Pencil, Trash2, Plus, X, Check, UserPlus, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { DIVISIONS, getDivisionName } from '@/contexts/DataContext';
import { CreateContactForm } from './CreateContactForm';
import mailCodesData from '@/data/MailCodes.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ROLE_OPTIONS = [
  { id: 'GC', label: 'General Contractor' },
  { id: 'SUB_PLUMBING', label: 'Plumbing Subcontractor' }, { id: 'SUB_ELECTRICAL', label: 'Electrical Subcontractor' },
  { id: 'SUB_HVAC', label: 'HVAC Subcontractor' }, { id: 'SUB_CONCRETE', label: 'Concrete Subcontractor' },
  { id: 'SUB_FRAMING', label: 'Framing Subcontractor' }, { id: 'SUB_ROOFING', label: 'Roofing Subcontractor' },
  { id: 'SUB_DRYWALL', label: 'Drywall Subcontractor' }, { id: 'SUB_PAINTING', label: 'Painting Subcontractor' },
  { id: 'SUB_FLOORING', label: 'Flooring Subcontractor' }, { id: 'SUPPLIER', label: 'Supplier' },
  { id: 'SUB-EXC', label: 'Subcontractor - Excavation' }, { id: 'SUB-PAV', label: 'Subcontractor - Paving' },
  { id: 'SUB-ELEC', label: 'Subcontractor - Electrical' }, { id: 'SUB-MECH', label: 'Subcontractor - Mechanical' },
  { id: 'SUB-SPEC', label: 'Subcontractor - Specialized' }, { id: 'SUB-STEEL', label: 'Subcontractor - Steel' },
  { id: 'ARCHITECT', label: 'Architect' }, { id: 'ENGINEER', label: 'Engineer' }, { id: 'OTHER', label: 'Other' },
];
interface ManageCompanyContactsModalProps {
  company: ProjectCompany;
  allCompanyContacts: CompanyContact[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedCompany: ProjectCompany) => void;
  countryCode: string;
}

interface ContactFormData { name: string; title: string; phone: string; email: string; divisionIds: string[]; mailCodes: string[]; }
const emptyContact: ContactFormData = { name: '', title: '', phone: '', email: '', divisionIds: [], mailCodes: [] };

export const ManageCompanyContactsModal = ({ company, allCompanyContacts, open, onOpenChange, onSave, countryCode }: ManageCompanyContactsModalProps) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ContactFormData>(emptyContact);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  const [companyRoleIds, setCompanyRoleIds] = useState<string[]>([]);
  const [addRoleValue, setAddRoleValue] = useState('');

  const availableContacts = allCompanyContacts.filter(ac => !contacts.some(c => c.email === ac.email));

  // Filter divisions to only those the company belongs to
  const availableDivisions = company.divisionIds && company.divisionIds.length > 0
    ? DIVISIONS.filter(d => company.divisionIds!.includes(d.code))
    : DIVISIONS;

  useEffect(() => {
    if (open && company) {
      setContacts([...(company.companyContacts || [])]);
      setPrimaryIndex(company.primaryContactIndex || 0);
      setEditingId(null);
      setShowAddSection(false);
      setShowCreateForm(false);
      setSelectedEmails(new Set());
      const roles = getCompanyRoles(company);
      setCompanyRoleIds([...roles.ids]);
    }
  }, [open, company]);

  const handleSetPrimary = (index: number) => setPrimaryIndex(index);
  const handleStartEdit = (contact: CompanyContact) => { setEditingId(contact.id); setEditForm({ name: contact.name, title: contact.title || '', phone: contact.phone, email: contact.email, divisionIds: contact.divisionIds || [], mailCodes: contact.mailCodes || [] }); };
  const handleCancelEdit = () => { setEditingId(null); setEditForm(emptyContact); };
  const handleSaveEdit = (contactId: number) => {
    if (!editForm.name.trim() || !editForm.email.trim()) { toast({ title: "Missing Information", description: "Name and email are required.", variant: "destructive" }); return; }
    if (editForm.divisionIds.length === 0) { toast({ title: "Division Required", description: "At least one division must be selected.", variant: "destructive" }); return; }
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, name: editForm.name.trim(), title: editForm.title.trim(), phone: editForm.phone.trim(), email: editForm.email.trim(), divisionIds: editForm.divisionIds, mailCodes: editForm.mailCodes.length > 0 ? editForm.mailCodes : undefined } : c));
    setEditingId(null); setEditForm(emptyContact);
  };
  const handleRemoveContact = (contactId: number) => {
    if (contacts.length <= 1) { toast({ title: "Cannot Remove", description: "At least one contact is required per company.", variant: "destructive" }); return; }
    const contactIndex = contacts.findIndex(c => c.id === contactId);
    setContacts(prev => prev.filter(c => c.id !== contactId));
    if (contactIndex < primaryIndex) setPrimaryIndex(prev => prev - 1);
    else if (contactIndex === primaryIndex) setPrimaryIndex(0);
  };
  const handleToggleContact = (email: string) => { setSelectedEmails(prev => { const n = new Set(prev); if (n.has(email)) n.delete(email); else n.add(email); return n; }); };
  const handleAddSelectedContacts = () => {
    if (selectedEmails.size === 0) { toast({ title: "No Contacts Selected", description: "Please select at least one contact to add.", variant: "destructive" }); return; }
    const contactsToAdd = availableContacts.filter(c => selectedEmails.has(c.email));
    const maxId = Math.max(...contacts.map(c => c.id), 0);
    setContacts(prev => [...prev, ...contactsToAdd.map((c, idx) => ({ ...c, id: maxId + idx + 1 }))]); setShowAddSection(false); setSelectedEmails(new Set());
  };
  const handleCreateContact = (newContact: CompanyContact) => {
    setContacts(prev => [...prev, newContact]);
    setShowCreateForm(false);
    toast({ title: "Contact Created", description: `${newContact.name} has been added.` });
  };
  const handleSave = () => {
    if (contacts.length === 0) { toast({ title: "No Contacts", description: "At least one contact is required.", variant: "destructive" }); return; }
    if (companyRoleIds.length === 0) { toast({ title: "No Roles", description: "At least one role is required.", variant: "destructive" }); return; }
    const roleDescriptions = companyRoleIds.map(id => ROLE_OPTIONS.find(r => r.id === id)?.label || id);
    onSave({
      ...company,
      companyContacts: contacts,
      primaryContactIndex: primaryIndex,
      roleId: companyRoleIds[0],
      roleDescription: roleDescriptions[0],
      roleIds: companyRoleIds,
      roleDescriptions,
    });
    onOpenChange(false);
  };

  const handleRemoveRole = (roleId: string) => {
    if (companyRoleIds.length <= 1) { toast({ title: "Cannot Remove", description: "At least one role is required.", variant: "destructive" }); return; }
    setCompanyRoleIds(prev => prev.filter(id => id !== roleId));
  };

  const handleAddRole = (roleId: string) => {
    if (roleId && !companyRoleIds.includes(roleId)) {
      setCompanyRoleIds(prev => [...prev, roleId]);
    }
    setAddRoleValue('');
  };

  const toggleDivision = (code: string) => {
    setEditForm(prev => ({
      ...prev,
      divisionIds: prev.divisionIds.includes(code)
        ? prev.divisionIds.filter(d => d !== code)
        : [...prev.divisionIds, code]
    }));
  };

  const toggleEditMailCode = (code: string) => {
    setEditForm(prev => ({
      ...prev,
      mailCodes: prev.mailCodes.includes(code)
        ? prev.mailCodes.filter(c => c !== code)
        : [...prev.mailCodes, code]
    }));
  };

  const MailCodeBadges = ({ codes }: { codes?: string[] }) => {
    if (!codes || codes.length === 0) return null;
    return (
      <div className="flex gap-1 flex-wrap">
        {codes.map(code => (
          <Badge key={code} variant="secondary" className="text-[10px] px-1.5 py-0 font-mono"
            title={mailCodesData.find(m => m.code === code)?.description}>{code}</Badge>
        ))}
      </div>
    );
  };

  const DivisionBadges = ({ divisionIds }: { divisionIds?: string[] }) => {
    if (!divisionIds || divisionIds.length === 0) return null;
    return (
      <div className="flex gap-1 flex-wrap">
        {divisionIds.map(div => (
          <Badge key={div} variant="outline" className="text-[10px] px-1.5 py-0 font-mono" title={getDivisionName(div)}>{div}</Badge>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Manage {company.companyName}</DialogTitle><DialogDescription>Edit roles and contacts for this company on the project.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          {/* Roles Section */}
          <div>
            <Label className="text-xs text-muted-foreground font-medium">Roles</Label>
            <div className="flex gap-1.5 flex-wrap mt-1.5 items-center">
              {companyRoleIds.map(roleId => {
                const role = ROLE_OPTIONS.find(r => r.id === roleId);
                return (
                  <Badge key={roleId} variant={roleId === 'GC' ? 'default' : 'secondary'} className="text-xs px-2 py-0.5 gap-1">
                    {role?.label || roleId}
                    <button type="button" onClick={() => handleRemoveRole(roleId)} className="ml-0.5 hover:text-destructive"><X className="h-3 w-3" /></button>
                  </Badge>
                );
              })}
              <Select value={addRoleValue} onValueChange={handleAddRole}>
                <SelectTrigger className="h-7 w-[140px] text-xs"><SelectValue placeholder="+ Add Role" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {ROLE_OPTIONS.filter(r => !companyRoleIds.includes(r.id)).map(role => (
                    <SelectItem key={role.id} value={role.id} className="text-xs">{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between"><h3 className="font-medium text-sm text-muted-foreground">Contacts at this project ({contacts.length})</h3></div>
          {contacts.map((contact, index) => (
            <Card key={contact.id} className={cn("p-4 relative", index === primaryIndex && "ring-2 ring-primary")}>
              {editingId === contact.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Name *</Label><Input value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Contact name" className="h-8" /></div>
                    <div><Label className="text-xs">Title</Label><Input value={editForm.title} onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Job title" className="h-8" /></div>
                    <div><Label className="text-xs">Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="(555) 123-4567" className="h-8" /></div>
                    <div><Label className="text-xs">Email *</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" className="h-8" /></div>
                  </div>
                  <div>
                    <Label className="text-xs">Divisions *</Label>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      {availableDivisions.map(div => (
                        <Badge
                          key={div.code}
                          variant={editForm.divisionIds.includes(div.code) ? "default" : "outline"}
                          className="cursor-pointer text-xs px-2 py-0.5 select-none"
                          onClick={() => toggleDivision(div.code)}
                        >
                          {div.code} – {div.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* Additional Fields - Mail Codes */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground px-0">
                        <ChevronRight className="h-3.5 w-3.5 mr-1.5 collapsible-chevron" />
                        Additional Fields
                        {editForm.mailCodes.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{editForm.mailCodes.length}</Badge>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      <Label className="text-xs">Mail Codes</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs font-normal">
                            {editForm.mailCodes.length === 0 ? 'Select mail codes...' : `${editForm.mailCodes.length} selected`}
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search mail codes..." className="h-8" />
                            <CommandList>
                              <CommandEmpty>No mail codes found.</CommandEmpty>
                              <CommandGroup className="max-h-[200px] overflow-y-auto">
                                {mailCodesData.map(mc => (
                                  <CommandItem key={mc.code} value={`${mc.code} ${mc.description}`} onSelect={() => toggleEditMailCode(mc.code)} className="text-xs">
                                    <Checkbox checked={editForm.mailCodes.includes(mc.code)} className="mr-2 h-3.5 w-3.5" />
                                    <span className="font-mono font-medium mr-2">{mc.code}</span>
                                    <span className="text-muted-foreground truncate">{mc.description}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {editForm.mailCodes.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {editForm.mailCodes.map(code => (
                            <Badge key={code} variant="secondary" className="text-[10px] px-1.5 py-0.5 gap-1">
                              <span className="font-mono">{code}</span>
                              <button onClick={() => toggleEditMailCode(code)} className="ml-0.5 hover:text-destructive"><X className="h-3 w-3" /></button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                  <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={handleCancelEdit}><X className="h-4 w-4 mr-1" /> Cancel</Button><Button size="sm" onClick={() => handleSaveEdit(contact.id)}><Check className="h-4 w-4 mr-1" /> Save</Button></div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {index === primaryIndex && <Star className="h-4 w-4 text-primary fill-primary" />}
                      <span className="font-medium">{contact.name}</span>
                      {contact.title && <span className="text-muted-foreground text-sm">• {contact.title}</span>}
                      <DivisionBadges divisionIds={contact.divisionIds} />
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">{contact.phone && <p>{contact.phone}</p>}<a href={`mailto:${contact.email}`} className="text-primary hover:underline block">{contact.email}</a></div>
                    <MailCodeBadges codes={contact.mailCodes} />
                  </div>
                  <div className="flex items-center gap-1">
                    {index !== primaryIndex && <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(index)} className="text-xs"><Star className="h-3 w-3 mr-1" /> Set Primary</Button>}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(contact)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRemoveContact(contact.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {/* Create New Contact Form */}
          {showCreateForm && (
            <CreateContactForm
              availableDivisions={[...availableDivisions]}
              countryCode={countryCode}
              companyId={company.companyId}
              onSave={handleCreateContact}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {/* Add Existing Contacts */}
          {showAddSection ? (
            <Card className="p-4 border-dashed">
              <h4 className="font-medium mb-3">Add Contacts from {company.companyName}</h4>
              {availableContacts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground"><p>All contacts from this company are already assigned to this project.</p><Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowAddSection(false)}>Close</Button></div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Select contacts to add to this project:</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {availableContacts.map((contact) => (
                      <div key={contact.email} className={cn("flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors", selectedEmails.has(contact.email) ? "bg-primary/10 border-primary" : "hover:bg-muted/50")} onClick={() => handleToggleContact(contact.email)}>
                        <Checkbox checked={selectedEmails.has(contact.email)} onCheckedChange={() => handleToggleContact(contact.email)} className="mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{contact.name}</span>
                            <DivisionBadges divisionIds={contact.divisionIds} />
                          </div>
                          {contact.title && <div className="text-sm text-muted-foreground">{contact.title}</div>}
                          <div className="text-sm text-muted-foreground truncate">{contact.phone && <span>{contact.phone} • </span>}{contact.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" size="sm" onClick={() => { setShowAddSection(false); setSelectedEmails(new Set()); }}>Cancel</Button><Button size="sm" onClick={handleAddSelectedContacts} disabled={selectedEmails.size === 0}><Plus className="h-4 w-4 mr-1" /> Add Selected ({selectedEmails.size})</Button></div>
                </div>
              )}
            </Card>
          ) : !showCreateForm && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-dashed" onClick={() => setShowAddSection(true)} disabled={availableContacts.length === 0}>
                <Plus className="h-4 w-4 mr-2" /> {availableContacts.length === 0 ? "All company contacts added" : "Add Existing Contact"}
              </Button>
              <Button variant="outline" className="flex-1 border-dashed" onClick={() => setShowCreateForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" /> Create New Contact
              </Button>
            </div>
          )}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSave}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
