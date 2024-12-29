import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface TradingViewChartProps {
  ticker: string;
}

export const TradingViewChart = ({ ticker }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTradingViewLibrary = async () => {
      if (!containerRef.current) {
        console.warn('Container not ready');
        return;
      }

      try {
        // Check if TradingView is already loaded
        if (!window.TradingView) {
          console.log('Loading TradingView library...');
          // Create script element
          const script = document.createElement('script');
          script.src = 'https://s3.tradingview.com/tv.js';
          script.async = true;
          script.onload = () => initializeWidget();
          script.onerror = () => {
            console.error('Failed to load TradingView library');
            toast.error('Failed to load chart library');
          };
          document.head.appendChild(script);
        } else {
          initializeWidget();
        }
      } catch (error) {
        console.error('Error loading TradingView:', error);
        toast.error('Error initializing chart');
      }
    };

    const initializeWidget = () => {
      if (!window.TradingView) {
        console.error('TradingView library not available');
        return;
      }

      console.log('Initializing TradingView widget for ticker:', ticker);
      
      try {
        new window.TradingView.widget({
          symbol: ticker,
          container: containerRef.current, // Changed from container_id to container
          datafeed: {
            onReady: (callback: any) => {
              console.log('TradingView datafeed onReady called');
              callback({
                supported_resolutions: ["1D", "1W", "1M"],
                exchanges: [{ value: "", name: "All Exchanges", desc: "" }],
                symbols_types: [{ name: "Stock", value: "stock" }],
              });
            },
            searchSymbols: () => {},
            resolveSymbol: (symbolName: string, onResolve: any) => {
              console.log('Resolving symbol:', symbolName);
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
              console.log('Fetching bars for:', symbolInfo.name, 'from:', new Date(from * 1000), 'to:', new Date(to * 1000));
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
                  onResult([], { noData: true });
                  return;
                }

                console.log('Retrieved historical data:', historicalData?.length, 'records');

                if (!historicalData?.length) {
                  console.log('No historical data found for ticker:', symbolInfo.name);
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

                console.log('Processed bars:', bars.length, 'First bar:', bars[0], 'Last bar:', bars[bars.length - 1]);
                onResult(bars);
              } catch (error) {
                console.error('Error in getBars:', error);
                onResult([], { noData: true });
              }
            },
            subscribeBars: () => {},
            unsubscribeBars: () => {},
          },
          width: '100%',
          height: 600,
          theme: 'dark',
          timezone: "America/New_York",
        });
      } catch (error) {
        console.error('Error initializing TradingView widget:', error);
        toast.error('Error initializing chart');
      }
    };

    loadTradingViewLibrary();
  }, [ticker]);

  return (
    <div ref={containerRef} className="w-full h-[600px]" />
  );
};