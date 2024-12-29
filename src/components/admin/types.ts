import { Database } from "@/integrations/supabase/types";
import { StockStatus } from "@/utils/stockStatus";

export type MasterStock = Database["public"]["Tables"]["master_stocks"]["Row"] & {
  status?: StockStatus;
  instrument_type?: string;
  display_name?: string;
  metadata?: Record<string, any>;
};

export type SortField = keyof Pick<MasterStock, "ticker" | "created_by_email" | "created_at" | "last_updated">;
export type SortOrder = "asc" | "desc";