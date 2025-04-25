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
import CurrencyPairSelect from './CurrencyPairSelect';  // New import

const TradeForm = () => {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Trade</CardTitle>
        <CardDescription>Record your trade details for analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pair">Currency Pair</Label>
              <CurrencyPairSelect />  {/* Replace existing Select with new component */}
            </div>

            <div className="space-y-2">
              <Label>Trade Type</Label>
              <RadioGroup 
                defaultValue={tradeType} 
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
              <Input type="datetime-local" id="entry-date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-price">Entry Price</Label>
              <Input type="number" id="entry-price" step="0.00001" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot-size">Lot Size</Label>
              <Input type="number" id="lot-size" step="0.01" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stop-loss">Stop Loss</Label>
                <Input type="number" id="stop-loss" step="0.00001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="take-profit">Take Profit</Label>
                <Input type="number" id="take-profit" step="0.00001" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exit-date">Exit Date/Time</Label>
                <Input type="datetime-local" id="exit-date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exit-price">Exit Price</Label>
                <Input type="number" id="exit-price" step="0.00001" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission">Commission</Label>
                <Input type="number" id="commission" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="swap">Swap</Label>
                <Input type="number" id="swap" step="0.01" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy</Label>
              <Select>
                <SelectTrigger id="strategy">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGIES.map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
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
              <Textarea id="notes" placeholder="Add your trading notes here..." className="h-24" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save Trade</Button>
      </CardFooter>
    </Card>
  );
};

export default TradeForm;
