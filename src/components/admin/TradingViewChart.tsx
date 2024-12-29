import { useEffect, useRef } from 'react';
import { useTradingViewScript } from '@/hooks/useTradingViewScript';
import { useStockHistoricalData } from '@/hooks/useStockHistoricalData';
import { createDatafeedConfig } from '@/config/tradingViewConfig';
import { toast } from "sonner";

interface TradingViewChartProps {
  ticker: string;
}

export const TradingViewChart = ({ ticker }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const isScriptLoaded = useTradingViewScript();
  const { fetchBars } = useStockHistoricalData();

  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !window.TradingView) {
      return;
    }

    const initializeWidget = () => {
      try {
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
          datafeed: createDatafeedConfig(fetchBars),
          library_path: 'https://s3.tradingview.com/tv.js',
          interval: 'D',
          locale: 'en',
          disabled_features: ['header_symbol_search'],
          enabled_features: [],
          charts_storage_url: undefined,
          client_id: undefined,
          user_id: undefined
        });
      } catch (error) {
        console.error('Error initializing TradingView widget:', error);
        toast.error('Error initializing chart');
      }
    };

    // Initialize widget with a delay to ensure container is ready
    const timeoutId = setTimeout(initializeWidget, 500);

    return () => {
      clearTimeout(timeoutId);
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
          widgetRef.current = null;
        } catch (error) {
          console.error('Error cleaning up widget:', error);
        }
      }
    };
  }, [ticker, isScriptLoaded, fetchBars]);

  return (
    <div 
      ref={containerRef}
      id="tradingview_chart"
      className="w-full h-[600px] border rounded-lg overflow-hidden bg-background"
    />
  );
};