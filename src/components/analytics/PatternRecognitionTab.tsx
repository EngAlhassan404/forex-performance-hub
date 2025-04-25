
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

const PatternRecognitionTab = () => {
  // Time-based performance data
  const timeData = [
    { hour: '00:00-04:00', profit: 120, trades: 5 },
    { hour: '04:00-08:00', profit: 180, trades: 8 },
    { hour: '08:00-12:00', profit: -50, trades: 12 },
    { hour: '12:00-16:00', profit: 95, trades: 15 },
    { hour: '16:00-20:00', profit: 200, trades: 10 },
    { hour: '20:00-24:00', profit: -30, trades: 6 },
  ];

  // Session data for pie chart
  const sessionData = [
    { name: 'Asian', value: 25 },
    { name: 'European', value: 45 },
    { name: 'US', value: 30 },
  ];

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
                data={sessionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#FFBB28" />
                <Cell fill="#00C49F" />
                <Cell fill="#0088FE" />
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
