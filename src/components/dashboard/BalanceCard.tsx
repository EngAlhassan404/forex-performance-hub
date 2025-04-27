import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, ChevronDown } from 'lucide-react';
import { Trade } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Calculate total profit from trades WITHOUT deducting commission
const calculateTotalProfit = (trades: Trade[]) => {
  return trades
    .filter(trade => trade.status === 'CLOSED')
    .reduce((total, trade) => {
      // No longer subtract commission from profit
      const tradeProfit = (trade.profit || 0) - (trade.swap || 0);
      return total + tradeProfit;
    }, 0);
};

const BalanceCard = ({ trades }: { trades: Trade[] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [newFunds, setNewFunds] = useState('');
  const { toast } = useToast();

  // Use a stored initial balance or default to 0
  const [initialBalance, setInitialBalance] = useState(() => {
    const savedBalance = localStorage.getItem('initialBalance');
    return savedBalance ? parseFloat(savedBalance) : 0;
  });

  // Calculate total profit WITHOUT commission subtracted
  const totalProfit = calculateTotalProfit(trades);
  
  // Calculate total commissions separately to display
  const totalCommissions = trades
    .filter(trade => trade.status === 'CLOSED')
    .reduce((total, trade) => total + (trade.commission || 0), 0);
  
  // Calculate total balance (initial + profit)
  const totalBalance = initialBalance + totalProfit;
  
  // Calculate profit percentage
  const profitPercentage = initialBalance > 0 
    ? (totalProfit / initialBalance) * 100 
    : 0;
  
  // Calculate max drawdown with improved methodology
  const calculateMaxDrawdown = (trades: Trade[]) => {
    if (trades.length === 0) return 0;
    
    const closedTrades = trades.filter(trade => trade.status === 'CLOSED')
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
      
    if (closedTrades.length === 0) return 0;
    
    let peak = initialBalance;
    let maxDrawdown = 0;
    let currentBalance = initialBalance;
    
    // Iterate through trades chronologically
    closedTrades.forEach(trade => {
      // Update current balance without deducting commission
      currentBalance += (trade.profit || 0) - (trade.swap || 0);
      
      // Update peak if we have a new high
      if (currentBalance > peak) {
        peak = currentBalance;
      }
      
      // Calculate drawdown from peak
      const drawdown = peak > 0 ? ((peak - currentBalance) / peak) * 100 : 0;
      
      // Update max drawdown if this is worse
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    return { maxDrawdown, peak };
  };
  
  const { maxDrawdown, peak } = calculateMaxDrawdown(trades);

  // Calculate recovery factor (Net Profit / Maximum Drawdown)
  const recoveryFactor = maxDrawdown > 0 
    ? totalProfit / (maxDrawdown / 100 * peak) 
    : 0;

  // Update initial balance when adding funds
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
    setInitialBalance(updatedBalance);
    
    toast({
      title: "Funds added",
      description: `$${parseFloat(newFunds).toFixed(3)} has been added to your account.`,
    });
    
    setNewFunds('');
    setIsDialogOpen(false);
  };
  
  // Handle reset capital to zero
  const handleResetCapital = () => {
    localStorage.setItem('initialBalance', '0');
    setInitialBalance(0);
    
    toast({
      title: "Capital reset",
      description: "Your capital has been reset to $0.000",
    });
    
    setIsAlertOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <Wallet className="mr-2 h-5 w-5" /> Account Balance
        </CardTitle>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ChevronDown className="h-4 w-4 mr-1" /> Capital Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Funds
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsAlertOpen(true)} className="text-red-600">
              Reset Capital to Zero
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          ${totalBalance.toFixed(3)}
        </div>
        
        {trades.length > 0 && (
          <div className="flex items-center mt-2">
            <div className={`flex items-center ${totalProfit >= 0 ? 'text-forex-profit' : 'text-forex-loss'}`}>
              {totalProfit >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                ${Math.abs(totalProfit).toFixed(3)} ({profitPercentage.toFixed(3)}%)
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-muted-foreground">Initial Capital</p>
            <p className="text-sm font-medium">${initialBalance.toFixed(3)}</p>
          </div>
          {trades.length > 0 && (
            <>
              <div>
                <p className="text-xs text-muted-foreground">Net Profit/Loss</p>
                <p className={`text-sm font-medium ${totalProfit >= 0 ? 'text-forex-profit' : 'text-forex-loss'}`}>
                  ${totalProfit.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Commission</p>
                <p className="text-sm font-medium text-forex-loss">
                  ${totalCommissions.toFixed(3)} 
                  {initialBalance > 0 && (
                    <span> ({((totalCommissions / initialBalance) * 100).toFixed(3)}%)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Drawdown</p>
                <p className="text-sm font-medium text-forex-loss">
                  {maxDrawdown.toFixed(3)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recovery Factor</p>
                <p className="text-sm font-medium">
                  {recoveryFactor.toFixed(3)}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
      
      {/* Add Funds Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                step="0.001"
                placeholder="0.000"
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
      
      {/* Reset Capital Alert */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Capital to Zero</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your initial capital to $0.000. This action cannot be undone. 
              Your trade history will remain unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetCapital} className="bg-red-600 hover:bg-red-700">
              Reset Capital
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default BalanceCard;
