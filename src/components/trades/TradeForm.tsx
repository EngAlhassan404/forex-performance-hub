import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { STRATEGIES, TRADE_TAGS } from '@/lib/constants';
import CurrencyPairSelect from './CurrencyPairSelect';
import { useToast } from '@/components/ui/use-toast';
import { TradingSession } from '@/lib/types';
import { getAvailableSessions, determineActiveSession } from '@/lib/sessionData';
import { supabase } from '@/integrations/supabase/client';

const TradeForm = () => {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currencyPair, setCurrencyPair] = useState<string>('EUR/USD');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [exitDate, setExitDate] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [stopLossPips, setStopLossPips] = useState<string>('');
  const [takeProfitPips, setTakeProfitPips] = useState<string>('');
  const [lotSize, setLotSize] = useState<string>('0.1');
  const [commission, setCommission] = useState<string>('0');
  const [swap, setSwap] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [strategy, setStrategy] = useState<string>('');
  const [session, setSession] = useState<TradingSession | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const availableSessions = getAvailableSessions();
  const { toast } = useToast();

  // Calculate stop loss and take profit prices based on pips
  const calculateStopLossTakeProfit = () => {
    if (!entryPrice || !stopLossPips || !takeProfitPips) return { sl: null, tp: null };
    
    const entry = parseFloat(entryPrice);
    const slPips = parseFloat(stopLossPips);
    const tpPips = parseFloat(takeProfitPips);
    
    // Determine pip value based on currency pair
    const pipFactor = currencyPair.includes('JPY') ? 0.01 : 0.0001;
    
    let stopLoss = 0;
    let takeProfit = 0;
    
    if (tradeType === 'BUY') {
      stopLoss = entry - (slPips * pipFactor);
      takeProfit = entry + (tpPips * pipFactor);
    } else { // SELL
      stopLoss = entry + (slPips * pipFactor);
      takeProfit = entry - (tpPips * pipFactor);
    }
    
    return {
      sl: parseFloat(stopLoss.toFixed(5)),
      tp: parseFloat(takeProfit.toFixed(5))
    };
  };
  
  // Auto-detect session based on entry time
  const handleEntryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setEntryDate(newDate);
    
    // Auto-detect trading session based on time
    if (newDate) {
      const date = new Date(newDate);
      const activeSessions = determineActiveSession(date);
      if (activeSessions.length > 0 && activeSessions[0] !== 'NEUTRAL') {
        setSession(activeSessions[0]);
      }
    }
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Calculate stop loss and take profit prices
      const { sl, tp } = calculateStopLossTakeProfit();
      
      // Calculate profit (if exit price is provided)
      let profit = null;
      let pips = null;
      
      if (exitPrice) {
        const entry = parseFloat(entryPrice);
        const exit = parseFloat(exitPrice);
        const lotSizeValue = parseFloat(lotSize);
        
        // Calculate pips based on the currency pair
        const pipFactor = currencyPair.includes('JPY') ? 0.01 : 0.0001;
        
        if (tradeType === 'BUY') {
          pips = Math.round((exit - entry) / pipFactor);
          // Standard calculation: (Exit - Entry) * Lot Size * Pip Value
          profit = (exit - entry) * lotSizeValue * 100000;
        } else {
          pips = Math.round((entry - exit) / pipFactor);
          profit = (entry - exit) * lotSizeValue * 100000;
        }
        
        // Subtract commission
        profit -= parseFloat(commission || '0');
        
        // Adjust for JPY pairs
        if (currencyPair.includes('JPY')) {
          profit = profit / 100;
        }
      }
      
      // Calculate risk-reward ratio
      let riskRewardRatio = null;
      if (sl && tp && entryPrice) {
        const entry = parseFloat(entryPrice);
        const riskPips = tradeType === 'BUY' ? entry - sl : sl - entry;
        const rewardPips = tradeType === 'BUY' ? tp - entry : entry - tp;
        
        if (riskPips > 0) {
          riskRewardRatio = parseFloat((rewardPips / riskPips).toFixed(2));
        }
      }
      
      // Prepare the trade data
      const tradeData = {
        pair: currencyPair,
        type: tradeType,
        entryDate,
        entryPrice: parseFloat(entryPrice),
        exitDate: exitDate || null,
        exitPrice: exitPrice ? parseFloat(exitPrice) : null,
        stopLoss: sl,
        takeProfit: tp,
        lotSize: parseFloat(lotSize),
        commission: parseFloat(commission || '0'),
        swap: parseFloat(swap || '0'),
        profit,
        pips,
        riskRewardRatio,
        notes,
        tags: selectedTags,
        strategy: strategy || null,
        status: exitPrice ? 'CLOSED' : 'OPEN',
        session: session || null,
        riskPercentage: null, // Will be calculated on the backend based on account settings
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('trades')
        .insert([tradeData])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Trade successfully saved",
        description: `Your ${tradeType} trade on ${currencyPair} has been added to your journal.`,
      });
      
      // Reset form fields
      setEntryPrice('');
      setExitPrice('');
      setStopLossPips('');
      setTakeProfitPips('');
      setLotSize('0.1');
      setCommission('0');
      setSwap('0');
      setNotes('');
      setStrategy('');
      setSelectedTags([]);
      // Keep trade type and currency pair as they are commonly reused
      
    } catch (error: any) {
      console.error('Error saving trade:', error);
      toast({
        variant: "destructive",
        title: "Error saving trade",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Trade</CardTitle>
        <CardDescription>Record your trade details for analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pair">Currency Pair</Label>
                <CurrencyPairSelect value={currencyPair} onChange={setCurrencyPair} />
              </div>

              <div className="space-y-2">
                <Label>Trade Type</Label>
                <RadioGroup 
                  value={tradeType} 
                  className="flex space-x-4"
                  onValueChange={(value) => setTradeType(value as 'BUY' | 'SELL')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BUY" id="buy" />
                    <Label htmlFor="buy" className="text-forex-profit font-medium">Buy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SELL" id="sell" />
                    <Label htmlFor="sell" className="text-forex-loss font-medium">Sell</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry-date">Entry Date/Time</Label>
                <Input 
                  type="datetime-local" 
                  id="entry-date" 
                  value={entryDate}
                  onChange={handleEntryDateChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry-price">Entry Price</Label>
                <Input 
                  type="number" 
                  id="entry-price" 
                  step="0.00001" 
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lot-size">Lot Size</Label>
                <Input 
                  type="number" 
                  id="lot-size" 
                  step="0.01" 
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stop-loss-pips">Stop Loss (Pips)</Label>
                  <Input 
                    type="number" 
                    id="stop-loss-pips" 
                    value={stopLossPips}
                    onChange={(e) => setStopLossPips(e.target.value)}
                  />
                  {entryPrice && stopLossPips && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Price: {calculateStopLossTakeProfit().sl}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="take-profit-pips">Take Profit (Pips)</Label>
                  <Input 
                    type="number" 
                    id="take-profit-pips" 
                    value={takeProfitPips}
                    onChange={(e) => setTakeProfitPips(e.target.value)}
                  />
                  {entryPrice && takeProfitPips && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Price: {calculateStopLossTakeProfit().tp}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exit-date">Exit Date/Time</Label>
                  <Input 
                    type="datetime-local" 
                    id="exit-date" 
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exit-price">Exit Price</Label>
                  <Input 
                    type="number" 
                    id="exit-price" 
                    step="0.00001" 
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission</Label>
                  <Input 
                    type="number" 
                    id="commission" 
                    step="0.01" 
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="swap">Swap</Label>
                  <Input 
                    type="number" 
                    id="swap" 
                    step="0.01" 
                    value={swap}
                    onChange={(e) => setSwap(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session">Trading Session</Label>
                <Select value={session} onValueChange={(value) => setSession(value as TradingSession)}>
                  <SelectTrigger id="session">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSessions.map((session) => (
                      <SelectItem key={session.value} value={session.value}>{session.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategy">Strategy</Label>
                <Select value={strategy} onValueChange={setStrategy}>
                  <SelectTrigger id="strategy">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {STRATEGIES.map((strat) => (
                      <SelectItem key={strat} value={strat}>{strat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 pt-2">
                  {TRADE_TAGS.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedTags.includes(tag)
                          ? 'bg-forex-accent text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Add your trading notes here..." 
                  className="h-24" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Trade'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TradeForm;
