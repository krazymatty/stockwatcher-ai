import { supabase } from "@/integrations/supabase/client";

export const fetchAndStoreHistoricalData = async (ticker: string) => {
  try {
    console.log(`Fetching historical data for ${ticker}`);
    
    const { data, error } = await supabase.functions.invoke('fetch-historical-data', {
      body: { ticker }
    });

    if (error) {
      console.error('Error fetching historical data:', error);
      throw new Error(`Failed to fetch data for ${ticker}: ${error.message}`);
    }

    if (!data.success) {
      const errorMessage = data.error || `Failed to fetch data for ${ticker}`;
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`Successfully fetched data for ${ticker}:`, data);
    return data;
  } catch (error) {
    console.error(`Error processing historical data for ${ticker}:`, error);
    throw error;
  }
};