
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, Plus } from 'lucide-react';
import { Trade } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { calculateTotalProfit, calculateMaxDrawdown } from '@/utils/balanceCalculations';
import AddFundsDialog from './AddFundsDialog';
import ResetCapitalAlert from './ResetCapitalAlert';
import BalanceStats from './BalanceStats';

const BalanceCard = ({ trades }: { trades: Trade[] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [newFunds, setNewFunds] = useState('');
  const { toast } = useToast();

  const [initialBalance, setInitialBalance] = useState(() => {
    const savedBalance = localStorage.getItem('initialBalance');
    return savedBalance ? parseFloat(savedBalance) : 0;
  });

  const totalProfit = calculateTotalProfit(trades);
  const totalCommissions = trades
    .filter(trade => trade.status === 'CLOSED')
    .reduce((total, trade) => total + (trade.commission || 0), 0);

  const drawdownResult = calculateMaxDrawdown(trades, initialBalance);
  const maxDrawdown = drawdownResult.maxDrawdown;
  const peak = drawdownResult.peak;

  const recoveryFactor = maxDrawdown > 0 
    ? (totalProfit - totalCommissions) / (maxDrawdown / 100 * peak) 
    : 0;

  const handleAddFunds = () => {
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
        <BalanceStats
          trades={trades}
          initialBalance={initialBalance}
          totalProfit={totalProfit}
          totalCommissions={totalCommissions}
          maxDrawdown={maxDrawdown}
          recoveryFactor={recoveryFactor}
        />
      </CardContent>

      <AddFundsDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        newFunds={newFunds}
        setNewFunds={setNewFunds}
        onAddFunds={handleAddFunds}
      />
      
      <ResetCapitalAlert
        isOpen={isAlertOpen}
        setIsOpen={setIsAlertOpen}
        onResetCapital={handleResetCapital}
      />
    </Card>
  );
};

export default BalanceCard;
