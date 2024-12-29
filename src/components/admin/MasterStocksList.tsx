import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { getStockStatus } from "@/utils/stockStatus";
import { fetchAndStoreHistoricalData } from "@/utils/stockData";
import { StockTableHeader } from "./StockTableHeader";
import { StockTableRow } from "./StockTableRow";
import { MasterStock, SortField, SortOrder } from "./types";

interface MasterStocksListProps {
  stocks: MasterStock[] | undefined;
  refetch: () => void;
  onSelectTicker: (ticker: string) => void;
}

export const MasterStocksList = ({ stocks, refetch, onSelectTicker }: MasterStocksListProps) => {
  const [sortField, setSortField] = useState<SortField>("ticker");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [stocksWithStatus, setStocksWithStatus] = useState<MasterStock[]>([]);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!stocks) return;
      
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => ({
          ...stock,
          status: await getStockStatus(stock.ticker),
        }))
      );
      
      setStocksWithStatus(updatedStocks);
    };

    fetchStatuses();
  }, [stocks]);

  const handleDeleteTicker = async (ticker: string) => {
    try {
      const { error } = await supabase
        .from("master_stocks")
        .delete()
        .eq("ticker", ticker);

      if (error) throw error;

      toast.success("Ticker deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting ticker:", error);
      toast.error("Failed to delete ticker");
    }
  };

  const handleUpdateData = async (ticker: string) => {
    setIsUpdating(prev => ({ ...prev, [ticker]: true }));
    try {
      await fetchAndStoreHistoricalData(ticker);
      toast.success(`Updated data for ${ticker}`);
      const newStatus = await getStockStatus(ticker);
      setStocksWithStatus(prev => 
        prev.map(stock => 
          stock.ticker === ticker ? { ...stock, status: newStatus } : stock
        )
      );
    } catch (error) {
      console.error(`Error updating ${ticker}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(errorMessage.includes('API key') 
        ? 'API key not configured. Please contact the administrator.' 
        : `Failed to update ${ticker}: ${errorMessage}`
      );
    } finally {
      setIsUpdating(prev => ({ ...prev, [ticker]: false }));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedStocks = stocksWithStatus ? [...stocksWithStatus].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null) return sortOrder === "asc" ? 1 : -1;
    if (bValue === null) return sortOrder === "asc" ? -1 : 1;

    const comparison = String(aValue).localeCompare(String(bValue));
    return sortOrder === "asc" ? comparison : -comparison;
  }) : [];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <StockTableHeader onSort={handleSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStocks.map((stock) => (
              <StockTableRow
                key={stock.ticker}
                stock={stock}
                isUpdating={isUpdating[stock.ticker] || false}
                onDelete={handleDeleteTicker}
                onUpdate={handleUpdateData}
                onSelect={() => onSelectTicker(stock.ticker)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
