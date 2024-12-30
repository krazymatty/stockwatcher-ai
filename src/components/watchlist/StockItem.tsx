import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { WatchlistStock } from "@/types/watchlist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StockItemProps {
  stock: WatchlistStock;
  onDelete: () => void;
  onSelect: () => void;
}

export const StockItem = ({ stock, onDelete, onSelect }: StockItemProps) => {
  const deleteStock = async () => {
    const { error } = await supabase
      .from('watchlist_stocks')
      .delete()
      .eq('id', stock.id);

    if (error) {
      toast.error("Error deleting stock");
      return;
    }

    toast.success("Stock removed successfully");
    onDelete();
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div 
        onClick={onSelect}
        className="flex-1 p-1 font-mono text-sm border rounded-md hover:bg-accent cursor-pointer transition-colors"
      >
        {stock.ticker}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={deleteStock}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};