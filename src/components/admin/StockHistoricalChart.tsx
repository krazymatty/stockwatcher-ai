import { TradingViewChart } from "./TradingViewChart";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface StockHistoricalChartProps {
  ticker: string;
}

export const StockHistoricalChart = ({ ticker }: StockHistoricalChartProps) => {
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [exchange, setExchange] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestPriceAndExchange = async () => {
      // Fetch latest price
      const { data: priceData, error: priceError } = await supabase
        .from('stock_historical_data')
        .select('close, date')
        .eq('ticker', ticker)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (priceError) {
        console.error('Error fetching latest price:', priceError);
        return;
      }

      if (priceData) {
        setLatestPrice(Number(priceData.close));
      }

      // Fetch exchange info
      const { data: stockData, error: stockError } = await supabase
        .from('master_stocks')
        .select('exchange')
        .eq('ticker', ticker)
        .single();

      if (stockError) {
        console.error('Error fetching exchange:', stockError);
        return;
      }

      if (stockData) {
        setExchange(stockData.exchange);
      }
    };

    fetchLatestPriceAndExchange();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('stock_price_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stock_historical_data',
          filter: `ticker=eq.${ticker}`,
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          if (payload.new && typeof payload.new.close === 'number') {
            setLatestPrice(Number(payload.new.close));
            toast.info(`Price updated for ${ticker}`);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to real-time updates for:', ticker);
        }
      });

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticker]);

  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Symbol</span>
            <span className="text-lg font-mono">{ticker}</span>
            {exchange && (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                {exchange}
              </span>
            )}
          </div>
          {latestPrice !== null && (
            <span className="font-mono text-lg">${latestPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
      <TradingViewChart ticker={ticker} />
    </div>
  );
};