import { WatchlistStock } from "@/types/watchlist";
import { StockItem } from "./StockItem";

interface StockListDisplayProps {
  stocks: WatchlistStock[];
  onStocksChanged: () => void;
}

export const StockListDisplay = ({ stocks, onStocksChanged }: StockListDisplayProps) => {
  return (
    <div className="space-y-2">
      {stocks.map((stock) => (
        <StockItem
          key={stock.id}
          stock={stock}
          onDelete={onStocksChanged}
        />
      ))}
    </div>
  );
};