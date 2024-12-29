import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, ArrowUpDown, LineChart, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StockHistoricalChart } from "./StockHistoricalChart";
import { getStockStatus, StockStatus } from "@/utils/stockStatus";
import { fetchAndStoreHistoricalData } from "@/utils/stockData";

type MasterStock = Database["public"]["Tables"]["master_stocks"]["Row"] & {
  status?: StockStatus;
};
type SortField = keyof Pick<MasterStock, "ticker" | "created_by_email" | "created_at" | "last_updated">;
type SortOrder = "asc" | "desc";

interface MasterStocksListProps {
  stocks: MasterStock[] | undefined;
  refetch: () => void;
}

export const MasterStocksList = ({ stocks, refetch }: MasterStocksListProps) => {
  const [sortField, setSortField] = useState<SortField>("ticker");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
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
      toast.error(`Failed to update ${ticker}`);
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

  const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-8 flex items-center gap-1"
    >
      {children}
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  );

  const StatusIndicator = ({ status }: { status: StockStatus }) => {
    const colors = {
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500"
    };

    return (
      <div className={`w-3 h-3 rounded-full ${colors[status]}`} />
    );
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Status</TableHead>
            <TableHead>
              <SortButton field="ticker">Ticker</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="created_by_email">Added By</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="created_at">Created At</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="last_updated">Last Updated</SortButton>
            </TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStocks.map((stock) => (
            <TableRow key={stock.ticker}>
              <TableCell>
                <StatusIndicator status={stock.status || "red"} />
              </TableCell>
              <TableCell className="font-medium">{stock.ticker}</TableCell>
              <TableCell>{stock.created_by_email || 'Unknown'}</TableCell>
              <TableCell>{new Date(stock.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {stock.last_updated
                  ? new Date(stock.last_updated).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedTicker(stock.ticker)}
                    >
                      <LineChart className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Historical Data for {stock.ticker}</DialogTitle>
                    </DialogHeader>
                    {selectedTicker === stock.ticker && (
                      <StockHistoricalChart ticker={stock.ticker} />
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUpdateData(stock.ticker)}
                  disabled={isUpdating[stock.ticker]}
                >
                  <RefreshCw className={`h-4 w-4 ${isUpdating[stock.ticker] ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTicker(stock.ticker)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};