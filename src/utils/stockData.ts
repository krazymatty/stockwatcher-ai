import { supabase } from "@/integrations/supabase/client";

export const fetchAndStoreHistoricalData = async (ticker: string) => {
  try {
    // Call the edge function to fetch historical data
    const { data, error } = await supabase.functions.invoke('fetch-historical-data', {
      body: { ticker }
    });

    if (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error processing historical data for ${ticker}:`, error);
    throw error;
  }
};