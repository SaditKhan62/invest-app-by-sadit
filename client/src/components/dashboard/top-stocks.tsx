import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sectorFilters } from "@/lib/mock-data";
import { fetchTopStocks, fetchStocksByCategory } from "@/lib/api";
import { 
  formatCurrency, 
  formatMarketCap, 
  getColorForChange 
} from "@/lib/utils";
import { Stock } from "@shared/schema";

export default function TopStocks() {
  const [activeFilter, setActiveFilter] = useState("all");
  
  const { data: stocks, isLoading } = useQuery({
    queryKey: [activeFilter === "all" ? "/api/stocks/top" : `/api/stocks/sector/${activeFilter}`],
    queryFn: () => 
      activeFilter === "all" 
        ? fetchTopStocks(50) 
        : fetchStocksByCategory(activeFilter, 50)
  });

  // Only show first 5 for dashboard preview
  const displayStocks = stocks ? stocks.slice(0, 5) : [];

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Top 50 Stocks</h2>
      
      {/* Filters */}
      <div className="flex items-center mb-4 overflow-x-auto pb-2">
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
      
      {/* Top 50 Stocks Table */}
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
                Array.from({ length: 5 }).map((_, index) => (
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
              ) : displayStocks.length > 0 ? (
                displayStocks.map((stock: Stock, index: number) => (
                  <tr 
                    key={stock.id} 
                    className="border-b border-dark-600 hover:bg-dark-600 cursor-pointer"
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td 
                      className="py-3 px-4 font-medium cursor-pointer hover:text-primary"
                      onClick={() => window.location.href = `/stock/${stock.symbol}`}
                    >
                      {stock.symbol}
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
                      <Button variant="ghost" size="icon" className="text-primary h-auto p-1">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-light-400">
                    No stocks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-center">
          <span 
            onClick={() => window.location.href = "/markets"} 
            className="text-primary font-medium cursor-pointer hover:underline"
          >
            View All Stocks
          </span>
        </div>
      </div>
    </section>
  );
}
