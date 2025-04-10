import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation, useSearch } from "wouter";
import { User, Watchlist, Stock } from "@shared/schema";
import { fetchUserWatchlist, fetchAllStocks, removeFromWatchlist, addToWatchlist } from "@/lib/api";
import { StockListItem } from "@/components/stocks/stock-list-item";
import AlertList from "@/components/watchlist/alert-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type WatchlistPageProps = {
  user: User | null;
};

export default function WatchlistPage({ user }: WatchlistPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("watchlist");
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const search = useSearch();
  
  // Parse URL search parameters
  const urlParams = new URLSearchParams(search);
  const createAlert = urlParams.get("createAlert") === "true";
  const stockId = urlParams.get("stockId") ? parseInt(urlParams.get("stockId")!) : null;
  const stockSymbol = urlParams.get("symbol");

  const { data: watchlist, isLoading: isLoadingWatchlist, refetch: refetchWatchlist } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/watchlist`] : [],
    queryFn: () => user ? fetchUserWatchlist(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  const { data: allStocks, isLoading: isLoadingStocks } = useQuery({
    queryKey: ["/api/stocks"],
    queryFn: fetchAllStocks,
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

  // Handle URL parameters for creating alerts
  useEffect(() => {
    if (createAlert && stockId && user) {
      // Switch to the alerts tab
      setActiveTab("alerts");
      
      // If stock is not in watchlist, add it
      if (watchlist && !watchlist.some((item: Watchlist) => item.stockId === stockId)) {
        addToWatchlistMutation.mutate(stockId);
      }
      
      // Clear the URL parameters after processing
      navigate("/watchlist", { replace: true });
    }
  }, [createAlert, stockId, stockSymbol, user, watchlist]);

  // Filter stocks based on search term
  const filteredStocks = searchTerm
    ? allStocks?.filter((stock: Stock) => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Handle removing from watchlist
  const handleRemoveFromWatchlist = async (stockId: number) => {
    if (!user) return;
    
    try {
      await removeFromWatchlist(user.id, stockId);
      toast({
        title: "Removed from watchlist",
        description: "The stock has been removed from your watchlist."
      });
      refetchWatchlist();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove stock from watchlist.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 md:px-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold mb-6">Watchlist & Alerts</h1>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="watchlist" className="mt-0">
          {/* Search & Add Stocks */}
          <div className="bg-dark-700 rounded-lg p-4 mb-6">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search for symbols or companies..." 
                className="bg-dark-600 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-light-500" />
            </div>
            
            {searchTerm && (
              <div className="mt-3 max-h-60 overflow-y-auto">
                {isLoadingStocks ? (
                  <div className="py-2 text-center text-light-500">Loading...</div>
                ) : filteredStocks && filteredStocks.length > 0 ? (
                  filteredStocks.map((stock: Stock) => (
                    <div key={stock.id} className="flex items-center justify-between p-2 hover:bg-dark-600 rounded">
                      <div 
                        onClick={() => window.location.href = `/stock/${stock.symbol}`}
                        className="flex-1 cursor-pointer flex items-center"
                      >
                        <span className="font-medium mr-2">{stock.symbol}</span>
                        <span className="text-light-400">{stock.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary h-auto p-1"
                        onClick={() => addToWatchlistMutation.mutate(stock.id)}
                        disabled={watchlist?.some((item: Watchlist) => item.stockId === stock.id) || addToWatchlistMutation.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-center text-light-500">No matching stocks found</div>
                )}
              </div>
            )}
          </div>
          
          {/* Watchlist */}
          <div className="bg-dark-700 rounded-lg overflow-hidden">
            <h2 className="text-lg font-semibold p-4 border-b border-dark-600">Your Watchlist</h2>
            
            {isLoadingWatchlist ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-b border-dark-600">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <div className="w-10 h-10 rounded-full bg-dark-600 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-5 w-32 bg-dark-600 animate-pulse rounded mb-1"></div>
                      <div className="h-4 w-24 bg-dark-600 animate-pulse rounded"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-5 w-16 bg-dark-600 animate-pulse rounded mb-1"></div>
                    <div className="h-4 w-12 bg-dark-600 animate-pulse rounded"></div>
                  </div>
                </div>
              ))
            ) : watchlist && watchlist.length > 0 ? (
              watchlist.map((item: Watchlist & { stock?: Stock }) => (
                <div key={item.id} className="relative group">
                  {item.stock && (
                    <>
                      <div
                        onClick={() => {
                          if (item.stock) {
                            window.location.href = `/stock/${item.stock.symbol}`;
                          }
                        }}
                        className="cursor-pointer block"
                      >
                        <StockListItem stock={item.stock} />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-light-500 hover:text-white"
                        onClick={() => handleRemoveFromWatchlist(item.stockId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-light-500">
                <p>Your watchlist is empty</p>
                <p className="text-sm mt-2">Search for stocks above to add them to your watchlist</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="alerts" className="mt-0">
          <AlertList user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
