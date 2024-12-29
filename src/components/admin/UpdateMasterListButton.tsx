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

      // Get current master stocks
      const { data: currentMasterStocks, error: masterError } = await supabase
        .from('master_stocks')
        .select('ticker');

      if (masterError) throw masterError;

      // Create sets for easier comparison
      const activeWatchlistTickers = new Set(watchlistStocks?.map(stock => stock.ticker));
      const masterTickers = new Set(currentMasterStocks.map(stock => stock.ticker));

      // Find tickers to add (in watchlists but not in master)
      const tickersToAdd = [...activeWatchlistTickers].filter(ticker => !masterTickers.has(ticker));

      // Find tickers to remove (in master but not in any watchlist)
      const tickersToRemove = [...masterTickers].filter(ticker => !activeWatchlistTickers.has(ticker));

      // Add new tickers
      if (tickersToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('master_stocks')
          .insert(
            tickersToAdd.map((ticker) => ({
              ticker,
              user_id: session?.user?.id,
              created_by_email: session?.user?.email
            }))
          );

        if (insertError) throw insertError;
      }

      // Remove orphaned tickers
      if (tickersToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('master_stocks')
          .delete()
          .in('ticker', tickersToRemove);

        if (deleteError) throw deleteError;
      }

      // Show appropriate toast message
      if (tickersToAdd.length === 0 && tickersToRemove.length === 0) {
        toast.info("Master list is already up to date");
      } else {
        const addedMsg = tickersToAdd.length > 0 ? `Added ${tickersToAdd.length} new tickers` : '';
        const removedMsg = tickersToRemove.length > 0 ? `Removed ${tickersToRemove.length} orphaned tickers` : '';
        const message = [addedMsg, removedMsg].filter(Boolean).join(' and ');
        toast.success(message);
      }

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