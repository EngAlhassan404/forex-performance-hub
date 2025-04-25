
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY_PAIRS } from '@/lib/constants';
import { Input } from '@/components/ui/input';

const CurrencyPairSelect = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPairs = CURRENCY_PAIRS.filter(pair => 
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Input 
        placeholder="Search currency pairs..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select currency pair" />
        </SelectTrigger>
        <SelectContent>
          {filteredPairs.length > 0 ? (
            filteredPairs.map((pair) => (
              <SelectItem key={pair} value={pair}>{pair}</SelectItem>
            ))
          ) : (
            <div className="p-2 text-center text-muted-foreground">
              No pairs found
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencyPairSelect;
