
// Trade types
export interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryDate: string;
  entryPrice: number;
  exitDate: string | null;
  exitPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  lotSize: number;
  commission: number;
  swap: number;
  profit: number | null;
  pips: number | null;
  riskRewardRatio: number | null;
  notes: string;
  tags: string[];
  strategy: string;
  status: 'OPEN' | 'CLOSED';
}

// Performance metric types
export interface PerformanceMetric {
  name: string;
  value: string | number;
  change?: number;
  isPositive?: boolean;
}

export interface DailyPerformance {
  date: string;
  profit: number;
  trades: number;
}

export interface PairPerformance {
  pair: string;
  totalProfit: number;
  winRate: number;
  tradesCount: number;
}

export interface TradeDistribution {
  name: string;
  value: number;
}

// Filter types
export interface TradeFilter {
  dateRange?: [Date | null, Date | null];
  pairs?: string[];
  types?: ('BUY' | 'SELL')[];
  status?: ('OPEN' | 'CLOSED')[];
  strategies?: string[];
  tags?: string[];
}
