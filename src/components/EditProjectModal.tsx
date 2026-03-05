import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types';
import { Plus, X, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';


type LocationType = 'address' | 'coordinates';

interface EditProjectModalProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProjectModal = ({ project, open, onOpenChange }: EditProjectModalProps) => {
  const { updateProject, salesReps, getSalesRepName, getSalesRepNames } = useData();
  const { toast } = useToast();

  const [salesRepIds, setSalesRepIds] = useState<number[]>(project.salesRepIds);
  const [salesRepOpen, setSalesRepOpen] = useState(false);
  const [description, setDescription] = useState(project.description);
  const [contactName, setContactName] = useState(project.projectPrimaryContact.name);
  const [contactTitle, setContactTitle] = useState(project.projectPrimaryContact.title);
  const [contactPhone, setContactPhone] = useState(project.projectPrimaryContact.phone);
  const [contactEmail, setContactEmail] = useState(project.projectPrimaryContact.email);
  const [street, setStreet] = useState(project.address.street);
  const [city, setCity] = useState(project.address.city);
  const [state, setState] = useState(project.address.state);
  const [zipCode, setZipCode] = useState(project.address.zipCode);
  const [country, setCountry] = useState(project.address.country);
  const [latitude, setLatitude] = useState(project.address.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(project.address.longitude?.toString() || '');
  const [locationType, setLocationType] = useState<LocationType>('address');

  useEffect(() => {
    if (open) {
      setSalesRepIds(project.salesRepIds);
      setDescription(project.description);
      setContactName(project.projectPrimaryContact.name);
      setContactTitle(project.projectPrimaryContact.title);
      setContactPhone(project.projectPrimaryContact.phone);
      setContactEmail(project.projectPrimaryContact.email);
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
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      toast({ title: "Error", description: "Please fill in all primary contact fields.", variant: "destructive" }); return;
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
    if (salesRepIds.length === 0) {
      toast({ title: "Error", description: "Please select at least one sales rep.", variant: "destructive" }); return;
    }

    updateProject(project.id, {
      salesRepIds,
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
      projectPrimaryContact: {
        name: contactName.trim(), title: contactTitle.trim(), phone: contactPhone.trim(), email: contactEmail.trim()
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
            <h3 className="font-semibold">Sales Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesRep">Assigned Sales Rep(s) *</Label>
                <Popover open={salesRepOpen} onOpenChange={setSalesRepOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={salesRepOpen} className="w-full justify-between h-auto min-h-10">
                      <div className="flex flex-wrap gap-1">
                        {salesRepIds.length > 0 ? salesRepIds.map(id => (
                          <span key={id} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                            {getSalesRepName(id)}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={(e) => { e.stopPropagation(); setSalesRepIds(prev => prev.filter(r => r !== id)); }} />
                          </span>
                        )) : <span className="text-muted-foreground">Select sales reps...</span>}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search sales rep..." />
                      <CommandList>
                        <CommandEmpty>No sales rep found.</CommandEmpty>
                        <CommandGroup>
                          {salesReps.map((rep) => (
                            <CommandItem key={rep.salesrepid} value={`${rep.firstname} ${rep.lastname}`} onSelect={() => { setSalesRepIds(prev => prev.includes(rep.salesrepid) ? prev.filter(id => id !== rep.salesrepid) : [...prev, rep.salesrepid]); }}>
                              <Check className={cn("mr-2 h-4 w-4", salesRepIds.includes(rep.salesrepid) ? "opacity-100" : "opacity-0")} />
                              {rep.firstname} {rep.lastname}
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
            <h3 className="font-semibold">Primary Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="contactName">Name *</Label><Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact name" required /></div>
              <div className="space-y-2"><Label htmlFor="contactTitle">Title</Label><Input id="contactTitle" value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} placeholder="Contact title" /></div>
              <div className="space-y-2"><Label htmlFor="contactPhone">Phone *</Label><Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="(555) 123-4567" required /></div>
              <div className="space-y-2"><Label htmlFor="contactEmail">Email *</Label><Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@example.com" required /></div>
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
