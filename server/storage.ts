import {
  users, type User, type InsertUser,
  stocks, type Stock, type InsertStock,
  watchlists, type Watchlist, type InsertWatchlist,
  positions, type Position, type InsertPosition,
  trades, type Trade, type InsertTrade,
  news, type News, type InsertNews,
  alerts, type Alert, type InsertAlert,
  priceHistory, type PriceHistory, type InsertPriceHistory
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;

  // Stock operations
  getAllStocks(): Promise<Stock[]>;
  getStocksBySymbols(symbols: string[]): Promise<Stock[]>;
  getStock(id: number): Promise<Stock | undefined>;
  getStockBySymbol(symbol: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, stock: Partial<Stock>): Promise<Stock | undefined>;
  getTopStocks(limit: number): Promise<Stock[]>;
  getTopGainers(limit: number): Promise<Stock[]>;
  getTopLosers(limit: number): Promise<Stock[]>;
  getMostActive(limit: number): Promise<Stock[]>;
  getStocksByCategory(sector: string, limit: number): Promise<Stock[]>;

  // Watchlist operations
  getWatchlistsForUser(userId: number): Promise<(Watchlist & { stock: Stock })[]>;
  addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, stockId: number): Promise<boolean>;
  isInWatchlist(userId: number, stockId: number): Promise<boolean>;

  // Portfolio operations
  getPositionsForUser(userId: number): Promise<(Position & { stock: Stock })[]>;
  getPosition(userId: number, stockId: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(userId: number, stockId: number, shares: number, averageCost: number): Promise<Position | undefined>;
  deletePosition(userId: number, stockId: number): Promise<boolean>;

  // Trade operations
  getTradesForUser(userId: number): Promise<(Trade & { stock: Stock })[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;

  // News operations
  getAllNews(limit: number): Promise<News[]>;
  getNewsBySymbol(symbol: string, limit: number): Promise<News[]>;

  // Alert operations
  getAlertsForUser(userId: number): Promise<(Alert & { stock: Stock })[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<Alert>): Promise<Alert | undefined>;
  deleteAlert(id: number): Promise<boolean>;

  // Price history operations
  getPriceHistory(stockId: number, interval: string): Promise<PriceHistory[]>;
  addPriceHistoryPoint(point: InsertPriceHistory): Promise<PriceHistory>;
}

export class MemStorage implements IStorage {
  public sessionStore: session.Store;
  private users: Map<number, User>;
  private stocks: Map<number, Stock>;
  private watchlists: Map<number, Watchlist>;
  private positions: Map<number, Position>;
  private trades: Map<number, Trade>;
  private news: Map<number, News>;
  private alerts: Map<number, Alert>;
  private priceHistory: Map<number, PriceHistory>;
  
  private currentIds: {
    users: number;
    stocks: number;
    watchlists: number;
    positions: number;
    trades: number;
    news: number;
    alerts: number;
    priceHistory: number;
  };

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.stocks = new Map();
    this.watchlists = new Map();
    this.positions = new Map();
    this.trades = new Map();
    this.news = new Map();
    this.alerts = new Map();
    this.priceHistory = new Map();
    
    this.currentIds = {
      users: 1,
      stocks: 1,
      watchlists: 1,
      positions: 1,
      trades: 1,
      news: 1,
      alerts: 1,
      priceHistory: 1
    };
    
    // Initialize with some default stocks
    this.initializeStocks();
    this.initializeNews();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const avatarInitials = insertUser.firstName && insertUser.lastName ? 
      `${insertUser.firstName[0]}${insertUser.lastName[0]}` : 
      insertUser.username.substring(0, 2).toUpperCase();
      
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      avatarInitials: avatarInitials || null,
      balance: 10000
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, balance: newBalance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Stock operations
  async getAllStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async getStocksBySymbols(symbols: string[]): Promise<Stock[]> {
    return Array.from(this.stocks.values()).filter(
      (stock) => symbols.includes(stock.symbol)
    );
  }

  async getStock(id: number): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    return Array.from(this.stocks.values()).find(
      (stock) => stock.symbol.toUpperCase() === symbol.toUpperCase()
    );
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const id = this.currentIds.stocks++;
    const now = new Date();
    
    const stock: Stock = { 
      id,
      symbol: insertStock.symbol,
      name: insertStock.name,
      price: insertStock.price,
      previousClose: insertStock.previousClose,
      change: insertStock.change || null,
      changePercent: insertStock.changePercent || null,
      volume: insertStock.volume || null,
      marketCap: insertStock.marketCap || null,
      peRatio: insertStock.peRatio || null,
      dividendYield: insertStock.dividendYield || null,
      high52Week: insertStock.high52Week || null,
      low52Week: insertStock.low52Week || null,
      sector: insertStock.sector || null,
      updatedAt: now
    };
    
    this.stocks.set(id, stock);
    return stock;
  }

  async updateStock(id: number, stockUpdate: Partial<Stock>): Promise<Stock | undefined> {
    const stock = await this.getStock(id);
    if (!stock) return undefined;
    
    const updatedStock = { ...stock, ...stockUpdate, updatedAt: new Date() };
    this.stocks.set(id, updatedStock);
    return updatedStock;
  }

  async getTopStocks(limit: number): Promise<Stock[]> {
    return Array.from(this.stocks.values())
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
      .slice(0, limit);
  }

  async getTopGainers(limit: number): Promise<Stock[]> {
    return Array.from(this.stocks.values())
      .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
      .filter(stock => (stock.changePercent || 0) > 0)
      .slice(0, limit);
  }

  async getTopLosers(limit: number): Promise<Stock[]> {
    return Array.from(this.stocks.values())
      .sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0))
      .filter(stock => (stock.changePercent || 0) < 0)
      .slice(0, limit);
  }

  async getMostActive(limit: number): Promise<Stock[]> {
    return Array.from(this.stocks.values())
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, limit);
  }

  async getStocksByCategory(sector: string, limit: number): Promise<Stock[]> {
    return Array.from(this.stocks.values())
      .filter(stock => stock.sector === sector)
      .slice(0, limit);
  }

  // Watchlist operations
  async getWatchlistsForUser(userId: number): Promise<(Watchlist & { stock: Stock })[]> {
    const watchlistItems = Array.from(this.watchlists.values()).filter(
      (item) => item.userId === userId
    );
    
    return Promise.all(
      watchlistItems.map(async (item) => {
        const stock = await this.getStock(item.stockId);
        return { ...item, stock: stock! };
      })
    );
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    // Check if already exists
    const exists = await this.isInWatchlist(insertWatchlist.userId, insertWatchlist.stockId);
    if (exists) {
      throw new Error("Stock already in watchlist");
    }
    
    const id = this.currentIds.watchlists++;
    const watchlistItem: Watchlist = { ...insertWatchlist, id };
    this.watchlists.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(userId: number, stockId: number): Promise<boolean> {
    const watchlistItem = Array.from(this.watchlists.values()).find(
      item => item.userId === userId && item.stockId === stockId
    );
    
    if (watchlistItem) {
      this.watchlists.delete(watchlistItem.id);
      return true;
    }
    
    return false;
  }

  async isInWatchlist(userId: number, stockId: number): Promise<boolean> {
    return Array.from(this.watchlists.values()).some(
      item => item.userId === userId && item.stockId === stockId
    );
  }

  // Portfolio operations
  async getPositionsForUser(userId: number): Promise<(Position & { stock: Stock })[]> {
    const userPositions = Array.from(this.positions.values()).filter(
      position => position.userId === userId
    );
    
    return Promise.all(
      userPositions.map(async (position) => {
        const stock = await this.getStock(position.stockId);
        return { ...position, stock: stock! };
      })
    );
  }

  async getPosition(userId: number, stockId: number): Promise<Position | undefined> {
    return Array.from(this.positions.values()).find(
      position => position.userId === userId && position.stockId === stockId
    );
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const id = this.currentIds.positions++;
    const position: Position = { ...insertPosition, id };
    this.positions.set(id, position);
    return position;
  }

  async updatePosition(userId: number, stockId: number, shares: number, averageCost: number): Promise<Position | undefined> {
    const position = await this.getPosition(userId, stockId);
    if (!position) return undefined;
    
    const updatedPosition = { ...position, shares, averageCost };
    this.positions.set(position.id, updatedPosition);
    return updatedPosition;
  }

  async deletePosition(userId: number, stockId: number): Promise<boolean> {
    const position = await this.getPosition(userId, stockId);
    if (!position) return false;
    
    this.positions.delete(position.id);
    return true;
  }

  // Trade operations
  async getTradesForUser(userId: number): Promise<(Trade & { stock: Stock })[]> {
    const userTrades = Array.from(this.trades.values()).filter(
      trade => trade.userId === userId
    );
    
    return Promise.all(
      userTrades.map(async (trade) => {
        const stock = await this.getStock(trade.stockId);
        return { ...trade, stock: stock! };
      })
    );
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = this.currentIds.trades++;
    const now = new Date();
    const trade: Trade = { ...insertTrade, id, createdAt: now };
    this.trades.set(id, trade);
    return trade;
  }

  // News operations
  async getAllNews(limit: number): Promise<News[]> {
    return Array.from(this.news.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async getNewsBySymbol(symbol: string, limit: number): Promise<News[]> {
    return Array.from(this.news.values())
      .filter(newsItem => 
        newsItem.relatedSymbols && newsItem.relatedSymbols.includes(symbol)
      )
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  // Alert operations
  async getAlertsForUser(userId: number): Promise<(Alert & { stock: Stock })[]> {
    const userAlerts = Array.from(this.alerts.values()).filter(
      alert => alert.userId === userId
    );
    
    return Promise.all(
      userAlerts.map(async (alert) => {
        const stock = await this.getStock(alert.stockId);
        return { ...alert, stock: stock! };
      })
    );
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentIds.alerts++;
    const now = new Date();
    const alert: Alert = { 
      ...insertAlert, 
      id, 
      triggered: false, 
      createdAt: now 
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: number, alertUpdate: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...alertUpdate };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async deleteAlert(id: number): Promise<boolean> {
    if (!this.alerts.has(id)) return false;
    
    this.alerts.delete(id);
    return true;
  }

  // Price history operations
  async getPriceHistory(stockId: number, interval: string): Promise<PriceHistory[]> {
    const stockHistory = Array.from(this.priceHistory.values()).filter(
      point => point.stockId === stockId
    );
    
    // Sort by timestamp
    return stockHistory.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async addPriceHistoryPoint(insertPoint: InsertPriceHistory): Promise<PriceHistory> {
    const id = this.currentIds.priceHistory++;
    const point: PriceHistory = { 
      id,
      stockId: insertPoint.stockId,
      timestamp: insertPoint.timestamp,
      price: insertPoint.price,
      volume: insertPoint.volume || null
    };
    this.priceHistory.set(id, point);
    return point;
  }

  // Initialize with default data
  private initializeStocks() {
    const defaultStocks: InsertStock[] = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 189.37,
        previousClose: 186.52,
        change: 2.85,
        changePercent: 1.53,
        volume: 54300000,
        marketCap: 2940000000000,
        peRatio: 31.64,
        dividendYield: 0.51,
        high52Week: 199.62,
        low52Week: 124.17,
        sector: "Technology"
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corp.",
        price: 413.94,
        previousClose: 410.37,
        change: 3.57,
        changePercent: 0.87,
        volume: 25200000,
        marketCap: 3080000000000,
        peRatio: 37.12,
        dividendYield: 0.72,
        high52Week: 420.82,
        low52Week: 309.45,
        sector: "Technology"
      },
      {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: 142.89,
        previousClose: 142.00,
        change: 0.89,
        changePercent: 0.63,
        volume: 18750000,
        marketCap: 1780000000000,
        peRatio: 27.35,
        dividendYield: 0.53,
        high52Week: 155.20,
        low52Week: 115.35,
        sector: "Technology"
      },
      {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        price: 178.75,
        previousClose: 176.61,
        change: 2.14,
        changePercent: 1.21,
        volume: 31450000,
        marketCap: 1860000000000,
        peRatio: 68.21,
        dividendYield: 0,
        high52Week: 189.95,
        low52Week: 118.35,
        sector: "Consumer Cyclical"
      },
      {
        symbol: "TSLA",
        name: "Tesla Inc.",
        price: 174.31,
        previousClose: 178.14,
        change: -3.83,
        changePercent: -2.15,
        volume: 85600000,
        marketCap: 555000000000,
        peRatio: 49.25,
        dividendYield: 0,
        high52Week: 278.98,
        low52Week: 152.37,
        sector: "Consumer Cyclical"
      },
      {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        price: 825.31,
        previousClose: 792.84,
        change: 32.47,
        changePercent: 4.10,
        volume: 127000000,
        marketCap: 2030000000000,
        peRatio: 70.15,
        dividendYield: 0.03,
        high52Week: 925.68,
        low52Week: 222.97,
        sector: "Technology"
      },
      {
        symbol: "META",
        name: "Meta Platforms Inc.",
        price: 477.82,
        previousClose: 470.12,
        change: 7.70,
        changePercent: 1.64,
        volume: 15200000,
        marketCap: 1210000000000,
        peRatio: 28.57,
        dividendYield: 0.45,
        high52Week: 485.96,
        low52Week: 258.61,
        sector: "Communication Services"
      },
      {
        symbol: "JPM",
        name: "JPMorgan Chase & Co.",
        price: 196.42,
        previousClose: 193.14,
        change: 3.28,
        changePercent: 1.70,
        volume: 9450000,
        marketCap: 565000000000,
        peRatio: 11.85,
        dividendYield: 2.42,
        high52Week: 205.23,
        low52Week: 135.18,
        sector: "Financial Services"
      },
      {
        symbol: "V",
        name: "Visa Inc.",
        price: 276.35,
        previousClose: 274.82,
        change: 1.53,
        changePercent: 0.56,
        volume: 6125000,
        marketCap: 570000000000,
        peRatio: 31.12,
        dividendYield: 0.76,
        high52Week: 290.96,
        low52Week: 228.78,
        sector: "Financial Services"
      },
      {
        symbol: "WMT",
        name: "Walmart Inc.",
        price: 67.43,
        previousClose: 67.21,
        change: 0.22,
        changePercent: 0.33,
        volume: 12350000,
        marketCap: 542000000000,
        peRatio: 28.75,
        dividendYield: 1.25,
        high52Week: 72.98,
        low52Week: 49.85,
        sector: "Consumer Defensive"
      },
      {
        symbol: "SPY",
        name: "SPDR S&P 500 ETF Trust",
        price: 507.45,
        previousClose: 505.83,
        change: 1.62,
        changePercent: 0.32,
        volume: 56250000,
        marketCap: 476500000000,
        peRatio: 22.34,
        dividendYield: 1.28,
        high52Week: 510.78,
        low52Week: 410.91,
        sector: "Financial Services"
      },
      {
        symbol: "JNJ",
        name: "Johnson & Johnson",
        price: 149.78,
        previousClose: 151.24,
        change: -1.46,
        changePercent: -0.97,
        volume: 7520000,
        marketCap: 359000000000,
        peRatio: 9.35,
        dividendYield: 3.15,
        high52Week: 159.74,
        low52Week: 143.67,
        sector: "Healthcare"
      },
      {
        symbol: "PG",
        name: "Procter & Gamble Co.",
        price: 166.23,
        previousClose: 165.75,
        change: 0.48,
        changePercent: 0.29,
        volume: 4950000,
        marketCap: 392000000000,
        peRatio: 27.24,
        dividendYield: 2.38,
        high52Week: 169.95,
        low52Week: 141.45,
        sector: "Consumer Defensive"
      },
      {
        symbol: "AVGO",
        name: "Broadcom Inc.",
        price: 1452.15,
        previousClose: 1428.95,
        change: 23.20,
        changePercent: 1.62,
        volume: 3210000,
        marketCap: 672000000000,
        peRatio: 62.85,
        dividendYield: 1.78,
        high52Week: 1445.35,
        low52Week: 542.45,
        sector: "Technology"
      },
      {
        symbol: "COST",
        name: "Costco Wholesale Corp.",
        price: 855.87,
        previousClose: 842.32,
        change: 13.55,
        changePercent: 1.61,
        volume: 2250000,
        marketCap: 379000000000,
        peRatio: 53.15,
        dividendYield: 0.58,
        high52Week: 873.35,
        low52Week: 476.75,
        sector: "Consumer Defensive"
      },
      {
        symbol: "PYPL",
        name: "PayPal Holdings Inc.",
        price: 56.68,
        previousClose: 58.72,
        change: -2.04,
        changePercent: -3.47,
        volume: 15650000,
        marketCap: 59800000000,
        peRatio: 15.12,
        dividendYield: 0,
        high52Week: 79.36,
        low52Week: 50.25,
        sector: "Financial Services"
      },
      {
        symbol: "NFLX",
        name: "Netflix Inc.",
        price: 628.75,
        previousClose: 622.42,
        change: 6.33,
        changePercent: 1.02,
        volume: 3450000,
        marketCap: 272000000000,
        peRatio: 43.85,
        dividendYield: 0,
        high52Week: 645.57,
        low52Week: 344.75,
        sector: "Communication Services"
      },
      {
        symbol: "DIS",
        name: "Walt Disney Co.",
        price: 90.52,
        previousClose: 92.74,
        change: -2.22,
        changePercent: -2.39,
        volume: 11250000,
        marketCap: 164000000000,
        peRatio: 98.63,
        dividendYield: 0.88,
        high52Week: 123.74,
        low52Week: 78.73,
        sector: "Communication Services"
      },
      {
        symbol: "AMD",
        name: "Advanced Micro Devices",
        price: 156.38,
        previousClose: 148.76,
        change: 7.62,
        changePercent: 5.12,
        volume: 68000000,
        marketCap: 252000000000,
        peRatio: 148.25,
        dividendYield: 0,
        high52Week: 227.30,
        low52Week: 93.12,
        sector: "Technology"
      },
      {
        symbol: "CRWD",
        name: "CrowdStrike Holdings",
        price: 317.25,
        previousClose: 302.43,
        change: 14.82,
        changePercent: 4.89,
        volume: 31000000,
        marketCap: 76500000000,
        peRatio: 594.31,
        dividendYield: 0,
        high52Week: 365.96,
        low52Week: 117.25,
        sector: "Technology"
      },
      {
        symbol: "SMCI",
        name: "Super Micro Computer",
        price: 842.65,
        previousClose: 812.78,
        change: 29.87,
        changePercent: 3.67,
        volume: 54000000,
        marketCap: 47200000000,
        peRatio: 52.35,
        dividendYield: 0,
        high52Week: 1229.56,
        low52Week: 226.59,
        sector: "Technology"
      },
      {
        symbol: "ENPH",
        name: "Enphase Energy",
        price: 102.45,
        previousClose: 93.55,
        change: 8.90,
        changePercent: 9.51,
        volume: 42000000,
        marketCap: 13900000000,
        peRatio: 53.67,
        dividendYield: 0,
        high52Week: 192.22,
        low52Week: 73.49,
        sector: "Technology"
      },
      {
        symbol: "SHOP",
        name: "Shopify Inc.",
        price: 75.42,
        previousClose: 74.05,
        change: 1.37,
        changePercent: 1.85,
        volume: 8250000,
        marketCap: 97000000000,
        peRatio: 89.14,
        dividendYield: 0,
        high52Week: 91.57,
        low52Week: 45.36,
        sector: "Technology"
      },
      {
        symbol: "DIS",
        name: "Walt Disney Co.",
        price: 115.87,
        previousClose: 114.03,
        change: 1.84,
        changePercent: 1.61,
        volume: 9380000,
        marketCap: 212000000000,
        peRatio: 72.86,
        dividendYield: 0.35,
        high52Week: 123.74,
        low52Week: 78.73,
        sector: "Entertainment"
      },
      {
        symbol: "PYPL",
        name: "PayPal Holdings",
        price: 64.18,
        previousClose: 62.94,
        change: 1.24,
        changePercent: 1.97,
        volume: 11200000,
        marketCap: 67800000000,
        peRatio: 15.28,
        dividendYield: 0,
        high52Week: 79.27,
        low52Week: 50.25,
        sector: "Financial Services"
      },
      {
        symbol: "ABNB",
        name: "Airbnb Inc.",
        price: 159.32,
        previousClose: 155.47,
        change: 3.85,
        changePercent: 2.48,
        volume: 3850000,
        marketCap: 101000000000,
        peRatio: 21.53,
        dividendYield: 0,
        high52Week: 170.10,
        low52Week: 103.55,
        sector: "Travel"
      },
      {
        symbol: "COST",
        name: "Costco Wholesale",
        price: 729.56,
        previousClose: 725.63,
        change: 3.93,
        changePercent: 0.54,
        volume: 1950000,
        marketCap: 324000000000,
        peRatio: 47.65,
        dividendYield: 0.54,
        high52Week: 787.08,
        low52Week: 476.75,
        sector: "Retail"
      },
      {
        symbol: "PFE",
        name: "Pfizer Inc.",
        price: 27.45,
        previousClose: 26.98,
        change: 0.47,
        changePercent: 1.74,
        volume: 27600000,
        marketCap: 155000000000,
        peRatio: 9.15,
        dividendYield: 5.76,
        high52Week: 37.19,
        low52Week: 25.20,
        sector: "Healthcare"
      },
      {
        symbol: "JPM",
        name: "JPMorgan Chase",
        price: 195.43,
        previousClose: 192.57,
        change: 2.86,
        changePercent: 1.49,
        volume: 8200000,
        marketCap: 562000000000,
        peRatio: 11.87,
        dividendYield: 2.23,
        high52Week: 205.88,
        low52Week: 135.19,
        sector: "Financial Services"
      },
      {
        symbol: "NKE",
        name: "Nike Inc.",
        price: 93.68,
        previousClose: 91.95,
        change: 1.73,
        changePercent: 1.88,
        volume: 8520000,
        marketCap: 141000000000,
        peRatio: 27.36,
        dividendYield: 1.51,
        high52Week: 123.39,
        low52Week: 88.66,
        sector: "Consumer Goods"
      },
      {
        symbol: "SBUX",
        name: "Starbucks Corp.",
        price: 84.56,
        previousClose: 83.21,
        change: 1.35,
        changePercent: 1.62,
        volume: 7850000,
        marketCap: 95800000000,
        peRatio: 23.62,
        dividendYield: 2.48,
        high52Week: 107.66,
        low52Week: 71.33,
        sector: "Consumer Services"
      },
      {
        symbol: "AMD",
        name: "Advanced Micro Devices",
        price: 164.93,
        previousClose: 160.75,
        change: 4.18,
        changePercent: 2.60,
        volume: 59200000,
        marketCap: 267000000000,
        peRatio: 180.36,
        dividendYield: 0,
        high52Week: 227.30,
        low52Week: 93.11,
        sector: "Technology"
      },
      {
        symbol: "SHOP",
        name: "Shopify Inc.",
        price: 73.89,
        previousClose: 72.05,
        change: 1.84,
        changePercent: 2.55,
        volume: 9670000,
        marketCap: 94500000000,
        peRatio: 270.61,
        dividendYield: 0,
        high52Week: 91.57,
        low52Week: 45.50,
        sector: "Technology"
      },
      {
        symbol: "SPOT",
        name: "Spotify Technology S.A.",
        price: 312.56,
        previousClose: 309.75,
        change: 2.81,
        changePercent: 0.91,
        volume: 1520000,
        marketCap: 61000000000,
        peRatio: 0,
        dividendYield: 0,
        high52Week: 319.30,
        low52Week: 156.33,
        sector: "Communication Services"
      },
      {
        symbol: "SQ",
        name: "Block Inc.",
        price: 69.48,
        previousClose: 67.23,
        change: 2.25,
        changePercent: 3.35,
        volume: 8520000,
        marketCap: 42500000000,
        peRatio: 83.71,
        dividendYield: 0,
        high52Week: 87.55,
        low52Week: 38.85,
        sector: "Financial Services"
      },
      {
        symbol: "ABNB",
        name: "Airbnb Inc.",
        price: 147.72,
        previousClose: 146.51,
        change: 1.21,
        changePercent: 0.83,
        volume: 3560000,
        marketCap: 93500000000,
        peRatio: 39.86,
        dividendYield: 0,
        high52Week: 170.10,
        low52Week: 103.55,
        sector: "Consumer Cyclical"
      },
      {
        symbol: "COIN",
        name: "Coinbase Global Inc.",
        price: 218.34,
        previousClose: 214.89,
        change: 3.45,
        changePercent: 1.61,
        volume: 10280000,
        marketCap: 52000000000,
        peRatio: 155.24,
        dividendYield: 0,
        high52Week: 283.48,
        low52Week: 46.43,
        sector: "Financial Services"
      },
      {
        symbol: "SNAP",
        name: "Snap Inc.",
        price: 15.64,
        previousClose: 15.42,
        change: 0.22,
        changePercent: 1.43,
        volume: 19340000,
        marketCap: 25500000000,
        peRatio: 0,
        dividendYield: 0,
        high52Week: 17.90,
        low52Week: 8.22,
        sector: "Communication Services"
      },
      {
        symbol: "PLTR",
        name: "Palantir Technologies Inc.",
        price: 22.14,
        previousClose: 21.56,
        change: 0.58,
        changePercent: 2.69,
        volume: 47500000,
        marketCap: 48000000000,
        peRatio: 221.40,
        dividendYield: 0,
        high52Week: 27.50,
        low52Week: 9.27,
        sector: "Technology"
      },
      {
        symbol: "DASH",
        name: "DoorDash Inc.",
        price: 120.82,
        previousClose: 119.37,
        change: 1.45,
        changePercent: 1.21,
        volume: 2950000,
        marketCap: 49000000000,
        peRatio: 0,
        dividendYield: 0,
        high52Week: 143.34,
        low52Week: 69.90,
        sector: "Consumer Cyclical"
      },
      {
        symbol: "ZM",
        name: "Zoom Video Communications",
        price: 62.05,
        previousClose: 61.48,
        change: 0.57,
        changePercent: 0.93,
        volume: 2830000,
        marketCap: 18800000000,
        peRatio: 132.02,
        dividendYield: 0,
        high52Week: 75.90,
        low52Week: 58.87,
        sector: "Technology"
      },
      {
        symbol: "ENPH",
        name: "Enphase Energy",
        price: 118.46,
        previousClose: 114.80,
        change: 3.66,
        changePercent: 3.19,
        volume: 3860000,
        marketCap: 16100000000,
        peRatio: 38.35,
        dividendYield: 0,
        high52Week: 228.36,
        low52Week: 73.49,
        sector: "Technology"
      },
      {
        symbol: "RIVN",
        name: "Rivian Automotive Inc.",
        price: 10.84,
        previousClose: 10.65,
        change: 0.19,
        changePercent: 1.78,
        volume: 24750000,
        marketCap: 10500000000,
        peRatio: 0,
        dividendYield: 0,
        high52Week: 24.61,
        low52Week: 8.26,
        sector: "Consumer Cyclical"
      },
      {
        symbol: "SOFI",
        name: "SoFi Technologies Inc.",
        price: 7.53,
        previousClose: 7.38,
        change: 0.15,
        changePercent: 2.03,
        volume: 33450000,
        marketCap: 7400000000,
        peRatio: 0,
        dividendYield: 0,
        high52Week: 11.70,
        low52Week: 4.45,
        sector: "Financial Services"
      },
      {
        symbol: "HOOD",
        name: "Robinhood Markets Inc.",
        price: 19.53,
        previousClose: 19.15,
        change: 0.38,
        changePercent: 1.98,
        volume: 14530000,
        marketCap: 17700000000,
        peRatio: 0,
        dividendYield: 0,
        high52Week: 20.55,
        low52Week: 7.91,
        sector: "Financial Services"
      },
      {
        symbol: "PINS",
        name: "Pinterest Inc.",
        price: 38.15,
        previousClose: 37.68,
        change: 0.47,
        changePercent: 1.25,
        volume: 9230000,
        marketCap: 26400000000,
        peRatio: 92.94,
        dividendYield: 0,
        high52Week: 41.60,
        low52Week: 20.60,
        sector: "Communication Services"
      }
    ];

    // Add all stocks to storage
    defaultStocks.forEach(stock => {
      this.createStock(stock);
    });

    // Generate price history for ALL stocks
    // Iterate through all stocks and generate price history
    Array.from(this.stocks.values()).forEach(stock => {
      this.generatePriceHistory(stock.id);
    });
  }

  private generatePriceHistory(stockId: number) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(9, 30, 0, 0); // Market open at 9:30 AM
    
    const endDate = new Date(now);
    endDate.setHours(16, 0, 0, 0); // Market close at 4:00 PM
    
    // Get the stock's current price as the starting point
    const stock = this.stocks.get(stockId);
    if (!stock) return;
    
    // Generate price points for today
    let currentPrice = stock.price; // Starting price from the stock
    let timestamp = new Date(startDate);
    let lastVolume = stock.volume || 1000000;
    
    while (timestamp <= endDate) {
      // Random price movement
      const priceChange = (Math.random() - 0.4) * 0.5; // Slightly biased upward
      currentPrice += priceChange;
      
      // Random volume
      const volumeChange = Math.random() * 0.2 - 0.1;
      const volume = Math.max(100000, Math.round(lastVolume * (1 + volumeChange)));
      lastVolume = volume;
      
      const point: InsertPriceHistory = {
        stockId,
        timestamp: new Date(timestamp),
        price: currentPrice,
        volume
      };
      
      this.addPriceHistoryPoint(point);
      
      // Advance by 5 minutes
      timestamp = new Date(timestamp.getTime() + 5 * 60 * 1000);
    }
  }

  private initializeNews() {
    const newsItems = [
      {
        title: "Fed signals potential rate cuts as inflation continues to cool",
        summary: "The Federal Reserve indicated it may begin cutting interest rates soon as inflation shows signs of easing across multiple sectors.",
        url: "https://example.com/news/1",
        imageUrl: "",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        relatedSymbols: ["JPM", "GS", "MS"]
      },
      {
        title: "NVIDIA unveils next-gen AI chips, shares jump 4%",
        summary: "NVIDIA announced its latest generation of AI accelerator chips, promising 2x performance gains over previous models.",
        url: "https://example.com/news/2",
        imageUrl: "",
        source: "CNBC",
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        relatedSymbols: ["NVDA", "AMD", "INTC"]
      },
      {
        title: "Apple supplier Foxconn sees strong Q2 growth on AI demand",
        summary: "Foxconn reported better-than-expected quarterly profits as AI server demand offset sluggish smartphone sales.",
        url: "https://example.com/news/3",
        imageUrl: "",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        relatedSymbols: ["AAPL", "NVDA", "TSM"]
      },
      {
        title: "Tesla cuts prices in China amid increasing competition",
        summary: "Tesla has reduced prices on its Model Y and Model 3 vehicles in China as local EV makers gain market share.",
        url: "https://example.com/news/4",
        imageUrl: "",
        source: "Wall Street Journal",
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        relatedSymbols: ["TSLA", "NIO", "XPEV"]
      },
      {
        title: "Amazon expands healthcare offerings with new pharmacy features",
        summary: "Amazon announced new features for its pharmacy service, increasing competition with traditional pharmacies.",
        url: "https://example.com/news/5",
        imageUrl: "",
        source: "The Verge",
        publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
        relatedSymbols: ["AMZN", "CVS", "WBA"]
      },
      {
        title: "Shopify reports record-breaking holiday shopping season",
        summary: "E-commerce platform Shopify announced its merchants achieved record sales during the holiday season, with mobile purchases surpassing desktop for the first time.",
        url: "https://example.com/news/6",
        imageUrl: "",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
        relatedSymbols: ["SHOP", "AMZN", "WMT"]
      },
      {
        title: "Disney+ subscriber growth exceeds expectations in Q1",
        summary: "Walt Disney Co. reported stronger-than-anticipated streaming subscriber growth, helping its shares climb amid a challenging media landscape.",
        url: "https://example.com/news/7",
        imageUrl: "",
        source: "Variety",
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        relatedSymbols: ["DIS", "NFLX", "PARA"]
      },
      {
        title: "PayPal introduces new AI-powered fraud detection system",
        summary: "PayPal Holdings unveiled an advanced fraud prevention system leveraging artificial intelligence to identify suspicious transactions with greater accuracy.",
        url: "https://example.com/news/8",
        imageUrl: "",
        source: "TechCrunch",
        publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30 hours ago
        relatedSymbols: ["PYPL", "V", "MA"]
      },
      {
        title: "Airbnb launches new features for long-term rentals",
        summary: "Airbnb introduced new tools designed for long-term stays, catering to remote workers and digital nomads seeking accommodations for weeks or months.",
        url: "https://example.com/news/9",
        imageUrl: "",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
        relatedSymbols: ["ABNB", "EXPE", "MAR"]
      },
      {
        title: "Costco membership fees expected to increase this year",
        summary: "Analysts predict Costco Wholesale will raise its membership fees in 2025, potentially boosting revenue amid competitive retail environment.",
        url: "https://example.com/news/10",
        imageUrl: "",
        source: "CNBC",
        publishedAt: new Date(Date.now() - 40 * 60 * 60 * 1000), // 40 hours ago
        relatedSymbols: ["COST", "WMT", "TGT"]
      },
      {
        title: "Coinbase revenue surges on crypto market rebound",
        summary: "Cryptocurrency exchange Coinbase reported quarterly revenue that more than doubled, benefiting from increased trading volumes and the rise in crypto prices.",
        url: "https://example.com/news/11",
        imageUrl: "",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 44 * 60 * 60 * 1000),
        relatedSymbols: ["COIN", "SQ", "PYPL"]
      },
      {
        title: "Microsoft AI investments drive record cloud revenue",
        summary: "Microsoft reported record Azure cloud revenue as its investments in artificial intelligence continue to pay off with strong enterprise adoption.",
        url: "https://example.com/news/12",
        imageUrl: "",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        relatedSymbols: ["MSFT", "AMZN", "GOOGL"]
      },
      {
        title: "Pinterest shares surge on strong user growth and ad revenue",
        summary: "Pinterest stock jumped after the company reported better-than-expected user growth and advertising revenue, particularly in international markets.",
        url: "https://example.com/news/13",
        imageUrl: "",
        source: "The Wall Street Journal",
        publishedAt: new Date(Date.now() - 52 * 60 * 60 * 1000),
        relatedSymbols: ["PINS", "META", "SNAP"]
      },
      {
        title: "Palantir wins major government contract for AI solutions",
        summary: "Palantir Technologies secured a significant multi-year contract to provide AI-powered data analytics solutions to a major government agency.",
        url: "https://example.com/news/14",
        imageUrl: "",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 56 * 60 * 60 * 1000),
        relatedSymbols: ["PLTR", "MSFT", "CRM"]
      },
      {
        title: "SoFi reports first quarterly profit as banking services expand",
        summary: "SoFi Technologies achieved its first quarterly profit since going public, driven by growth in its banking services and personal loan business.",
        url: "https://example.com/news/15",
        imageUrl: "",
        source: "CNBC",
        publishedAt: new Date(Date.now() - 60 * 60 * 60 * 1000),
        relatedSymbols: ["SOFI", "LC", "PYPL"]
      },
      {
        title: "Spotify introduces AI-powered personalized playlists",
        summary: "Spotify launched a new AI feature that creates highly customized playlists based on user listening habits and text prompts.",
        url: "https://example.com/news/16",
        imageUrl: "",
        source: "TechCrunch",
        publishedAt: new Date(Date.now() - 64 * 60 * 60 * 1000),
        relatedSymbols: ["SPOT", "AAPL", "AMZN"]
      },
      {
        title: "Rivian partners with major charging network to enhance EV experience",
        summary: "Electric vehicle maker Rivian announced a partnership with a leading charging network to improve charging accessibility for its customers.",
        url: "https://example.com/news/17",
        imageUrl: "",
        source: "The Verge",
        publishedAt: new Date(Date.now() - 68 * 60 * 60 * 1000),
        relatedSymbols: ["RIVN", "TSLA", "F"]
      },
      {
        title: "Block's Cash App drives strong revenue growth",
        summary: "Block, Inc. reported better-than-expected quarterly results as its Cash App product continued to gain users and drive transaction revenue.",
        url: "https://example.com/news/18",
        imageUrl: "",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        relatedSymbols: ["SQ", "PYPL", "COIN"]
      },
      {
        title: "DoorDash expands into non-food delivery services",
        summary: "DoorDash announced expansion of its delivery platform to include retail products beyond food, partnering with major national retailers.",
        url: "https://example.com/news/19",
        imageUrl: "",
        source: "CNBC",
        publishedAt: new Date(Date.now() - 76 * 60 * 60 * 1000),
        relatedSymbols: ["DASH", "UBER", "AMZN"]
      },
      {
        title: "Zoom introduces AI assistant for meeting summaries and actions",
        summary: "Zoom Video Communications launched an AI assistant that automatically generates meeting summaries and identifies action items from recorded meetings.",
        url: "https://example.com/news/20",
        imageUrl: "",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 80 * 60 * 60 * 1000),
        relatedSymbols: ["ZM", "TEAM", "MSFT"]
      }
    ];

    newsItems.forEach(news => {
      const id = this.currentIds.news++;
      this.news.set(id, { 
        id,
        title: news.title, 
        summary: news.summary, 
        url: news.url, 
        publishedAt: news.publishedAt,
        imageUrl: news.imageUrl || null,
        source: news.source || null,
        relatedSymbols: news.relatedSymbols || null
      });
    });
  }
}

export const storage = new MemStorage();
