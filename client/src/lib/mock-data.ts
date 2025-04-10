export const marketIndices = [
  {
    name: "S&P 500",
    value: "4,587.64",
    change: 0.63,
    isPositive: true
  },
  {
    name: "NASDAQ",
    value: "15,361.64",
    change: 0.83,
    isPositive: true
  },
  {
    name: "DOW",
    value: "36,054.43",
    change: -0.12,
    isPositive: false
  }
];

export const sectorFilters = [
  { name: "All", value: "all" },
  { name: "Technology", value: "Technology" },
  { name: "Healthcare", value: "Healthcare" },
  { name: "Finance", value: "Financial Services" },
  { name: "Consumer", value: "Consumer Cyclical" },
  { name: "Energy", value: "Energy" },
  { name: "Industrial", value: "Industrial" }
];

export const timeRangeOptions = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "1Y", value: "1y" },
  { label: "ALL", value: "all" }
];

export const tabOptions = {
  marketMovers: [
    { label: "Top Gainers", value: "gainers" },
    { label: "Top Losers", value: "losers" },
    { label: "Most Active", value: "active" }
  ],
  tradeActions: [
    { label: "Buy", value: "buy" },
    { label: "Sell", value: "sell" }
  ]
};

export const defaultMockPortfolio = {
  totalValue: 100.00,
  dayChange: 0.00,
  dayChangePercent: 0.00,
  balance: 100.00
};

export const defaultStockDetails = {
  AAPL: {
    ceo: "Tim Cook",
    headquarters: "Cupertino, California",
    founded: "1976",
    employees: "164,000",
    description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, iPad, Mac, Apple Watch, and Apple TV products, as well as various services."
  }
};
