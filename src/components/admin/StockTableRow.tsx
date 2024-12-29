import { TableCell, TableRow } from "@/components/ui/table";
import { StockStatusIndicator } from "./StockStatusIndicator";
import { StockActions } from "./StockActions";
import { MasterStock } from "./types";

interface StockTableRowProps {
  stock: MasterStock;
  isUpdating: boolean;
  onDelete: (ticker: string) => void;
  onUpdate: (ticker: string) => void;
}

export const StockTableRow = ({ 
  stock, 
  isUpdating, 
  onDelete, 
  onUpdate 
}: StockTableRowProps) => {
  return (
    <TableRow>
      <TableCell>
        <StockStatusIndicator status={stock.status || "red"} />
      </TableCell>
      <TableCell className="font-medium">{stock.ticker}</TableCell>
      <TableCell>{stock.created_by_email || 'Unknown'}</TableCell>
      <TableCell>{new Date(stock.created_at).toLocaleDateString()}</TableCell>
      <TableCell>
        {stock.last_updated
          ? new Date(stock.last_updated).toLocaleDateString()
          : "-"}
      </TableCell>
      <TableCell>
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