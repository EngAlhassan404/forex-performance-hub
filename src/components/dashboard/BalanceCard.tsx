
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { dummyTrades } from '@/lib/dummyData';
import { Trade } from '@/lib/types';

// Fetch user balance from supabase
const fetchUserBalance = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('account_settings')
    .select('balance')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching balance:', error);
    return null;
  }

  return data?.balance || 0;
};

// Calculate total profit from trades
const calculateTotalProfit = (trades: Trade[]) => {
  return trades
    .filter(trade => trade.status === 'CLOSED')
    .reduce((total, trade) => total + (trade.profit || 0), 0);
};

const BalanceCard = () => {
  const { data: initialBalance, isLoading, error } = useQuery({
    queryKey: ['userBalance'],
    queryFn: fetchUserBalance
  });

  // Calculate total profit
  const totalProfit = calculateTotalProfit(dummyTrades);
  
  // Calculate total balance (initial + profit)
  const totalBalance = (initialBalance || 0) + totalProfit;
  
  // Calculate profit percentage
  const profitPercentage = initialBalance && initialBalance > 0 
    ? (totalProfit / initialBalance) * 100 
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <Wallet className="mr-2 h-5 w-5" /> Account Balance
        </CardTitle>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Funds
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {isLoading ? 'Loading...' : `$${totalBalance?.toFixed(2) || '0.00'}`}
        </div>
        
        <div className="flex items-center mt-2">
          <div className={`flex items-center ${totalProfit >= 0 ? 'text-forex-profit' : 'text-forex-loss'}`}>
            {totalProfit >= 0 ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              ${Math.abs(totalProfit).toFixed(2)} ({profitPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-xs text-muted-foreground">Initial Capital</p>
            <p className="text-sm font-medium">${(initialBalance || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net Profit/Loss</p>
            <p className={`text-sm font-medium ${totalProfit >= 0 ? 'text-forex-profit' : 'text-forex-loss'}`}>
              ${totalProfit.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
