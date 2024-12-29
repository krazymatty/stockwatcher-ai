import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { WatchlistStock } from "@/types/watchlist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StockItemProps {
  stock: WatchlistStock;
  onDelete: () => void;
}

export const StockItem = ({ stock, onDelete }: StockItemProps) => {
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
    <div className="flex items-center justify-between p-2 border rounded-md">
      <span className="font-mono">{stock.ticker}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={deleteStock}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};