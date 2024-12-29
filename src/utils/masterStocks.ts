import { supabase } from "@/integrations/supabase/client";
import { getUserUsername } from "./user";

export const addTickerToMasterStocks = async (ticker: string, userId: string, email: string) => {
  const username = await getUserUsername(userId) || email;
  
  const { error } = await supabase
    .from('master_stocks')
    .upsert({ 
      ticker,
      user_id: userId,
      created_by_email: username,
      instrument_type: 'stock', // Default to stock type
      display_name: `Stock: ${ticker.toUpperCase()}`,
      metadata: { validated: false }
    });

  return { error };
};

export const updateMasterStocksList = async (userId: string, email: string) => {
  const username = await getUserUsername(userId) || email;

  // Get all unique tickers from active watchlists
  const { data: watchlistStocks, error: fetchError } = await supabase
    .from('watchlist_stocks')
    .select('ticker, watchlist_id, watchlists!inner(id)')
    .order('ticker');

  if (fetchError) throw fetchError;

  // Get current master stocks
  const { data: currentMasterStocks, error: masterError } = await supabase
    .from('master_stocks')
    .select('ticker');

  if (masterError) throw masterError;

  // Create sets for easier comparison
  const activeWatchlistTickers = new Set(watchlistStocks?.map(stock => stock.ticker));
  const masterTickers = new Set(currentMasterStocks.map(stock => stock.ticker));

  // Find tickers to add (in watchlists but not in master)
  const tickersToAdd = [...activeWatchlistTickers].filter(ticker => !masterTickers.has(ticker));

  // Find tickers to remove (in master but not in any watchlist)
  const tickersToRemove = [...masterTickers].filter(ticker => !activeWatchlistTickers.has(ticker));

  // Add new tickers
  if (tickersToAdd.length > 0) {
    const { error: insertError } = await supabase
      .from('master_stocks')
      .insert(
        tickersToAdd.map((ticker) => ({
          ticker,
          user_id: userId,
          created_by_email: username,
          instrument_type: 'stock', // Default to stock type
          display_name: `Stock: ${ticker.toUpperCase()}`,
          metadata: { validated: false }
        }))
      );

    if (insertError) throw insertError;
  }

  // Remove orphaned tickers
  if (tickersToRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('master_stocks')
      .delete()
      .in('ticker', tickersToRemove);

    if (deleteError) throw deleteError;
  }

  return { tickersToAdd, tickersToRemove };
};