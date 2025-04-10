import { User } from "@shared/schema";
import { defaultMockPortfolio } from "@/lib/mock-data";
import { useLocation } from "wouter";
import { TrendingUp, Zap, LineChart, BarChart3, BadgePercent, ArrowRight } from "lucide-react";
import { useState } from "react";

// Components
import PortfolioSummary from "@/components/dashboard/portfolio-summary";
import WatchlistPreview from "@/components/dashboard/watchlist-preview";
import MarketMovers from "@/components/dashboard/market-movers";
import NewsFeed from "@/components/dashboard/news-feed";
import TopStocks from "@/components/dashboard/top-stocks";
import { AccountBalanceCard } from "@/components/funds/account-balance-card";
import { Button } from "@/components/ui/button";

type DashboardProps = {
  user: User | null;
};

export default function Dashboard({ user }: DashboardProps) {
  const [, navigate] = useLocation();
  const [balance, setBalance] = useState(0);
  
  // We use the defaultMockPortfolio for the initial load
  // In a real implementation, we would fetch this data from the server
  const portfolio = defaultMockPortfolio;

  return (
    <div className="px-4 md:px-6 pb-20 md:pb-6">
      {/* Hero Banner */}
      <div className="w-full relative mb-6 overflow-hidden rounded-xl">
        <div className="bg-gradient-to-r from-primary/20 to-blue-500/10 glass backdrop-blur-md rounded-xl border border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-10 md:py-16 relative">
            <div className="absolute top-0 right-0 w-full h-full">
              <div className="absolute top-10 right-20 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-10 left-20 w-40 h-40 bg-blue-500/20 rounded-full filter blur-3xl"></div>
            </div>
            
            <div className="relative z-10 max-w-xl">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 glow-text bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Invest Now for a Greater Future
              </h1>
              <p className="text-lg mb-6 text-white/80">
                Take control of your financial destiny with advanced trading tools and real-time market insights designed for tomorrow's investors.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="cyberpunk-button"
                  onClick={() => navigate('/markets')}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Discover Markets
                </Button>
                <Button variant="outline" className="glass border-white/20 hover:bg-white/10" onClick={() => navigate('/auth')}>
                  <LineChart className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl border border-white/10 p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Trending Markets</h3>
          </div>
          <p className="text-sm text-white/70 mb-3">Top performing sectors today</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Technology</span>
              <span className="text-green-400 text-sm">+2.45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Healthcare</span>
              <span className="text-green-400 text-sm">+1.87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Energy</span>
              <span className="text-red-400 text-sm">-0.54%</span>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl border border-white/10 p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <BadgePercent className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="font-semibold">Trading Opportunity</h3>
          </div>
          <p className="text-sm text-white/70 mb-3">Highest potential return</p>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">NVDA</span>
            <span className="text-green-400 font-semibold">+4.3%</span>
          </div>
          <p className="text-xs text-white/60">AI semiconductors leading market rally with significant institutional buying.</p>
          <Button variant="link" size="sm" className="text-primary px-0 mt-2">
            View Analysis <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        
        <div className="glass rounded-xl border border-white/10 p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-semibold">Portfolio Health</h3>
          </div>
          <p className="text-sm text-white/70 mb-3">Your diversification score</p>
          <div className="w-full bg-white/10 rounded-full h-2.5 mb-2">
            <div className="bg-gradient-to-r from-primary to-blue-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-xs text-white/60 mb-2">85/100 - Well diversified across 6 sectors</p>
          <Button variant="link" size="sm" className="text-primary px-0 mt-1">
            Optimize Portfolio <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Account Balance Card */}
      <div className="mb-6">
        <AccountBalanceCard 
          balance={balance} 
          onBalanceChange={setBalance} 
        />
      </div>
      
      {/* Watchlist & Market Movers Section - Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass rounded-xl border border-white/10 p-4 backdrop-blur-sm">
          <WatchlistPreview user={user} />
        </div>
        <div className="glass rounded-xl border border-white/10 p-4 backdrop-blur-sm">
          <MarketMovers />
        </div>
      </div>
      
      {/* Latest News Section */}
      <div className="glass rounded-xl border border-white/10 p-4 backdrop-blur-sm mb-8">
        <NewsFeed />
      </div>
      
      {/* Top 50 Stocks Section */}
      <div className="glass rounded-xl border border-white/10 p-4 backdrop-blur-sm">
        <TopStocks />
      </div>


    </div>
  );
}
