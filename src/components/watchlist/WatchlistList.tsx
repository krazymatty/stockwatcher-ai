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

  const handleSetDefaultWatchlist = async (watchlistId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          default_watchlist_id: watchlistId,
          updated_at: new Date().toISOString()
        })
        .eq('id', session?.user?.id);

      if (error) throw error;
      toast.success('Default watchlist updated');
    } catch (error) {
      console.error('Error updating default watchlist:', error);
      toast.error('Failed to update default watchlist');
    }
  };

  return (
    <div className="space-y-2">
      {watchlists.map((watchlist) => (
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
            onClick={() => handleSetDefaultWatchlist(watchlist.id)}
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