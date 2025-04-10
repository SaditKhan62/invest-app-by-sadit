import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Bell, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { sectorFilters } from "@/lib/mock-data";
import { 
  fetchTopStocks, 
  fetchStocksByCategory, 
  addToWatchlist, 
  fetchUserWatchlist 
} from "@/lib/api";
import { 
  formatCurrency, 
  formatMarketCap,
  getColorForChange
} from "@/lib/utils";
import { Stock, Watchlist } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Markets() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: stocks, isLoading } = useQuery({
    queryKey: [activeFilter === "all" ? "/api/stocks/top" : `/api/stocks/sector/${activeFilter}`],
    queryFn: () => 
      activeFilter === "all" 
        ? fetchTopStocks(50) 
        : fetchStocksByCategory(activeFilter, 50)
  });

  // Get user's watchlist
  const { data: watchlist, refetch: refetchWatchlist } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/watchlist`] : [],
    queryFn: () => user ? fetchUserWatchlist(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: (stockId: number) => user ? addToWatchlist(user.id, stockId) : Promise.reject("User not found"),
    onSuccess: () => {
      toast({
        title: "Added to watchlist",
        description: "Stock has been added to your watchlist"
      });
      refetchWatchlist();
    },
    onError: (error) => {
      toast({
        title: "Failed to add to watchlist",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });

  // Handle create alert
  const handleCreateAlert = (stockId: number, stockSymbol: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to create alerts",
        variant: "destructive"
      });
      return;
    }
    navigate(`/watchlist?createAlert=true&stockId=${stockId}&symbol=${stockSymbol}`);
  };

  // Check if a stock is already in watchlist
  const isInWatchlist = (stockId: number): boolean => {
    if (!watchlist) return false;
    return watchlist.some((item: Watchlist & { stock?: Stock }) => item.stockId === stockId);
  };

  // Filter stocks based on search
  const filteredStocks = stocks 
    ? stocks.filter((stock: Stock) => 
        !searchTerm || 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="px-4 md:px-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold mb-6">Markets</h1>
      
      {/* Search */}
      <div className="mb-6">
        <Input 
          type="text" 
          placeholder="Search by symbol or company name" 
          className="bg-dark-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Filters */}
      <div className="flex items-center mb-6 overflow-x-auto pb-2">
        {sectorFilters.map((filter) => (
          <button 
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`py-1 px-3 mr-2 rounded-full text-sm whitespace-nowrap ${
              activeFilter === filter.value 
                ? 'bg-primary text-white' 
                : 'bg-dark-600 text-light-300'
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>
      
      {/* Stocks Table */}
      <div className="bg-dark-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-dark-600 text-light-300 text-xs">
                <th className="py-3 px-4 text-left font-medium">RANK</th>
                <th className="py-3 px-4 text-left font-medium">SYMBOL</th>
                <th className="py-3 px-4 text-left font-medium">COMPANY</th>
                <th className="py-3 px-4 text-right font-medium">PRICE</th>
                <th className="py-3 px-4 text-right font-medium">CHANGE</th>
                <th className="py-3 px-4 text-right font-medium">MARKET CAP</th>
                <th className="py-3 px-4 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index} className="border-b border-dark-600">
                    <td className="py-3 px-4">
                      <div className="h-4 w-6 bg-dark-600 animate-pulse rounded"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-12 bg-dark-600 animate-pulse rounded"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-36 bg-dark-600 animate-pulse rounded"></div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-4 w-16 bg-dark-600 animate-pulse rounded ml-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-4 w-14 bg-dark-600 animate-pulse rounded ml-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-4 w-12 bg-dark-600 animate-pulse rounded ml-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-4 w-4 bg-dark-600 animate-pulse rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredStocks.length > 0 ? (
                filteredStocks.map((stock: Stock, index: number) => (
                  <tr 
                    key={stock.id} 
                    className="border-b border-dark-600 hover:bg-dark-600"
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 font-medium">
                      <Link to={`/stock/${stock.symbol}`} className="hover:underline">
                        {stock.symbol}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-light-400">{stock.name}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(stock.price)}</td>
                    <td className={`py-3 px-4 text-right ${getColorForChange(stock.changePercent)}`}>
                      {stock.changePercent && stock.changePercent > 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-light-400">
                      {stock.marketCap ? formatMarketCap(stock.marketCap) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-primary h-auto p-1 hover:bg-white/10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass border border-white/20 backdrop-blur-md w-48">
                          <DropdownMenuItem 
                            className="flex items-center cursor-pointer"
                            onClick={() => !isInWatchlist(stock.id) && addToWatchlistMutation.mutate(stock.id)}
                            disabled={isInWatchlist(stock.id) || addToWatchlistMutation.isPending}
                          >
                            <Star className="mr-2 h-4 w-4" />
                            {isInWatchlist(stock.id) ? "Already in Watchlist" : "Add to Watchlist"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center cursor-pointer"
                            onClick={() => handleCreateAlert(stock.id, stock.symbol)}
                          >
                            <Bell className="mr-2 h-4 w-4" />
                            Create Price Alert
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-light-400">
                    {searchTerm 
                      ? "No matching stocks found" 
                      : "No stocks available for this category"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
