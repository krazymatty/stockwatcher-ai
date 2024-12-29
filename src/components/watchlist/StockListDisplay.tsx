import { WatchlistStock } from "@/types/watchlist";
import { StockItem } from "./StockItem";

interface StockListDisplayProps {
  stocks: WatchlistStock[];
  onStocksChanged: () => void;
  onSelectTicker: (ticker: string) => void;
}

export const StockListDisplay = ({ 
  stocks, 
  onStocksChanged,
  onSelectTicker 
}: StockListDisplayProps) => {
  // Sort stocks alphabetically by ticker
  const sortedStocks = [...stocks].sort((a, b) => 
    a.ticker.localeCompare(b.ticker)
  );

  return (
    <div className="space-y-2">
      {sortedStocks.map((stock) => (
        <StockItem
          key={stock.id}
          stock={stock}
          onDelete={onStocksChanged}
          onSelect={() => onSelectTicker(stock.ticker)}
        />
      ))}
    </div>
  );
};