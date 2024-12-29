import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { MasterStocksList } from "@/components/admin/MasterStocksList";
import { AddTickerForm } from "@/components/admin/AddTickerForm";
import { UpdateMasterListButton } from "@/components/admin/UpdateMasterListButton";

type MasterStock = Database["public"]["Tables"]["master_stocks"]["Row"];

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Master Stocks List</h1>
        <UpdateMasterListButton refetch={refetch} />
      </div>

      <AddTickerForm refetch={refetch} />
      <MasterStocksList stocks={stocks} refetch={refetch} />
    </div>
  );
};

export default Admin;