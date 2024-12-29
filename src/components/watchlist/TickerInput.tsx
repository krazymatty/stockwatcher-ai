import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Watchlist } from "@/types/watchlist";
import { useSession } from "@supabase/auth-helpers-react";

interface TickerInputProps {
  selectedWatchlist: Watchlist;
  onStocksChanged: () => void;
}

export const TickerInput = ({ selectedWatchlist, onStocksChanged }: TickerInputProps) => {
  const [newTicker, setNewTicker] = useState("");
  const session = useSession();

  const addStock = async () => {
    if (!session) {
      toast.error("Please sign in to add stocks");
      return;
    }

    if (!selectedWatchlist) {
      toast.error("Please select a watchlist first");
      return;
    }

    if (!newTicker.trim()) {
      toast.error("Please enter ticker symbol(s)");
      return;
    }

    // Get user's profile first to get the username
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();

    const username = profileData?.username || session.user.email;

    // Split the input by commas and/or spaces and filter out empty strings
    const tickers = newTicker
      .toUpperCase()
      .split(/[,\s]+/)
      .filter(ticker => ticker.length > 0);

    // Check for existing tickers in the watchlist
    const { data: existingStocks } = await supabase
      .from('watchlist_stocks')
      .select('ticker')
      .eq('watchlist_id', selectedWatchlist.id);

    const existingTickers = new Set(existingStocks?.map(stock => stock.ticker) || []);
    
    let hasError = false;
    let addedCount = 0;
    let duplicateCount = 0;

    for (const ticker of tickers) {
      if (existingTickers.has(ticker)) {
        duplicateCount++;
        continue;
      }

      try {
        // First, try to add to master_stocks if it doesn't exist
        const { error: masterStocksError } = await supabase
          .from('master_stocks')
          .upsert({ 
            ticker,
            user_id: session.user.id,
            created_by_email: username
          });

        if (masterStocksError) {
          console.error("Error adding to master_stocks:", masterStocksError);
          hasError = true;
          continue;
        }

        // Then add to watchlist_stocks
        const { error: watchlistStocksError } = await supabase
          .from('watchlist_stocks')
          .insert({
            watchlist_id: selectedWatchlist.id,
            ticker: ticker
          });

        if (watchlistStocksError) {
          console.error("Error adding stock:", watchlistStocksError);
          hasError = true;
          toast.error(`Error adding ${ticker}`);
        } else {
          addedCount++;
        }
      } catch (error) {
        console.error("Error in stock addition process:", error);
        hasError = true;
        toast.error(`Error processing ${ticker}`);
      }
    }

    if (addedCount > 0) {
      setNewTicker("");
      toast.success(`Successfully added ${addedCount} ticker${addedCount > 1 ? 's' : ''}`);
      onStocksChanged();
    }

    if (duplicateCount > 0) {
      toast.error(`${duplicateCount} ticker${duplicateCount > 1 ? 's were' : ' was'} already in the watchlist`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addStock();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Add ticker symbols (separate by comma or space)"
        value={newTicker}
        onChange={(e) => setNewTicker(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <Button onClick={addStock}>
        <Plus className="mr-2 h-4 w-4" />
        Add
      </Button>
    </div>
  );
};