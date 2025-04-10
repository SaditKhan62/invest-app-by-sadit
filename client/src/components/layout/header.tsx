import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { User, Stock } from "@shared/schema";
import { Search, Bell, LogOut, ChevronDown, BarChart, Settings } from "lucide-react";
import { marketIndices } from "@/lib/mock-data";
import { getColorForChange } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchAllStocks } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  user: User | null;
};

export default function Header({ user }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [, navigate] = useLocation();
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Fetch all stocks for search functionality
  const { data: allStocks } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
    queryFn: fetchAllStocks,
  });
  
  // Handle search functionality
  useEffect(() => {
    if (searchTerm.length > 1 && allStocks) {
      const results = allStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchTerm, allStocks]);
  
  // Handle search result click
  const handleSearchResultClick = (symbol: string) => {
    setSearchTerm("");
    setShowResults(false);
    navigate(`/stock/${symbol}`);
  };
  
  // Handle clicking outside search results
  useEffect(() => {
    const handleClickOutside = () => setShowResults(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/auth");
  };

  // Desktop header
  const desktopHeader = (
    <header className="hidden md:flex items-center justify-between py-4 px-6 border-b border-white/10 glass backdrop-blur-md">
      <div className="flex items-center">
        <div 
          onClick={() => navigate("/")} 
          className="flex items-center mr-8 group cursor-pointer"
        >
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 glow-text">NextGen Trading</span>
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <input 
            type="text" 
            placeholder="Search for symbols, companies..." 
            className="glass text-foreground px-4 py-2 pl-10 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300 hover:ring-1 hover:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-primary/70" />
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full z-50 bg-dark-800/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((stock) => (
                <div 
                  key={stock.id} 
                  className="px-4 py-2 cursor-pointer hover:bg-white/10 flex items-center justify-between"
                  onClick={() => handleSearchResultClick(stock.symbol)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold mr-3">
                      {stock.symbol}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{stock.name}</p>
                      <p className="text-xs text-gray-400">{stock.sector}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${getColorForChange(stock.change)}`}>
                    ${stock.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex space-x-6 mr-4">
          {marketIndices.map((index) => (
            <div key={index.name} className="flex flex-col items-center glass px-3 py-1 rounded-md">
              <span className="text-xs text-gray-300">{index.name}</span>
              <span className={`text-sm font-semibold ${getColorForChange(index.isPositive ? 1 : -1)}`}>
                {index.value} <span className="text-xs">{index.isPositive ? '+' : ''}{index.change}%</span>
              </span>
            </div>
          ))}
        </div>
        <div className="w-px h-6 bg-white/20"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 text-foreground rounded-full hover:bg-white/10 glow-border transition-all duration-300">
              <Bell className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass border border-white/20 backdrop-blur-md w-80">
            <DropdownMenuLabel className="text-primary">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="py-4 px-3 text-center text-white/70">
              <Bell className="h-16 w-16 mx-auto mb-2 text-white/30" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">We'll notify you when there's something important</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2 px-2 py-1 rounded-full hover:bg-white/10 transition-all">
              <div className="w-8 h-8 rounded-full futuristic-gradient flex items-center justify-center text-white font-bold">
                {user.avatarInitials}
              </div>
              <ChevronDown className="h-4 w-4 text-white/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass border border-white/20 backdrop-blur-md">
              <DropdownMenuLabel className="text-primary">{user.firstName} {user.lastName}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs text-white/70">{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="flex items-center cursor-pointer"
                onClick={() => navigate("/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button 
            onClick={() => navigate("/auth")}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full futuristic-gradient text-white text-sm font-medium hover:opacity-90 transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );

  // Mobile header
  const mobileHeader = (
    <header className="md:hidden z-50 py-3 px-4 border-b border-white/10 glass backdrop-blur-md">
      <div className="flex justify-between items-center">
        <div 
          onClick={() => navigate("/")} 
          className="flex items-center cursor-pointer"
        >
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 glow-text">NextGen</span>
        </div>
        <div className="flex space-x-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-white/70 p-2 hover:bg-white/10 rounded-full transition-all">
                <Search className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass border border-white/20 backdrop-blur-md w-64" align="end">
              <div className="p-2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search stocks..." 
                    className="w-full glass text-foreground px-4 py-2 pl-9 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary/70" />
                </div>
                
                {/* Mobile Search Results */}
                {searchTerm.length > 1 && searchResults.length > 0 ? (
                  <div className="mt-2 max-h-60 overflow-auto">
                    {searchResults.map((stock) => (
                      <div 
                        key={stock.id} 
                        className="px-3 py-2 cursor-pointer hover:bg-white/10 flex items-center justify-between"
                        onClick={() => handleSearchResultClick(stock.symbol)}
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold mr-2">
                            {stock.symbol}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{stock.name}</p>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${getColorForChange(stock.change)}`}>
                          ${stock.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchTerm.length > 1 ? (
                  <p className="text-center text-sm text-gray-400 py-2">No results found</p>
                ) : null}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-white/70 p-2 hover:bg-white/10 rounded-full transition-all">
                <Bell className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass border border-white/20 backdrop-blur-md w-64" align="end">
              <DropdownMenuLabel className="text-primary">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="py-4 px-3 text-center text-white/70">
                <Bell className="h-12 w-12 mx-auto mb-2 text-white/30" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">We'll notify you when there's something important</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="w-8 h-8 rounded-full futuristic-gradient flex items-center justify-center text-white font-bold cursor-pointer">
                  {user.avatarInitials}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass border border-white/20 backdrop-blur-md" align="end">
                <DropdownMenuLabel className="text-primary">{user.firstName} {user.lastName}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="flex items-center cursor-pointer"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="px-2 py-1 rounded-full futuristic-gradient text-white text-xs font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );

  return (
    <>
      {desktopHeader}
      {mobileHeader}
    </>
  );
}
