import { useEffect, useRef } from 'react';
import { widget } from '@/lib/tradingview/charting_library';
import { supabase } from '@/integrations/supabase/client';

interface TradingViewChartProps {
  ticker: string;
}

export const TradingViewChart = ({ ticker }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const widgetOptions = {
      symbol: ticker,
      // TradingView Widget parameters
      container: containerRef.current,
      datafeed: {
        onReady: (callback: any) => {
          callback({
            supported_resolutions: ["1D", "1W", "1M"],
            exchanges: [{ value: "", name: "All Exchanges", desc: "" }],
            symbols_types: [{ name: "Stock", value: "stock" }],
          });
        },
        searchSymbols: () => {},
        resolveSymbol: (symbolName: string, onResolve: any) => {
          onResolve({
            name: symbolName,
            full_name: symbolName,
            description: symbolName,
            type: "stock",
            session: "0930-1630",
            timezone: "America/New_York",
            exchange: "",
            minmov: 1,
            pricescale: 100,
            has_intraday: false,
            has_daily: true,
            has_weekly_and_monthly: true,
            supported_resolutions: ["1D", "1W", "1M"],
          });
        },
        getBars: async (symbolInfo: any, resolution: string, from: number, to: number, onResult: any) => {
          try {
            const { data: historicalData } = await supabase
              .from('stock_historical_data')
              .select('*')
              .eq('ticker', symbolInfo.name)
              .gte('date', new Date(from * 1000).toISOString())
              .lte('date', new Date(to * 1000).toISOString())
              .order('date', { ascending: true });

            if (!historicalData?.length) {
              onResult([], { noData: true });
              return;
            }

            const bars = historicalData.map(record => ({
              time: new Date(record.date).getTime(),
              open: Number(record.open),
              high: Number(record.high),
              low: Number(record.low),
              close: Number(record.close),
              volume: Number(record.volume),
            }));

            onResult(bars);
          } catch (error) {
            console.error('Error fetching historical data:', error);
            onResult([], { noData: true });
          }
        },
        subscribeBars: () => {},
        unsubscribeBars: () => {},
      },
      library_path: '/charting_library/',
      locale: 'en',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates'],
      charts_storage_url: 'https://saveload.tradingview.com',
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      fullscreen: false,
      autosize: true,
      theme: 'dark',
    };

    const tvWidget = new widget(widgetOptions);

    return () => {
      tvWidget.remove();
    };
  }, [ticker]);

  return (
    <div ref={containerRef} className="w-full h-[600px]" />
  );
};