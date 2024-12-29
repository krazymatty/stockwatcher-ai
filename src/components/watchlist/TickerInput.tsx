import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Watchlist } from "@/types/watchlist";

interface TickerInputProps {
  selectedWatchlist: Watchlist;
  onStocksChanged: () => void;
}

export const TickerInput = ({ selectedWatchlist, onStocksChanged }: TickerInputProps) => {
  const [newTicker, setNewTicker] = useState("");

  const addStock = async () => {
    if (!selectedWatchlist) {
      toast.error("Please select a watchlist first");
      return;
    }

    if (!newTicker.trim()) {
      toast.error("Please enter ticker symbol(s)");
      return;
    }

    // Split the input by commas and/or spaces and filter out empty strings
    const tickers = newTicker
      .toUpperCase()
      .split(/[,\s]+/)
      .filter(ticker => ticker.length > 0);

    let hasError = false;
    let addedCount = 0;

    for (const ticker of tickers) {
      const { error } = await supabase
        .from('watchlist_stocks')
        .insert({
          watchlist_id: selectedWatchlist.id,
          ticker: ticker
        });

      if (error) {
        hasError = true;
        toast.error(`Error adding ${ticker}`);
      } else {
        addedCount++;
      }
    }

    if (addedCount > 0) {
      setNewTicker("");
      toast.success(`Successfully added ${addedCount} ticker${addedCount > 1 ? 's' : ''}`);
      onStocksChanged();
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