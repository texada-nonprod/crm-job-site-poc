import { useState, useEffect } from 'react';
import { Opportunity } from '@/types';
import { useData } from '@/contexts/DataContext';
import { getDivisionName } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, Package, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const OpportunityDetailModal = ({ opportunity, open, onOpenChange }: OpportunityDetailModalProps) => {
  const { getStageName, getTypeName, updateOpportunity } = useData();
  const { toast } = useToast();

  const [estMonth, setEstMonth] = useState<string>('');
  const [estYear, setEstYear] = useState<string>('');

  useEffect(() => {
    if (opportunity) {
      setEstMonth(opportunity.estimateDeliveryMonth ? String(opportunity.estimateDeliveryMonth) : 'none');
      setEstYear(opportunity.estimateDeliveryYear ? String(opportunity.estimateDeliveryYear) : 'none');
    }
  }, [opportunity]);

  if (!opportunity) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEstCloseChange = (month: string, year: string) => {
    const updates: Partial<Opportunity> = {
      estimateDeliveryMonth: month && month !== 'none' ? Number(month) : undefined,
      estimateDeliveryYear: year && year !== 'none' ? Number(year) : undefined,
    };
    updateOpportunity(opportunity.id, updates);
    toast({ title: "Updated", description: "Est. close date updated." });
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear + i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div>
            <DialogTitle className="text-2xl">{opportunity.description}</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">Opportunity Number: {opportunity.id}</p>
              <Badge variant="secondary">{getTypeName(opportunity.typeId)}</Badge>
              {opportunity.isUrgent && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Urgent
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Financials</span>
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-2xl font-bold">
                  ${opportunity.estimateRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Probability: {opportunity.probabilityOfClosingId}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Timeline</span>
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Entered:</span> {formatDate(opportunity.enterDate)}
                </p>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Est. Close</Label>
                  <div className="flex gap-2">
                    <Select
                      value={estMonth}
                      onValueChange={(v) => {
                        setEstMonth(v);
                        handleEstCloseChange(v, estYear);
                      }}
                    >
                      <SelectTrigger className="w-[100px] h-8 text-sm">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {MONTH_NAMES.map((m, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={estYear}
                      onValueChange={(v) => {
                        setEstYear(v);
                        handleEstCloseChange(estMonth, v);
                      }}
                    >
                      <SelectTrigger className="w-[90px] h-8 text-sm">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {yearOptions.map(y => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Customer Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-medium">{opportunity.customerName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Stage:</span>
                <p className="font-medium">{getStageName(opportunity.stageId)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Contact:</span>
                <p className="font-medium">{opportunity.contactName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium">{opportunity.contactPhone}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{opportunity.contactEmail}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Address:</span>
                <p className="font-medium">
                  {opportunity.customerAddress}, {opportunity.customerCity}, {opportunity.customerState} {opportunity.customerZipCode}
                </p>
              </div>
            </div>
          </div>

          {opportunity.productGroups && opportunity.productGroups.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <h4 className="font-semibold">Equipment/Products</h4>
                </div>
                <div className="space-y-3">
                  {opportunity.productGroups.map((group, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-4">
                      {group.products.map((product, prodIdx) => (
                        <div key={prodIdx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {product.makeId} {product.baseModelId} - {product.description}
                            </p>
                            {product.isPrimary && (
                              <Badge variant="outline">Primary</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <p>Qty: {product.quantity}</p>
                            <p>Age: {product.age} years</p>
                            <p>SMU: {product.hours.toLocaleString()}</p>
                          </div>
                          <p className="text-sm">
                            Duration: {product.rentDuration} months @ ${product.unitPrice.toLocaleString()}/mo
                          </p>
                          <p className="text-xs text-muted-foreground">Stock #: {product.stockNumber}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div>
              <span>Case ID:</span> {opportunity.cmCaseId}
            </div>
            <div>
              <span>Work Order:</span> {opportunity.workOrderId}
            </div>
            <div>
              <span>Division:</span> {opportunity.divisionId} - {getDivisionName(opportunity.divisionId)}
            </div>
            <div>
              <span>Classification:</span> {opportunity.classificationId}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
