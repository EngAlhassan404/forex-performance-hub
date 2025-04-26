
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { Trade, TradingSession } from '@/lib/types';

interface SessionAnalysisProps {
  trades: Trade[];
}

// Display names for trading sessions
const sessionDisplayNames: Record<TradingSession, string> = {
  'TOKYO': 'Tokyo',
  'SYDNEY': 'Sydney',
  'LONDON': 'London',
  'NEW_YORK': 'New York',
  'TOKYO_LONDON': 'Tokyo-London',
  'LONDON_NEW_YORK': 'London-NY',
  'SYDNEY_TOKYO': 'Sydney-Tokyo',
  'NEW_YORK_SYDNEY': 'NY-Sydney',
  'NEUTRAL': 'No Session'
};

const SessionAnalysis = ({ trades }: SessionAnalysisProps) => {
  // Calculate session performance statistics
  const sessionStats = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    // Create map for each session
    const sessionMap = new Map<string, { wins: number; losses: number; totalProfit: number }>();
    
    // Initialize with all sessions
    Object.keys(sessionDisplayNames).forEach(session => {
      sessionMap.set(session, { wins: 0, losses: 0, totalProfit: 0 });
    });
    
    // Process trades
    trades.filter(trade => trade.status === 'CLOSED' && trade.session).forEach(trade => {
      const session = trade.session || 'NEUTRAL';
      const isWin = (trade.profit || 0) > 0;
      
      const stats = sessionMap.get(session)!;
      
      if (isWin) {
        stats.wins += 1;
      } else {
        stats.losses += 1;
      }
      
      stats.totalProfit += (trade.profit || 0);
    });
    
    // Convert map to array and filter out sessions with no trades
    return Array.from(sessionMap.entries())
      .map(([session, stats]) => ({
        session: sessionDisplayNames[session as TradingSession] || session,
        originalSession: session,
        totalProfit: stats.totalProfit,
        winRate: stats.wins + stats.losses > 0 ? 
          (stats.wins / (stats.wins + stats.losses)) * 100 : 0,
        tradesCount: stats.wins + stats.losses
      }))
      .filter(item => item.tradesCount > 0)
      .sort((a, b) => b.totalProfit - a.totalProfit);
  }, [trades]);

  if (sessionStats.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No session data available. Add trades with session information to see analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sessionStats}
            margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
          >
            <XAxis 
              dataKey="session"
              angle={-45}
              textAnchor="end"
              height={60}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value: any) => [`$${value}`, 'Profit']}
              contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0' }}
            />
            <Legend />
            <Bar 
              name="Total Profit" 
              dataKey="totalProfit" 
              radius={[4, 4, 0, 0]}
            >
              {sessionStats.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.totalProfit >= 0 ? '#4CAF50' : '#F44336'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 text-sm font-medium">Session</th>
              <th className="text-center p-2 text-sm font-medium">Trades</th>
              <th className="text-center p-2 text-sm font-medium">Win Rate</th>
              <th className="text-right p-2 text-sm font-medium">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {sessionStats.map((stat) => (
              <tr key={stat.originalSession} className="border-b">
                <td className="p-2 text-sm">{stat.session}</td>
                <td className="p-2 text-sm text-center">{stat.tradesCount}</td>
                <td className="p-2 text-sm text-center">{stat.winRate.toFixed(1)}%</td>
                <td className={`p-2 text-sm text-right ${
                  stat.totalProfit >= 0 ? 'text-forex-profit' : 'text-forex-loss'
                }`}>
                  ${stat.totalProfit.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionAnalysis;
