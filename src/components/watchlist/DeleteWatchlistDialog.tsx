import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Watchlist } from "@/types/watchlist";

interface DeleteWatchlistDialogProps {
  watchlist: Watchlist;
  onWatchlistDeleted: () => void;
}

export const DeleteWatchlistDialog = ({
  watchlist,
  onWatchlistDeleted,
}: DeleteWatchlistDialogProps) => {
  const handleDelete = async () => {
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('id', watchlist.id);

    if (error) {
      toast.error("Failed to delete watchlist");
      return;
    }

    toast.success("Watchlist deleted successfully");
    onWatchlistDeleted();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Watchlist</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{watchlist.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};