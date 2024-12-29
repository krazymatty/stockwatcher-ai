import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface UpdateMasterListButtonProps {
  refetch: () => void;
}

export const UpdateMasterListButton = ({ refetch }: UpdateMasterListButtonProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const session = useSession();

  const handleUpdateMasterList = async () => {
    setIsUpdating(true);
    try {
      // Get all unique tickers from active watchlists
      const { data: watchlistStocks, error: fetchError } = await supabase
        .from('watchlist_stocks')
        .select('ticker, watchlist_id, watchlists!inner(id)')
        .order('ticker');

      if (fetchError) throw fetchError;

      // Remove duplicates using Set
      const uniqueTickers = [...new Set(watchlistStocks?.map(stock => stock.ticker))];

      // Get current master stocks
      const { data: currentMasterStocks, error: masterError } = await supabase
        .from('master_stocks')
        .select('ticker');

      if (masterError) throw masterError;

      // Find new tickers that aren't in master_stocks
      const currentTickers = new Set(currentMasterStocks.map(stock => stock.ticker));
      const newTickers = uniqueTickers.filter(ticker => !currentTickers.has(ticker));

      if (newTickers.length === 0) {
        toast.info("Master list is already up to date");
        return;
      }

      // Add new tickers to master_stocks
      const { error: insertError } = await supabase
        .from('master_stocks')
        .insert(
          newTickers.map((ticker) => ({
            ticker,
            user_id: session?.user?.id,
            created_by_email: session?.user?.email
          }))
        );

      if (insertError) throw insertError;

      toast.success(`Added ${newTickers.length} new tickers to master list`);
      refetch();
    } catch (error) {
      console.error("Error updating master list:", error);
      toast.error("Failed to update master list");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button 
      onClick={handleUpdateMasterList} 
      disabled={isUpdating}
      variant="outline"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
      Update Master List
    </Button>
  );
};