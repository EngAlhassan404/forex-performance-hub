
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddFundsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newFunds: string;
  setNewFunds: (value: string) => void;
  onAddFunds: () => void;
}

const AddFundsDialog = ({ isOpen, setIsOpen, newFunds, setNewFunds, onAddFunds }: AddFundsDialogProps) => {
  const { toast } = useToast();

  const handleAddFunds = () => {
    if (!newFunds || isNaN(parseFloat(newFunds)) || parseFloat(newFunds) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid positive amount.",
      });
      return;
    }
    onAddFunds();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Funds to Account</DialogTitle>
          <DialogDescription>
            Enter the amount you want to add to your trading account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.001"
              placeholder="0.000"
              value={newFunds}
              onChange={(e) => setNewFunds(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleAddFunds}>Add Funds</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundsDialog;
