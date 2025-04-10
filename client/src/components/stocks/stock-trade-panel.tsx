import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Stock, User } from "@shared/schema";
import { 
  Minus, Plus, DollarSign, ArrowUpRight, ArrowDownRight, 
  Loader2, ShoppingCart, CheckCircle, ArrowLeftRight, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { tabOptions } from "@/lib/mock-data";
import { executeTrade } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";

type StockTradePanelProps = {
  stock: Stock;
};

interface Position {
  stockId: number;
  shares: number;
}

export default function StockTradePanel({ stock }: StockTradePanelProps) {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState(10);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState(stock.price);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Reset limit price when stock changes
  useEffect(() => {
    setLimitPrice(stock.price);
  }, [stock.price]);

  // Get user portfolio to check current shares
  const { data: positions } = useQuery<Position[]>({
    queryKey: [`/api/users/${user?.id || 1}/portfolio`],
    queryFn: () => Promise.resolve([]) // In a real app, we would fetch this
  });
  
  // Find position for this stock if it exists
  const position = positions?.find((pos) => pos.stockId === stock.id);
  const availableShares = position?.shares || 0;
  
  // Calculate costs
  const estimatedCost = shares * (orderType === "market" ? stock.price : limitPrice);
  const availableCash = user?.balance || 5000;
  
  // Handle trade execution
  const tradeMutation = useMutation({
    mutationFn: (tradeData: { 
      userId: number; 
      stockId: number; 
      type: "buy" | "sell"; 
      shares: number; 
      price: number 
    }) => {
      const { userId, ...data } = tradeData;
      return executeTrade(userId, data);
    },
    onSuccess: () => {
      setOrderSuccess(true);
      setIsAnimating(true);
      toast({
        title: `${tradeType === 'buy' ? 'Purchase' : 'Sell'} successful`,
        description: `You ${tradeType === 'buy' ? 'bought' : 'sold'} ${shares} shares of ${stock.symbol}`,
      });
      
      // Success animation before reset
      setTimeout(() => {
        setOrderSuccess(false);
        setIsAnimating(false);
        setShares(1);
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: `${tradeType === 'buy' ? 'Purchase' : 'Sell'} failed`,
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle share count changes
  const decreaseShares = () => {
    if (shares > 1) {
      setShares(shares - 1);
    }
  };
  
  const increaseShares = () => {
    setShares(shares + 1);
  };
  
  // Handle quick share presets
  const setSharePreset = (percentage: number) => {
    if (tradeType === 'buy') {
      // Calculate how many shares they can buy with x% of available cash
      const cash = availableCash * (percentage / 100);
      const newShares = Math.floor(cash / stock.price);
      setShares(Math.max(1, newShares));
    } else {
      // Calculate x% of available shares to sell
      const newShares = Math.floor(availableShares * (percentage / 100));
      setShares(Math.max(1, newShares));
    }
  };
  
  // Handle trade submission
  const handleSubmitTrade = () => {
    // Validations
    if (tradeType === 'buy' && estimatedCost > availableCash) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough cash for this purchase",
        variant: "destructive",
      });
      return;
    }
    
    if (tradeType === 'sell' && shares > availableShares) {
      toast({
        title: "Insufficient shares",
        description: `You only have ${availableShares} shares to sell`,
        variant: "destructive",
      });
      return;
    }
    
    // Execute trade
    tradeMutation.mutate({
      userId: user?.id || 1,
      stockId: stock.id,
      type: tradeType,
      shares: shares,
      price: orderType === "market" ? stock.price : limitPrice
    });
  };

  if (orderSuccess) {
    return (
      <div className="py-4 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Order Confirmed!</h3>
          <p className="text-white/70 mb-4">
            {tradeType === 'buy' ? 'Bought' : 'Sold'} {shares} shares of {stock.symbol} at {formatCurrency(stock.price)}
          </p>
          <div className={`w-full h-2 bg-white/10 rounded-full overflow-hidden ${isAnimating ? 'animate-pulse' : ''}`}>
            <div className="h-full bg-gradient-to-r from-primary to-blue-500 w-full"></div>
          </div>
          <p className="text-xs text-white/50 mt-2">Processing order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Tabs */}
      <div className="flex w-full rounded-lg glass border border-white/10 mb-6 overflow-hidden">
        {tabOptions.tradeActions.map((tab) => (
          <button 
            key={tab.value}
            className={`flex-1 py-3 px-4 font-medium transition-all duration-300 ${
              tradeType === tab.value 
                ? 'bg-gradient-to-r from-primary/20 to-blue-500/10 backdrop-blur-md text-white' 
                : 'text-white/70 backdrop-blur-sm hover:bg-white/5'
            }`}
            onClick={() => setTradeType(tab.value as "buy" | "sell")}
          >
            <div className="flex items-center justify-center">
              {tab.value === 'buy' ? (
                <ArrowUpRight className={`h-4 w-4 mr-2 ${tradeType === 'buy' ? 'text-green-400' : ''}`} />
              ) : (
                <ArrowDownRight className={`h-4 w-4 mr-2 ${tradeType === 'sell' ? 'text-red-400' : ''}`} />
              )}
              {tab.label}
            </div>
          </button>
        ))}
      </div>
      
      {/* Order Type */}
      <div className="mb-6">
        <RadioGroup
          value={orderType}
          onValueChange={(value) => setOrderType(value as "market" | "limit")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="market" id="market" className="border-white/20" />
            <Label htmlFor="market" className="cursor-pointer">Market Order</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="limit" id="limit" className="border-white/20" />
            <Label htmlFor="limit" className="cursor-pointer">Limit Order</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Limit Price (only shown for limit orders) */}
      {orderType === "limit" && (
        <div className="mb-6 glass rounded-lg border border-white/10 p-4">
          <label className="block text-white/70 text-sm mb-2">Limit Price</label>
          <div className="flex items-center mb-2">
            <DollarSign className="h-4 w-4 text-white/50 mr-1" />
            <input 
              type="number" 
              value={limitPrice.toFixed(2)} 
              onChange={(e) => setLimitPrice(parseFloat(e.target.value) || stock.price)}
              className="glass border-0 w-full text-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              min="0.01"
              step="0.01"
            />
          </div>
          <div className="flex justify-between items-center text-xs text-white/50">
            <span>Current: {formatCurrency(stock.price)}</span>
            <Badge variant="outline" className="glass border-white/20">
              {limitPrice > stock.price ? '+' : ''}{((limitPrice - stock.price) / stock.price * 100).toFixed(2)}%
            </Badge>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-white/70 text-sm">Shares</label>
          <div className="flex space-x-2">
            <Badge 
              variant="outline" 
              className="cursor-pointer glass border-white/20 hover:bg-white/10"
              onClick={() => setSharePreset(25)}
            >
              25%
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer glass border-white/20 hover:bg-white/10"
              onClick={() => setSharePreset(50)}
            >
              50%
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer glass border-white/20 hover:bg-white/10"
              onClick={() => setSharePreset(100)}
            >
              Max
            </Badge>
          </div>
        </div>
        <div className="flex items-center mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="glass border-white/20 rounded-l-lg rounded-r-none hover:bg-white/10"
            onClick={decreaseShares}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <input 
            type="number" 
            value={shares} 
            onChange={(e) => setShares(parseInt(e.target.value) || 1)}
            className="w-full text-center py-2 glass border-x-0 border-y border-white/20 focus:outline-none"
            min="1"
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="glass border-white/20 rounded-r-lg rounded-l-none hover:bg-white/10"
            onClick={increaseShares}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="text-white/50">Market Price:</span>
            <span className="ml-2 font-medium">{formatCurrency(stock.price)}</span>
          </div>
          <div className="text-sm">
            <span className="text-white/50">Total Value:</span>
            <span className="ml-2 font-medium">{formatCurrency(shares * stock.price)}</span>
          </div>
        </div>
      </div>
      
      {/* Estimated cost */}
      <div className="mb-6 glass rounded-xl border border-white/10 p-4">
        <div className="flex justify-between mb-3">
          <div className="text-white/70">Estimated {tradeType === 'buy' ? 'Cost' : 'Credit'}</div>
          <div className="font-medium text-lg">{formatCurrency(estimatedCost)}</div>
        </div>
        <div className="flex justify-between mb-3">
          <div className="text-white/70">Available {tradeType === 'buy' ? 'Cash' : 'Shares'}</div>
          <div className="font-medium">
            {tradeType === 'buy' 
              ? formatCurrency(availableCash)
              : availableShares}
          </div>
        </div>
        
        {/* Usage bar */}
        <div className="mt-4">
          <Progress 
            value={tradeType === 'buy' 
              ? Math.min(100, (estimatedCost / availableCash) * 100) 
              : Math.min(100, (shares / Math.max(1, availableShares)) * 100)} 
            className="h-2 bg-white/10"
          />
          <div className="flex justify-between mt-1 text-xs text-white/50">
            <span>0%</span>
            <span>{tradeType === 'buy' 
              ? Math.min(100, Math.round((estimatedCost / availableCash) * 100)) 
              : Math.min(100, Math.round((shares / Math.max(1, availableShares)) * 100))}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      
      {/* Execute button */}
      <Button 
        className="w-full cyberpunk-button text-white py-6"
        onClick={handleSubmitTrade}
        disabled={tradeMutation.isPending}
      >
        {tradeMutation.isPending ? (
          <span className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center">
            {tradeType === 'buy' ? (
              <ShoppingCart className="h-5 w-5 mr-2" />
            ) : (
              <ArrowLeftRight className="h-5 w-5 mr-2" />
            )}
            {tradeType === 'buy' ? 'Buy' : 'Sell'} {shares} {shares === 1 ? 'Share' : 'Shares'}
          </span>
        )}
      </Button>
      
      <div className="flex items-center mt-3 justify-center">
        <Sparkles className="h-3 w-3 text-primary mr-1" />
        <span className="text-xs text-white/50">
          {orderType === "market" ? "Instant execution at market price" : "Executes when price reaches your limit"}
        </span>
      </div>
    </div>
  );
}
