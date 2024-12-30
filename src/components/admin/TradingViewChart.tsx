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
  const mountedRef = useRef(false);
  const [isContainerReady, setIsContainerReady] = useState(false);
  const isScriptLoaded = useTradingViewScript();

  // Set mounted ref on component mount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Monitor container size
  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!mountedRef.current) return;
      
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize widget
  useEffect(() => {
    const initializeWidget = async () => {
      if (!isScriptLoaded || !isContainerReady || !containerRef.current || !mountedRef.current) {
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

        // Ensure container is still valid
        if (!containerRef.current || !mountedRef.current) {
          console.log('Container no longer valid');
          return;
        }

        const widgetOptions: ChartingLibraryWidgetOptions = {
          symbol: symbol,
          interval: 'D',
          container_id: containerRef.current.id,
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

        // Create widget instance
        widgetRef.current = new window.TradingView.widget(widgetOptions);
      } catch (error) {
        console.error('Error initializing TradingView chart:', error);
        if (mountedRef.current) {
          toast.error('Failed to initialize chart');
        }
      }
    };

    // Delay initialization slightly to ensure DOM is ready
    const timeoutId = setTimeout(initializeWidget, 250);

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
      id={`tv_chart_${ticker}`} // Add unique ID for container
      className="h-[500px] w-full border rounded-lg overflow-hidden bg-background"
      style={{ minWidth: '300px' }}
    />
  );
};