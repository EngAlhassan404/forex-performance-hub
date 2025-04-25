
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';
import { dummyPairPerformance } from '@/lib/dummyData';

const PairPerformance = () => {
  // Sort pairs by total profit descending
  const sortedData = [...dummyPairPerformance]
    .filter(item => item.tradesCount > 0)
    .sort((a, b) => b.totalProfit - a.totalProfit);

  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
        >
          <XAxis 
            type="number" 
            tickFormatter={(value) => `$${value}`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="pair" 
            tick={{ fontSize: 12 }}
            width={70}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`$${value}`, 'Profit/Loss']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
          />
          <Bar 
            dataKey="totalProfit" 
            fill={(data) => data.totalProfit >= 0 ? '#4CAF50' : '#F44336'} 
            radius={[4, 4, 4, 4]}
            maxBarSize={15}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PairPerformance;
