import { Button } from "@/components/ui/button";
import { Watchlist } from "@/types/watchlist";
import { DeleteWatchlistDialog } from "./DeleteWatchlistDialog";

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
          <DeleteWatchlistDialog 
            watchlist={watchlist}
            onWatchlistDeleted={onWatchlistDeleted}
          />
        </div>
      ))}
    </div>
  );
};