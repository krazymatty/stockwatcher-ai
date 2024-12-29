import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WatchlistCreate } from "@/components/watchlist/WatchlistCreate";
import { WatchlistList } from "@/components/watchlist/WatchlistList";
import { StockList } from "@/components/watchlist/StockList";
import { Watchlist, WatchlistStock } from "@/types/watchlist";

const Index = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserEmail(user?.email || null);
    };
    getUserEmail();
    fetchWatchlists();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchWatchlists = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Error fetching watchlists");
      return;
    }
    setWatchlists(data);
  };

  const fetchStocks = async (watchlistId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from('watchlist_stocks')
      .select('*')
      .eq('watchlist_id', watchlistId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Error fetching stocks");
      return;
    }
    setStocks(data);
  };

  useEffect(() => {
    if (selectedWatchlist) {
      fetchStocks(selectedWatchlist.id);
    }
  }, [selectedWatchlist]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Error signing out");
        return;
      }
      // The navigation will be handled by the auth state change listener
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground">StockWatcher AI</h1>
          <p className="text-muted-foreground">Track and analyze your favorite stocks</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{userEmail}</span>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Watchlists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WatchlistCreate onWatchlistCreated={fetchWatchlists} />
            <WatchlistList
              watchlists={watchlists}
              selectedWatchlist={selectedWatchlist}
              onSelectWatchlist={setSelectedWatchlist}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedWatchlist ? `Stocks in ${selectedWatchlist.name}` : 'Select a watchlist'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedWatchlist && (
              <StockList
                selectedWatchlist={selectedWatchlist}
                stocks={stocks}
                onStocksChanged={() => fetchStocks(selectedWatchlist.id)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;