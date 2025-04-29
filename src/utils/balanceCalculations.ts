
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
    .sort((a, b) => {
      // Ensure we're working with valid date objects by using a safe comparison
      const dateA = a.entryDate ? new Date(a.entryDate).getTime() : 0;
      const dateB = b.entryDate ? new Date(b.entryDate).getTime() : 0;
      return dateA - dateB;
    });
    
  if (closedTrades.length === 0) return { maxDrawdown: 0, peak: 0 };
  
  // Calculate total commissions to deduct from initial balance
  const totalCommissions = closedTrades.reduce((total, trade) => total + (trade.commission || 0), 0);
  
  // Adjust initial balance by deducting total commissions
  const adjustedInitialBalance = initialBalance - totalCommissions;
  
  let peak = adjustedInitialBalance;
  let maxDrawdown = 0;
  let currentBalance = adjustedInitialBalance;
  
  closedTrades.forEach(trade => {
    // Ensure values are numbers by using || 0 for null/undefined values
    const profit = Number(trade.profit || 0);
    const swap = Number(trade.swap || 0);
    
    // Only include trade profit and swap in balance calculation
    currentBalance += profit - swap;
    
    if (currentBalance > peak) {
      peak = currentBalance;
    }
    
    // Prevent division by zero
    const drawdown = peak > 0 ? ((peak - currentBalance) / peak) * 100 : 0;
    
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  return { maxDrawdown, peak };
};
