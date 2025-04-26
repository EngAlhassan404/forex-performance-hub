// Trade types
export interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL' | 'NEUTRAL';
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
  session: TradingSession | null;
  capitalGrowth: number | null;
  riskPercentage: number | null;
}

export type TradingSession = 
  | 'TOKYO' 
  | 'SYDNEY' 
  | 'LONDON' 
  | 'NEW_YORK' 
  | 'TOKYO_LONDON' 
  | 'LONDON_NEW_YORK' 
  | 'SYDNEY_TOKYO' 
  | 'NEW_YORK_SYDNEY'
  | 'NEUTRAL';

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
  types?: ('BUY' | 'SELL' | 'NEUTRAL')[];
  status?: ('OPEN' | 'CLOSED')[];
  strategies?: string[];
  tags?: string[];
  sessions?: TradingSession[];
}

// User authentication
export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER';
}

// Extended trading session definition with time information
export interface SessionTime {
  name: TradingSession;
  displayName: string;
  startTimeGMT: string; // Format: "HH:MM"
  endTimeGMT: string;   // Format: "HH:MM"
  description?: string;
}

// Session analysis
export interface SessionPerformance {
  session: TradingSession;
  totalProfit: number;
  tradeCount: number;
  winRate: number;
}
