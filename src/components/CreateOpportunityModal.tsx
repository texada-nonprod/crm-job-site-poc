import { useState } from 'react';
import { useData, DIVISIONS } from '@/contexts/DataContext';
import { Opportunity } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CreateOpportunityModalProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateOpportunityModal = ({ projectId, open, onOpenChange }: CreateOpportunityModalProps) => {
  const { opportunityStages, createNewOpportunity, opportunities } = useData();
  const [description, setDescription] = useState('');
  const [revenue, setRevenue] = useState('');
  const [stageId, setStageId] = useState('');
  const [divisionId, setDivisionId] = useState('');

  const handleCreate = () => {
    if (!description || !revenue || !stageId || !divisionId) { toast.error('Please fill in all fields'); return; }
    const newId = Math.max(...opportunities.map(o => o.id), 100000) + 1;
    const newOpportunity: Opportunity = {
      id: newId, description, estimateRevenue: parseFloat(revenue), stageId: parseInt(stageId), isUrgent: false, typeId: 2,
      probabilityOfClosingId: 'Medium', phaseId: 2, stageIdEnteredAt: parseInt(stageId), projectId, salesRepId: 0, ownerUserId: 0,
      originatorUserId: 0, sourceId: 0, campaignId: 0, classificationId: 'A', cmCaseId: `CASE-${newId}`,
      enterDate: new Date().toISOString(), changeDate: new Date().toISOString(), customerId: '', customerName: '',
      customerAddress: '', customerCity: '', customerZipCode: '', customerState: '', principalWorkCodeId: '',
      externalReferenceNumber: '', branchId: 0, olgaOpportunityId: `OLG-${newId}`, contactName: '', contactPhone: '',
      contactEmail: '', industryCodeId: '', workOrderId: `WO-${newId}`, customerCountry: 'USA', divisionId,
      PSETypeId: 1, additionalSourceIds: [],
    };
    createNewOpportunity(newOpportunity);
    toast.success('Opportunity created successfully');
    setDescription(''); setRevenue(''); setStageId(''); setDivisionId(''); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create New Opportunity</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" placeholder="Enter opportunity description" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="revenue">Estimated Revenue</Label><Input id="revenue" type="number" placeholder="0.00" value={revenue} onChange={(e) => setRevenue(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="division">Division</Label><Select value={divisionId} onValueChange={setDivisionId}><SelectTrigger id="division"><SelectValue placeholder="Select a division" /></SelectTrigger><SelectContent>{DIVISIONS.map(div => (<SelectItem key={div.code} value={div.code}>{div.code} - {div.name}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="stage">Stage</Label><Select value={stageId} onValueChange={setStageId}><SelectTrigger id="stage"><SelectValue placeholder="Select a stage" /></SelectTrigger><SelectContent>{opportunityStages.filter(stage => stage.phaseid === 1 || stage.phaseid === 2).map(stage => (<SelectItem key={stage.stageid} value={stage.stageid.toString()}>{stage.stagename}</SelectItem>))}</SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
