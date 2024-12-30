import { useEffect, useRef } from 'react';
import { useTradingViewScript } from '@/hooks/useTradingViewScript';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChartingLibraryWidgetOptions } from '@/lib/tradingview/charting_library/types';

interface TradingViewChartProps {
  ticker: string;
}

export const TradingViewChart = ({ ticker }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const isScriptLoaded = useTradingViewScript();

  useEffect(() => {
    const initializeChart = async () => {
      if (!isScriptLoaded) {
        console.log('Script not loaded');
        return;
      }

      // Wait for the container to be mounted
      if (!containerRef.current) {
        console.log('Container not ready');
        return;
      }

      try {
        console.log('Fetching symbol data for:', ticker);
        // Fetch the TradingView symbol from master_stocks
        const { data, error } = await supabase
          .from('master_stocks')
          .select('tradingview_symbol, exchange')
          .eq('ticker', ticker)
          .maybeSingle();

        if (error) {
          console.error('Error fetching symbol data:', error);
          toast.error('Error loading chart data');
          return;
        }

        // Use the tradingview_symbol if available, otherwise fallback to ticker
        const symbol = data?.tradingview_symbol || ticker;
        const exchange = data?.exchange || 'NYSE';
        
        console.log('Initializing chart with symbol:', `${exchange}:${symbol}`);

        // Clean up previous widget instance
        if (widgetRef.current) {
          widgetRef.current.remove();
          widgetRef.current = null;
        }

        // Create new widget instance with proper typing
        const widgetOptions: ChartingLibraryWidgetOptions = {
          symbol: `${exchange}:${symbol}`,
          interval: 'D',
          container: containerRef.current,
          width: '100%',
          height: '100%',
          theme: 'dark',
          style: '1',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: false,
          autosize: true, // Add autosize option
          fullscreen: false, // Disable fullscreen by default
        };

        // Small delay to ensure DOM is ready
        setTimeout(() => {
          if (containerRef.current) {
            widgetRef.current = new window.TradingView.widget(widgetOptions);
          }
        }, 0);
      } catch (error) {
        console.error('Error initializing TradingView chart:', error);
        toast.error('Failed to initialize chart');
      }
    };

    initializeChart();

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [isScriptLoaded, ticker]);

  return <div ref={containerRef} className="h-[500px] w-full" />;
};