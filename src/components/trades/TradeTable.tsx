import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Trade } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ChevronDown, Edit, FileDown, MoreHorizontal, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface TradeTableProps {
  data: Trade[];
}

const TradeTable = ({ data }: TradeTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Function to handle editing a trade
  const handleEditTrade = (tradeId: string) => {
    navigate(`/edit-trade/${tradeId}`);
  };
  
  // Function to delete a trade
  const handleDeleteTrade = async () => {
    if (!tradeToDelete) return;
    
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeToDelete);
      
      if (error) throw error;
      
      toast({
        title: "Trade deleted",
        description: "The trade has been successfully deleted.",
      });
      
      setTradeToDelete(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting trade",
        description: error.message || "Failed to delete the trade",
      });
    }
  };
  
  // Function to export trades as CSV
  const exportAsCSV = () => {
    if (data.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "Add some trades before exporting.",
      });
      return;
    }
    
    // Create CSV header
    const headers = [
      "Pair", "Type", "Entry Date", "Entry Price", "Exit Date", "Exit Price", 
      "Stop Loss", "Take Profit", "Lot Size", "Commission", "Swap", "Profit", 
      "Pips", "R:R Ratio", "Status", "Result", "Session", "Strategy", "Notes"
    ];
    
    // Convert trade data to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(trade => [
        trade.pair,
        trade.type,
        trade.entryDate ? new Date(trade.entryDate).toLocaleString() : '',
        trade.entryPrice,
        trade.exitDate ? new Date(trade.exitDate).toLocaleString() : '',
        trade.exitPrice || '',
        trade.stopLoss || '',
        trade.takeProfit || '',
        trade.lotSize.toFixed(2),
        trade.commission.toFixed(3),
        trade.swap.toFixed(3),
        trade.profit ? trade.profit.toFixed(3) : '',
        trade.pips ? trade.pips.toFixed(1) : '', // Allow decimal places for pips
        trade.riskRewardRatio ? trade.riskRewardRatio.toFixed(3) : '',
        trade.status,
        trade.result || '',
        trade.session || '',
        trade.strategy || '',
        `"${(trade.notes || '').replace(/"/g, '""')}"` // Escape quotes in notes
      ].join(','))
    ];
    
    // Create blob and download link
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `trade-log-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    // Add to document, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Your trade log has been exported as CSV.",
    });
  };
  
  // Function to export trades as HTML
  const exportAsHTML = () => {
    if (data.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "Add some trades before exporting.",
      });
      return;
    }
    
    // Calculate additional metrics for the summary
    const closedTrades = data.filter(t => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter(t => (t.profit || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.profit || 0) < 0);
    const breakEvenTrades = closedTrades.filter(t => (t.profit || 0) === 0);
    
    const totalProfit = closedTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);
    const totalCommission = closedTrades.reduce((acc, trade) => acc + (trade.commission || 0), 0);
    const winRate = closedTrades.length ? (winningTrades.length / closedTrades.length) * 100 : 0;
    
    // Calculate Sharpe Ratio (simplified)
    const returns = closedTrades.map(t => t.profit || 0);
    const avgReturn = returns.reduce((sum, val) => sum + val, 0) / (returns.length || 1);
    const stdDev = Math.sqrt(returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) / (returns.length || 1));
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
    
    // Calculate expected value
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((acc, t) => acc + (t.profit || 0), 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((acc, t) => acc + (t.profit || 0), 0)) / losingTrades.length 
      : 0;
    const winRateDecimal = winRate / 100;
    const lossRateDecimal = 1 - winRateDecimal;
    const expectedValue = (winRateDecimal * avgWin) - (lossRateDecimal * avgLoss);
    
    // Create HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ForexTracker Trade Log</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #2C74B3; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          .profit { color: green; }
          .loss { color: red; }
          .timestamp { text-align: right; color: #777; font-size: 0.9em; margin: 30px 0 10px; }
          .summary { background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
          .metric-card { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 15px; }
          .metric-title { font-size: 0.9em; color: #666; margin-bottom: 5px; }
          .metric-value { font-size: 1.2em; font-weight: bold; }
          .win { background-color: rgba(0, 128, 0, 0.1); }
          .loss { background-color: rgba(255, 0, 0, 0.1); }
          .break-even { background-color: rgba(0, 0, 0, 0.05); }
        </style>
      </head>
      <body>
        <h1>ForexTracker Trade Log</h1>
        <div class="summary">
          <h2>Trade Summary</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">Total Trades</div>
              <div class="metric-value">${closedTrades.length}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Winning Trades</div>
              <div class="metric-value">${winningTrades.length} (${winRate.toFixed(2)}%)</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Losing Trades</div>
              <div class="metric-value">${losingTrades.length} (${(100 - winRate).toFixed(2)}%)</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Break Even Trades</div>
              <div class="metric-value">${breakEvenTrades.length}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Total Profit/Loss</div>
              <div class="metric-value" style="color: ${totalProfit >= 0 ? 'green' : 'red'}">$${totalProfit.toFixed(3)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Total Commission</div>
              <div class="metric-value">$${totalCommission.toFixed(3)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Expected Value</div>
              <div class="metric-value" style="color: ${expectedValue >= 0 ? 'green' : 'red'}">$${expectedValue.toFixed(3)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Sharpe Ratio</div>
              <div class="metric-value">${sharpeRatio.toFixed(3)}</div>
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Pair</th>
              <th>Type</th>
              <th>Entry Date</th>
              <th>Entry Price</th>
              <th>Exit Date</th>
              <th>Exit Price</th>
              <th>Lot Size</th>
              <th>Commission</th>
              <th>Result</th>
              <th>Profit/Loss</th>
              <th>Pips</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add rows for each trade with coloring based on result
    data.forEach(trade => {
      const result = trade.result || (trade.profit ? (trade.profit > 0 ? 'WIN' : trade.profit < 0 ? 'LOSS' : 'BREAK_EVEN') : '');
      const rowClass = result === 'WIN' ? 'win' : result === 'LOSS' ? 'loss' : result === 'BREAK_EVEN' ? 'break-even' : '';
      
      htmlContent += `
        <tr class="${rowClass}">
          <td>${trade.pair}</td>
          <td>${trade.type}</td>
          <td>${trade.entryDate ? new Date(trade.entryDate).toLocaleString() : '-'}</td>
          <td>${trade.entryPrice.toFixed(5)}</td>
          <td>${trade.exitDate ? new Date(trade.exitDate).toLocaleString() : '-'}</td>
          <td>${trade.exitPrice ? trade.exitPrice.toFixed(5) : '-'}</td>
          <td>${trade.lotSize.toFixed(2)}</td>
          <td>$${trade.commission.toFixed(3)}</td>
          <td>${result}</td>
          <td class="${(trade.profit || 0) >= 0 ? 'profit' : 'loss'}">${trade.profit ? `$${trade.profit.toFixed(3)}` : '-'}</td>
          <td>${trade.pips ? trade.pips.toFixed(1) : '-'}</td>
          <td>${trade.status}</td>
        </tr>
      `;
    });
    
    // Close HTML structure
    htmlContent += `
          </tbody>
        </table>
        <div class="timestamp">
          Generated on: ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
    
    // Create blob and download link
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `trade-log-${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    
    // Add to document, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Your trade log has been exported as HTML.",
    });
  };
  
  const columns: ColumnDef<Trade>[] = [
    {
      accessorKey: "pair",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Currency Pair
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div>{row.getValue("pair")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant={type === 'BUY' ? 'secondary' : 'outline'} className={
            type === 'BUY' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
            'bg-red-100 text-red-800 hover:bg-red-100'
          }>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "entryDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Entry Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("entryDate"));
        return <div>{date.toLocaleString()}</div>;
      },
    },
    {
      accessorKey: "entryPrice",
      header: "Entry Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("entryPrice"));
        return <div className="text-right">{price.toFixed(5)}</div>;
      },
    },
    {
      accessorKey: "exitPrice",
      header: "Exit Price",
      cell: ({ row }) => {
        const price = row.getValue("exitPrice");
        return price ? <div className="text-right">{parseFloat(price as string).toFixed(5)}</div> : "-";
      },
    },
    {
      accessorKey: "lotSize",
      header: "Lot Size",
      cell: ({ row }) => {
        const lotSize = parseFloat(row.getValue("lotSize"));
        return <div className="text-right">{lotSize.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "commission",
      header: "Commission",
      cell: ({ row }) => {
        const commission = parseFloat(row.original.commission.toString());
        return <div className="text-right">${commission.toFixed(3)}</div>;
      },
    },
    {
      accessorKey: "result",
      header: "Result",
      cell: ({ row }) => {
        const result = row.original.result || 
                      (row.original.profit ? 
                        (row.original.profit > 0 ? 'WIN' : 
                         row.original.profit < 0 ? 'LOSS' : 'BREAK_EVEN') : 
                        null);
        
        if (!result) return <div className="text-center">-</div>;
        
        return (
          <Badge variant="outline" className={
            result === 'WIN' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
            result === 'LOSS' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
            'bg-gray-100 text-gray-800 hover:bg-gray-100'
          }>
            {result === 'BREAK_EVEN' ? 'Break Even' : result}
          </Badge>
        );
      },
    },
    {
      accessorKey: "profit",
      header: ({ column }) => {
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-auto"
            >
              Profit/Loss
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const profit = row.getValue("profit") as number | null;
        
        if (profit === null) return <div className="text-right">-</div>;
        
        const formatted = `$${profit.toFixed(3)}`;
        
        return (
          <div className={`text-right font-medium ${profit >= 0 ? "text-forex-profit" : "text-forex-loss"}`}>
            {formatted}
          </div>
        );
      },
    },
    {
      accessorKey: "pips",
      header: "Pips",
      cell: ({ row }) => {
        const pips = row.getValue("pips") as number | null;
        
        if (pips === null) return <div className="text-right">-</div>;
        
        return (
          <div className={`text-right font-medium ${pips >= 0 ? "text-forex-profit" : "text-forex-loss"}`}>
            {pips >= 0 ? `+${pips.toFixed(1)}` : pips.toFixed(1)}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        
        return (
          <Badge variant="outline" className={
            status === 'OPEN' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
            'bg-gray-100 text-gray-800 hover:bg-gray-100'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const trade = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleEditTrade(trade.id)}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setTradeToDelete(trade.id)}
                className="cursor-pointer text-forex-loss"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter by currency pair..."
          value={(table.getColumn("pair")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("pair")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportAsCSV} className="cursor-pointer">
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsHTML} className="cursor-pointer">
                Export as HTML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().map((column) => {
                return (
                  <DropdownMenuItem key={column.id} className="capitalize">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={(e) => column.toggleVisibility(e.target.checked)}
                      />
                      <span>{column.id}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No trades found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      
      {/* Alert Dialog for confirming delete */}
      <AlertDialog open={!!tradeToDelete} onOpenChange={() => setTradeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this trade
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrade} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TradeTable;
