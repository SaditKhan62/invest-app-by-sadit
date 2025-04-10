import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus, TrendingUp, Wallet } from "lucide-react";
import { DepositFundsDialog } from "./deposit-funds-dialog";
import { useToast } from "@/hooks/use-toast";

type AccountBalanceCardProps = {
  balance: number;
  onBalanceChange?: (newBalance: number) => void;
  className?: string;
};

export function AccountBalanceCard({ 
  balance, 
  onBalanceChange,
  className = ""
}: AccountBalanceCardProps) {
  const { toast } = useToast();
  const [currentBalance, setCurrentBalance] = useState(balance);
  
  const handleDeposit = (amount: number) => {
    const newBalance = currentBalance + amount;
    setCurrentBalance(newBalance);
    
    if (onBalanceChange) {
      onBalanceChange(newBalance);
    }
    
    toast({
      title: "Deposit Successful!",
      description: `$${amount.toFixed(2)} has been added to your account.`,
    });
  };
  
  return (
    <Card className={`glass overflow-hidden ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Account Balance
          </CardTitle>
          <div className="px-2 py-1 bg-primary/20 rounded-full text-xs">
            AVAILABLE
          </div>
        </div>
        <CardDescription>Your available funds for trading</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold">${currentBalance.toFixed(2)}</div>
              <div className="text-xs text-white/60 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-400" />
                <span className="text-green-400">+24%</span> this month
              </div>
            </div>
            <DepositFundsDialog 
              onDeposit={handleDeposit}
              trigger={
                <Button size="sm" variant="outline" className="glass border-white/20 hover:bg-white/10">
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
              }
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="default" className="flex-1">
              <Wallet className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
            <Button size="sm" variant="outline" className="flex-1 border-white/20">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Transfer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}