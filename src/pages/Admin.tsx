import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { MasterStocksList } from "@/components/admin/MasterStocksList";
import { AddTickerForm } from "@/components/admin/AddTickerForm";
import { UpdateMasterListButton } from "@/components/admin/UpdateMasterListButton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { fetchAndStoreHistoricalData } from "@/utils/stockData";

type MasterStock = Database["public"]["Tables"]["master_stocks"]["Row"];

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUpdatingHistorical, setIsUpdatingHistorical] = useState(false);

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
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const stock of stocks) {
        try {
          await fetchAndStoreHistoricalData(stock.ticker);
          successCount++;
        } catch (error) {
          console.error(`Failed to fetch data for ${stock.ticker}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Updated historical data for ${successCount} stocks`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} stocks`);
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

      <AddTickerForm refetch={refetch} />
      <MasterStocksList stocks={stocks} refetch={refetch} />
    </div>
  );
};

export default Admin;