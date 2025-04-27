
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import { supabase } from '@/integrations/supabase/client';
import { Trade } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Helper function to determine trade result
  const determineTradeResult = (profit: number | null) => {
    if (profit === null) return null;
    if (profit > 0) return 'WIN';
    if (profit < 0) return 'LOSS';
    return 'BREAK_EVEN';
  };
  
  // Fetch trades from Supabase
  useEffect(() => {
    const fetchTrades = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .order('entry_date', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Map Supabase data to our Trade type
          const mappedTrades: Trade[] = data.map(trade => ({
            id: trade.id,
            pair: trade.pair,
            type: trade.type as 'BUY' | 'SELL' | 'NEUTRAL',
            entryDate: trade.entry_date,
            entryPrice: trade.entry_price,
            exitDate: trade.exit_date,
            exitPrice: trade.exit_price,
            stopLoss: trade.stop_loss,
            takeProfit: trade.take_profit,
            lotSize: trade.lot_size,
            commission: trade.commission,
            swap: trade.swap,
            profit: trade.profit,
            pips: trade.pips,
            riskRewardRatio: trade.risk_reward_ratio,
            notes: trade.notes || '',
            tags: trade.tags || [],
            strategy: trade.strategy || '',
            status: trade.status as 'OPEN' | 'CLOSED',
            session: trade.session as any || null,
            capitalGrowth: trade.capital_growth,
            riskPercentage: trade.risk_percentage,
            result: trade.profit !== null ? determineTradeResult(trade.profit) : null
          }));
          setTrades(mappedTrades);
        }
      } catch (error: any) {
        console.error('Error fetching trades:', error);
        toast({
          variant: "destructive",
          title: "Error loading trades",
          description: error.message || "Failed to load your trades"
        });
        // Empty array instead of dummy data
        setTrades([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrades();
  }, [toast]);
  
  // Subscribe to real-time updates for trades
  useEffect(() => {
    const tradesSubscription = supabase
      .channel('trades-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trades' }, 
        (payload) => {
          // Handle different events
          if (payload.eventType === 'INSERT') {
            // Map the new trade to our Trade type
            const newTrade: Trade = {
              id: payload.new.id,
              pair: payload.new.pair,
              type: payload.new.type as 'BUY' | 'SELL' | 'NEUTRAL',
              entryDate: payload.new.entry_date,
              entryPrice: payload.new.entry_price,
              exitDate: payload.new.exit_date,
              exitPrice: payload.new.exit_price,
              stopLoss: payload.new.stop_loss,
              takeProfit: payload.new.take_profit,
              lotSize: payload.new.lot_size,
              commission: payload.new.commission,
              swap: payload.new.swap,
              profit: payload.new.profit,
              pips: payload.new.pips,
              riskRewardRatio: payload.new.risk_reward_ratio,
              notes: payload.new.notes || '',
              tags: payload.new.tags || [],
              strategy: payload.new.strategy || '',
              status: payload.new.status as 'OPEN' | 'CLOSED',
              session: payload.new.session as any || null,
              capitalGrowth: payload.new.capital_growth,
              riskPercentage: payload.new.risk_percentage,
              result: payload.new.profit !== null ? determineTradeResult(payload.new.profit) : null
            };
            
            setTrades(prev => [newTrade, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTrades(prev => 
              prev.map(trade => {
                if (trade.id === payload.new.id) {
                  return {
                    id: payload.new.id,
                    pair: payload.new.pair,
                    type: payload.new.type as 'BUY' | 'SELL' | 'NEUTRAL',
                    entryDate: payload.new.entry_date,
                    entryPrice: payload.new.entry_price,
                    exitDate: payload.new.exit_date,
                    exitPrice: payload.new.exit_price,
                    stopLoss: payload.new.stop_loss,
                    takeProfit: payload.new.take_profit,
                    lotSize: payload.new.lot_size,
                    commission: payload.new.commission,
                    swap: payload.new.swap,
                    profit: payload.new.profit,
                    pips: payload.new.pips,
                    riskRewardRatio: payload.new.risk_reward_ratio,
                    notes: payload.new.notes || '',
                    tags: payload.new.tags || [],
                    strategy: payload.new.strategy || '',
                    status: payload.new.status as 'OPEN' | 'CLOSED',
                    session: payload.new.session as any || null,
                    capitalGrowth: payload.new.capital_growth,
                    riskPercentage: payload.new.risk_percentage,
                    result: payload.new.profit !== null ? determineTradeResult(payload.new.profit) : null
                  };
                }
                return trade;
              })
            );
          } else if (payload.eventType === 'DELETE') {
            setTrades(prev => 
              prev.filter(trade => trade.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      void supabase.removeChannel(tradesSubscription);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-forex-primary/20">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forex-primary mx-auto"></div>
                <p className="mt-3 text-muted-foreground">Loading data...</p>
              </div>
            </div>
          ) : (
            <Dashboard trades={trades} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
