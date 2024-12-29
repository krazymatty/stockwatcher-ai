import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { updateMasterStocksList } from "@/utils/masterStocks";

interface UpdateMasterListButtonProps {
  refetch: () => void;
}

export const UpdateMasterListButton = ({ refetch }: UpdateMasterListButtonProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const session = useSession();

  const handleUpdateMasterList = async () => {
    if (!session?.user) {
      toast.error("Please sign in to update the master list");
      return;
    }

    setIsUpdating(true);
    try {
      const { tickersToAdd, tickersToRemove } = await updateMasterStocksList(
        session.user.id,
        session.user.email!
      );

      // Show appropriate toast message
      if (tickersToAdd.length === 0 && tickersToRemove.length === 0) {
        toast.info("Master list is already up to date");
      } else {
        const addedMsg = tickersToAdd.length > 0 ? `Added ${tickersToAdd.length} new tickers` : '';
        const removedMsg = tickersToRemove.length > 0 ? `Removed ${tickersToRemove.length} orphaned tickers` : '';
        const message = [addedMsg, removedMsg].filter(Boolean).join(' and ');
        toast.success(message);
      }

      refetch();
    } catch (error) {
      console.error("Error updating master list:", error);
      toast.error("Failed to update master list");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button 
      onClick={handleUpdateMasterList} 
      disabled={isUpdating}
      variant="outline"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
      Update Master List
    </Button>
  );
};