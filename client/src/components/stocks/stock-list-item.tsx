import { Stock } from "@shared/schema";
import { getStockLogo, getColorForChange, formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

type StockListItemProps = {
  stock: Stock;
  onClick?: () => void;
};

export function StockListItem({ stock, onClick }: StockListItemProps) {
  // Guard clause for undefined stock
  if (!stock) {
    return (
      <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors duration-200">
        <div className="text-white/60">Stock data unavailable</div>
      </div>
    );
  }
  
  const isPositive = (stock.changePercent || 0) >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  
  return (
    <div 
      className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors duration-200"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="mr-3">
          <div className="w-10 h-10 rounded-xl futuristic-gradient flex items-center justify-center text-white font-bold border border-white/10">
            {stock.symbol?.slice(0, 4) || '????'}
          </div>
        </div>
        <div>
          <div className="font-semibold">{stock.name || 'Unknown Stock'}</div>
          <div className="text-sm text-white/60">
            {stock.symbol ? (stock.symbol.includes(':') ? stock.symbol : `NASDAQ: ${stock.symbol}`) : 'Unknown'}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{typeof stock.price === 'number' ? formatCurrency(stock.price) : 'N/A'}</div>
        <div className={`text-sm ${changeColor} flex items-center justify-end`}>
          {isPositive ? 
            <TrendingUp className="h-3 w-3 mr-1" /> : 
            <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
          }
          {isPositive ? '+' : ''}
          {typeof stock.changePercent === 'number' ? stock.changePercent.toFixed(2) : '0.00'}%
        </div>
      </div>
    </div>
  );
}
