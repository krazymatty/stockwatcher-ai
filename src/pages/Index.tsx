import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Watchlist, WatchlistStock } from "@/types/watchlist";
import { WatchlistCreate } from "@/components/watchlist/WatchlistCreate";
import { WatchlistList } from "@/components/watchlist/WatchlistList";
import { StockList } from "@/components/watchlist/StockList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StockHistoricalChart } from "@/components/admin/StockHistoricalChart";

const Index = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);
  const [activeTicker, setActiveTicker] = useState<string>("");
  const [manualTicker, setManualTicker] = useState<string>("");
  const session = useSession();

  const fetchWatchlists = async () => {
    if (!session?.user?.id) return;

    try {
      // First, get the user's profile to check for default watchlist
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('default_watchlist_id')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Then fetch all watchlists
      const { data: watchlistsData, error: watchlistsError } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at');

      if (watchlistsError) {
        console.error('Error fetching watchlists:', watchlistsError);
        return;
      }

      // Transform the data to include is_default flag
      const transformedWatchlists = watchlistsData.map(watchlist => ({
        ...watchlist,
        is_default: watchlist.id === profileData?.default_watchlist_id
      }));

      setWatchlists(transformedWatchlists);

      // If there's no selected watchlist, select the default one or the first one
      if (!selectedWatchlist) {
        const defaultWatchlist = transformedWatchlists.find(w => w.is_default);
        setSelectedWatchlist(defaultWatchlist || transformedWatchlists[0] || null);
      }
    } catch (error) {
      console.error('Error in fetchWatchlists:', error);
    }
  };

  const fetchStocks = async () => {
    if (!selectedWatchlist) return;

    try {
      const { data: stocksData, error: stocksError } = await supabase
        .from('watchlist_stocks')
        .select('*')
        .eq('watchlist_id', selectedWatchlist.id);

      if (stocksError) {
        console.error('Error fetching stocks:', stocksError);
        return;
      }

      setStocks(stocksData);
    } catch (error) {
      console.error('Error in fetchStocks:', error);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, [session?.user?.id]);

  useEffect(() => {
    fetchStocks();
  }, [selectedWatchlist]);

  // Set the first stock as active when stocks are loaded or changed
  useEffect(() => {
    if (stocks.length > 0 && !activeTicker) {
      setActiveTicker(stocks[0].ticker);
    }
  }, [stocks]);

  const handleTickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTicker.trim()) {
      setActiveTicker(manualTicker.toUpperCase());
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Chart Section */}
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Chart</h2>
          <form onSubmit={handleTickerSubmit} className="flex gap-2">
            <Input
              placeholder="Enter ticker symbol"
              value={manualTicker}
              onChange={(e) => setManualTicker(e.target.value)}
              className="w-40"
            />
            <Button type="submit">Load Chart</Button>
          </form>
        </div>
        {activeTicker && (
          <div className="border rounded-lg p-4">
            <StockHistoricalChart ticker={activeTicker} />
          </div>
        )}
      </div>

      {/* Watchlists and Stocks Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column - Watchlists */}
        <div className="w-full md:w-1/3 space-y-4">
          <h2 className="text-2xl font-bold">Watchlists</h2>
          <WatchlistCreate onWatchlistCreated={fetchWatchlists} />
          <WatchlistList
            watchlists={watchlists}
            selectedWatchlist={selectedWatchlist}
            onSelectWatchlist={setSelectedWatchlist}
            onWatchlistDeleted={fetchWatchlists}
          />
        </div>

        {/* Right column - Stocks */}
        <div className="w-full md:w-2/3 space-y-4">
          <h2 className="text-2xl font-bold">Stocks</h2>
          <StockList
            selectedWatchlist={selectedWatchlist}
            stocks={stocks}
            onStocksChanged={fetchStocks}
            onSelectTicker={setActiveTicker}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;