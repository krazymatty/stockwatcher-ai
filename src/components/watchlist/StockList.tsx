import { Watchlist, WatchlistStock } from "@/types/watchlist";
import { TickerInput } from "./TickerInput";
import { StockListDisplay } from "./StockListDisplay";

interface StockListProps {
  selectedWatchlist: Watchlist | null;
  stocks: WatchlistStock[];
  onStocksChanged: () => void;
  onSelectTicker: (ticker: string) => void;
}

export const StockList = ({ 
  selectedWatchlist, 
  stocks, 
  onStocksChanged,
  onSelectTicker 
}: StockListProps) => {
  if (!selectedWatchlist) {
    return null;
  }

  return (
    <>
      <TickerInput
        selectedWatchlist={selectedWatchlist}
        onStocksChanged={onStocksChanged}
      />
      <StockListDisplay
        stocks={stocks}
        onStocksChanged={onStocksChanged}
        onSelectTicker={onSelectTicker}
      />
    </>
  );
};