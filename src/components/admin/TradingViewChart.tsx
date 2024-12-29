import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface TradingViewChartProps {
  ticker: string;
}

export const TradingViewChart = ({ ticker }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const loadTradingViewLibrary = async () => {
      if (typeof window.TradingView !== 'undefined') {
        setIsScriptLoaded(true);
        return;
      }

      try {
        console.log('Loading TradingView library...');
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => setIsScriptLoaded(true);
        script.onerror = () => {
          console.error('Failed to load TradingView library');
          toast.error('Failed to load chart library');
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading TradingView:', error);
        toast.error('Error initializing chart');
      }
    };

    loadTradingViewLibrary();
  }, []); // Load script only once

  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !window.TradingView) {
      return;
    }

    const initializeWidget = () => {
      try {
        // Clean up previous widget instance if it exists
        if (widgetRef.current) {
          widgetRef.current.remove();
          widgetRef.current = null;
        }

        console.log('Initializing TradingView widget for ticker:', ticker);
        
        widgetRef.current = new window.TradingView.widget({
          symbol: ticker,
          container: containerRef.current,
          autosize: true,
          theme: 'dark',
          time_zone: "America/New_York",
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
                time_zone: "America/New_York",
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
        });
      } catch (error) {
        console.error('Error initializing TradingView widget:', error);
        toast.error('Error initializing chart');
      }
    };

    // Initialize widget with a small delay to ensure container is ready
    const timeoutId = setTimeout(initializeWidget, 100);

    return () => {
      clearTimeout(timeoutId);
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [ticker, isScriptLoaded]); // Re-run when ticker changes or script loads

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '600px' }} 
      className="border rounded-lg overflow-hidden"
    />
  );
};