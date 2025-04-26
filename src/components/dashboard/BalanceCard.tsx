
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { dummyTrades } from '@/lib/dummyData';
import { Trade } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

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
    .reduce((total, trade) => {
      // Subtract commission from profit
      const tradeProfit = (trade.profit || 0) - (trade.commission || 0);
      return total + tradeProfit;
    }, 0);
};

const BalanceCard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFunds, setNewFunds] = useState('');
  const { toast } = useToast();

  // Use a dummy initial balance for demo purposes
  const initialBalance = localStorage.getItem('initialBalance') 
    ? parseFloat(localStorage.getItem('initialBalance')!)
    : 10000;

  // Calculate total profit with commission subtracted
  const totalProfit = calculateTotalProfit(dummyTrades);
  
  // Calculate total commissions
  const totalCommissions = dummyTrades
    .filter(trade => trade.status === 'CLOSED')
    .reduce((total, trade) => total + (trade.commission || 0), 0);
  
  // Calculate total balance (initial + profit)
  const totalBalance = initialBalance + totalProfit;
  
  // Calculate profit percentage
  const profitPercentage = initialBalance > 0 
    ? (totalProfit / initialBalance) * 100 
    : 0;
  
  // Calculate max drawdown (simplified version)
  const maxDrawdown = -5.2; // Placeholder value

  const handleAddFunds = () => {
    if (!newFunds || isNaN(parseFloat(newFunds)) || parseFloat(newFunds) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid positive amount.",
      });
      return;
    }

    const updatedBalance = initialBalance + parseFloat(newFunds);
    localStorage.setItem('initialBalance', updatedBalance.toString());
    
    toast({
      title: "Funds added",
      description: `$${parseFloat(newFunds).toFixed(2)} has been added to your account.`,
    });
    
    setNewFunds('');
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <Wallet className="mr-2 h-5 w-5" /> Account Balance
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Funds
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Funds to Account</DialogTitle>
              <DialogDescription>
                Enter the amount you want to add to your trading account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newFunds}
                  onChange={(e) => setNewFunds(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddFunds}>Add Funds</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          ${totalBalance.toFixed(2)}
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
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-muted-foreground">Initial Capital</p>
            <p className="text-sm font-medium">${initialBalance.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net Profit/Loss</p>
            <p className={`text-sm font-medium ${totalProfit >= 0 ? 'text-forex-profit' : 'text-forex-loss'}`}>
              ${totalProfit.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Commission</p>
            <p className="text-sm font-medium text-forex-loss">
              ${totalCommissions.toFixed(2)} ({((totalCommissions / initialBalance) * 100).toFixed(2)}%)
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Max Drawdown</p>
            <p className="text-sm font-medium text-forex-loss">
              {maxDrawdown}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
