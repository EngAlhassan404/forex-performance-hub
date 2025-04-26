
import { useState, useMemo } from 'react';
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
import { Trade } from '@/lib/types';

interface EquityCurveProps {
  trades: Trade[];
}

const EquityCurve = ({ trades }: EquityCurveProps) => {
  const [showGrid, setShowGrid] = useState(true);

  // Calculate equity curve data from trades
  const equityData = useMemo(() => {
    if (trades.length === 0) {
      // Return empty data if no trades
      return [];
    }

    // Sort trades by entry date
    const sortedTrades = [...trades]
      .filter(trade => trade.status === 'CLOSED' && trade.profit !== null)
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
      
    if (sortedTrades.length === 0) {
      return [];
    }

    // Get initial balance from localStorage
    const initialBalanceStr = localStorage.getItem('initialBalance');
    const initialBalance = initialBalanceStr ? parseFloat(initialBalanceStr) : 0;
    
    // Create daily equity points based on trades
    const dailyEquity: { date: string; balance: number }[] = [];
    
    // Start with initial balance
    let currentBalance = initialBalance;
    
    // Add initial point
    const firstTradeDate = new Date(sortedTrades[0].entryDate);
    firstTradeDate.setDate(firstTradeDate.getDate() - 1); // Day before first trade
    
    dailyEquity.push({
      date: firstTradeDate.toISOString().split('T')[0],
      balance: currentBalance
    });
    
    // Add each trade's impact to the balance
    sortedTrades.forEach((trade) => {
      // Only use closed trades with profit values
      if (trade.status === 'CLOSED' && trade.profit !== null) {
        const tradeDate = new Date(trade.exitDate || trade.entryDate).toISOString().split('T')[0];
        currentBalance += trade.profit;
        
        // Check if we already have an entry for this date
        const existingEntry = dailyEquity.find(item => item.date === tradeDate);
        
        if (existingEntry) {
          existingEntry.balance = currentBalance;
        } else {
          dailyEquity.push({
            date: tradeDate,
            balance: currentBalance
          });
        }
      }
    });
    
    return dailyEquity;
  }, [trades]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-72">
      {equityData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={equityData}
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
              dataKey="balance" 
              stroke="#2C74B3" 
              strokeWidth={2}
              fill="url(#equityGradient)" 
              dot={false}
              activeDot={{ r: 6, stroke: '#2C74B3', strokeWidth: 2, fill: 'white' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No trade data available. Add trades to see your equity curve.
        </div>
      )}
    </div>
  );
};

export default EquityCurve;
