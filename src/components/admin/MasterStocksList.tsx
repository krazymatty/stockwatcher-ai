import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type MasterStock = Database["public"]["Tables"]["master_stocks"]["Row"];

interface MasterStocksListProps {
  stocks: MasterStock[] | undefined;
  refetch: () => void;
}

export const MasterStocksList = ({ stocks, refetch }: MasterStocksListProps) => {
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

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Added By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks?.map((stock) => (
            <TableRow key={stock.ticker}>
              <TableCell className="font-medium">{stock.ticker}</TableCell>
              <TableCell>{stock.created_by_email || 'Unknown'}</TableCell>
              <TableCell>{new Date(stock.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {stock.last_updated
                  ? new Date(stock.last_updated).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>
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