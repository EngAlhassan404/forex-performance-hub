
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dummyDailyPerformance, dummyMetrics, dummyPairPerformance, dummyTradeDistribution } from '@/lib/dummyData';
import EquityCurve from '@/components/analytics/EquityCurve';
import WinRateChart from '@/components/analytics/WinRateChart';
import PairPerformance from '@/components/analytics/PairPerformance';
import PerformanceMetrics from '@/components/analytics/PerformanceMetrics';
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
  Cell,
  Legend
} from 'recharts';

const Analytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Format data for day of week chart
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekData = daysOfWeek.map(day => ({
    day,
    profit: Math.random() * 200 - 50, // Dummy data
    trades: Math.floor(Math.random() * 10)
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-forex-primary/20">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Visualize and analyze your trading performance</p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="patterns">Pattern Recognition</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-6">
                <PerformanceMetrics metrics={dummyMetrics} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Equity Curve</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <EquityCurve />
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Win Rate</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <WinRateChart />
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Pairs Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <PairPerformance />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Day of Week Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dayOfWeekData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="profit" fill={(data) => (data.profit >= 0 ? '#4CAF50' : '#F44336')} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="detailed">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Strategy Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dummyTradeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label
                          >
                            {dummyTradeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Risk-Reward Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: '1:1', win: 12, loss: 8 },
                            { name: '1:2', win: 10, loss: 5 },
                            { name: '1:3', win: 8, loss: 3 },
                            { name: '1:4+', win: 5, loss: 2 },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="win" name="Winning Trades" stackId="a" fill="#4CAF50" />
                          <Bar dataKey="loss" name="Losing Trades" stackId="a" fill="#F44336" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="patterns">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Time-Based Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { hour: '00:00-04:00', profit: 120, trades: 5 },
                          { hour: '04:00-08:00', profit: 180, trades: 8 },
                          { hour: '08:00-12:00', profit: -50, trades: 12 },
                          { hour: '12:00-16:00', profit: 95, trades: 15 },
                          { hour: '16:00-20:00', profit: 200, trades: 10 },
                          { hour: '20:00-24:00', profit: -30, trades: 6 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="profit" fill={(data) => (data.profit >= 0 ? '#4CAF50' : '#F44336')} />
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
                          data={[
                            { name: 'Asian', value: 25 },
                            { name: 'European', value: 45 },
                            { name: 'US', value: 30 },
                          ]}
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
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
