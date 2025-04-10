import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWatchlistSchema, insertTradeSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // User-specific route for profile details
  app.get("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Stock routes
  app.get("/api/stocks", async (_req: Request, res: Response) => {
    try {
      const stocks = await storage.getAllStocks();
      res.status(200).json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  app.get("/api/stocks/top", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const stocks = await storage.getTopStocks(limit);
      res.status(200).json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top stocks" });
    }
  });

  app.get("/api/stocks/gainers", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const stocks = await storage.getTopGainers(limit);
      res.status(200).json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top gainers" });
    }
  });

  app.get("/api/stocks/losers", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const stocks = await storage.getTopLosers(limit);
      res.status(200).json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top losers" });
    }
  });

  app.get("/api/stocks/active", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const stocks = await storage.getMostActive(limit);
      res.status(200).json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch most active stocks" });
    }
  });

  app.get("/api/stocks/sector/:sector", async (req: Request, res: Response) => {
    try {
      const { sector } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const stocks = await storage.getStocksByCategory(sector, limit);
      res.status(200).json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stocks by sector" });
    }
  });

  app.get("/api/stocks/:symbol", async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const stock = await storage.getStockBySymbol(symbol);
      
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.status(200).json(stock);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock" });
    }
  });

  // Price history routes
  app.get("/api/stocks/:symbol/history", async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const interval = req.query.interval as string || "1d";
      
      const stock = await storage.getStockBySymbol(symbol);
      
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      const history = await storage.getPriceHistory(stock.id, interval);
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price history" });
    }
  });

  // Watchlist routes
  app.get("/api/users/:userId/watchlist", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const watchlist = await storage.getWatchlistsForUser(userId);
      res.status(200).json(watchlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/users/:userId/watchlist", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { stockId } = req.body;
      
      if (!stockId) {
        return res.status(400).json({ message: "Stock ID is required" });
      }
      
      const watchlistData = insertWatchlistSchema.parse({ userId, stockId });
      
      try {
        const newWatchlistItem = await storage.addToWatchlist(watchlistData);
        const stock = await storage.getStock(stockId);
        
        res.status(201).json({ ...newWatchlistItem, stock });
      } catch (error) {
        if (error instanceof Error && error.message === "Stock already in watchlist") {
          return res.status(400).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid watchlist data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/users/:userId/watchlist/:stockId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const stockId = parseInt(req.params.stockId);
      
      if (isNaN(userId) || isNaN(stockId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }
      
      const removed = await storage.removeFromWatchlist(userId, stockId);
      
      if (!removed) {
        return res.status(404).json({ message: "Item not found in watchlist" });
      }
      
      res.status(200).json({ message: "Removed from watchlist" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Portfolio routes
  app.get("/api/users/:userId/portfolio", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const positions = await storage.getPositionsForUser(userId);
      res.status(200).json(positions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Trading routes
  app.post("/api/users/:userId/trades", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { stockId, type, shares, price } = req.body;
      
      if (!stockId || !type || !shares || !price) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const stock = await storage.getStock(stockId);
      
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      const total = shares * price;
      const tradeData = insertTradeSchema.parse({
        userId,
        stockId,
        type,
        shares,
        price,
        total
      });
      
      // Check if user has enough funds for buy
      if (type === "buy" && user.balance < total) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // For sell, check if user has enough shares
      if (type === "sell") {
        const position = await storage.getPosition(userId, stockId);
        
        if (!position || position.shares < shares) {
          return res.status(400).json({ message: "Insufficient shares" });
        }
      }
      
      // Update user balance
      let newBalance = user.balance;
      if (type === "buy") {
        newBalance -= total;
      } else {
        newBalance += total;
      }
      
      await storage.updateUserBalance(userId, newBalance);
      
      // Update position
      const existingPosition = await storage.getPosition(userId, stockId);
      
      if (type === "buy") {
        if (existingPosition) {
          // Update existing position with new average cost
          const totalShares = existingPosition.shares + shares;
          const totalCost = (existingPosition.shares * existingPosition.averageCost) + total;
          const averageCost = totalCost / totalShares;
          
          await storage.updatePosition(userId, stockId, totalShares, averageCost);
        } else {
          // Create new position
          await storage.createPosition({
            userId,
            stockId,
            shares,
            averageCost: price
          });
        }
      } else {
        // Sell - reduce position
        if (existingPosition) {
          const newShares = existingPosition.shares - shares;
          
          if (newShares <= 0) {
            // Remove position entirely
            await storage.deletePosition(userId, stockId);
          } else {
            // Update with reduced shares (keep average cost)
            await storage.updatePosition(userId, stockId, newShares, existingPosition.averageCost);
          }
        }
      }
      
      // Create trade record
      const newTrade = await storage.createTrade(tradeData);
      
      res.status(201).json({
        trade: newTrade,
        newBalance,
        stock
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trade data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process trade" });
    }
  });

  app.get("/api/users/:userId/trades", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const trades = await storage.getTradesForUser(userId);
      res.status(200).json(trades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  // News routes
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const news = await storage.getAllNews(limit);
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get("/api/news/stock/:symbol", async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const news = await storage.getNewsBySymbol(symbol, limit);
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock news" });
    }
  });

  // Alerts routes
  app.get("/api/users/:userId/alerts", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const alerts = await storage.getAlertsForUser(userId);
      res.status(200).json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/users/:userId/alerts", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { stockId, type, value } = req.body;
      
      if (!stockId || !type || value === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const alertData = insertAlertSchema.parse({
        userId,
        stockId,
        type,
        value
      });
      
      const newAlert = await storage.createAlert(alertData);
      const stock = await storage.getStock(stockId);
      
      res.status(201).json({ ...newAlert, stock });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.delete("/api/alerts/:id", async (req: Request, res: Response) => {
    try {
      const alertId = parseInt(req.params.id);
      
      if (isNaN(alertId)) {
        return res.status(400).json({ message: "Invalid alert ID" });
      }
      
      const deleted = await storage.deleteAlert(alertId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.status(200).json({ message: "Alert deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
