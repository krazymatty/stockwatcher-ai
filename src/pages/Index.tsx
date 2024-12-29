import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Watchlist {
  id: string;
  name: string;
  created_at: string;
}

interface WatchlistStock {
  id: string;
  ticker: string;
  created_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newTicker, setNewTicker] = useState("");

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUserEmail();
    fetchWatchlists();
  }, []);

  useEffect(() => {
    if (selectedWatchlist) {
      fetchStocks(selectedWatchlist.id);
    }
  }, [selectedWatchlist]);

  const fetchWatchlists = async () => {
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

  const createWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      toast.error("Please enter a watchlist name");
      return;
    }

    const { data, error } = await supabase
      .from('watchlists')
      .insert([{ name: newWatchlistName }])
      .select()
      .single();

    if (error) {
      toast.error("Error creating watchlist");
      return;
    }

    setNewWatchlistName("");
    toast.success("Watchlist created successfully");
    fetchWatchlists();
  };

  const addStock = async () => {
    if (!selectedWatchlist) {
      toast.error("Please select a watchlist first");
      return;
    }

    if (!newTicker.trim()) {
      toast.error("Please enter a ticker symbol");
      return;
    }

    const { error } = await supabase
      .from('watchlist_stocks')
      .insert([{
        watchlist_id: selectedWatchlist.id,
        ticker: newTicker.toUpperCase()
      }]);

    if (error) {
      toast.error("Error adding stock");
      return;
    }

    setNewTicker("");
    toast.success("Stock added successfully");
    fetchStocks(selectedWatchlist.id);
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
    if (selectedWatchlist) {
      fetchStocks(selectedWatchlist.id);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
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
            <div className="flex gap-2">
              <Input
                placeholder="New watchlist name"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
              />
              <Button onClick={createWatchlist}>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </div>
            <div className="space-y-2">
              {watchlists.map((watchlist) => (
                <Button
                  key={watchlist.id}
                  variant={selectedWatchlist?.id === watchlist.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedWatchlist(watchlist)}
                >
                  {watchlist.name}
                </Button>
              ))}
            </div>
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
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add ticker symbol"
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;