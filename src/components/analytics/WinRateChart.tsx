
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trade } from '@/lib/types';

interface WinRateChartProps {
  trades: Trade[];
}

const WinRateChart = ({ trades }: WinRateChartProps) => {
  // Calculate win rate statistics from actual trades
  const calculateWinRate = () => {
    if (trades.length === 0) return [];
    
    const closedTrades = trades.filter(trade => trade.status === 'CLOSED');
    if (closedTrades.length === 0) return [];
    
    const winningTrades = closedTrades.filter(trade => (trade.profit || 0) > 0).length;
    const losingTrades = closedTrades.length - winningTrades;
    
    return [
      { name: 'Winning Trades', value: winningTrades },
      { name: 'Losing Trades', value: losingTrades }
    ];
  };

  const winRateData = calculateWinRate();
  const COLORS = ['#4CAF50', '#F44336'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (winRateData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">No closed trades yet</p>
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={winRateData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            dataKey="value"
          >
            {winRateData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} trades`, name]}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '4px',
              border: '1px solid #e2e8f0'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WinRateChart;
