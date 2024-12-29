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
    // Only proceed if script is loaded and container is ready
    if (!isScriptLoaded || !containerRef.current || !window.TradingView) {
      return;
    }

    // Clean up previous widget instance if it exists
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (error) {
        console.error('Error cleaning up previous widget:', error);
      }
      widgetRef.current = null;
    }

    // Wait for the next frame to ensure DOM is ready
    const initializeWidget = () => {
      if (!containerRef.current) return; // Double check container still exists

      try {
        console.log('Initializing TradingView widget for ticker:', ticker);
        
        widgetRef.current = new window.TradingView.widget({
          symbol: ticker,
          container: containerRef.current.id,
          autosize: true,
          theme: 'dark',
          time_zone: "America/New_York",
          datafeed: createDatafeedConfig(fetchBars),
          library_path: 'https://s3.tradingview.com/tv.js/',
          interval: 'D',
          locale: 'en',
          disabled_features: ['header_symbol_search'],
          enabled_features: [],
          allow_symbol_change: false
        });
      } catch (error) {
        console.error('Error initializing TradingView widget:', error);
        toast.error('Error initializing chart');
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(initializeWidget);

    return () => {
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