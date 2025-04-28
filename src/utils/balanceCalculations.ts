
import { Trade } from '@/lib/types';

export const calculateTotalProfit = (trades: Trade[]) => {
  return trades
    .filter(trade => trade.status === 'CLOSED')
    .reduce((total, trade) => {
      // Only include trade profit and swap, no commission deduction
      const tradeProfit = (trade.profit || 0) - (trade.swap || 0);
      return total + tradeProfit;
    }, 0);
};

export const calculateMaxDrawdown = (trades: Trade[], initialBalance: number): { maxDrawdown: number; peak: number } => {
  if (trades.length === 0) return { maxDrawdown: 0, peak: 0 };
  
  const closedTrades = trades.filter(trade => trade.status === 'CLOSED')
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    
  if (closedTrades.length === 0) return { maxDrawdown: 0, peak: 0 };
  
  // Calculate total commissions to deduct from initial balance
  const totalCommissions = closedTrades.reduce((total, trade) => total + (trade.commission || 0), 0);
  
  // Adjust initial balance by deducting total commissions
  const adjustedInitialBalance = initialBalance - totalCommissions;
  
  let peak = adjustedInitialBalance;
  let maxDrawdown = 0;
  let currentBalance = adjustedInitialBalance;
  
  closedTrades.forEach(trade => {
    // Only include trade profit and swap in balance calculation
    currentBalance += (trade.profit || 0) - (trade.swap || 0);
    
    if (currentBalance > peak) {
      peak = currentBalance;
    }
    
    const drawdown = peak > 0 ? ((peak - currentBalance) / peak) * 100 : 0;
    
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  return { maxDrawdown, peak };
};
