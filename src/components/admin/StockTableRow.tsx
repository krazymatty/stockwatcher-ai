import { TableCell, TableRow } from "@/components/ui/table";
import { StockStatusIndicator } from "./StockStatusIndicator";
import { StockActions } from "./StockActions";
import { MasterStock } from "./types";

interface StockTableRowProps {
  stock: MasterStock;
  isUpdating: boolean;
  onDelete: (ticker: string) => void;
  onUpdate: (ticker: string) => void;
  onSelect: () => void;
}

export const StockTableRow = ({ 
  stock, 
  isUpdating, 
  onDelete, 
  onUpdate,
  onSelect
}: StockTableRowProps) => {
  return (
    <TableRow className="h-6 hover:bg-muted/50 cursor-pointer" onClick={onSelect}>
      <TableCell className="py-0.5">
        <StockStatusIndicator status={stock.status || "red"} />
      </TableCell>
      <TableCell className="py-0.5 font-medium text-sm">
        {stock.ticker}
      </TableCell>
      <TableCell className="py-0.5">
        <StockActions
          ticker={stock.ticker}
          onDelete={onDelete}
          onUpdate={onUpdate}
          isUpdating={isUpdating}
        />
      </TableCell>
    </TableRow>
  );
};