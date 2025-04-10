import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { StockChart } from "@/components/stocks/stock-chart";
import StockStats from "@/components/stocks/stock-stats";
import StockTradePanel from "@/components/stocks/stock-trade-panel";
import { fetchStockBySymbol } from "@/lib/api";
import { formatCurrency, getColorForChange } from "@/lib/utils";
import { timeRangeOptions } from "@/lib/mock-data";
import { defaultStockDetails } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StockDetailModalProps = {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function StockDetailModal({ symbol, isOpen, onClose }: StockDetailModalProps) {
  const [timeRange, setTimeRange] = useState("1d");
  
  const { data: stock, isLoading, error } = useQuery({
    queryKey: [`/api/stocks/${symbol}`],
    queryFn: () => fetchStockBySymbol(symbol),
    enabled: isOpen && !!symbol
  });
  
  // Get stock details - in a real app, this would be fetched from an API
  const stockDetails = defaultStockDetails[symbol as keyof typeof defaultStockDetails] || {
    ceo: "Unknown",
    headquarters: "Unknown",
    founded: "Unknown",
    employees: "Unknown",
    description: "No description available."
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-dark-700 text-light-100 p-0">
        <DialogHeader className="p-4 border-b border-dark-600 flex justify-between items-center">
          {!isLoading && stock ? (
            <div>
              <DialogTitle className="text-xl font-bold">{stock.symbol}</DialogTitle>
              <p className="text-light-400">{stock.name}</p>
            </div>
          ) : (
            <div className="h-12 w-40 animate-pulse bg-dark-600 rounded"></div>
          )}
          <DialogClose className="text-light-400 hover:text-white">
            <X className="h-5 w-5" />
          </DialogClose>
        </DialogHeader>
        
        <div className="p-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 w-32 bg-dark-600 rounded"></div>
              <div className="h-6 w-24 bg-dark-600 rounded"></div>
              <div className="h-64 bg-dark-600 rounded"></div>
              <div className="flex justify-between">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-8 w-12 bg-dark-600 rounded"></div>
                ))}
              </div>
            </div>
          ) : error || !stock ? (
            <div className="text-center text-secondary py-8">
              <p className="text-xl mb-2">Error Loading Stock</p>
              <p className="text-light-400">
                Unable to load details for {symbol}. Please try again later.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="text-3xl font-bold mb-1">{formatCurrency(stock.price)}</div>
                <div className="flex items-center">
                  <span className={`text-lg ${getColorForChange(stock.changePercent)} mr-3`}>
                    {stock.change && stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2)} 
                    ({stock.changePercent && stock.changePercent > 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%)
                  </span>
                  <span className="text-light-500 text-sm">Today</span>
                </div>
              </div>
              
              {/* Stock Chart */}
              <div className="h-64 mb-4">
                <StockChart symbol={stock.symbol} interval={timeRange} height={256} />
              </div>
              
              {/* Time Period Selector */}
              <div className="flex justify-between text-sm mb-6">
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
              
              {/* Tabs for Stats, Trade, and About */}
              <Tabs defaultValue="stats" className="mt-6">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="trade">Trade</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>
                
                <TabsContent value="stats" className="mt-0">
                  <StockStats stock={stock} />
                </TabsContent>
                
                <TabsContent value="trade" className="mt-0">
                  <StockTradePanel stock={stock} />
                </TabsContent>
                
                <TabsContent value="about" className="mt-0">
                  <div className="mb-6">
                    <p className="text-light-300 mb-4">
                      {stockDetails.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-light-500 text-sm">CEO</div>
                        <div className="font-medium">{stockDetails.ceo}</div>
                      </div>
                      <div>
                        <div className="text-light-500 text-sm">Headquarters</div>
                        <div className="font-medium">{stockDetails.headquarters}</div>
                      </div>
                      <div>
                        <div className="text-light-500 text-sm">Founded</div>
                        <div className="font-medium">{stockDetails.founded}</div>
                      </div>
                      <div>
                        <div className="text-light-500 text-sm">Employees</div>
                        <div className="font-medium">{stockDetails.employees}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
