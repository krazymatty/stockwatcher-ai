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
    let timeoutId: NodeJS.Timeout;
    let isComponentMounted = true;

    const initializeWidget = () => {
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

      try {
        console.log('Initializing TradingView widget for ticker:', ticker);
        
        const containerId = `tv_chart_${Date.now()}`;
        if (containerRef.current) {
          containerRef.current.id = containerId;
        }
        
        timeoutId = setTimeout(() => {
          if (!isComponentMounted || !containerRef.current) return;
          
          widgetRef.current = new window.TradingView.widget({
            symbol: ticker,
            container_id: containerId,
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
        }, 100);
      } catch (error) {
        console.error('Error initializing TradingView widget:', error);
        toast.error('Error initializing chart');
      }
    };

    initializeWidget();

    return () => {
      isComponentMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Safe cleanup of the widget
      if (widgetRef.current) {
        try {
          // Check if the container still exists before removing
          if (containerRef.current && containerRef.current.parentNode) {
            widgetRef.current.remove();
          }
        } catch (error) {
          // Silently handle cleanup errors as the component is being unmounted
          console.debug('Widget cleanup skipped:', error);
        }
        widgetRef.current = null;
      }
    };
  }, [ticker, isScriptLoaded, fetchBars]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-[600px] border rounded-lg overflow-hidden bg-background"
    />
  );
};