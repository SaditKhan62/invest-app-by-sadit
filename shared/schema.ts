import { pgTable, text, serial, integer, doublePrecision, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarInitials: text("avatar_initials"),
  balance: doublePrecision("balance").notNull().default(10000),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  balance: true,
});

// Stock schema
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  previousClose: doublePrecision("previous_close").notNull(),
  change: doublePrecision("change"),
  changePercent: doublePrecision("change_percent"),
  volume: integer("volume"),
  marketCap: doublePrecision("market_cap"),
  peRatio: doublePrecision("pe_ratio"),
  dividendYield: doublePrecision("dividend_yield"),
  high52Week: doublePrecision("high_52_week"),
  low52Week: doublePrecision("low_52_week"),
  sector: text("sector"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  updatedAt: true,
});

// Watchlist schema
export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
});

export const insertWatchlistSchema = createInsertSchema(watchlists).omit({
  id: true,
});

// Portfolio / Positions schema
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
  shares: doublePrecision("shares").notNull(),
  averageCost: doublePrecision("average_cost").notNull(),
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
});

// Trade schema
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
  type: text("type").notNull(), // "buy" or "sell"
  shares: doublePrecision("shares").notNull(),
  price: doublePrecision("price").notNull(),
  total: doublePrecision("total").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  createdAt: true,
});

// News schema
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  source: text("source"),
  publishedAt: timestamp("published_at").notNull(),
  relatedSymbols: text("related_symbols").array(),
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
});

// Alert schema
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
  type: text("type").notNull(), // "price_above", "price_below", "percent_change"
  value: doublePrecision("value").notNull(),
  triggered: boolean("triggered").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  triggered: true,
  createdAt: true,
});

// Stock price history
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
  timestamp: timestamp("timestamp").notNull(),
  price: doublePrecision("price").notNull(),
  volume: integer("volume"),
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;

export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;

export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
