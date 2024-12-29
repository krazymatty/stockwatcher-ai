import { TableCell, TableRow } from "@/components/ui/table";
import { StockStatusIndicator } from "./StockStatusIndicator";
import { StockActions } from "./StockActions";
import { MasterStock } from "./types";
import { Badge } from "@/components/ui/badge";

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
  const getInstrumentColor = (type: string | null) => {
    switch (type) {
      case 'stock':
        return 'default';
      case 'etf':
        return 'secondary';
      case 'future':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <StockStatusIndicator status={stock.status || "red"} />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {stock.ticker}
          {stock.instrument_type && (
            <Badge variant={getInstrumentColor(stock.instrument_type)}>
              {stock.instrument_type.toUpperCase()}
            </Badge>
          )}
        </div>
      </TableCell>
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