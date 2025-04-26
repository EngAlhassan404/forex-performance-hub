
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown } from 'lucide-react';
import { dummyMetrics, dummyDailyPerformance, dummyTrades } from '@/lib/dummyData';
import EquityCurve from '@/components/analytics/EquityCurve';
import WinRateChart from '@/components/analytics/WinRateChart';
import PairPerformance from '@/components/analytics/PairPerformance';
import SessionAnalysis from '@/components/analytics/SessionAnalysis';
import PerformanceMetrics from '@/components/analytics/PerformanceMetrics';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell
} from 'recharts';

const OverviewTab = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('1M');
  
  // Format data for day of week chart
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekData = daysOfWeek.map(day => ({
    day,
    profit: Math.random() * 200 - 50, // Dummy data
    trades: Math.floor(Math.random() * 10)
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center relative">
            <div className="flex space-x-2 border rounded-md p-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex space-x-2">
                <DatePicker date={dateRange[0]} setDate={(date) => setDateRange([date, dateRange[1]])} placeholder="Start date" />
                <span className="text-muted-foreground">to</span>
                <DatePicker date={dateRange[1]} setDate={(date) => setDateRange([dateRange[0], date])} placeholder="End date" />
              </div>
            </div>
          </div>
          <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1W">1 Week</SelectItem>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
              <SelectItem value="ALL">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline">
          <ChevronDown className="h-4 w-4 mr-2" />
          Filter Options
        </Button>
      </div>
      
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
                  <Bar dataKey="profit" fill="#4CAF50" radius={[4, 4, 0, 0]}>
                    {dayOfWeekData.map((entry, index) => (
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
        </div>
      </div>
      
      {/* New section for session analysis */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trading Session Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionAnalysis trades={dummyTrades} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
