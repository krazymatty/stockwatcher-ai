import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

type MasterStock = Database["public"]["Tables"]["master_stocks"]["Row"];

const Admin = () => {
  const [newTicker, setNewTicker] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const session = useSession();

  const { data: stocks, refetch } = useQuery({
    queryKey: ["master-stocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_stocks")
        .select("*")
        .order("ticker");
      if (error) throw error;
      return data as MasterStock[];
    },
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email?.endsWith("@philmatthews.net")) {
        setIsAdmin(true);
      }
    };
    checkAdminStatus();
  }, []);

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker || !session?.user) return;

    try {
      const { error } = await supabase
        .from("master_stocks")
        .insert([{ 
          ticker: newTicker.toUpperCase(),
          user_id: session.user.id,
          created_by_email: session.user.email
        }]);

      if (error) throw error;

      toast.success("Ticker added successfully");
      setNewTicker("");
      refetch();
    } catch (error) {
      console.error("Error adding ticker:", error);
      toast.error("Failed to add ticker");
    }
  };

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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Master Stocks List</h1>

      <form onSubmit={handleAddTicker} className="flex gap-4 mb-8">
        <Input
          type="text"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          placeholder="Enter ticker symbol"
          className="max-w-xs"
        />
        <Button type="submit">
          <Plus className="mr-2 h-4 w-4" />
          Add Ticker
        </Button>
      </form>

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
    </div>
  );
};

export default Admin;