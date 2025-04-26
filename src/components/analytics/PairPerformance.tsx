
import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Trade } from '@/lib/types';

interface PairPerformanceProps {
  trades: Trade[];
}

const PairPerformance = ({ trades }: PairPerformanceProps) => {
  // Calculate pair performance statistics
  const pairStats = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    // Group trades by pair
    const pairMap = new Map<string, { wins: number; losses: number; totalProfit: number }>();
    
    trades.filter(trade => trade.status === 'CLOSED').forEach(trade => {
      const pair = trade.pair;
      const isWin = (trade.profit || 0) > 0;
      
      if (!pairMap.has(pair)) {
        pairMap.set(pair, { wins: 0, losses: 0, totalProfit: 0 });
      }
      
      const stats = pairMap.get(pair)!;
      
      if (isWin) {
        stats.wins += 1;
      } else {
        stats.losses += 1;
      }
      
      stats.totalProfit += (trade.profit || 0);
    });
    
    // Convert map to array and sort by total profit
    return Array.from(pairMap.entries())
      .map(([pair, stats]) => ({
        pair,
        totalProfit: stats.totalProfit,
        winRate: stats.wins + stats.losses > 0 ? 
          (stats.wins / (stats.wins + stats.losses)) * 100 : 0,
        tradesCount: stats.wins + stats.losses
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5); // Top 5 pairs
  }, [trades]);
  
  if (pairStats.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">No closed trades yet</p>
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={pairStats}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
          <XAxis type="number" axisLine={false} tickLine={false} />
          <YAxis 
            type="category" 
            dataKey="pair" 
            axisLine={false} 
            tickLine={false} 
            width={60}
            dx={-10}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Profit']}
            labelFormatter={(label) => `${label}`}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="totalProfit" radius={[0, 4, 4, 0]}>
            {pairStats.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.totalProfit >= 0 ? '#4CAF50' : '#F44336'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PairPerformance;
