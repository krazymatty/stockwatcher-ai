import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface AddTickerFormProps {
  refetch: () => void;
}

export const AddTickerForm = ({ refetch }: AddTickerFormProps) => {
  const [newTicker, setNewTicker] = useState("");
  const session = useSession();

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker || !session?.user) return;

    try {
      const { error } = await supabase
        .from("master_stocks")
        .insert([{ 
          ticker: newTicker.toUpperCase(),
          user_id: session.user.id,
          created_by_email: session.user.email,
          instrument_type: 'stock', // Default to stock type
          display_name: `Stock: ${newTicker.toUpperCase()}`,
          metadata: { validated: false }
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

  return (
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
  );
};