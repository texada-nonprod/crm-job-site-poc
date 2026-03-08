import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';

import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types';
import { X, Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';


type LocationType = 'address' | 'coordinates';

interface EditProjectModalProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProjectModal = ({ project, open, onOpenChange }: EditProjectModalProps) => {
  const { updateProject, users, getUserName, getAllKnownCompanies, getCompanyById } = useData();
  const { toast } = useToast();

  const [assigneeIds, setAssigneeIds] = useState<number[]>(project.assigneeIds);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [description, setDescription] = useState(project.description);
  const [ownerCompanyId, setOwnerCompanyId] = useState(project.projectOwner?.companyId || '');
  const [ownerContactIds, setOwnerContactIds] = useState<number[]>(project.projectOwner?.contactIds || []);
  const [ownerCompanyOpen, setOwnerCompanyOpen] = useState(false);
  const [street, setStreet] = useState(project.address.street);
  const [city, setCity] = useState(project.address.city);
  const [state, setState] = useState(project.address.state);
  const [zipCode, setZipCode] = useState(project.address.zipCode);
  const [country, setCountry] = useState(project.address.country);
  const [latitude, setLatitude] = useState(project.address.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(project.address.longitude?.toString() || '');
  const [locationType, setLocationType] = useState<LocationType>('address');

  const allCompanies = getAllKnownCompanies();
  const selectedOwnerCompany = ownerCompanyId ? getCompanyById(ownerCompanyId) : undefined;

  useEffect(() => {
    if (open) {
      setAssigneeIds(project.assigneeIds);
      setDescription(project.description);
      setOwnerCompanyId(project.projectOwner?.companyId || '');
      setOwnerContactIds(project.projectOwner?.contactIds || []);
      setStreet(project.address.street);
      setCity(project.address.city);
      setState(project.address.state);
      setZipCode(project.address.zipCode);
      setCountry(project.address.country);
      setLatitude(project.address.latitude?.toString() || '');
      setLongitude(project.address.longitude?.toString() || '');
      const hasAddress = project.address.street && project.address.city && project.address.state;
      setLocationType(hasAddress ? 'address' : 'coordinates');
    }
  }, [open, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerCompanyId) {
      toast({ title: "Error", description: "Please select a project owner company.", variant: "destructive" }); return;
    }
    if (locationType === 'address') {
      if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
        toast({ title: "Error", description: "Please fill in all address fields.", variant: "destructive" }); return;
      }
    } else {
      const lat = parseFloat(latitude); const lon = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        toast({ title: "Error", description: "Please enter valid coordinates.", variant: "destructive" }); return;
      }
    }
    if (assigneeIds.length === 0) {
      toast({ title: "Error", description: "Please select at least one assignee.", variant: "destructive" }); return;
    }

    updateProject(project.id, {
      assigneeIds,
      description: description.trim(),
      address: {
        street: locationType === 'address' ? street.trim() : '',
        city: locationType === 'address' ? city.trim() : '',
        state: locationType === 'address' ? state.trim() : '',
        zipCode: locationType === 'address' ? zipCode.trim() : '',
        country: locationType === 'address' ? country.trim() : '',
        latitude: locationType === 'coordinates' ? parseFloat(latitude) : project.address.latitude,
        longitude: locationType === 'coordinates' ? parseFloat(longitude) : project.address.longitude
      },
      projectOwner: {
        companyId: ownerCompanyId,
        contactIds: ownerContactIds,
      }
    });

    toast({ title: "Success", description: "Project updated successfully." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project Details</DialogTitle>
          <DialogDescription>Update the details for {project.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-semibold">Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee(s) *</Label>
                <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={assigneeOpen} className="w-full justify-between h-auto min-h-10">
                      <div className="flex flex-wrap gap-1">
                        {assigneeIds.length > 0 ? assigneeIds.map(id => (
                          <span key={id} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                            {getUserName(id)}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={(e) => { e.stopPropagation(); setAssigneeIds(prev => prev.filter(r => r !== id)); }} />
                          </span>
                        )) : <span className="text-muted-foreground">Select assignees...</span>}
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
                <Button type="button" variant={locationType === 'address' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setLocationType('address')}>Address</Button>
                <Button type="button" variant={locationType === 'coordinates' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setLocationType('coordinates')}>Coordinates</Button>
              </div>
            </div>
            {locationType === 'address' ? (
              <>
                <div className="space-y-2"><Label htmlFor="street">Street Address *</Label><Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main Street" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="city">City *</Label><Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" /></div>
                  <div className="space-y-2"><Label htmlFor="state">State *</Label><Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="CA" /></div>
                  <div className="space-y-2"><Label htmlFor="zipCode">Zip Code *</Label><Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="12345" /></div>
                  <div className="space-y-2"><Label htmlFor="country">Country *</Label><Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" /></div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="latitude">Latitude *</Label><Input id="latitude" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 37.7749" /><p className="text-xs text-muted-foreground">Range: -90 to 90</p></div>
                <div className="space-y-2"><Label htmlFor="longitude">Longitude *</Label><Input id="longitude" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. -122.4194" /><p className="text-xs text-muted-foreground">Range: -180 to 180</p></div>
              </div>
            )}
          </div>
          <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter project description..." rows={4} /></div>
          
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
                          id={`edit-owner-contact-${contact.id}`}
                          checked={ownerContactIds.includes(contact.id)}
                          onCheckedChange={(checked) => {
                            setOwnerContactIds(prev =>
                              checked ? [...prev, contact.id] : prev.filter(id => id !== contact.id)
                            );
                          }}
                        />
                        <label htmlFor={`edit-owner-contact-${contact.id}`} className="text-sm cursor-pointer flex-1">
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};