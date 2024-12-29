import { Button } from "@/components/ui/button";
import { RefreshCw, Trash } from "lucide-react";

interface StockActionsProps {
  ticker: string;
  onDelete: (ticker: string) => void;
  onUpdate: (ticker: string) => void;
  isUpdating: boolean;
}

export const StockActions = ({ ticker, onDelete, onUpdate, isUpdating }: StockActionsProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onUpdate(ticker);
        }}
        disabled={isUpdating}
      >
        <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(ticker);
        }}
      >
        <Trash className="h-3 w-3" />
      </Button>
    </div>
  );
};