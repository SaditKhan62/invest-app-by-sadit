import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StockChart } from "@/components/stocks/stock-chart";
import { timeRangeOptions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { User } from "@shared/schema";

type PortfolioSummaryProps = {
  user: User | null;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
};

export default function PortfolioSummary({ 
  user, 
  totalValue, 
  dayChange, 
  dayChangePercent 
}: PortfolioSummaryProps) {
  const [timeRange, setTimeRange] = useState("1d");
  
  const isPositive = dayChange >= 0;
  
  return (
    <section className="mb-6">
      <div className="bg-dark-700 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-3">Your Portfolio</h2>
        <div className="text-3xl font-bold mb-1">{formatCurrency(totalValue)}</div>
        <div className="flex items-center mb-4">
          <span className={`text-lg ${isPositive ? 'text-primary' : 'text-secondary'} mr-3`}>
            {isPositive ? '+' : ''}{formatCurrency(dayChange)} ({isPositive ? '+' : ''}{dayChangePercent.toFixed(2)}%)
          </span>
          <span className="text-light-500 text-sm">Today</span>
        </div>
        
        {/* Portfolio Chart */}
        <div className="chart-container mb-4 h-[200px]">
          <StockChart 
            symbol="portfolio" 
            interval={timeRange}
            chartType="area"
            height={200}
          />
        </div>
        
        {/* Time Period Selector */}
        <div className="flex justify-between text-sm mb-2">
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
        
        {/* Buy/Sell Buttons */}
        <div className="flex space-x-3 mt-4">
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-white">
            Buy
          </Button>
          <Button variant="outline" className="flex-1 border-light-400 text-light-100">
            Sell
          </Button>
        </div>
      </div>
    </section>
  );
}
