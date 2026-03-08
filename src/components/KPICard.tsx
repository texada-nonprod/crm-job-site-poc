import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const KPICard = () => {
  const { getTotalPipelineRevenue, getRevenueByType } = useData();
  const revenue = getTotalPipelineRevenue();
  const revenueByType = getRevenueByType();

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue in Pipeline</p>
            <p className="text-3xl font-bold">
              ${Math.round(revenue).toLocaleString('en-US')}
            </p>
          </div>
        </div>

        {revenue > 0 && revenueByType.length > 0 && (
          <div className="flex items-center gap-4">
            {revenueByType.map((item, index) => (
              <div key={item.typeId} className="flex items-center gap-4">
                {index > 0 && <Separator orientation="vertical" className="h-8" />}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{item.typeName}</p>
                  <p className="text-sm font-semibold">
                    ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
