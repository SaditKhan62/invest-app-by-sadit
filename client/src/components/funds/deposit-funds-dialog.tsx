import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Building, CreditCard, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DepositFundsDialogProps = {
  onDeposit: (amount: number) => void;
  trigger?: React.ReactNode;
};

export function DepositFundsDialog({ onDeposit, trigger }: DepositFundsDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow valid dollar amounts
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      
      // Notify parent component with the deposited amount
      onDeposit(parseFloat(amount));
      
      // Reset states and close dialog after a short delay
      setTimeout(() => {
        setAmount("");
        setIsComplete(false);
        setIsOpen(false);
      }, 2000);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Deposit Funds
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass">
        {isComplete ? (
          <div className="py-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="text-xl mb-2">Deposit Successful!</DialogTitle>
            <DialogDescription>
              ${amount} has been added to your account.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
              <DialogDescription>
                Add money to your account to start trading or unlock features.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      id="amount"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="pl-8"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                
                <Tabs defaultValue="bank" onValueChange={setPaymentMethod} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bank">Bank Account</TabsTrigger>
                    <TabsTrigger value="card">Credit Card</TabsTrigger>
                  </TabsList>
                  <TabsContent value="bank">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Bank Transfer
                        </CardTitle>
                        <CardDescription>
                          Transfer funds directly from your bank account.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid gap-2">
                            <Label htmlFor="bank-name">Bank Name</Label>
                            <Input id="bank-name" placeholder="Your Bank" disabled={isProcessing} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="account-number">Account Number</Label>
                            <Input id="account-number" placeholder="123456789" disabled={isProcessing} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="routing-number">Routing Number</Label>
                            <Input id="routing-number" placeholder="987654321" disabled={isProcessing} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="card">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit Card
                        </CardTitle>
                        <CardDescription>
                          Pay using your credit or debit card.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid gap-2">
                            <Label htmlFor="card-name">Name on Card</Label>
                            <Input id="card-name" placeholder="John Doe" disabled={isProcessing} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="card-number">Card Number</Label>
                            <Input 
                              id="card-number" 
                              placeholder="4242 4242 4242 4242" 
                              disabled={isProcessing} 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="expiry">Expiry Date</Label>
                              <Input id="expiry" placeholder="MM/YY" disabled={isProcessing} />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="cvc">CVC</Label>
                              <Input id="cvc" placeholder="123" disabled={isProcessing} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                  className={isProcessing ? "opacity-80" : ""}
                >
                  {isProcessing ? "Processing..." : "Deposit Funds"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}