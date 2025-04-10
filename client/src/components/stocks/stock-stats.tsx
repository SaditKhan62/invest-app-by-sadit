import { Stock } from "@shared/schema";
import { formatCurrency, formatPercentage, formatMarketCap, formatVolume } from "@/lib/utils";

type StockStatsProps = {
  stock: Stock;
};

export default function StockStats({ stock }: StockStatsProps) {
  const stats = [
    {
      label: "Market Cap",
      value: stock.marketCap ? formatMarketCap(stock.marketCap) : "N/A"
    },
    {
      label: "P/E Ratio",
      value: stock.peRatio ? stock.peRatio.toFixed(2) : "N/A"
    },
    {
      label: "Dividend Yield",
      value: stock.dividendYield ? formatPercentage(stock.dividendYield) : "N/A"
    },
    {
      label: "52-Week High",
      value: stock.high52Week ? formatCurrency(stock.high52Week) : "N/A"
    },
    {
      label: "52-Week Low",
      value: stock.low52Week ? formatCurrency(stock.low52Week) : "N/A"
    },
    {
      label: "Volume",
      value: stock.volume ? formatVolume(stock.volume) : "N/A"
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Key Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-light-500 text-sm">{stat.label}</div>
            <div className="font-medium">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
