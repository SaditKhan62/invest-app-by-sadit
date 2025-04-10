import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import Dashboard from "@/pages/dashboard";
import StockDetail from "@/pages/stock-detail";
import Watchlist from "@/pages/watchlist";
import Portfolio from "@/pages/portfolio";
import Markets from "@/pages/markets";
import News from "@/pages/news";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import SettingsPage from "@/pages/settings";
import HelpPage from "@/pages/help";
import EarnPage from "@/pages/earn";

// Components
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Header from "@/components/layout/header";

function Router() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Main layout is now the same for both logged in and non-logged in users
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <Sidebar user={user} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation - Desktop only */}
        <Header user={user} />
        
        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto py-4">
          <Switch>
            <Route path="/" component={() => <Dashboard user={user} />} />
            <Route path="/stock/:symbol" component={StockDetail} />
            <Route path="/watchlist" component={() => <Watchlist user={user} />} />
            <Route path="/portfolio" component={() => <Portfolio user={user} />} />
            <Route path="/markets" component={Markets} />
            <Route path="/earn" component={EarnPage} />
            <Route path="/news" component={News} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/help" component={HelpPage} />
            <Route path="/auth" component={AuthPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNavigation location={location} />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
