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
          timezone: "America/New_York",
          datafeed: createDatafeedConfig(fetchBars),
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
  }, [ticker, isScriptLoaded, fetchBars]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '600px' }} 
      className="border rounded-lg overflow-hidden"
    />
  );
};