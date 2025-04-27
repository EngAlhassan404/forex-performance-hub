
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface ResetCapitalAlertProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onResetCapital: () => void;
}

const ResetCapitalAlert = ({ isOpen, setIsOpen, onResetCapital }: ResetCapitalAlertProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Capital to Zero</AlertDialogTitle>
          <AlertDialogDescription>
            This will reset your initial capital to $0.000. This action cannot be undone. 
            Your trade history will remain unchanged.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onResetCapital} className="bg-red-600 hover:bg-red-700">
            Reset Capital
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetCapitalAlert;
