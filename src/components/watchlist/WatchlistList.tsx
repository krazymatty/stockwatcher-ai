import { Button } from "@/components/ui/button";
import { Watchlist } from "@/types/watchlist";

interface WatchlistListProps {
  watchlists: Watchlist[];
  selectedWatchlist: Watchlist | null;
  onSelectWatchlist: (watchlist: Watchlist) => void;
}

export const WatchlistList = ({ 
  watchlists, 
  selectedWatchlist, 
  onSelectWatchlist 
}: WatchlistListProps) => {
  return (
    <div className="space-y-2">
      {watchlists.map((watchlist) => (
        <Button
          key={watchlist.id}
          variant={selectedWatchlist?.id === watchlist.id ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => onSelectWatchlist(watchlist)}
        >
          {watchlist.name}
        </Button>
      ))}
    </div>
  );
};