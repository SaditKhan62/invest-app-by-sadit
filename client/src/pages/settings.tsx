import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Moon, Sun, User as UserIcon, Shield, CreditCard, Lock, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [theme, setTheme] = useState("dark");
  
  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);
  
  // Handle theme change
  useEffect(() => {
    document.documentElement.className = theme === "dark" 
      ? "dark"
      : "light";
    
    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);
  const [notifications, setNotifications] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(true);
  const [chartType, setChartType] = useState("candle");
  const [timeZone, setTimeZone] = useState("UTC");
  const [currency, setCurrency] = useState("USD");
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully",
    });
  };

  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-white/60">Manage your account settings and preferences</p>
        </div>
        <Button onClick={handleSaveSettings} className="cyberpunk-button">
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="account" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Monitor className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Transactions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={user?.firstName || "Sadit"} className="bg-black/30 border-white/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={user?.lastName || "Khan"} className="bg-black/30 border-white/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user?.email || "sadit.khan@example.com"} className="bg-black/30 border-white/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={user?.username || "saditk"} className="bg-black/30 border-white/20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-white/60">
                      Select your preferred theme
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-white/60" />
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                    <Moon className="h-5 w-5 text-white/60" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="bg-black/30 border-white/20 w-full">
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candle">Candlestick</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger className="bg-black/30 border-white/20 w-full">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="CST">Central Time (CST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      <SelectItem value="IST">India (IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-black/30 border-white/20 w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">All Notifications</Label>
                    <p className="text-sm text-white/60">
                      Enable or disable all notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Market Alerts</Label>
                    <p className="text-sm text-white/60">
                      Receive notifications about market movements
                    </p>
                  </div>
                  <Switch
                    checked={marketAlerts}
                    onCheckedChange={setMarketAlerts}
                    disabled={!notifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Price Alerts</Label>
                    <p className="text-sm text-white/60">
                      Receive notifications when prices hit your targets
                    </p>
                  </div>
                  <Switch
                    checked={priceAlerts}
                    onCheckedChange={setPriceAlerts}
                    disabled={!notifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">News Alerts</Label>
                    <p className="text-sm text-white/60">
                      Receive notifications about important news
                    </p>
                  </div>
                  <Switch
                    checked={newsAlerts}
                    onCheckedChange={setNewsAlerts}
                    disabled={!notifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" className="bg-black/30 border-white/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" className="bg-black/30 border-white/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" className="bg-black/30 border-white/20" />
                </div>
                <Button className="cyberpunk-button w-full">
                  Update Password
                </Button>
                <div className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Two-Factor Authentication</Label>
                      <p className="text-sm text-white/60">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline" className="bg-transparent border-white/20 text-primary">
                      <Shield className="mr-2 h-4 w-4" />
                      Setup 2FA
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View your trading activity and transaction details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg">Recent Trades</h3>
                  <div className="bg-white/5 rounded-lg p-4 mt-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded mr-4">
                            <span className="text-xs font-bold">AAPL</span>
                          </div>
                          <div>
                            <p className="font-medium">Apple Inc.</p>
                            <p className="text-sm text-white/60">Apr 05, 2025 at 11:42 AM</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">Buy 5 shares</p>
                          <p className="text-sm">$189.84/share</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded mr-4">
                            <span className="text-xs font-bold">MSFT</span>
                          </div>
                          <div>
                            <p className="font-medium">Microsoft Corp.</p>
                            <p className="text-sm text-white/60">Apr 03, 2025 at 2:15 PM</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">Buy 3 shares</p>
                          <p className="text-sm">$425.55/share</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded mr-4">
                            <span className="text-xs font-bold">TSLA</span>
                          </div>
                          <div>
                            <p className="font-medium">Tesla Inc.</p>
                            <p className="text-sm text-white/60">Apr 02, 2025 at 10:35 AM</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-400">Sell 2 shares</p>
                          <p className="text-sm">$175.20/share</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded mr-4">
                            <span className="text-xs font-bold">GOOGL</span>
                          </div>
                          <div>
                            <p className="font-medium">Alphabet Inc.</p>
                            <p className="text-sm text-white/60">Mar 29, 2025 at 3:22 PM</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">Buy 1 share</p>
                          <p className="text-sm">$152.78/share</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 bg-transparent border-white/20 text-primary">
                    View All Trades
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg">Funds Activity</h3>
                  <div className="bg-white/5 rounded-lg p-4 mt-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <div>
                          <p className="font-medium">Apr 04, 2025</p>
                          <p className="text-sm text-white/60">Deposit</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">+$1,000.00</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <div>
                          <p className="font-medium">Mar 15, 2025</p>
                          <p className="text-sm text-white/60">Withdrawal</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-400">-$500.00</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Mar 01, 2025</p>
                          <p className="text-sm text-white/60">Deposit</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">+$2,000.00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}