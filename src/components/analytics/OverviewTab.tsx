
import React, { useState, useEffect } from 'react';
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
import EquityCurve from '@/components/analytics/EquityCurve';
import WinRateChart from '@/components/analytics/WinRateChart';
import PairPerformance from '@/components/analytics/PairPerformance';
import SessionAnalysis from '@/components/analytics/SessionAnalysis';
import PerformanceMetrics from '@/components/analytics/PerformanceMetrics';
import { Trade } from '@/lib/types';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const OverviewTab = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('1M');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch trades from Supabase
  React.useEffect(() => {
    const fetchTrades = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .order('entry_date', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Map Supabase data to our Trade type
          const mappedTrades: Trade[] = data.map(trade => ({
            id: trade.id,
            pair: trade.pair,
            type: trade.type as 'BUY' | 'SELL' | 'NEUTRAL',
            entryDate: trade.entry_date,
            entryPrice: trade.entry_price,
            exitDate: trade.exit_date,
            exitPrice: trade.exit_price,
            stopLoss: trade.stop_loss,
            takeProfit: trade.take_profit,
            lotSize: trade.lot_size,
            commission: trade.commission,
            swap: trade.swap,
            profit: trade.profit,
            pips: trade.pips,
            riskRewardRatio: trade.risk_reward_ratio,
            notes: trade.notes || '',
            tags: trade.tags || [],
            strategy: trade.strategy || '',
            status: trade.status as 'OPEN' | 'CLOSED',
            session: trade.session as any || null,
            capitalGrowth: trade.capital_growth,
            riskPercentage: trade.risk_percentage
          }));
          setTrades(mappedTrades);
        }
      } catch (error: any) {
        console.error('Error fetching trades:', error);
        toast({
          variant: "destructive",
          title: "Error loading trades",
          description: error.message || "Failed to load your trades"
        });
        setTrades([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrades();
  }, [toast]);
  
  // Format data for day of week chart
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekData = useMemo(() => {
    if (!trades || trades.length === 0) {
      return daysOfWeek.map(day => ({
        day,
        profit: 0,
        trades: 0
      }));
    }
    
    const dayProfits: Record<string, { profit: number, count: number }> = {};
    daysOfWeek.forEach(day => {
      dayProfits[day] = { profit: 0, count: 0 };
    });
    
    // Calculate profit by day of week from actual trades
    trades
      .filter(trade => trade.status === 'CLOSED' && trade.profit !== null)
      .forEach(trade => {
        const exitDate = new Date(trade.exitDate || trade.entryDate);
        const dayName = daysOfWeek[exitDate.getDay()];
        dayProfits[dayName].profit += (trade.profit || 0);
        dayProfits[dayName].count += 1;
      });
    
    return daysOfWeek.map(day => ({
      day,
      profit: dayProfits[day].profit,
      trades: dayProfits[day].count
    }));
  }, [trades]);

  // Calculate performance metrics
  const metrics = useMemo(() => {
    if (trades.length === 0) return [];
    
    // Calculate win rate
    const closedTrades = trades.filter(trade => trade.status === 'CLOSED');
    const winningTrades = closedTrades.filter(trade => (trade.profit || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    
    // Calculate profit factor
    const totalProfit = winningTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    const totalLoss = Math.abs(closedTrades
      .filter(trade => (trade.profit || 0) < 0)
      .reduce((sum, trade) => sum + (trade.profit || 0), 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 1 : 0;
    
    // Calculate average trade
    const averageTrade = closedTrades.length > 0 
      ? closedTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0) / closedTrades.length 
      : 0;
    
    // Calculate net profit
    const netProfit = closedTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    
    return [
      {
        name: "Win Rate",
        value: `${winRate.toFixed(3)}%`,
        change: 0,
        isPositive: winRate >= 50
      },
      {
        name: "Profit Factor",
        value: profitFactor.toFixed(3),
        change: 0,
        isPositive: profitFactor >= 1
      },
      {
        name: "Average Trade",
        value: `$${averageTrade.toFixed(3)}`,
        change: 0,
        isPositive: averageTrade >= 0
      },
      {
        name: "Net Profit",
        value: `$${netProfit.toFixed(3)}`,
        change: 0,
        isPositive: netProfit >= 0
      }
    ];
  }, [trades]);

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
      
      <PerformanceMetrics metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equity Curve</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <EquityCurve trades={trades} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Win Rate</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <WinRateChart trades={trades} />
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
              <PairPerformance trades={trades} />
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
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `$${value.toFixed(3)}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(3)}`, 'Profit']}
                    labelFormatter={(label) => `${label}`}
                  />
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
            <SessionAnalysis trades={trades} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
