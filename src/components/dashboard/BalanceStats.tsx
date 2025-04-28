
import React from 'react';
import { Trade } from '@/lib/types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BalanceStatsProps {
  trades: Trade[];
  initialBalance: number;
  totalProfit: number;
  totalCommissions: number;
  maxDrawdown: number;
  recoveryFactor: number;
}

const BalanceStats = ({
  trades,
  initialBalance,
  totalProfit,
  totalCommissions,
  maxDrawdown,
  recoveryFactor
}: BalanceStatsProps) => {
  // Calculate profit percentage based on commission-adjusted initial balance
  const adjustedInitialBalance = initialBalance - totalCommissions;
  const profitPercentage = adjustedInitialBalance > 0 
    ? (totalProfit / adjustedInitialBalance) * 100 
    : 0;

  return (
    <div>
      <div className="text-3xl font-bold tracking-tight">
        ${(adjustedInitialBalance + totalProfit).toFixed(3)}
      </div>
      
      {trades.length > 0 && (
        <div className="flex items-center mt-2">
          <div className={`flex items-center ${totalProfit >= 0 ? 'text-forex-profit' : 'text-forex-loss'}`}>
            {totalProfit >= 0 ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              ${Math.abs(totalProfit).toFixed(3)} ({profitPercentage.toFixed(3)}%)
            </span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs text-muted-foreground">Initial Capital (After Commissions)</p>
          <p className="text-sm font-medium">${adjustedInitialBalance.toFixed(3)}</p>
        </div>
        {trades.length > 0 && (
          <>
            <div>
              <p className="text-xs text-muted-foreground">Net Profit/Loss</p>
              <p className={`text-sm font-medium ${totalProfit >= 0 ? 'text-forex-profit' : 'text-forex-loss'}`}>
                ${totalProfit.toFixed(3)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Commission</p>
              <p className="text-sm font-medium text-forex-loss">
                ${totalCommissions.toFixed(3)} 
                {initialBalance > 0 && (
                  <span> ({((totalCommissions / initialBalance) * 100).toFixed(3)}%)</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Max Drawdown</p>
              <p className="text-sm font-medium text-forex-loss">
                {maxDrawdown.toFixed(3)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recovery Factor</p>
              <p className="text-sm font-medium">
                {recoveryFactor.toFixed(3)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BalanceStats;
