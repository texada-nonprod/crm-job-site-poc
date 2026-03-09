import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Activity } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import activityTypesData from '@/data/ActivityTypes.json';

const ACTIVITY_TYPES = activityTypesData.content;

interface ActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  activity?: Activity;
  mode: 'create' | 'edit';
}

export const ActivityModal = ({ open, onOpenChange, projectId, activity, mode }: ActivityModalProps) => {
  const { users, projects, addActivity, updateActivity } = useData();
  const { toast } = useToast();

  const project = projects.find(p => p.id === projectId);
  const projectCompanies = project?.projectCompanies ?? [];

  const [salesRepId, setSalesRepId] = useState<string>('');
  const [typeId, setTypeId] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeValue, setTimeValue] = useState<string>('12:00');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedContactId, setSelectedContactId] = useState<number | ''>('');
  const [companyPopoverOpen, setCompanyPopoverOpen] = useState(false);
  const [contactPopoverOpen, setContactPopoverOpen] = useState(false);

  const selectedCompany = projectCompanies.find(c => c.companyId === selectedCompanyId);
  const companyContacts = selectedCompany?.companyContacts ?? [];

  useEffect(() => {
    if (activity && mode === 'edit') {
      setSalesRepId(activity.salesRepId.toString());
      setTypeId(activity.typeId);
      const actDate = activity.date ? new Date(activity.date) : undefined;
      setDate(actDate);
      setTimeValue(actDate ? format(actDate, 'HH:mm') : '12:00');
      setDescription(activity.description);
      setNotes(activity.notes || '');
      // Initialize company/contact from activity
      if (activity.customerId) {
        setSelectedCompanyId(activity.customerId);
        const company = projectCompanies.find(c => c.companyId === activity.customerId);
        if (company && activity.contactName) {
          const contact = company.companyContacts.find(c => c.name === activity.contactName);
          setSelectedContactId(contact?.id ?? '');
        }
      } else {
        setSelectedCompanyId('');
        setSelectedContactId('');
      }
    } else {
      setSalesRepId('');
      setTypeId('');
      setDate(undefined);
      setTimeValue('12:00');
      setDescription('');
      setNotes('');
      setSelectedCompanyId('');
      setSelectedContactId('');
    }
  }, [activity, mode, open]);

  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (!selectedDay) { setDate(undefined); return; }
    const [hours, minutes] = timeValue.split(':').map(Number);
    const merged = new Date(selectedDay);
    merged.setHours(hours, minutes, 0, 0);
    setDate(merged);
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    if (!date) return;
    const [hours, minutes] = newTime.split(':').map(Number);
    const merged = new Date(date);
    merged.setHours(hours, minutes, 0, 0);
    setDate(merged);
  };

  const status = useMemo(() => {
    if (!date) return null;
    return isPast(date) ? 'Completed' : 'Outstanding';
  }, [date]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedContactId('');
    setCompanyPopoverOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!salesRepId || !typeId || !date || !description.trim() || !notes.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const statusId = isPast(date) ? 2 : 1;
    const selectedContact = companyContacts.find(c => c.id === selectedContactId);

    const activityData = {
      statusId,
      salesRepId: parseInt(salesRepId),
      typeId,
      date: date.toISOString(),
      description: description.trim(),
      contactName: selectedContact?.name || '',
      notes: notes.trim(),
      customerId: selectedCompanyId || undefined
    };

    if (mode === 'create') {
      addActivity(projectId, activityData);
      toast({ title: "Success", description: "Activity created successfully." });
    } else if (activity) {
      updateActivity(projectId, activity.id, activityData);
      toast({ title: "Success", description: "Activity updated successfully." });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Activity' : 'Edit Activity'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salesRep">Sales Rep</Label>
            <Select value={salesRepId} onValueChange={setSalesRepId}>
              <SelectTrigger>
                <SelectValue placeholder="Select sales rep" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.lastName}, {user.firstName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="typeId">Activity Type</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Date & Time</Label>
              {status && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs pointer-events-none",
                    status === 'Completed'
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  )}
                >
                  {status}
                </Badge>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMM d, yyyy 'at' h:mm a") : "Select date & time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
                <div className="border-t border-border px-3 py-2">
                  <Label className="text-xs text-muted-foreground">Time</Label>
                  <Input
                    type="time"
                    value={timeValue}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="mt-1 h-8"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Company (optional)</Label>
            <Popover open={companyPopoverOpen} onOpenChange={setCompanyPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn("w-full justify-between font-normal", !selectedCompanyId && "text-muted-foreground")}
                >
                  {selectedCompany?.companyName || "Select company..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search companies..." />
                  <CommandList>
                    <CommandEmpty>No companies found.</CommandEmpty>
                    <CommandGroup>
                      {projectCompanies.map(company => (
                        <CommandItem
                          key={company.companyId}
                          value={company.companyName}
                          onSelect={() => handleCompanyChange(company.companyId)}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedCompanyId === company.companyId ? "opacity-100" : "opacity-0")} />
                          <span>{company.companyName}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{company.roleDescription}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedCompanyId && (
              <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setSelectedCompanyId(''); setSelectedContactId(''); }}>
                <X className="h-3 w-3 mr-1" /> Clear company
              </Button>
            )}
          </div>

          {selectedCompanyId && companyContacts.length > 0 && (
            <div className="space-y-2">
              <Label>Contact</Label>
              <Popover open={contactPopoverOpen} onOpenChange={setContactPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn("w-full justify-between font-normal", !selectedContactId && "text-muted-foreground")}
                  >
                    {selectedContactId ? companyContacts.find(c => c.id === selectedContactId)?.name || "Select contact..." : "Select contact..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search contacts..." />
                    <CommandList>
                      <CommandEmpty>No contacts found.</CommandEmpty>
                      <CommandGroup>
                        {companyContacts.map(contact => (
                          <CommandItem
                            key={contact.id}
                            value={contact.name}
                            onSelect={() => { setSelectedContactId(contact.id); setContactPopoverOpen(false); }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedContactId === contact.id ? "opacity-100" : "opacity-0")} />
                            <div>
                              <div>{contact.name}</div>
                              {contact.title && <div className="text-xs text-muted-foreground">{contact.title}</div>}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter activity description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};