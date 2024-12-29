import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const fetchAndStoreHistoricalData = async (ticker: string) => {
  console.log(`Fetching historical data for ${ticker}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('fetch-historical-data', {
      body: { ticker }
    });

    if (error) {
      console.error('Error fetching historical data:', error);
      if (error.message.includes('API key')) {
        throw new Error('Alpha Vantage API key is not configured. Please contact the administrator.');
      }
      throw error;
    }

    if (!data.success) {
      const errorMessage = data.error || `Failed to fetch data for ${ticker}`;
      console.error('API Error:', errorMessage);
      if (errorMessage.includes('API key')) {
        throw new Error('Alpha Vantage API key is not configured. Please contact the administrator.');
      }
      throw new Error(errorMessage);
    }

    // Update the last_updated timestamp in master_stocks table
    const { error: updateError } = await supabase
      .from('master_stocks')
      .update({ last_updated: new Date().toISOString() })
      .eq('ticker', ticker);

    if (updateError) {
      console.error('Error updating last_updated timestamp:', updateError);
      // Don't throw here as the main operation succeeded
    }

    console.log(`Successfully fetched data for ${ticker}:`, data);
    return data;
  } catch (error) {
    console.error(`Error processing historical data for ${ticker}:`, error);
    throw error;
  }
};