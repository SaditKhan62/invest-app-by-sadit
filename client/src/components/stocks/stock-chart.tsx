import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  ComposedChart,
  Bar
} from "recharts";
import { fetchStockPriceHistory } from "@/lib/api";
import { timestampToTimeString, formatCurrency } from "@/lib/utils";
import { PriceHistory } from "@shared/schema";

type StockChartProps = {
  symbol: string;
  interval: string;
  chartType?: "line" | "candlestick";
  height?: number;
};

type ChartDataItem = {
  time: string;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  timestamp: number;
  fullDate: string;
};

export function StockChart({ 
  symbol, 
  interval, 
  chartType = "line",
  height = 300 
}: StockChartProps) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: [`/api/stocks/${symbol}/history`, interval],
    queryFn: () => 
      symbol === "portfolio" 
        ? Promise.resolve(generateMockPortfolioData())
        : fetchStockPriceHistory(symbol, interval),
    enabled: symbol !== ""
  });
  
  // Generate some mock portfolio data for the demo
  function generateMockPortfolioData() {
    const data = [];
    const now = new Date();
    const startDate = new Date(now);
    
    // Adjust start date based on interval
    switch (interval) {
      case '1d':
        startDate.setHours(9, 30, 0, 0); // Market open at 9:30 AM
        break;
      case '1w':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      default:
        startDate.setHours(9, 30, 0, 0);
    }
    
    let currentValue = 15100;
    let timestamp = new Date(startDate);
    
    // Determine time increment based on interval
    let timeIncrement;
    let volatilityFactor;
    
    switch (interval) {
      case '1d':
        timeIncrement = 5 * 60 * 1000; // 5 minutes
        volatilityFactor = 1;
        break;
      case '1w':
        timeIncrement = 60 * 60 * 1000; // 1 hour
        volatilityFactor = 2;
        break;
      case '1m':
        timeIncrement = 24 * 60 * 60 * 1000; // 1 day
        volatilityFactor = 4;
        break;
      case '3m':
        timeIncrement = 24 * 60 * 60 * 1000; // 1 day
        volatilityFactor = 5;
        break;
      case '1y':
        timeIncrement = 7 * 24 * 60 * 60 * 1000; // 1 week
        volatilityFactor = 8;
        break;
      case 'all':
        timeIncrement = 30 * 24 * 60 * 60 * 1000; // 1 month
        volatilityFactor = 12;
        break;
      default:
        timeIncrement = 5 * 60 * 1000; // 5 minutes
        volatilityFactor = 1;
    }
    
    while (timestamp <= now) {
      // Random price movement with increased volatility for longer time periods
      const priceChange = (Math.random() - 0.48) * 20 * volatilityFactor; // Slightly biased upward
      currentValue += priceChange;
      
      // Prevent negative values
      currentValue = Math.max(currentValue, 100);
      
      // For candlestick data, we need open, high, low, close values
      const open = currentValue;
      const high = open + Math.random() * 10 * volatilityFactor;
      const low = open - Math.random() * 10 * volatilityFactor;
      const close = currentValue + priceChange;
      
      data.push({
        timestamp: new Date(timestamp),
        price: currentValue,
        open: open,
        high: high,
        low: low,
        close: close
      });
      
      // Advance by the determined time increment
      timestamp = new Date(timestamp.getTime() + timeIncrement);
    }
    
    // Ensure last value is exactly the current portfolio value
    if (data.length > 0) {
      data[data.length - 1].price = 15286.44;
      data[data.length - 1].close = 15286.44;
    }
    
    return data;
  }

  useEffect(() => {
    if (data) {
      const formattedData = data.map((item: any) => {
        const date = new Date(item.timestamp);
        let timeLabel;
        
        // Format time label based on interval
        switch (interval) {
          case '1d':
            timeLabel = timestampToTimeString(date);
            break;
          case '1w':
            timeLabel = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            break;
          case '1m':
          case '3m':
            timeLabel = `${date.getMonth() + 1}/${date.getDate()}`;
            break;
          case '1y':
            timeLabel = `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`;
            break;
          case 'all':
            timeLabel = `${date.getMonth() + 1}/${date.getFullYear()}`;
            break;
          default:
            timeLabel = timestampToTimeString(date);
        }
        
        // Add candlestick data if available
        return {
          time: timeLabel,
          value: item.price,
          open: item.open || item.price,
          high: item.high || item.price * 1.005,
          low: item.low || item.price * 0.995,
          close: item.close || item.price,
          timestamp: date.getTime(),
          fullDate: date.toLocaleDateString()
        };
      });
      
      // Sort by timestamp
      formattedData.sort((a: ChartDataItem, b: ChartDataItem) => a.timestamp - b.timestamp);
      
      setChartData(formattedData);
    }
  }, [data, interval]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const isLongerPeriod = interval !== '1d';
      const data = payload[0].payload;
      
      return (
        <div className="bg-dark-700 p-2 border border-dark-500 rounded-md shadow-lg">
          {isLongerPeriod && (
            <p className="text-xs text-white/70 mb-1">{data.fullDate}</p>
          )}
          <p className="text-sm font-medium text-white">{data.time}</p>
          
          {chartType === "candlestick" ? (
            <div className="space-y-1 mt-1">
              <p className="text-xs flex justify-between">
                <span className="text-white/70">Open:</span>
                <span className="text-primary">{formatCurrency(data.open)}</span>
              </p>
              <p className="text-xs flex justify-between">
                <span className="text-white/70">High:</span>
                <span className="text-green-400">{formatCurrency(data.high)}</span>
              </p>
              <p className="text-xs flex justify-between">
                <span className="text-white/70">Low:</span>
                <span className="text-red-400">{formatCurrency(data.low)}</span>
              </p>
              <p className="text-xs flex justify-between">
                <span className="text-white/70">Close:</span>
                <span className="text-primary">{formatCurrency(data.close)}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-primary">
              {formatCurrency(data.value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Determine color based on price movement
  const startPrice = chartData[0]?.value;
  const endPrice = chartData[chartData.length - 1]?.value;
  const isPositive = !startPrice || !endPrice || endPrice >= startPrice;
  const chartColor = isPositive ? "#00C805" : "#FF5000";

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="loading-skeleton h-full w-full rounded"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {chartType === "line" ? (
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="time" 
            tick={false} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            domain={['dataMin', 'dataMax']} 
            hide={true} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={chartColor} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      ) : (
        // Candlestick chart implementation
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="time" 
            tick={false} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            domain={['auto', 'auto']} 
            hide={true} 
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Wicks (high-low) */}
          {chartData.map((item, index) => (
            <Line
              key={`wick-${index}`}
              data={[{time: item.time, value: item.high}, {time: item.time, value: item.low}]}
              dataKey="value"
              stroke={(item.close ?? 0) >= (item.open ?? 0) ? "#00C805" : "#FF5000"}
              strokeWidth={1}
              dot={false}
            />
          ))}
          
          {/* Bodies (open-close) */}
          {chartData.map((item, index) => (
            <Bar
              key={`body-${index}`}
              data={[item]}
              dataKey={() => Math.abs((item.close ?? 0) - (item.open ?? 0))}
              fill={(item.close ?? 0) >= (item.open ?? 0) ? "#00C805" : "#FF5000"}
              stackId={`stack-${index}`}
              barSize={8}
              minPointSize={4}
              yAxisId={0}
              name={`Candle-${index}`}
              shape={(props: any) => {
                const { x, y, width, height } = props;
                const startY = (item.close ?? 0) >= (item.open ?? 0) ? y : y - height;
                return <rect x={x - width/2} y={startY} width={width} height={height || 1} fill={(item.close ?? 0) >= (item.open ?? 0) ? "#00C805" : "#FF5000"} />;
              }}
            />
          ))}
        </ComposedChart>
      )}
    </ResponsiveContainer>
  );
}
