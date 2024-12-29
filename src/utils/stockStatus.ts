import { supabase } from "@/integrations/supabase/client";

export type StockStatus = "green" | "yellow" | "red";

export const getStockStatus = async (ticker: string): Promise<StockStatus> => {
  const { data, error } = await supabase
    .from("stock_historical_data")
    .select("date")
    .eq("ticker", ticker)
    .order("date", { ascending: false })
    .limit(1);

  if (error || !data?.length) {
    return "red";
  }

  const lastRecord = new Date(data[0].date);
  const today = new Date();
  const lastTradingDay = getLastTradingDay();

  if (lastRecord >= lastTradingDay) {
    return "green";
  }

  return "yellow";
};

const getLastTradingDay = (): Date => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 2 : day === 1 ? 3 : 1; // Handle weekends
  
  const lastTradingDay = new Date();
  lastTradingDay.setDate(today.getDate() - diff);
  lastTradingDay.setHours(0, 0, 0, 0);
  
  return lastTradingDay;
};