
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip
} from 'recharts';
import { dummyTrades } from '@/lib/dummyData';

const WinRateChart = () => {
  const closedTrades = dummyTrades.filter(trade => trade.status === 'CLOSED');
  
  const winCount = closedTrades.filter(trade => (trade.profit || 0) > 0).length;
  const lossCount = closedTrades.length - winCount;
  
  const data = [
    { name: 'Winning Trades', value: winCount },
    { name: 'Losing Trades', value: lossCount }
  ];
  
  const COLORS = ['#4CAF50', '#F44336'];
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Trades']} 
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WinRateChart;
