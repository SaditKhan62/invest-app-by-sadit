import { Link } from "wouter";
import { User, Position, Stock } from "@shared/schema";
import { formatCurrency, formatNumber, getColorForChange } from "@/lib/utils";

type PortfolioHoldingsProps = {
  user: User | null;
  positions: (Position & { stock: Stock })[] | undefined;
  isLoading: boolean;
};

export default function PortfolioHoldings({ user, positions, isLoading }: PortfolioHoldingsProps) {
  // Calculate portfolio values and holdings
  const calculatePositionValue = (position: Position & { stock: Stock }) => {
    return position.shares * position.stock.price;
  };
  
  const calculateGainLoss = (position: Position & { stock: Stock }) => {
    const currentValue = position.shares * position.stock.price;
    const costBasis = position.shares * position.averageCost;
    return currentValue - costBasis;
  };
  
  const calculateGainLossPercent = (position: Position & { stock: Stock }) => {
    const currentValue = position.shares * position.stock.price;
    const costBasis = position.shares * position.averageCost;
    if (costBasis === 0) return 0;
    return ((currentValue - costBasis) / costBasis) * 100;
  };

  return (
    <div className="bg-dark-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-dark-600 text-light-300 text-xs">
              <th className="py-3 px-4 text-left font-medium">SYMBOL</th>
              <th className="py-3 px-4 text-left font-medium">NAME</th>
              <th className="py-3 px-4 text-right font-medium">SHARES</th>
              <th className="py-3 px-4 text-right font-medium">AVG COST</th>
              <th className="py-3 px-4 text-right font-medium">PRICE</th>
              <th className="py-3 px-4 text-right font-medium">VALUE</th>
              <th className="py-3 px-4 text-right font-medium">GAIN/LOSS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b border-dark-600">
                  <td className="py-3 px-4">
                    <div className="h-4 w-12 bg-dark-600 animate-pulse rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-32 bg-dark-600 animate-pulse rounded"></div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-4 w-12 bg-dark-600 animate-pulse rounded ml-auto"></div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-4 w-16 bg-dark-600 animate-pulse rounded ml-auto"></div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-4 w-16 bg-dark-600 animate-pulse rounded ml-auto"></div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-4 w-20 bg-dark-600 animate-pulse rounded ml-auto"></div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-4 w-20 bg-dark-600 animate-pulse rounded ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : positions && positions.length > 0 ? (
              positions.map((position) => {
                const positionValue = calculatePositionValue(position);
                const gainLoss = calculateGainLoss(position);
                const gainLossPercent = calculateGainLossPercent(position);
                
                return (
                  <tr key={position.id} className="border-b border-dark-600 hover:bg-dark-600">
                    <td className="py-3 px-4 font-medium">
                      <Link href={`/stock/${position.stock.symbol}`}>
                        <a className="hover:underline">{position.stock.symbol}</a>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-light-400">{position.stock.name}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(position.shares)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(position.averageCost)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(position.stock.price)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(positionValue)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className={getColorForChange(gainLoss)}>
                        {formatCurrency(gainLoss)}
                      </div>
                      <div className={`text-xs ${getColorForChange(gainLossPercent)}`}>
                        {gainLossPercent > 0 ? "+" : ""}
                        {gainLossPercent.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-light-500">
                  <p>You don't have any positions yet</p>
                  <p className="text-sm mt-2">Start investing by buying your first stock</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
