
export const calculateTotalProfit = (trades: Trade[]) => {
  return trades
    .filter(trade => trade.status === 'CLOSED')
    .reduce((total, trade) => {
      const tradeProfit = (trade.profit || 0) - (trade.swap || 0);
      return total + tradeProfit;
    }, 0);
};

export const calculateMaxDrawdown = (trades: Trade[], initialBalance: number): { maxDrawdown: number; peak: number } => {
  if (trades.length === 0) return { maxDrawdown: 0, peak: 0 };
  
  const closedTrades = trades.filter(trade => trade.status === 'CLOSED')
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    
  if (closedTrades.length === 0) return { maxDrawdown: 0, peak: 0 };
  
  let peak = initialBalance;
  let maxDrawdown = 0;
  let currentBalance = initialBalance;
  
  closedTrades.forEach(trade => {
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
