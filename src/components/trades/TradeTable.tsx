
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
import { ArrowUpDown, ChevronDown, Edit, MoreHorizontal, Trash } from "lucide-react";

interface TradeTableProps {
  data: Trade[];
}

const TradeTable = ({ data }: TradeTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
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
      accessorKey: "exitDate",
      header: "Exit Date",
      cell: ({ row }) => {
        const date = row.getValue("exitDate");
        return date ? <div>{new Date(date as string).toLocaleString()}</div> : "-";
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
        
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(profit);
        
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
            {pips >= 0 ? `+${pips}` : pips}
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
                onClick={() => console.log('Edit trade:', trade.id)}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => console.log('Delete trade:', trade.id)}
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
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by currency pair..."
          value={(table.getColumn("pair")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("pair")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
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
    </div>
  );
};

export default TradeTable;
