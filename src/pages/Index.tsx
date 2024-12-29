import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Watchlist, WatchlistStock } from "@/types/watchlist";
import { WatchlistCreate } from "@/components/watchlist/WatchlistCreate";
import { WatchlistList } from "@/components/watchlist/WatchlistList";
import { StockList } from "@/components/watchlist/StockList";

const Index = () => {
  const session = useSession();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);

  const fetchWatchlists = async () => {
    try {
      // First, get the user's default watchlist ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('default_watchlist_id')
        .eq('id', session?.user?.id)
        .single();

      // Then fetch all watchlists
      const { data: watchlistsData, error: watchlistsError } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at');

      if (watchlistsError) throw watchlistsError;

      // Mark default watchlist
      const watchlistsWithDefault = watchlistsData?.map(watchlist => ({
        ...watchlist,
        is_default: watchlist.id === profileData?.default_watchlist_id
      })) || [];

      setWatchlists(watchlistsWithDefault);

      // Select default watchlist or first watchlist
      const defaultWatchlist = watchlistsWithDefault.find(w => w.is_default) || watchlistsWithDefault[0];
      if (defaultWatchlist && !selectedWatchlist) {
        setSelectedWatchlist(defaultWatchlist);
        fetchStocks(defaultWatchlist.id);
      }
    } catch (error) {
      console.error('Error fetching watchlists:', error);
    }
  };

  const fetchStocks = async (watchlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('watchlist_stocks')
        .select('*')
        .eq('watchlist_id', watchlistId)
        .order('created_at');

      if (error) throw error;
      setStocks(data || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchWatchlists();
    }
  }, [session?.user]);

  const handleWatchlistSelect = (watchlist: Watchlist) => {
    setSelectedWatchlist(watchlist);
    fetchStocks(watchlist.id);
  };

  const handleWatchlistsChanged = () => {
    fetchWatchlists();
  };

  const handleStocksChanged = () => {
    if (selectedWatchlist) {
      fetchStocks(selectedWatchlist.id);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        <div className="space-y-4">
          <WatchlistCreate onWatchlistCreated={handleWatchlistsChanged} />
          <WatchlistList
            watchlists={watchlists}
            selectedWatchlist={selectedWatchlist}
            onSelectWatchlist={handleWatchlistSelect}
            onWatchlistDeleted={handleWatchlistsChanged}
          />
        </div>
        <StockList
          selectedWatchlist={selectedWatchlist}
          stocks={stocks}
          onStocksChanged={handleStocksChanged}
        />
      </div>
    </div>
  );
};

export default Index;