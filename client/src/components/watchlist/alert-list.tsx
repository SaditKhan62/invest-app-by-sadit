import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { AlertCircle, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchUserAlerts, createAlert, deleteAlert, fetchUserWatchlist } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { User, Alert as AlertType, Stock, Watchlist } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type AlertListProps = {
  user: User | null;
};

export default function AlertList({ user }: AlertListProps) {
  const [alertType, setAlertType] = useState<"price_above" | "price_below" | "percent_change">("price_above");
  const [stockId, setStockId] = useState<number | null>(null);
  const [value, setValue] = useState<string>("");
  const { toast } = useToast();
  
  // Get user alerts
  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/alerts`] : [],
    queryFn: () => user ? fetchUserAlerts(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  // Get watchlist to select stocks for alerts
  const { data: watchlist } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/watchlist`] : [],
    queryFn: () => user ? fetchUserWatchlist(user.id) : Promise.resolve([]),
    enabled: !!user
  });
  
  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: (alertData: { userId: number, stockId: number, type: "price_above" | "price_below" | "percent_change", value: number }) => 
      createAlert(alertData.userId, alertData),
    onSuccess: () => {
      toast({
        title: "Alert created",
        description: "You will be notified when the condition is met.",
      });
      // Reset form
      setStockId(null);
      setValue("");
      // Refetch alerts
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to create alert",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Delete alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: (alertId: number) => deleteAlert(alertId),
    onSuccess: () => {
      toast({
        title: "Alert deleted",
        description: "The alert has been removed.",
      });
      // Refetch alerts
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to delete alert",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle alert creation
  const handleCreateAlert = () => {
    if (!user || !stockId || !value) {
      toast({
        title: "Missing information",
        description: "Please select a stock and enter a value.",
        variant: "destructive",
      });
      return;
    }
    
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      toast({
        title: "Invalid value",
        description: "Please enter a valid number.",
        variant: "destructive",
      });
      return;
    }
    
    createAlertMutation.mutate({
      userId: user.id,
      stockId,
      type: alertType,
      value: numericValue
    });
  };

  return (
    <div>
      {/* Create New Alert */}
      <div className="bg-dark-700 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Create Price Alert</h2>
        
        <div className="grid gap-4">
          <div>
            <label className="block text-sm text-light-400 mb-1">Stock</label>
            <Select onValueChange={(value) => setStockId(parseInt(value))}>
              <SelectTrigger className="bg-dark-600 border-dark-500">
                <SelectValue placeholder="Select a stock" />
              </SelectTrigger>
              <SelectContent className="bg-dark-700 border-dark-500">
                {watchlist && watchlist.length > 0 ? (
                  watchlist.map((item: Watchlist & { stock: Stock }) => (
                    <SelectItem key={item.stockId} value={item.stockId.toString()}>
                      {item.stock.symbol} - {item.stock.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No stocks in watchlist
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm text-light-400 mb-1">Alert Type</label>
            <Select 
              defaultValue={alertType} 
              onValueChange={(value: "price_above" | "price_below" | "percent_change") => setAlertType(value)}
            >
              <SelectTrigger className="bg-dark-600 border-dark-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-700 border-dark-500">
                <SelectItem value="price_above">Price Above</SelectItem>
                <SelectItem value="price_below">Price Below</SelectItem>
                <SelectItem value="percent_change">Percent Change</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm text-light-400 mb-1">Value</label>
            <Input 
              type="number" 
              placeholder={alertType === "percent_change" ? "e.g. 5 for 5%" : "e.g. 150.00"}
              className="bg-dark-600 border-dark-500"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleCreateAlert}
            disabled={createAlertMutation.isPending || !stockId || !value}
          >
            {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
          </Button>
        </div>
      </div>
      
      {/* Existing Alerts */}
      <div className="bg-dark-700 rounded-lg overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b border-dark-600">Your Alerts</h2>
        
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 border-b border-dark-600 animate-pulse">
              <div className="h-5 w-40 bg-dark-600 rounded mb-2"></div>
              <div className="h-4 w-60 bg-dark-600 rounded"></div>
            </div>
          ))
        ) : alerts && alerts.length > 0 ? (
          alerts.map((alert: AlertType & { stock: Stock }) => (
            <div key={alert.id} className="p-4 border-b border-dark-600 flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-primary mr-2" />
                  <Link 
                    to={`/stock/${alert.stock.symbol}`}
                    className="font-medium hover:underline cursor-pointer"
                  >
                    {alert.stock.symbol}
                  </Link>
                  <span className="text-light-500 ml-2">({alert.stock.name})</span>
                </div>
                <div className="text-light-400 text-sm mt-1">
                  {alert.type === "price_above" && `Alert when price is above ${formatCurrency(alert.value)}`}
                  {alert.type === "price_below" && `Alert when price is below ${formatCurrency(alert.value)}`}
                  {alert.type === "percent_change" && `Alert when price changes by ${alert.value}%`}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => deleteAlertMutation.mutate(alert.id)}
                disabled={deleteAlertMutation.isPending}
              >
                <BellOff className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-light-500">
            <Alert className="bg-dark-600 border-dark-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No alerts set up</AlertTitle>
              <AlertDescription>
                Create alerts to be notified when stocks hit your target prices.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
