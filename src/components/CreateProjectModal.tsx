import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';

import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronsUpDown, X, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';


interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProjectModal = ({ open, onOpenChange }: CreateProjectModalProps) => {
  const { createProject, users, getUserName, getAllKnownCompanies, getCompanyById } = useData();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('Active');
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [ownerCompanyId, setOwnerCompanyId] = useState('');
  const [ownerContactIds, setOwnerContactIds] = useState<number[]>([]);
  const [ownerCompanyOpen, setOwnerCompanyOpen] = useState(false);
  const [locationType, setLocationType] = useState<'address' | 'coordinates'>('address');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const allCompanies = getAllKnownCompanies();
  const selectedOwnerCompany = ownerCompanyId ? getCompanyById(ownerCompanyId) : undefined;

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatusId('Active');
    setAssigneeIds([]);
    setOwnerCompanyId('');
    setOwnerContactIds([]);
    setLocationType('address');
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('USA');
    setLatitude('');
    setLongitude('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter a project name.", variant: "destructive" });
      return;
    }

    if (assigneeIds.length === 0) {
      toast({ title: "Error", description: "Please select at least one assignee.", variant: "destructive" });
      return;
    }

    if (!ownerCompanyId) {
      toast({ title: "Error", description: "Please select a project owner company.", variant: "destructive" });
      return;
    }

    if (locationType === 'address') {
      if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
        toast({ title: "Error", description: "Please fill in all address fields.", variant: "destructive" });
        return;
      }
    } else {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        toast({ title: "Error", description: "Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180).", variant: "destructive" });
        return;
      }
    }

    createProject({
      name: name.trim(),
      description: description.trim(),
      statusId,
      assigneeIds,
      projectOwner: {
        companyId: ownerCompanyId,
        contactIds: ownerContactIds,
      },
      address: locationType === 'address' 
        ? { street: street.trim(), city: city.trim(), state: state.trim(), zipCode: zipCode.trim(), country: country.trim(), latitude: 0, longitude: 0 }
        : { street: '', city: '', state: '', zipCode: '', country: '', latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      projectCompanies: [],
      associatedOpportunities: [],
      notes: [],
      activities: [],
      customerEquipment: []
    });

    toast({ title: "Success", description: `Project "${name.trim()}" created successfully.` });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Enter the details for the new project.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-semibold">Basic Information</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter project name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={statusId} onValueChange={setStatusId}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee(s) *</Label>
                <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={assigneeOpen} className="w-full justify-between h-auto min-h-10">
                      <div className="flex flex-wrap gap-1">
                        {assigneeIds.length > 0
                          ? assigneeIds.map(id => (
                              <span key={id} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                                {getUserName(id)}
                                <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={(e) => { e.stopPropagation(); setAssigneeIds(prev => prev.filter(r => r !== id)); }} />
                              </span>
                            ))
                          : <span className="text-muted-foreground">Select assignees...</span>}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search user..." />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem key={user.id} value={`${user.firstName} ${user.lastName}`} onSelect={() => { setAssigneeIds(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id]); }}>
                              <Check className={cn("mr-2 h-4 w-4", assigneeIds.includes(user.id) ? "opacity-100" : "opacity-0")} />
                              {user.firstName} {user.lastName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Location</h3>
              <div className="flex rounded-md border border-input overflow-hidden">
                <Button type="button" variant={locationType === 'address' ? 'default' : 'ghost'} size="sm" className="rounded-none h-7 text-xs" onClick={() => setLocationType('address')}>Address</Button>
                <Button type="button" variant={locationType === 'coordinates' ? 'default' : 'ghost'} size="sm" className="rounded-none h-7 text-xs" onClick={() => setLocationType('coordinates')}>Coordinates</Button>
              </div>
            </div>
            {locationType === 'address' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main Street" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="city">City *</Label><Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" /></div>
                  <div className="space-y-2"><Label htmlFor="state">State *</Label><Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="CA" /></div>
                  <div className="space-y-2"><Label htmlFor="zipCode">Zip Code *</Label><Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="12345" /></div>
                  <div className="space-y-2"><Label htmlFor="country">Country *</Label><Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" /></div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="latitude">Latitude *</Label><Input id="latitude" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="-90 to 90" /></div>
                <div className="space-y-2"><Label htmlFor="longitude">Longitude *</Label><Input id="longitude" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-180 to 180" /></div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter project description..." rows={4} />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" /> Project Owner</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Popover open={ownerCompanyOpen} onOpenChange={setOwnerCompanyOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={ownerCompanyOpen} className="w-full justify-between">
                      {selectedOwnerCompany ? selectedOwnerCompany.companyName : <span className="text-muted-foreground">Select a company...</span>}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search company..." />
                      <CommandList>
                        <CommandEmpty>No company found.</CommandEmpty>
                        <CommandGroup>
                          {allCompanies.map((company) => (
                            <CommandItem
                              key={company.companyId}
                              value={company.companyName}
                              onSelect={() => {
                                setOwnerCompanyId(company.companyId);
                                setOwnerContactIds([]);
                                setOwnerCompanyOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", ownerCompanyId === company.companyId ? "opacity-100" : "opacity-0")} />
                              {company.companyName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedOwnerCompany && selectedOwnerCompany.companyContacts.length > 0 && (
                <div className="space-y-2">
                  <Label>Contact(s)</Label>
                  <div className="space-y-2 rounded-md border border-input p-3">
                    {selectedOwnerCompany.companyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`owner-contact-${contact.id}`}
                          checked={ownerContactIds.includes(contact.id)}
                          onCheckedChange={(checked) => {
                            setOwnerContactIds(prev =>
                              checked ? [...prev, contact.id] : prev.filter(id => id !== contact.id)
                            );
                          }}
                        />
                        <label htmlFor={`owner-contact-${contact.id}`} className="text-sm cursor-pointer flex-1">
                          <span className="font-medium">{contact.name}</span>
                          {contact.title && <span className="text-muted-foreground"> — {contact.title}</span>}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};