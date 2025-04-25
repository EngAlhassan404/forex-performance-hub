
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Wallet } from 'lucide-react';

const fetchUserBalance = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('account_settings')
    .select('balance')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching balance:', error);
    return null;
  }

  return data?.balance || 0;
};

const BalanceCard = () => {
  const { data: balance, isLoading, error } = useQuery({
    queryKey: ['userBalance'],
    queryFn: fetchUserBalance
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <Wallet className="mr-2 h-5 w-5" /> Account Balance
        </CardTitle>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Funds
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {isLoading ? 'Loading...' : `$${balance?.toFixed(2) || '0.00'}`}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Current trading account balance
        </p>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
