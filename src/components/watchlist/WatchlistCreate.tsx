import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const WatchlistCreate = ({ onWatchlistCreated }: { onWatchlistCreated: () => void }) => {
  const [newWatchlistName, setNewWatchlistName] = useState("");

  const createWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      toast.error("Please enter a watchlist name");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a watchlist");
      return;
    }

    const { error } = await supabase
      .from('watchlists')
      .insert({
        name: newWatchlistName,
        user_id: user.id
      });

    if (error) {
      toast.error("Error creating watchlist");
      return;
    }

    setNewWatchlistName("");
    toast.success("Watchlist created successfully");
    onWatchlistCreated();
  };

  return (
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
  );
};