
import { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine
} from 'recharts';
import { dummyDailyPerformance } from '@/lib/dummyData';

const EquityCurve = () => {
  const [showGrid, setShowGrid] = useState(true);

  // Calculate cumulative profit data
  const cumulativeData = dummyDailyPerformance.reduce((acc, day, index) => {
    const prevValue = index > 0 ? acc[index - 1].cumulativeProfit : 0;
    return [
      ...acc, 
      {
        ...day, 
        cumulativeProfit: prevValue + day.profit
      }
    ];
  }, [] as Array<any>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={cumulativeData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `$${value}`}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value: number) => [`$${value}`, 'Balance']}
            labelFormatter={(label) => formatDate(label as string)}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2C74B3" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2C74B3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
          <Area 
            type="monotone" 
            dataKey="cumulativeProfit" 
            stroke="#2C74B3" 
            strokeWidth={2}
            fill="url(#equityGradient)" 
            dot={false}
            activeDot={{ r: 6, stroke: '#2C74B3', strokeWidth: 2, fill: 'white' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EquityCurve;
