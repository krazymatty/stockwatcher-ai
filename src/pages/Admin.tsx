import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { MasterStocksList } from "@/components/admin/MasterStocksList";
import { AddTickerForm } from "@/components/admin/AddTickerForm";
import { UpdateMasterListButton } from "@/components/admin/UpdateMasterListButton";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { fetchAndStoreHistoricalData } from "@/utils/stockData";
import { getStockStatus } from "@/utils/stockStatus";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

type MasterStock = Database["public"]["Tables"]["master_stocks"]["Row"];

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUpdatingHistorical, setIsUpdatingHistorical] = useState(false);
  const [failedTickers, setFailedTickers] = useState<string[]>([]);

  const { data: stocks, refetch } = useQuery({
    queryKey: ["master-stocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_stocks")
        .select("*")
        .order("ticker");
      if (error) throw error;
      return data as MasterStock[];
    },
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email?.endsWith("@philmatthews.net")) {
        setIsAdmin(true);
      }
    };
    checkAdminStatus();
  }, []);

  const updateHistoricalData = async () => {
    if (!stocks?.length) {
      toast.error("No stocks in master list");
      return;
    }

    setIsUpdatingHistorical(true);
    setFailedTickers([]);
    let successCount = 0;
    let failedTickers: string[] = [];

    try {
      // First, check the status of all stocks
      const stocksWithStatus = await Promise.all(
        stocks.map(async (stock) => ({
          ...stock,
          status: await getStockStatus(stock.ticker),
        }))
      );

      // Filter stocks that need updating (yellow or red status)
      const stocksToUpdate = stocksWithStatus.filter(
        stock => stock.status === "yellow" || stock.status === "red"
      );

      if (stocksToUpdate.length === 0) {
        toast.info("No stocks need updating");
        setIsUpdatingHistorical(false);
        return;
      }

      // Update only the filtered stocks
      for (const stock of stocksToUpdate) {
        try {
          await fetchAndStoreHistoricalData(stock.ticker);
          successCount++;
        } catch (error) {
          console.error(`Failed to fetch data for ${stock.ticker}:`, error);
          failedTickers.push(stock.ticker);
        }
      }

      if (successCount > 0) {
        toast.success(`Updated historical data for ${successCount} stocks`);
      }
      
      if (failedTickers.length > 0) {
        setFailedTickers(failedTickers);
        toast.error(`Failed to update ${failedTickers.length} stocks`);
      }
    } finally {
      setIsUpdatingHistorical(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Master Stocks List</h1>
        <div className="flex gap-4">
          <UpdateMasterListButton refetch={refetch} />
          <Button 
            variant="outline"
            onClick={updateHistoricalData}
            disabled={isUpdatingHistorical}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isUpdatingHistorical ? 'animate-spin' : ''}`} />
            Update Historical Data
          </Button>
        </div>
      </div>

      {failedTickers.length > 0 && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to fetch data for some tickers</AlertTitle>
          <AlertDescription>
            The following tickers failed to fetch: {failedTickers.join(", ")}. 
            This might be because the tickers don't exist or there was an API error.
          </AlertDescription>
        </Alert>
      )}

      <AddTickerForm refetch={refetch} />
      <MasterStocksList stocks={stocks} refetch={refetch} />
    </div>
  );
};

export default Admin;