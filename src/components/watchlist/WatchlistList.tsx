import { Button } from "@/components/ui/button";
import { Watchlist } from "@/types/watchlist";
import { DeleteWatchlistDialog } from "./DeleteWatchlistDialog";
import { Pin, PinOff } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WatchlistListProps {
  watchlists: Watchlist[];
  selectedWatchlist: Watchlist | null;
  onSelectWatchlist: (watchlist: Watchlist) => void;
  onWatchlistDeleted: () => void;
}

export const WatchlistList = ({ 
  watchlists, 
  selectedWatchlist, 
  onSelectWatchlist,
  onWatchlistDeleted
}: WatchlistListProps) => {
  const session = useSession();

  const handleSetDefaultWatchlist = async (watchlist: Watchlist) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to set a default watchlist");
      return;
    }

    try {
      // Update the profiles table with the new default watchlist
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          default_watchlist_id: watchlist.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // Select the watchlist to make it active
      onSelectWatchlist({
        ...watchlist,
        is_default: true
      });

      toast.success('Default watchlist updated');
    } catch (error) {
      console.error('Error updating default watchlist:', error);
      toast.error('Failed to update default watchlist');
    }
  };

  // Sort watchlists: default first, then alphabetically
  const sortedWatchlists = [...watchlists].sort((a, b) => {
    if (a.is_default) return -1;
    if (b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-2">
      {sortedWatchlists.map((watchlist) => (
        <div key={watchlist.id} className="flex items-center gap-2">
          <Button
            variant={selectedWatchlist?.id === watchlist.id ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => onSelectWatchlist(watchlist)}
          >
            {watchlist.name}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleSetDefaultWatchlist(watchlist)}
            className="shrink-0"
          >
            {watchlist.is_default ? (
              <Pin className="h-4 w-4 text-primary" />
            ) : (
              <PinOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <DeleteWatchlistDialog 
            watchlist={watchlist}
            onWatchlistDeleted={onWatchlistDeleted}
          />
        </div>
      ))}
    </div>
  );
};