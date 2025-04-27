
import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Cell,
  Legend
} from 'recharts';
import { Trade } from '@/lib/types';

interface EquityCurveProps {
  trades: Trade[];
  chartStyle?: 'area' | 'line' | 'bar';
}

const EquityCurve = ({ trades, chartStyle = 'area' }: EquityCurveProps) => {
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
    const dailyEquity: { date: string; balance: number; change: number; commission: number }[] = [];
    
    // Start with initial balance
    let currentBalance = initialBalance;
    let totalCommission = 0;
    
    // Add initial point
    const firstTradeDate = new Date(sortedTrades[0].entryDate);
    firstTradeDate.setDate(firstTradeDate.getDate() - 1); // Day before first trade
    
    dailyEquity.push({
      date: firstTradeDate.toISOString().split('T')[0],
      balance: currentBalance,
      change: 0,
      commission: 0
    });
    
    // Add each trade's impact to the balance
    sortedTrades.forEach((trade) => {
      // Only use closed trades with profit values
      if (trade.status === 'CLOSED' && trade.profit !== null) {
        const tradeDate = new Date(trade.exitDate || trade.entryDate).toISOString().split('T')[0];
        const tradeProfit = trade.profit - (trade.swap || 0); // Subtract swap but not commission
        const tradeCommission = trade.commission || 0;
        currentBalance += tradeProfit; // Don't subtract commission here
        totalCommission += tradeCommission;
        
        // Check if we already have an entry for this date
        const existingEntry = dailyEquity.find(item => item.date === tradeDate);
        
        if (existingEntry) {
          existingEntry.balance = currentBalance;
          existingEntry.change += tradeProfit;
          existingEntry.commission += tradeCommission;
        } else {
          dailyEquity.push({
            date: tradeDate,
            balance: currentBalance,
            change: tradeProfit,
            commission: tradeCommission
          });
        }
      }
    });
    
    // Apply commission deduction to the final balance only
    if (dailyEquity.length > 0) {
      const lastEntry = dailyEquity[dailyEquity.length - 1];
      lastEntry.balance -= totalCommission;
    }
    
    return dailyEquity;
  }, [trades]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Render the appropriate chart based on chartStyle
  const renderChart = () => {
    if (equityData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No trade data available. Add trades to see your equity curve.
        </div>
      );
    }

    const commonProps = {
      data: equityData,
      margin: { top: 10, right: 10, left: 0, bottom: 10 },
    };
    
    const commonGridProps = showGrid ? <CartesianGrid strokeDasharray="3 3" opacity={0.2} /> : null;
    
    const commonAxisProps = (
      <>
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value) => `$${value.toFixed(3)}`}
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'balance') return [`$${value.toFixed(3)}`, 'Balance'];
            if (name === 'change') return [`$${value.toFixed(3)}`, 'P/L'];
            if (name === 'commission') return [`$${value.toFixed(3)}`, 'Commission'];
            return [value, name];
          }}
          labelFormatter={(label) => formatDate(label as string)}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />
        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
      </>
    );
    
    if (chartStyle === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart {...commonProps}>
            {commonGridProps}
            {commonAxisProps}
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2C74B3" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2C74B3" stopOpacity={0} />
              </linearGradient>
            </defs>
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
      );
    } else if (chartStyle === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonProps}>
            {commonGridProps}
            {commonAxisProps}
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#2C74B3"
              strokeWidth={2}
              dot={{ fill: '#2C74B3', r: 3 }}
              activeDot={{ r: 6, stroke: '#2C74B3', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else { // bar chart
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...commonProps}>
            {commonGridProps}
            {commonAxisProps}
            <Bar dataKey="change" radius={[4, 4, 0, 0]}>
              {equityData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.change >= 0 ? '#4CAF50' : '#F44336'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="h-72">
      {renderChart()}
    </div>
  );
};

export default EquityCurve;
