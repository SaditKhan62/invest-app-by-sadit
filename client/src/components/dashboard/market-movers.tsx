import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { tabOptions } from "@/lib/mock-data";
import { 
  fetchTopGainers, 
  fetchTopLosers, 
  fetchMostActive 
} from "@/lib/api";
import { 
  formatCurrency, 
  formatPercentage, 
  formatVolume, 
  getColorForChange 
} from "@/lib/utils";
import { Stock } from "@shared/schema";

export default function MarketMovers() {
  const [activeTab, setActiveTab] = useState<string>("gainers");

  const { data: gainers, isLoading: isLoadingGainers } = useQuery({
    queryKey: ["/api/stocks/gainers"],
    queryFn: () => fetchTopGainers(),
    enabled: activeTab === "gainers"
  });

  const { data: losers, isLoading: isLoadingLosers } = useQuery({
    queryKey: ["/api/stocks/losers"],
    queryFn: () => fetchTopLosers(),
    enabled: activeTab === "losers"
  });

  const { data: active, isLoading: isLoadingActive } = useQuery({
    queryKey: ["/api/stocks/active"],
    queryFn: () => fetchMostActive(),
    enabled: activeTab === "active"
  });

  const isLoading = 
    (activeTab === "gainers" && isLoadingGainers) || 
    (activeTab === "losers" && isLoadingLosers) || 
    (activeTab === "active" && isLoadingActive);

  const stocks = 
    activeTab === "gainers" ? gainers :
    activeTab === "losers" ? losers :
    active;

  return (
    <section className="mb-6">
      <h2 className="text-xl font-bold mb-4">Market Movers</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-dark-600 mb-4">
        {tabOptions.marketMovers.map((tab) => (
          <button 
            key={tab.value}
            className={`py-2 px-4 font-medium ${
              activeTab === tab.value 
                ? 'border-b-2 border-primary text-white' 
                : 'text-light-400'
            }`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Market Movers List */}
      <div className="bg-dark-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-dark-600 text-light-300 text-xs">
                <th className="py-3 px-4 text-left font-medium">SYMBOL</th>
                <th className="py-3 px-4 text-left font-medium">COMPANY</th>
                <th className="py-3 px-4 text-right font-medium">PRICE</th>
                <th className="py-3 px-4 text-right font-medium">CHANGE</th>
                <th className="py-3 px-4 text-right font-medium">% CHANGE</th>
                <th className="py-3 px-4 text-right font-medium">VOLUME</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-dark-600">
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
                      <div className="h-4 w-12 bg-dark-600 animate-pulse rounded ml-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-4 w-14 bg-dark-600 animate-pulse rounded ml-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-4 w-10 bg-dark-600 animate-pulse rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : stocks && stocks.length > 0 ? (
                stocks.map((stock: Stock) => (
                  <tr key={stock.id} className="border-b border-dark-600 hover:bg-dark-600 cursor-pointer">
                    <td className="py-3 px-4 font-medium">
                      <span 
                        onClick={() => window.location.href = `/stock/${stock.symbol}`}
                        className="cursor-pointer hover:underline"
                      >
                        {stock.symbol}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-light-400">{stock.name}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(stock.price)}</td>
                    <td className={`py-3 px-4 text-right ${getColorForChange(stock.change)}`}>
                      {stock.change && stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right ${getColorForChange(stock.changePercent)}`}>
                      {stock.changePercent && stock.changePercent > 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-light-400">
                      {stock.volume ? formatVolume(stock.volume) : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-light-400">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
