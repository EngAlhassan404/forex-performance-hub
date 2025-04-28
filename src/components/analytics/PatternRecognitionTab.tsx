
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trade } from '@/lib/types';

const PatternRecognitionTab = () => {
  const { data: trades = [] } = useQuery({
    queryKey: ['trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as Trade[];
    }
  });

  // Process time-based performance data from actual trades
  const timeData = Array(6).fill(0).map((_, index) => {
    const startHour = index * 4;
    const endHour = startHour + 4;
    
    const periodTrades = trades.filter(trade => {
      const hour = new Date(trade.entryDate).getUTCHours();
      return hour >= startHour && hour < endHour;
    });
    
    const profit = periodTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    
    return {
      hour: `${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00`,
      profit: parseFloat(profit.toFixed(2)),
      trades: periodTrades.length
    };
  });

  // Calculate session data from actual trades
  const sessionData = trades.reduce((acc: { [key: string]: number }, trade) => {
    if (trade.session) {
      acc[trade.session] = (acc[trade.session] || 0) + 1;
    }
    return acc;
  }, {});

  const sessionChartData = Object.entries(sessionData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#FFBB28', '#00C49F', '#0088FE', '#FF8042'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Time-Based Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profit" fill="#4CAF50">
                {timeData.map((entry, index) => (
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
          <CardTitle className="text-lg">Trading Session Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sessionChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sessionChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternRecognitionTab;

