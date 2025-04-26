
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import { Trade, TradingSession, SessionPerformance } from '@/lib/types';
import { sessionTimes, getSessionDescription } from '@/lib/sessionData';

interface SessionAnalysisProps {
  trades: Trade[];
}

const SessionAnalysis = ({ trades }: SessionAnalysisProps) => {
  // Filter closed trades
  const closedTrades = trades.filter(trade => trade.status === 'CLOSED');
  
  // Group trades by session
  const sessionMap = new Map<TradingSession, {
    trades: Trade[],
    profit: number,
    count: number,
    wins: number
  }>();
  
  // Initialize session data
  sessionTimes.forEach(session => {
    sessionMap.set(session.name, {
      trades: [],
      profit: 0,
      count: 0,
      wins: 0
    });
  });
  
  // Populate session data
  closedTrades.forEach(trade => {
    if (trade.session) {
      const sessionData = sessionMap.get(trade.session) || {
        trades: [],
        profit: 0,
        count: 0,
        wins: 0
      };
      
      sessionData.trades.push(trade);
      sessionData.profit += trade.profit || 0;
      sessionData.count += 1;
      if ((trade.profit || 0) > 0) {
        sessionData.wins += 1;
      }
      
      sessionMap.set(trade.session, sessionData);
    }
  });
  
  // Convert to array for charts
  const sessionData = Array.from(sessionMap.entries()).map(([session, data]) => ({
    name: sessionTimes.find(s => s.name === session)?.displayName || session,
    profit: data.profit,
    count: data.count,
    winRate: data.count > 0 ? (data.wins / data.count * 100).toFixed(1) : '0',
    session
  }));
  
  // Filter out empty sessions
  const activeSessionData = sessionData.filter(s => s.count > 0);
  
  // Sort by profit for bar chart
  const sortedByProfit = [...activeSessionData].sort((a, b) => b.profit - a.profit);
  
  // Calculate trade distribution for pie chart
  const tradeDistribution = activeSessionData.map(s => ({
    name: s.name,
    value: s.count,
    displayName: `${s.name} (${getSessionDescription(s.session as TradingSession).split('(')[1].split(')')[0]})`
  }));
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c', '#d0ed57'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Profit Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedByProfit}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                <XAxis 
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value}`, 'Profit']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  labelFormatter={(label) => {
                    const session = sortedByProfit.find(s => s.name === label)?.session as TradingSession;
                    return getSessionDescription(session);
                  }}
                />
                <Bar dataKey="profit" radius={[4, 4, 4, 4]} barSize={20}>
                  {sortedByProfit.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.profit >= 0 ? '#4CAF50' : '#F44336'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeSessionData}
                margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis 
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Win Rate']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  labelFormatter={(label) => {
                    const session = activeSessionData.find(s => s.name === label)?.session as TradingSession;
                    return getSessionDescription(session);
                  }}
                />
                <Bar 
                  dataKey="winRate" 
                  fill="#2C74B3" 
                  radius={[4, 4, 0, 0]} 
                  name="Win Rate"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trade Distribution by Session</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={tradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {tradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} trades`, 'Count']}
                labelFormatter={(label, entry) => {
                  const dataEntry = tradeDistribution.find(item => item.name === label);
                  return dataEntry?.displayName || label;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionAnalysis;
