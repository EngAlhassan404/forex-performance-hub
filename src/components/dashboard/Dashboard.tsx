
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trade } from '@/lib/types';
import { TIME_PERIODS } from '@/lib/constants';
import EquityCurve from '@/components/analytics/EquityCurve';
import WinRateChart from '@/components/analytics/WinRateChart';
import PairPerformance from '@/components/analytics/PairPerformance';
import PerformanceMetrics from '@/components/analytics/PerformanceMetrics';
import { ArrowUpRight, ArrowDownRight, ChevronRight, LineChart, BarChart2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BalanceCard from './BalanceCard';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Dashboard = ({ trades }: { trades: Trade[] }) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = React.useState('1M');
  // Add state for chart style selection
  const [chartStyle, setChartStyle] = useState<'area' | 'line' | 'bar'>('area');
  
  // Only show recent trades if there are any
  const recentTrades = trades
    .filter(trade => trade.status === 'CLOSED')
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
    .slice(0, 5);

  // Calculate performance metrics from actual trades
  const calculateMetrics = () => {
    if (trades.length === 0) return [];
    
    // Only calculate metrics if there are trades
    const closedTrades = trades.filter(trade => trade.status === 'CLOSED');
    const winningTrades = closedTrades.filter(trade => (trade.profit || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.profit || 0) < 0);
    const breakEvenTrades = closedTrades.filter(trade => (trade.profit || 0) === 0);
    
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const lossRate = closedTrades.length > 0 ? (losingTrades.length / closedTrades.length) * 100 : 0;
    
    const totalProfit = closedTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);
      
    const avgProfit = winningTrades.length > 0
      ? winningTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0) / winningTrades.length
      : 0;
    
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0)) / losingTrades.length
      : 0;
    
    // Calculate profit factor (total profits / total losses)
    const profitFactor = () => {
      const totalWins = winningTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);
      
      const totalLosses = Math.abs(losingTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0));
      
      return totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 1 : 0;
    };

    // Calculate expected value
    const expectedValue = ((winRate / 100) * avgProfit) - ((lossRate / 100) * avgLoss);
    
    // Calculate Sharpe Ratio
    const profitValues = closedTrades.map(trade => trade.profit || 0);
    const mean = profitValues.reduce((sum, val) => sum + val, 0) / profitValues.length;
    const variance = profitValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / profitValues.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? mean / stdDev : 0;
    
    return [
      {
        name: "Win Rate",
        value: `${winRate.toFixed(3)}%`,
        change: 0,
        isPositive: winRate > 50
      },
      {
        name: "Profit Factor",
        value: profitFactor().toFixed(3),
        change: 0,
        isPositive: profitFactor() >= 1
      },
      {
        name: "Avg Profit",
        value: `$${avgProfit.toFixed(3)}`,
        change: 0,
        isPositive: avgProfit > 0
      },
      {
        name: "Total P/L",
        value: `$${totalProfit.toFixed(3)}`,
        change: 0,
        isPositive: totalProfit >= 0
      },
      {
        name: "Expected Value",
        value: `$${expectedValue.toFixed(3)}`,
        change: 0,
        isPositive: expectedValue >= 0
      },
      {
        name: "Sharpe Ratio",
        value: sharpeRatio.toFixed(3),
        change: 0,
        isPositive: sharpeRatio > 0
      }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BalanceCard trades={trades} />
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Equity Curve</CardTitle>
              <Select value={chartStyle} onValueChange={(value) => setChartStyle(value as 'area' | 'line' | 'bar')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Chart Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">
                    <div className="flex items-center">
                      <LineChart className="h-4 w-4 mr-2" />
                      <span>Area Chart</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      <span>Line Chart</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      <span>Bar Chart</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="pt-0">
              <EquityCurve trades={trades} chartStyle={chartStyle} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Win Rate Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <WinRateChart trades={trades} />
            </CardContent>
          </Card>
        </div>
      </div>

      {trades.length > 0 ? (
        <PerformanceMetrics metrics={calculateMetrics()} />
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No performance metrics available. Add trades to see your statistics.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Trades</CardTitle>
              <Button variant="link" asChild>
                <a href="/trade-log" className="flex items-center">
                  View All <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {recentTrades.length > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-sm font-medium">Pair</th>
                        <th className="text-left p-2 text-sm font-medium">Type</th>
                        <th className="text-left p-2 text-sm font-medium">Entry Date</th>
                        <th className="text-right p-2 text-sm font-medium">Profit/Loss</th>
                        <th className="text-right p-2 text-sm font-medium">Pips</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTrades.map((trade: Trade) => (
                        <tr key={trade.id} className="border-b">
                          <td className="p-2 text-sm">{trade.pair}</td>
                          <td className="p-2 text-sm">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="p-2 text-sm">
                            {new Date(trade.entryDate).toLocaleDateString()}
                          </td>
                          <td className={`p-2 text-sm text-right ${
                            (trade.profit || 0) >= 0 ? 'text-forex-profit' : 'text-forex-loss'
                          }`}>
                            <div className="flex items-center justify-end">
                              {(trade.profit || 0) >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                              )}
                              ${Math.abs(trade.profit || 0).toFixed(3)}
                            </div>
                          </td>
                          <td className={`p-2 text-sm text-right ${
                            (trade.pips || 0) >= 0 ? 'text-forex-profit' : 'text-forex-loss'
                          }`}>
                            {(trade.pips || 0) >= 0 ? '+' : ''}{(trade.pips || 0).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No trades yet. Add trades in the Trade Log to see your recent trades here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Currency Pair Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <PairPerformance trades={trades} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
