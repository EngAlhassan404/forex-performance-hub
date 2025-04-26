
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Trade } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import CurrencyPairSelect from '@/components/trades/CurrencyPairSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STRATEGIES, TRADE_TAGS } from '@/lib/constants';
import { TradingSession } from '@/lib/types';
import { getAvailableSessions, determineActiveSession } from '@/lib/sessionData';

const EditTrade = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [trade, setTrade] = useState<Trade | null>(null);
  
  // Form state
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currencyPair, setCurrencyPair] = useState<string>('EUR/USD');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [entryDate, setEntryDate] = useState<string>('');
  const [exitDate, setExitDate] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [stopLossPips, setStopLossPips] = useState<string>('');
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [takeProfitPips, setTakeProfitPips] = useState<string>('');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
  const [lotSize, setLotSize] = useState<string>('0.1');
  const [commission, setCommission] = useState<string>('0');
  const [swap, setSwap] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [strategy, setStrategy] = useState<string>('');
  const [session, setSession] = useState<TradingSession | ''>('');
  
  const availableSessions = getAvailableSessions();

  useEffect(() => {
    const fetchTrade = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Map database fields to our Trade type
          const mappedTrade: Trade = {
            id: data.id,
            pair: data.pair,
            type: data.type as 'BUY' | 'SELL' | 'NEUTRAL',
            entryDate: data.entry_date,
            entryPrice: data.entry_price,
            exitDate: data.exit_date,
            exitPrice: data.exit_price,
            stopLoss: data.stop_loss,
            takeProfit: data.take_profit,
            lotSize: data.lot_size,
            commission: data.commission,
            swap: data.swap,
            profit: data.profit,
            pips: data.pips,
            riskRewardRatio: data.risk_reward_ratio,
            notes: data.notes || '',
            tags: data.tags || [],
            strategy: data.strategy || '',
            status: data.status as 'OPEN' | 'CLOSED',
            session: data.session as any || null,
            capitalGrowth: data.capital_growth,
            riskPercentage: data.risk_percentage
          };
          
          setTrade(mappedTrade);
          
          // Populate form fields
          setTradeType(mappedTrade.type as 'BUY' | 'SELL');
          setCurrencyPair(mappedTrade.pair);
          setEntryDate(mappedTrade.entryDate ? new Date(mappedTrade.entryDate).toISOString().slice(0, 16) : '');
          setEntryPrice(mappedTrade.entryPrice?.toString() || '');
          setExitDate(mappedTrade.exitDate ? new Date(mappedTrade.exitDate).toISOString().slice(0, 16) : '');
          setExitPrice(mappedTrade.exitPrice?.toString() || '');
          setLotSize(mappedTrade.lotSize?.toString() || '0.1');
          setCommission(mappedTrade.commission?.toString() || '0');
          setSwap(mappedTrade.swap?.toString() || '0');
          setNotes(mappedTrade.notes || '');
          setStrategy(mappedTrade.strategy || '');
          setSelectedTags(mappedTrade.tags || []);
          setSession(mappedTrade.session || '');
          
          // Calculate stop loss and take profit in pips
          if (mappedTrade.stopLoss && mappedTrade.entryPrice) {
            const pipFactor = mappedTrade.pair.includes('JPY') ? 0.01 : 0.0001;
            const slPips = tradeType === 'BUY' 
              ? (mappedTrade.entryPrice - mappedTrade.stopLoss) / pipFactor 
              : (mappedTrade.stopLoss - mappedTrade.entryPrice) / pipFactor;
              
            setStopLossPips(Math.abs(slPips).toFixed(1));
            setStopLossPrice(mappedTrade.stopLoss.toString());
          }
          
          if (mappedTrade.takeProfit && mappedTrade.entryPrice) {
            const pipFactor = mappedTrade.pair.includes('JPY') ? 0.01 : 0.0001;
            const tpPips = tradeType === 'BUY' 
              ? (mappedTrade.takeProfit - mappedTrade.entryPrice) / pipFactor 
              : (mappedTrade.entryPrice - mappedTrade.takeProfit) / pipFactor;
              
            setTakeProfitPips(Math.abs(tpPips).toFixed(1));
            setTakeProfitPrice(mappedTrade.takeProfit.toString());
          }
        }
      } catch (error: any) {
        console.error('Error fetching trade:', error);
        toast({
          variant: "destructive",
          title: "Error loading trade",
          description: error.message || "Failed to load trade details"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrade();
  }, [id, toast]);
  
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
    
    setStopLossPrice(stopLoss.toFixed(5));
    setTakeProfitPrice(takeProfit.toFixed(5));
    
    return {
      sl: parseFloat(stopLoss.toFixed(5)),
      tp: parseFloat(takeProfit.toFixed(5))
    };
  };
  
  // Recalculate when inputs change
  useEffect(() => {
    if (entryPrice && stopLossPips && takeProfitPips) {
      calculateStopLossTakeProfit();
    }
  }, [entryPrice, stopLossPips, takeProfitPips, tradeType, currencyPair]);
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    setIsSaving(true);
    
    try {
      const { sl, tp } = calculateStopLossTakeProfit();
      
      // Calculate profit if exit price is provided
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
      
      // Prepare the trade data matching Supabase schema
      const updatedTradeData = {
        pair: currencyPair,
        type: tradeType,
        entry_date: entryDate,
        entry_price: parseFloat(entryPrice),
        exit_date: exitDate || null,
        exit_price: exitPrice ? parseFloat(exitPrice) : null,
        stop_loss: sl,
        take_profit: tp,
        lot_size: parseFloat(lotSize),
        commission: parseFloat(commission || '0'),
        swap: parseFloat(swap || '0'),
        profit,
        pips,
        risk_reward_ratio: riskRewardRatio,
        notes,
        tags: selectedTags,
        strategy: strategy || null,
        status: exitPrice ? 'CLOSED' : 'OPEN',
        session: session || null
      };
      
      const { error } = await supabase
        .from('trades')
        .update(updatedTradeData)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Trade updated",
        description: `Your ${tradeType} trade on ${currencyPair} has been updated.`,
      });
      
      // Navigate back to trade log
      navigate('/trade-log');
      
    } catch (error: any) {
      console.error('Error updating trade:', error);
      toast({
        variant: "destructive",
        title: "Error updating trade",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forex-primary mx-auto"></div>
          <p className="mt-3 text-muted-foreground">Loading trade data...</p>
        </div>
      </div>
    );
  }
  
  if (!trade) {
    return (
      <div className="text-center p-8">
        <p>Trade not found.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/trade-log')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trade Log
        </Button>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/trade-log')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Trade</h1>
        </div>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Trade Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pair">Currency Pair</Label>
                  <CurrencyPairSelect value={currencyPair} onValueChange={setCurrencyPair} />
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
                    onChange={(e) => setEntryDate(e.target.value)}
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
                        Price: {stopLossPrice}
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
                        Price: {takeProfitPrice}
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
              <Button type="button" variant="outline" onClick={() => navigate('/trade-log')}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTrade;
