import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { DollarSign, Trophy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const RevenueSection = ({
  icon: Icon,
  label,
  total,
  byType,
}: {
  icon: React.ElementType;
  label: string;
  total: number;
  byType: { typeId: number; typeName: string; revenue: number }[];
}) => (
  <div className="flex items-center justify-between flex-1 min-w-0">
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold">
          ${Math.round(total).toLocaleString('en-US')}
        </p>
      </div>
    </div>

    {total > 0 && byType.length > 0 && (
      <div className="flex items-center gap-4">
        {byType.map((item, index) => (
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
);

export const KPICard = () => {
  const { getPipelineRevenue, getWonRevenue, getPipelineRevenueByType, getWonRevenueByType } = useData();
  const pipelineRevenue = getPipelineRevenue();
  const wonRevenue = getWonRevenue();
  const pipelineByType = getPipelineRevenueByType();
  const wonByType = getWonRevenueByType();

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-6">
        <RevenueSection
          icon={DollarSign}
          label="Pipeline Revenue"
          total={pipelineRevenue}
          byType={pipelineByType}
        />
        <Separator orientation="vertical" className="h-12" />
        <RevenueSection
          icon={Trophy}
          label="Won Revenue"
          total={wonRevenue}
          byType={wonByType}
        />
      </div>
    </Card>
  );
};
