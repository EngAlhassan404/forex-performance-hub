
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trade } from '@/lib/types';
import { TIME_PERIODS } from '@/lib/constants';
import EquityCurve from '@/components/analytics/EquityCurve';
import WinRateChart from '@/components/analytics/WinRateChart';
import PairPerformance from '@/components/analytics/PairPerformance';
import PerformanceMetrics from '@/components/analytics/PerformanceMetrics';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BalanceCard from './BalanceCard';

const Dashboard = ({ trades }: { trades: Trade[] }) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = React.useState('1M');
  
  // Only show recent trades if there are any
  const recentTrades = trades
    .filter(trade => trade.status === 'CLOSED')
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
    .slice(0, 5);

  // Calculate performance metrics from actual trades
  const calculateMetrics = () => {
    if (trades.length === 0) return [];
    
    // Only calculate metrics if there are trades
    const winningTrades = trades.filter(trade => trade.status === 'CLOSED' && (trade.profit || 0) > 0);
    const winRate = trades.length > 0 ? (winningTrades.length / trades.filter(trade => trade.status === 'CLOSED').length) * 100 : 0;
    
    const totalProfit = trades
      .filter(trade => trade.status === 'CLOSED')
      .reduce((acc, trade) => acc + (trade.profit || 0), 0);
      
    const avgProfit = winningTrades.length > 0
      ? winningTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0) / winningTrades.length
      : 0;
    
    return [
      {
        name: "Win Rate",
        value: `${winRate.toFixed(1)}%`,
        change: 2.5,
        isPositive: true
      },
      {
        name: "Profit Factor",
        value: trades.length > 0 ? "1.8" : "0",
        change: 0.3,
        isPositive: true
      },
      {
        name: "Avg Profit",
        value: `$${avgProfit.toFixed(2)}`,
        change: 5.2,
        isPositive: true
      },
      {
        name: "Total P/L",
        value: `$${totalProfit.toFixed(2)}`,
        change: 10.1,
        isPositive: totalProfit >= 0
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
            </CardHeader>
            <CardContent className="pt-0">
              <EquityCurve trades={trades} />
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
                              ${Math.abs(trade.profit || 0).toFixed(2)}
                            </div>
                          </td>
                          <td className={`p-2 text-sm text-right ${
                            (trade.pips || 0) >= 0 ? 'text-forex-profit' : 'text-forex-loss'
                          }`}>
                            {(trade.pips || 0) >= 0 ? '+' : ''}{trade.pips}
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
              {trades.length > 0 ? (
                <PairPerformance trades={trades} />
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No trade data available. Add trades to see pair performance.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
