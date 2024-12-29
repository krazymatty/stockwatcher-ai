import { Button } from "@/components/ui/button";
import { Trash2, LineChart } from "lucide-react";
import { WatchlistStock } from "@/types/watchlist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StockHistoricalChart } from "@/components/admin/StockHistoricalChart";

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
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="font-mono">
            {stock.ticker}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historical Data for {stock.ticker}</DialogTitle>
          </DialogHeader>
          <StockHistoricalChart ticker={stock.ticker} />
        </DialogContent>
      </Dialog>
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