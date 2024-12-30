import { TradingViewChart } from "./TradingViewChart";
import { useStockHistoricalData } from '@/hooks/useStockHistoricalData';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StockHistoricalChartProps {
  ticker: string;
}

export const StockHistoricalChart = ({ ticker }: StockHistoricalChartProps) => {
  const [latestPrice, setLatestPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchLatestPrice = async () => {
      const { data, error } = await supabase
        .from('stock_historical_data')
        .select('close, date')
        .eq('ticker', ticker)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest price:', error);
        return;
      }

      if (data) {
        setLatestPrice(Number(data.close));
      }
    };

    fetchLatestPrice();
  }, [ticker]);

  return (
    <div className="space-y-2">
      {latestPrice !== null && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-md">
          <span className="text-sm font-medium">Latest Close</span>
          <span className="font-mono text-lg">${latestPrice.toFixed(2)}</span>
        </div>
      )}
      <TradingViewChart ticker={ticker} />
    </div>
  );
};