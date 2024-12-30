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

    // Check immediately
    checkContainer();

    // Also check after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(checkContainer, 100);

    // Cleanup
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeChart = async () => {
      if (!isScriptLoaded) {
        console.log('Script not loaded');
        return;
      }

      if (!isContainerReady) {
        console.log('Container not ready');
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

        // Create new widget instance with proper typing
        const widgetOptions: ChartingLibraryWidgetOptions = {
          symbol: symbol,
          interval: 'D',
          container: containerRef.current!,
          width: '100%',
          height: '100%',
          theme: 'dark',
          style: '1',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: false,
          autosize: true,
          fullscreen: false,
        };

        // Initialize widget with a delay to ensure DOM is fully ready
        timeoutId = setTimeout(() => {
          try {
            if (containerRef.current && containerRef.current.offsetWidth > 0) {
              widgetRef.current = new window.TradingView.widget(widgetOptions);
            } else {
              console.error('Container not properly sized');
              toast.error('Chart container not ready');
            }
          } catch (err) {
            console.error('Widget initialization error:', err);
            toast.error('Failed to initialize chart widget');
          }
        }, 500); // Increased delay to 500ms for better reliability
      } catch (error) {
        console.error('Error initializing TradingView chart:', error);
        toast.error('Failed to initialize chart');
      }
    };

    initializeChart();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
      style={{ minWidth: '300px' }} // Increased minimum width
    />
  );
};