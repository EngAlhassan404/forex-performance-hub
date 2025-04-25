
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY_PAIRS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";

interface CurrencyPairSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

const CurrencyPairSelect = ({ 
  value, 
  onValueChange,
  placeholder = "Select currency pair" 
}: CurrencyPairSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPairs = CURRENCY_PAIRS.filter(pair => 
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input 
              placeholder="Search currency pairs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
          </div>
          <ScrollArea className="h-[200px]">
            {filteredPairs.length > 0 ? (
              filteredPairs.map((pair) => (
                <SelectItem key={pair} value={pair}>{pair}</SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-muted-foreground">
                No pairs found
              </div>
            )}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencyPairSelect;
