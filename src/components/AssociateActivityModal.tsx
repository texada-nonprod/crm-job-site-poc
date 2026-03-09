import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/types';

interface AssociateActivityModalProps {
  projectId: number;
  currentActivityIds: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssociateActivityModal = ({ projectId, currentActivityIds, open, onOpenChange }: AssociateActivityModalProps) => {
  const { projects, getUserName, addActivity } = useData();
  const [selectedActivity, setSelectedActivity] = useState<{ activity: Activity; sourceProjectId: number } | null>(null);

  const availableActivities: { activity: Activity; sourceProjectName: string; sourceProjectId: number }[] = [];
  projects.forEach(project => {
    if (project.id !== projectId && project.activities) {
      project.activities.forEach(activity => {
        if (!currentActivityIds.includes(activity.id)) {
          availableActivities.push({ activity, sourceProjectName: project.name, sourceProjectId: project.id });
        }
      });
    }
  });

  const handleAssociate = () => {
    if (selectedActivity) {
      addActivity(projectId, { statusId: selectedActivity.activity.statusId, salesRepId: selectedActivity.activity.salesRepId, typeId: selectedActivity.activity.typeId, date: selectedActivity.activity.date, description: selectedActivity.activity.description, contactName: selectedActivity.activity.contactName, notes: selectedActivity.activity.notes });
      setSelectedActivity(null); onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Associate Existing Activity</DialogTitle></DialogHeader>
        <div className="mt-4">
          {availableActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No available activities to associate.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead className="w-12"></TableHead><TableHead>Source Project</TableHead><TableHead>Assignee</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
              <TableBody>
                {availableActivities.map(({ activity, sourceProjectName, sourceProjectId }) => (
                  <TableRow key={`${sourceProjectId}-${activity.id}`} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedActivity({ activity, sourceProjectId })}>
                    <TableCell><input type="radio" checked={selectedActivity?.activity.id === activity.id && selectedActivity?.sourceProjectId === sourceProjectId} onChange={() => setSelectedActivity({ activity, sourceProjectId })} className="cursor-pointer" /></TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate" title={sourceProjectName}>{sourceProjectName}</TableCell>
                    <TableCell className="font-medium">{getUserName(activity.salesRepId)}</TableCell>
                    <TableCell><Badge variant="outline">{activity.typeId}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(activity.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate" title={activity.description}>{activity.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleAssociate} disabled={!selectedActivity}>Associate</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
