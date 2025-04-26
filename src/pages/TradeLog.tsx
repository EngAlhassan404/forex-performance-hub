import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import TradeTable from '@/components/trades/TradeTable';
import TradeForm from '@/components/trades/TradeForm';
import { supabase } from '@/integrations/supabase/client';
import { Trade, TradingSession } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { useTradingSessions } from '@/hooks/use-trading-sessions';
import { Badge } from '@/components/ui/badge';

const TradeLog = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('trades');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeSessions, getSessionDescription } = useTradingSessions();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
            session: trade.session as TradingSession || null,
            capitalGrowth: trade.capital_growth,
            riskPercentage: trade.risk_percentage
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
        // Fall back to dummy data if there's an error
        import('@/lib/dummyData').then(({ dummyTrades }) => {
          setTrades(dummyTrades);
        });
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
            setTrades(prev => [payload.new as Trade, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTrades(prev => 
              prev.map(trade => trade.id === payload.new.id ? payload.new as Trade : trade)
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Trade Log</h1>
              <p className="text-muted-foreground">View and manage your trading journal</p>
            </div>
            
            {activeSessions.length > 0 && activeSessions[0] !== 'NEUTRAL' && (
              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                <p className="text-sm text-muted-foreground mr-2">Active sessions:</p>
                {activeSessions.map(session => (
                  <Badge key={session} variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {getSessionDescription(session)}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="trades">All Trades</TabsTrigger>
              <TabsTrigger value="add">Add New Trade</TabsTrigger>
            </TabsList>
            <TabsContent value="trades">
              {isLoading ? (
                <div className="text-center p-8">Loading trades...</div>
              ) : (
                <TradeTable data={trades} />
              )}
            </TabsContent>
            <TabsContent value="add">
              <TradeForm />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default TradeLog;
