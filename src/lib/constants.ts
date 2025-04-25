
export const CURRENCY_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 
  'USD/CHF', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
  'AUD/JPY', 'EUR/AUD', 'EUR/CAD', 'USD/MXN', 'USD/ZAR'
];

export const STRATEGIES = [
  'Trend Following', 'Breakout', 'Mean Reversion', 'Scalping',
  'Day Trading', 'Swing Trading', 'Position Trading', 'Grid Trading',
  'Martingale', 'Hedging', 'Arbitrage', 'News Trading'
];

export const TRADE_TAGS = [
  'Good Setup', 'Bad Entry', 'Emotional Trade', 'Revenge Trade',
  'News Event', 'Fundamental', 'Technical', 'Pre-market',
  'High Volume', 'Low Volume', 'Choppy Market', 'Strong Trend'
];

export const TIME_PERIODS = ['Today', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'All'];

export const DEFAULT_COLUMNS = [
  'pair', 
  'type', 
  'entryDate', 
  'entryPrice', 
  'exitDate', 
  'exitPrice', 
  'lotSize', 
  'profit', 
  'pips',
  'status'
];

export const ADVANCED_COLUMNS = [
  'riskRewardRatio',
  'stopLoss',
  'takeProfit', 
  'commission', 
  'swap',
  'strategy',
  'tags',
  'notes'
];
