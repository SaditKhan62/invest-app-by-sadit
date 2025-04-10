import { queryClient, apiRequest } from "./queryClient";

// Auth API
export const loginUser = async (username: string, password: string) => {
  const res = await apiRequest("POST", "/api/login", { username, password });
  return res.json();
};

export const registerUser = async (userData: {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
}) => {
  const res = await apiRequest("POST", "/api/register", userData);
  return res.json();
};

// Stocks API
export const fetchAllStocks = async () => {
  const res = await apiRequest("GET", "/api/stocks");
  return res.json();
};

export const fetchTopStocks = async (limit = 50) => {
  const res = await apiRequest("GET", `/api/stocks/top?limit=${limit}`);
  return res.json();
};

export const fetchTopGainers = async (limit = 5) => {
  const res = await apiRequest("GET", `/api/stocks/gainers?limit=${limit}`);
  return res.json();
};

export const fetchTopLosers = async (limit = 5) => {
  const res = await apiRequest("GET", `/api/stocks/losers?limit=${limit}`);
  return res.json();
};

export const fetchMostActive = async (limit = 5) => {
  const res = await apiRequest("GET", `/api/stocks/active?limit=${limit}`);
  return res.json();
};

export const fetchStocksByCategory = async (sector: string, limit = 10) => {
  const res = await apiRequest("GET", `/api/stocks/sector/${sector}?limit=${limit}`);
  return res.json();
};

export const fetchStockBySymbol = async (symbol: string) => {
  const res = await apiRequest("GET", `/api/stocks/${symbol}`);
  return res.json();
};

export const fetchStockPriceHistory = async (symbol: string, interval = "1d") => {
  const res = await apiRequest("GET", `/api/stocks/${symbol}/history?interval=${interval}`);
  return res.json();
};

// Watchlist API
export const fetchUserWatchlist = async (userId: number) => {
  const res = await apiRequest("GET", `/api/users/${userId}/watchlist`);
  return res.json();
};

export const addToWatchlist = async (userId: number, stockId: number) => {
  const res = await apiRequest("POST", `/api/users/${userId}/watchlist`, { stockId });
  // Invalidate watchlist cache
  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/watchlist`] });
  return res.json();
};

export const removeFromWatchlist = async (userId: number, stockId: number) => {
  const res = await apiRequest("DELETE", `/api/users/${userId}/watchlist/${stockId}`);
  // Invalidate watchlist cache
  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/watchlist`] });
  return res.json();
};

// Portfolio API
export const fetchUserPortfolio = async (userId: number) => {
  const res = await apiRequest("GET", `/api/users/${userId}/portfolio`);
  return res.json();
};

// Trading API
export const executeTrade = async (
  userId: number,
  tradeData: {
    stockId: number;
    type: "buy" | "sell";
    shares: number;
    price: number;
  }
) => {
  const res = await apiRequest("POST", `/api/users/${userId}/trades`, tradeData);
  // Invalidate portfolio and trades cache
  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/portfolio`] });
  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/trades`] });
  queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
  return res.json();
};

export const fetchUserTrades = async (userId: number) => {
  const res = await apiRequest("GET", `/api/users/${userId}/trades`);
  return res.json();
};

// News API
export const fetchNews = async (limit = 10) => {
  const res = await apiRequest("GET", `/api/news?limit=${limit}`);
  return res.json();
};

export const fetchStockNews = async (symbol: string, limit = 5) => {
  const res = await apiRequest("GET", `/api/news/stock/${symbol}?limit=${limit}`);
  return res.json();
};

// Alerts API
export const fetchUserAlerts = async (userId: number) => {
  const res = await apiRequest("GET", `/api/users/${userId}/alerts`);
  return res.json();
};

export const createAlert = async (
  userId: number,
  alertData: {
    stockId: number;
    type: "price_above" | "price_below" | "percent_change";
    value: number;
  }
) => {
  const res = await apiRequest("POST", `/api/users/${userId}/alerts`, alertData);
  // Invalidate alerts cache
  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/alerts`] });
  return res.json();
};

export const deleteAlert = async (alertId: number) => {
  const res = await apiRequest("DELETE", `/api/alerts/${alertId}`);
  // We don't know the user ID here, so client must handle invalidation
  return res.json();
};
