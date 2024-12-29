import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Watchlist, WatchlistStock } from "@/types/watchlist";

interface StockListProps {
  selectedWatchlist: Watchlist | null;
  stocks: WatchlistStock[];
  onStocksChanged: () => void;
}

export const StockList = ({ selectedWatchlist, stocks, onStocksChanged }: StockListProps) => {
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

  const deleteStock = async (stockId: string) => {
    const { error } = await supabase
      .from('watchlist_stocks')
      .delete()
      .eq('id', stockId);

    if (error) {
      toast.error("Error deleting stock");
      return;
    }

    toast.success("Stock removed successfully");
    onStocksChanged();
  };

  return (
    <>
      <div className="flex gap-2">
        <Input
          placeholder="Add ticker symbols (separate by comma or space)"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
        />
        <Button onClick={addStock}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {stocks.map((stock) => (
          <div
            key={stock.id}
            className="flex items-center justify-between p-2 border rounded-md"
          >
            <span className="font-mono">{stock.ticker}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteStock(stock.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};