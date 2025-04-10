import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { User, Position, Stock } from "@shared/schema";
import { fetchUserPortfolio, fetchUserTrades } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { StockChart } from "@/components/stocks/stock-chart";
import PortfolioHoldings from "@/components/portfolio/portfolio-holdings";
import { timeRangeOptions, defaultMockPortfolio } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, ArrowUpDown, Plus } from "lucide-react";
import { DepositFundsDialog } from "@/components/funds/deposit-funds-dialog";
import { useToast } from "@/hooks/use-toast";

type PortfolioPageProps = {
  user: User | null;
};

export default function PortfolioPage({ user }: PortfolioPageProps) {
  const [timeRange, setTimeRange] = useState("1d");
  const [balance, setBalance] = useState(0);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get portfolio positions
  const { data: positions, isLoading: isLoadingPositions } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/portfolio`] : [],
    queryFn: () => user ? fetchUserPortfolio(user.id) : Promise.resolve([]),
    enabled: !!user
  });
  
  // Get past trades
  const { data: trades, isLoading: isLoadingTrades } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/trades`] : [],
    queryFn: () => user ? fetchUserTrades(user.id) : Promise.resolve([]),
    enabled: !!user
  });
  
  // Calculate real portfolio data from positions
  const calculatePortfolioData = () => {
    if (!positions || positions.length === 0) {
      return {
        totalValue: 0,
        dayChange: 0,
        dayChangePercent: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0
      };
    }
    
    // Calculate total portfolio value
    const totalValue = positions.reduce((sum: number, position: Position & { stock: Stock }) => 
      sum + (position.shares * position.stock.price), 0);
    
    // Calculate day change (based on previous close prices)
    const dayChange = positions.reduce((sum: number, position: Position & { stock: Stock }) => {
      const previousValue = position.shares * position.stock.previousClose;
      const currentValue = position.shares * position.stock.price;
      return sum + (currentValue - previousValue);
    }, 0);
    
    // Calculate day change percent
    const previousTotalValue = positions.reduce((sum: number, position: Position & { stock: Stock }) => 
      sum + (position.shares * position.stock.previousClose), 0);
    const dayChangePercent = previousTotalValue ? (dayChange / previousTotalValue) * 100 : 0;
    
    // Calculate total gain/loss (compared to cost basis)
    const totalCostBasis = positions.reduce((sum: number, position: Position & { stock: Stock }) => 
      sum + (position.shares * position.averageCost), 0);
    const totalGainLoss = totalValue - totalCostBasis;
    const totalGainLossPercent = totalCostBasis ? (totalGainLoss / totalCostBasis) * 100 : 0;
    
    return {
      totalValue,
      dayChange,
      dayChangePercent,
      totalGainLoss,
      totalGainLossPercent
    };
  };
  
  const portfolio = positions ? calculatePortfolioData() : {
    totalValue: 0,
    dayChange: 0,
    dayChangePercent: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0
  };
  
  // Initialize balance with user data or previous state
  useEffect(() => {
    if (user) {
      setBalance(user.balance || 0);
    }
  }, [user]);
  
  const availableCash = balance;
  
  const handleNavigateToMarkets = () => {
    navigate("/markets");
  };

  return (
    <div className="px-4 md:px-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>
      
      {/* Portfolio Overview */}
      <div className="bg-dark-700 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap md:flex-nowrap justify-between mb-4">
          <div>
            <div className="text-sm text-light-500 mb-1">Portfolio Value</div>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
            <div className="flex items-center">
              <span className="text-primary mr-2">
                +{formatCurrency(portfolio.dayChange)} ({portfolio.dayChangePercent.toFixed(2)}%)
              </span>
              <span className="text-light-500 text-xs">Today</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-light-500 mb-1">Available Cash</div>
            <div className="text-xl font-bold">{formatCurrency(availableCash)}</div>
            <DepositFundsDialog 
              onDeposit={(amount) => {
                setBalance(prev => prev + amount);
                toast({
                  title: "Deposit Successful!",
                  description: `$${amount.toFixed(2)} has been added to your account.`,
                });
              }}
              trigger={
                <Button variant="link" className="text-primary p-0 h-auto text-sm mt-1 flex items-center gap-2">
                  <Plus className="h-3 w-3" />
                  Deposit Funds
                </Button>
              }
            />
          </div>
        </div>
        
        {/* Portfolio Chart */}
        <div className="h-64 mb-2">
          {isLoadingPositions ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="loading-skeleton h-full w-full rounded"></div>
            </div>
          ) : (
            <StockChart 
              symbol={positions && positions.length > 0 ? "portfolio" : "empty"} 
              interval={timeRange} 
              height={256} 
            />
          )}
        </div>
        
        {/* Time Period Selector */}
        <div className="flex justify-between text-sm">
          {timeRangeOptions.map((option) => (
            <button 
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`py-1 px-3 rounded-full ${
                timeRange === option.value 
                  ? 'bg-dark-600 text-primary' 
                  : 'text-light-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Trade Actions */}
      <div className="flex gap-4 mb-6 mt-8">
        <Button 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6" 
          onClick={handleNavigateToMarkets}
        >
          <DollarSign className="mr-2 h-5 w-5" />
          Buy Stock
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 border-red-600 hover:bg-red-600/10 text-red-500 py-6"
          onClick={handleNavigateToMarkets}
        >
          <ArrowUpDown className="mr-2 h-5 w-5" />
          Sell Stock
        </Button>
      </div>
      
      {/* Portfolio Holdings & Trades */}
      <Tabs defaultValue="holdings" className="mb-6">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="holdings" className="mt-0">
          <PortfolioHoldings user={user} positions={positions} isLoading={isLoadingPositions} />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          <div className="bg-dark-700 rounded-lg overflow-hidden">
            <h2 className="text-lg font-semibold p-4 border-b border-dark-600">Recent Trades</h2>
            
            {isLoadingTrades ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex justify-between p-4 border-b border-dark-600">
                  <div>
                    <div className="h-5 w-32 bg-dark-600 animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-24 bg-dark-600 animate-pulse rounded"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-5 w-20 bg-dark-600 animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-16 bg-dark-600 animate-pulse rounded"></div>
                  </div>
                </div>
              ))
            ) : trades && trades.length > 0 ? (
              trades.map((trade: any) => (
                <div key={trade.id} className="flex justify-between p-4 border-b border-dark-600">
                  <div>
                    <div className="flex items-center">
                      <Link href={`/stock/${trade.stock.symbol}`}>
                        <a className="font-medium hover:underline">{trade.stock.symbol}</a>
                      </Link>
                      <span className={`ml-2 text-sm px-2 py-0.5 rounded ${
                        trade.type === 'buy' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                      }`}>
                        {trade.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-light-500 text-sm">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(trade.shares)} shares</div>
                    <div className="text-light-500 text-sm">@ {formatCurrency(trade.price)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-light-500">
                <p>No trading activity yet</p>
                <p className="text-sm mt-2">Buy or sell stocks to see them here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
