import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockListItem } from "@/components/stocks/stock-list-item";
import { fetchUserWatchlist, fetchStockBySymbol, fetchAllStocks, addToWatchlist } from "@/lib/api";
import { User, Watchlist, Stock } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

type WatchlistPreviewProps = {
  user: User | null;
};

// Let's create a type that matches our actual stock data structure
type DefaultStock = {
  id: number;
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  sector: string;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  high52Week: number;
  low52Week: number;
  updatedAt: Date;
};

// Default stocks to show if watchlist is empty
const defaultStocks: DefaultStock[] = [
  { 
    id: 1001, 
    symbol: "SPY", 
    name: "S&P 500 ETF", 
    price: 510.72, 
    previousClose: 508.57,
    change: 2.15, 
    changePercent: 0.42, 
    sector: "ETF", 
    volume: 87500000, 
    marketCap: 474000000000,
    peRatio: 21.5,
    dividendYield: 1.02,
    high52Week: 525.85,
    low52Week: 410.23,
    updatedAt: new Date()
  },
  { 
    id: 1002, 
    symbol: "AAPL", 
    name: "Apple Inc.", 
    price: 189.97, 
    previousClose: 188.70,
    change: 1.27, 
    changePercent: 0.67, 
    sector: "Technology", 
    volume: 75490000, 
    marketCap: 2950000000000,
    peRatio: 32.1,
    dividendYield: 0.51,
    high52Week: 198.23,
    low52Week: 164.32,
    updatedAt: new Date()
  },
  { 
    id: 1003, 
    symbol: "MSFT", 
    name: "Microsoft Corp.", 
    price: 429.35, 
    previousClose: 427.23,
    change: 2.12, 
    changePercent: 0.50, 
    sector: "Technology", 
    volume: 22680000, 
    marketCap: 3190000000000,
    peRatio: 36.8,
    dividendYield: 0.70,
    high52Week: 445.25,
    low52Week: 309.90,
    updatedAt: new Date()
  },
  { 
    id: 1004, 
    symbol: "AMZN", 
    name: "Amazon.com Inc.", 
    price: 180.75, 
    previousClose: 179.77,
    change: 0.98, 
    changePercent: 0.54, 
    sector: "Consumer Cyclical", 
    volume: 43920000, 
    marketCap: 1870000000000,
    peRatio: 60.2,
    dividendYield: 0,
    high52Week: 185.05,
    low52Week: 118.35,
    updatedAt: new Date()
  },
  { 
    id: 1005, 
    symbol: "NVDA", 
    name: "NVIDIA Corp.", 
    price: 925.19, 
    previousClose: 902.54,
    change: 22.65, 
    changePercent: 2.51, 
    sector: "Technology", 
    volume: 52510000, 
    marketCap: 2280000000000,
    peRatio: 68.5,
    dividendYield: 0.02,
    high52Week: 974.00,
    low52Week: 567.01,
    updatedAt: new Date()
  }
];

export default function WatchlistPreview({ user }: WatchlistPreviewProps) {
  const { toast } = useToast();
  const [displayItems, setDisplayItems] = useState<(Watchlist & { stock: Stock })[]>([]);
  
  // Fetch user's watchlist
  const { data: watchlist, isLoading, error } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/watchlist`] : [],
    queryFn: () => user ? fetchUserWatchlist(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  // Fetch all stocks for adding to watchlist
  const { data: allStocks } = useQuery({
    queryKey: ["/api/stocks"],
    queryFn: () => fetchAllStocks(),
  });

  // Set display items based on user watchlist or defaults
  useEffect(() => {
    if (!isLoading && !error) {
      if (watchlist && watchlist.length > 0) {
        // User has items in watchlist, display those
        setDisplayItems(watchlist);
      } else {
        // Create default watchlist items from default stocks
        const defaultItems = defaultStocks.map((stock, index) => ({
          id: index,
          userId: user?.id || 1,
          stockId: stock.id,
          createdAt: new Date(),
          stock: stock
        }));
        setDisplayItems(defaultItems);
      }
    }
  }, [watchlist, isLoading, error, user]);

  // Add stock to watchlist
  const addToWatchlistHandler = async (stockId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add stocks to your watchlist",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addToWatchlist(user.id, stockId);
      toast({
        title: "Added to Watchlist",
        description: "Stock has been added to your watchlist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
        variant: "destructive"
      });
    }
  };

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Watchlist</h2>
        <Button 
          variant="ghost" 
          className="text-primary p-0 h-auto"
          onClick={() => window.location.href = "/watchlist"}
        >
          <ExternalLink className="h-4 w-4 mr-1" /> View All
        </Button>
      </div>
      
      <div className="glass rounded-lg overflow-hidden border border-white/10">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse"></div>
                </div>
                <div>
                  <div className="h-5 w-32 bg-white/5 animate-pulse rounded mb-1"></div>
                  <div className="h-4 w-24 bg-white/5 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-5 w-16 bg-white/5 animate-pulse rounded mb-1"></div>
                <div className="h-4 w-12 bg-white/5 animate-pulse rounded"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="p-4 text-center text-secondary">
            Error loading watchlist
          </div>
        ) : displayItems.length > 0 ? (
          displayItems.map((item, index) => (
            <div 
              key={item.id || `default-${index}`} 
              className={`relative group ${index < displayItems.length - 1 ? 'border-b border-white/10' : ''}`}
            >
              <div 
                onClick={() => {
                  if (item?.stock?.symbol) {
                    window.location.href = `/stock/${item.stock.symbol}`;
                  }
                }}
                className="cursor-pointer"
              >
                <StockListItem stock={item.stock} />
              </div>
              {watchlist && watchlist.length === 0 && (
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="glass border-white/20 hover:bg-white/10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToWatchlistHandler(item.stock.id);
                    }}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-white/70">
            <p>Your watchlist is empty</p>
            <Button variant="link" className="text-primary mt-2">
              Add stocks to your watchlist
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
