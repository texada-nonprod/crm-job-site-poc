import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ProjectCompany, CustomerEquipment } from '@/types';
import { useData } from '@/contexts/DataContext';

interface AddCustomerEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (equipmentId: number) => void;
  projectId: number;
  projectCompanies: ProjectCompany[];
  existingEquipmentIds: number[];
}

export const AddCustomerEquipmentModal = ({ open, onOpenChange, onSave, projectId, projectCompanies, existingEquipmentIds }: AddCustomerEquipmentModalProps) => {
  const { getCompanyEquipment, getEquipmentProjectAssignment } = useData();
  const [companyId, setCompanyId] = useState('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [availableEquipment, setAvailableEquipment] = useState<CustomerEquipment[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<{ projectName: string } | null>(null);

  useEffect(() => {
    if (!open) {
      setCompanyId('');
      setSelectedEquipmentId(null);
      setAvailableEquipment([]);
    }
  }, [open]);

  useEffect(() => {
    if (companyId) {
      const all = getCompanyEquipment(companyId);
      setAvailableEquipment(all.filter(eq => !existingEquipmentIds.includes(eq.id)));
      setSelectedEquipmentId(null);
    } else {
      setAvailableEquipment([]);
    }
  }, [companyId, getCompanyEquipment, existingEquipmentIds]);

  const handleSubmit = () => {
    if (selectedEquipmentId === null) return;

    const assignment = getEquipmentProjectAssignment(selectedEquipmentId, projectId);
    if (assignment) {
      setConflictInfo({ projectName: assignment.projectName });
      setShowConflictDialog(true);
    } else {
      onSave(selectedEquipmentId);
      onOpenChange(false);
    }
  };

  const handleConfirmConflict = () => {
    if (selectedEquipmentId !== null) {
      onSave(selectedEquipmentId);
      setShowConflictDialog(false);
      onOpenChange(false);
    }
  };

  const selectedEq = availableEquipment.find(e => e.id === selectedEquipmentId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Associate Existing Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Company *</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {projectCompanies.map(c => (
                    <SelectItem key={c.companyId} value={c.companyId}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {companyId && (
              <div className="space-y-2">
                <Label>Select Equipment *</Label>
                {availableEquipment.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No available equipment for this company.</p>
                ) : (
                  <div className="max-h-[300px] overflow-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Make</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Serial #</TableHead>
                          <TableHead className="text-right">SMU</TableHead>
                          <TableHead>Ownership</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableEquipment.map(eq => (
                          <TableRow
                            key={eq.id}
                            className={`cursor-pointer ${selectedEquipmentId === eq.id ? 'bg-accent' : ''}`}
                            onClick={() => setSelectedEquipmentId(eq.id)}
                          >
                            <TableCell>{eq.equipmentType}</TableCell>
                            <TableCell>{eq.make}</TableCell>
                            <TableCell>{eq.model}</TableCell>
                            <TableCell>{eq.year || '—'}</TableCell>
                            <TableCell className="font-mono text-sm">{eq.serialNumber || '—'}</TableCell>
                            <TableCell className="text-right">{eq.smu?.toLocaleString() || '—'}</TableCell>
                            <TableCell>
                              <Badge variant={eq.ownershipStatus === 'owned' ? 'default' : 'secondary'}>
                                {eq.ownershipStatus === 'owned' ? 'Owned' : 'Rented'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={selectedEquipmentId === null}>Associate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Equipment Already Assigned</AlertDialogTitle>
            <AlertDialogDescription>
              This equipment ({selectedEq ? `${selectedEq.make} ${selectedEq.model}` : ''}) is currently assigned to <strong>"{conflictInfo?.projectName}"</strong>. Adding it here will not remove it from that project. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmConflict}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
