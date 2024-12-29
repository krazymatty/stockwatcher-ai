import { WatchlistStock } from "@/types/watchlist";
import { StockItem } from "./StockItem";

interface StockListDisplayProps {
  stocks: WatchlistStock[];
  onStocksChanged: () => void;
}

export const StockListDisplay = ({ stocks, onStocksChanged }: StockListDisplayProps) => {
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
        />
      ))}
    </div>
  );
};