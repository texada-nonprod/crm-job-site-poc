import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Activity } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ACTIVITY_TYPES = [
  'Site Visit',
  'Phone Call',
  'Email',
  'Meeting',
  'Follow-up',
  'Proposal',
  'Demo',
  'Other'
];

interface ActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  activity?: Activity;
  mode: 'create' | 'edit';
}

export const ActivityModal = ({ open, onOpenChange, projectId, activity, mode }: ActivityModalProps) => {
  const { users, addActivity, updateActivity } = useData();
  const { toast } = useToast();

  const [assigneeId, setAssigneeId] = useState<string>('');
  const [activityType, setActivityType] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (activity && mode === 'edit') {
      setAssigneeId(activity.assigneeId.toString());
      setActivityType(activity.activityType);
      setDate(activity.date ? new Date(activity.date) : undefined);
      setDescription(activity.description);
    } else {
      setAssigneeId('');
      setActivityType('');
      setDate(undefined);
      setDescription('');
    }
  }, [activity, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!assigneeId || !activityType || !date || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const activityData = {
      assigneeId: parseInt(assigneeId),
      activityType,
      date: date.toISOString(),
      description: description.trim()
    };

    if (mode === 'create') {
      addActivity(projectId, activityData);
      toast({
        title: "Success",
        description: "Activity created successfully."
      });
    } else if (activity) {
      updateActivity(projectId, activity.id, activityData);
      toast({
        title: "Success",
        description: "Activity updated successfully."
      });
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
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
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
            <Label htmlFor="activityType">Activity Type</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
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
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

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
