import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { 
  X, TrendingUp, BarChart3, DollarSign, PieChart, Star, Calendar, 
  Sparkles, ArrowRightLeft, LineChart, Eye, Info, ChevronLeft,
  PlusCircle, CandlestickChart
} from "lucide-react";

import { StockChart } from "@/components/stocks/stock-chart";
import StockStats from "@/components/stocks/stock-stats";
import StockTradePanel from "@/components/stocks/stock-trade-panel";
import NewsFeed from "@/components/dashboard/news-feed";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { fetchStockBySymbol, addToWatchlist } from "@/lib/api";
import { formatCurrency, getColorForChange } from "@/lib/utils";
import { defaultStockDetails, timeRangeOptions } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function StockDetail() {
  const [, params] = useRoute("/stock/:symbol");
  const symbol = params?.symbol || "";
  const [timeRange, setTimeRange] = useState("1d");
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: stock, isLoading, error } = useQuery({
    queryKey: [`/api/stocks/${symbol}`],
    queryFn: () => fetchStockBySymbol(symbol),
    enabled: !!symbol
  });
  
  const addToWatchlistHandler = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add stocks to your watchlist",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsAnimating(true);
      await addToWatchlist(user.id, stock?.id || 0);
      setIsInWatchlist(true);
      toast({
        title: "Added to Watchlist",
        description: `${stock?.symbol} has been added to your watchlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setIsAnimating(false), 800);
    }
  };

  // Get stock details - in a real app, this would be fetched from an API
  const stockDetails = defaultStockDetails[symbol as keyof typeof defaultStockDetails] || {
    ceo: "Unknown",
    headquarters: "Unknown",
    founded: "Unknown",
    employees: "Unknown",
    description: "No description available."
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="glass rounded-xl border border-white/10 p-6 animate-pulse backdrop-blur-md">
          <div className="h-8 w-40 bg-white/5 rounded mb-4"></div>
          <div className="h-10 w-32 bg-white/5 rounded mb-2"></div>
          <div className="h-6 w-24 bg-white/5 rounded mb-6"></div>
          <div className="h-64 bg-white/5 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="p-4 md:p-6">
        <div className="glass rounded-xl border border-white/10 p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold text-secondary mb-4">Error Loading Stock</h2>
          <p className="text-white/70">
            Unable to load stock details for {symbol}. Please try again later.
          </p>
          <Button 
            className="mt-4 glass border-white/20 hover:bg-white/10 backdrop-blur-md flex items-center"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isPositive = (stock.changePercent || 0) >= 0;
  const recommendationClass = isPositive ? 'text-green-400' : 'text-red-400';
  const recommendationText = isPositive ? 'Buy' : 'Sell';

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="glass rounded-xl border border-white/10 mb-6 backdrop-blur-md">
        <div className="p-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl futuristic-gradient flex items-center justify-center mr-4">
              <span className="text-xl font-bold text-white">{stock.symbol.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-bold">{stock.symbol}</h2>
                <Badge variant="outline" className="ml-2 glass border-white/20">{stock.sector}</Badge>
              </div>
              <p className="text-white/70">{stock.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full transition-all duration-300 ${isInWatchlist || isAnimating ? 'text-yellow-400' : 'text-white/70'}`}
              onClick={addToWatchlistHandler}
            >
              <Star className={`h-5 w-5 ${isAnimating ? 'animate-pulse' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => window.location.href = '/'}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6">
          <div className="p-6 col-span-2">
            <div className="flex justify-between mb-4">
              <div>
                <div className="text-3xl font-bold mb-1 glow-text">{formatCurrency(stock.price)}</div>
                <div className="flex items-center">
                  <span className={`text-lg ${isPositive ? 'text-green-400' : 'text-red-400'} mr-3`}>
                    {isPositive ? '+' : ''}{stock.change?.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent?.toFixed(2)}%)
                  </span>
                  <span className="text-white/70 text-sm">Today</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge className={`mb-1 ${isPositive ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                  <span className="flex items-center">
                    {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                    Recommendation: {recommendationText}
                  </span>
                </Badge>
                <span className="text-xs text-white/50">Based on technical analysis</span>
              </div>
            </div>
            
            {/* Stock Chart */}
            <div className="mb-4 glass rounded-xl border border-white/10">
              <div className="flex justify-between items-center px-4 pt-4">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className={`px-2 py-1 ${chartType === "line" ? "bg-white/10 text-primary" : "text-white/70"}`}
                    onClick={() => setChartType("line")}
                  >
                    <LineChart className="h-4 w-4 mr-1" />
                    Line
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className={`px-2 py-1 ${chartType === "candlestick" ? "bg-white/10 text-primary" : "text-white/70"}`}
                    onClick={() => setChartType("candlestick")}
                  >
                    <CandlestickChart className="h-4 w-4 mr-1" />
                    Candle
                  </Button>
                </div>
              </div>
              <div className="h-64 p-4">
                <StockChart symbol={stock.symbol} interval={timeRange} chartType={chartType} height={240} />
              </div>
            </div>
            
            {/* Time Period Selector */}
            <div className="flex justify-between text-sm mb-6">
              {timeRangeOptions.map((option) => (
                <button 
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`py-1 px-3 rounded-full transition-all duration-300 ${
                    timeRange === option.value 
                      ? 'glass text-primary border border-primary/40 glow-border' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Tabs for Stats, About, and News */}
            <Tabs defaultValue="stats" className="mt-6">
              <TabsList className="grid grid-cols-3 mb-4 glass border border-white/10">
                <TabsTrigger value="stats" className="data-[state=active]:glass">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Stats
                </TabsTrigger>
                <TabsTrigger value="about" className="data-[state=active]:glass">
                  <Info className="h-4 w-4 mr-2" />
                  About
                </TabsTrigger>
                <TabsTrigger value="news" className="data-[state=active]:glass">
                  <Calendar className="h-4 w-4 mr-2" />
                  News
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="mt-0">
                <div className="glass rounded-xl border border-white/10 p-4 mb-6">
                  <h3 className="flex items-center text-lg font-semibold mb-4">
                    <ArrowRightLeft className="h-5 w-5 mr-2 text-primary" />
                    Trade {stock.symbol}
                  </h3>
                  <StockTradePanel stock={stock} />
                </div>
                <div className="glass rounded-xl border border-white/10 p-4">
                  <StockStats stock={stock} />
                </div>
              </TabsContent>
              
              <TabsContent value="about" className="mt-0">
                <div className="glass rounded-xl border border-white/10 p-4 mb-6">
                  <p className="text-white/80 mb-4">
                    {stockDetails.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-white/50 text-sm">CEO</div>
                      <div className="font-medium">{stockDetails.ceo}</div>
                    </div>
                    <div>
                      <div className="text-white/50 text-sm">Headquarters</div>
                      <div className="font-medium">{stockDetails.headquarters}</div>
                    </div>
                    <div>
                      <div className="text-white/50 text-sm">Founded</div>
                      <div className="font-medium">{stockDetails.founded}</div>
                    </div>
                    <div>
                      <div className="text-white/50 text-sm">Employees</div>
                      <div className="font-medium">{stockDetails.employees}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="news" className="mt-0">
                <div className="glass rounded-xl border border-white/10 p-4">
                  <NewsFeed stockSymbol={stock.symbol} limit={5} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column */}
          <div className="p-6 border-t md:border-t-0 md:border-l border-white/10">
            
            <div className="glass rounded-xl border border-white/10 p-4">
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <PieChart className="h-5 w-5 mr-2 text-blue-400" />
                Price Targets
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Low</span>
                  <span className="font-semibold">${(stock.price * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Average</span>
                  <span className="font-semibold">${(stock.price * 1.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">High</span>
                  <span className="font-semibold">${(stock.price * 1.35).toFixed(2)}</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full mt-2">
                  <div className="h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full"></div>
                  <div className="flex justify-between text-xs text-white/50 mt-1">
                    <span>-15%</span>
                    <span className="relative">
                      <span className="absolute left-1/2 transform -translate-x-1/2 -top-6 bg-white/10 px-2 py-0.5 rounded-md text-white text-opacity-80 whitespace-nowrap">
                        Current: ${stock.price}
                      </span>
                      Current
                    </span>
                    <span>+35%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 glass rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h4 className="flex items-center font-semibold">
                  <Eye className="h-4 w-4 mr-2 text-primary" />
                  People are watching
                </h4>
                <span className="text-xs text-white/50">Last 24h</span>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center text-xs text-white font-bold border border-black/20">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-white/70">+218 others</span>
              </div>
              <Button variant="outline" className="w-full glass border-white/20 hover:bg-white/10" onClick={addToWatchlistHandler}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add to Watchlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
