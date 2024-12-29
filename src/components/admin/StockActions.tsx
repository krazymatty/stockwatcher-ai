import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, RefreshCw, Trash } from "lucide-react";
import { StockHistoricalChart } from "./StockHistoricalChart";
import { useState } from "react";

interface StockActionsProps {
  ticker: string;
  onDelete: (ticker: string) => void;
  onUpdate: (ticker: string) => void;
  isUpdating: boolean;
}

export const StockActions = ({ ticker, onDelete, onUpdate, isUpdating }: StockActionsProps) => {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedTicker(ticker)}
          >
            <LineChart className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historical Data for {ticker}</DialogTitle>
            <DialogDescription>
              View historical price and volume data for {ticker}
            </DialogDescription>
          </DialogHeader>
          {selectedTicker === ticker && (
            <StockHistoricalChart ticker={ticker} />
          )}
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onUpdate(ticker)}
        disabled={isUpdating}
      >
        <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(ticker)}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};