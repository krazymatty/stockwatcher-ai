import { supabase } from '@/integrations/supabase/client';

export const useStockHistoricalData = () => {
  const fetchBars = async (
    symbolInfo: any,
    from: number,
    to: number,
  ) => {
    try {
      const { data: historicalData, error } = await supabase
        .from('stock_historical_data')
        .select('*')
        .eq('ticker', symbolInfo.name)
        .gte('date', new Date(from * 1000).toISOString())
        .lte('date', new Date(to * 1000).toISOString())
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching historical data:', error);
        return { bars: [], noData: true };
      }

      if (!historicalData?.length) {
        console.log('No historical data found for ticker:', symbolInfo.name);
        return { bars: [], noData: true };
      }

      const bars = historicalData.map(record => ({
        time: new Date(record.date).getTime(),
        open: Number(record.open),
        high: Number(record.high),
        low: Number(record.low),
        close: Number(record.close),
        volume: Number(record.volume),
      }));

      return { bars, noData: false };
    } catch (error) {
      console.error('Error in fetchBars:', error);
      return { bars: [], noData: true };
    }
  };

  return { fetchBars };
};