import { useEffect, useRef, useState } from 'react';
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
  const [isContainerReady, setIsContainerReady] = useState(false);
  const isScriptLoaded = useTradingViewScript();

  // Check if container is ready
  useEffect(() => {
    const checkContainer = () => {
      if (containerRef.current && containerRef.current.offsetWidth > 0) {
        setIsContainerReady(true);
      }
    };

    // Create an observer to watch for container size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setIsContainerReady(true);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      checkContainer(); // Initial check
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const initializeWidget = async () => {
      if (!isScriptLoaded || !isContainerReady || !containerRef.current) {
        return;
      }

      try {
        console.log('Fetching symbol data for:', ticker);
        const { data, error } = await supabase
          .from('master_stocks')
          .select('tradingview_symbol')
          .eq('ticker', ticker)
          .maybeSingle();

        if (error) {
          console.error('Error fetching symbol data:', error);
          toast.error('Error loading chart data');
          return;
        }

        const symbol = data?.tradingview_symbol || ticker;
        console.log('Initializing chart with symbol:', symbol);

        // Clean up previous widget instance
        if (widgetRef.current) {
          widgetRef.current.remove();
          widgetRef.current = null;
        }

        const widgetOptions: ChartingLibraryWidgetOptions = {
          symbol: symbol,
          interval: 'D',
          container: containerRef.current,
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
          theme: 'dark',
          style: '1',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: false,
          autosize: true,
          fullscreen: false,
        };

        widgetRef.current = new window.TradingView.widget(widgetOptions);
      } catch (error) {
        console.error('Error initializing TradingView chart:', error);
        toast.error('Failed to initialize chart');
      }
    };

    // Add a small delay before initialization
    const timeoutId = setTimeout(initializeWidget, 100);

    return () => {
      clearTimeout(timeoutId);
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [isScriptLoaded, ticker, isContainerReady]);

  return (
    <div 
      ref={containerRef} 
      className="h-[500px] w-full border rounded-lg overflow-hidden bg-background"
      style={{ minWidth: '300px' }}
    />
  );
};