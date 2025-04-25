
import { Card, CardContent } from '@/components/ui/card';
import { PerformanceMetric } from '@/lib/types';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: PerformanceMetric[];
}

const PerformanceMetrics = ({ metrics }: PerformanceMetricsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.name} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5">
              <p className="text-sm text-muted-foreground">{metric.name}</p>
              <div className="flex items-end justify-between">
                <p className={`text-2xl font-semibold ${
                  metric.name.toLowerCase().includes('loss') || 
                  metric.name.toLowerCase().includes('drawdown') 
                    ? (metric.isPositive ? 'text-forex-profit' : 'text-forex-loss')
                    : (metric.isPositive ? 'text-forex-profit' : 'text-forex-loss')
                }`}>
                  {metric.value}
                </p>
                {metric.change !== undefined && (
                  <div className={`flex items-center ${
                    metric.isPositive ? 'text-forex-profit' : 'text-forex-loss'
                  }`}>
                    {metric.isPositive ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PerformanceMetrics;
