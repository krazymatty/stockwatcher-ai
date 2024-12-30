import { useEffect, useRef } from 'react';
import { widget } from '@/lib/tradingview/charting_library';
import { useTradingViewScript } from '@/hooks/useTradingViewScript';
import { supabase } from '@/integrations/supabase/client';

interface TradingViewChartProps {
  ticker: string;
}

export const TradingViewChart = ({ ticker }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const isScriptLoaded = useTradingViewScript();

  useEffect(() => {
    const initializeChart = async () => {
      if (!isScriptLoaded || !containerRef.current) return;

      try {
        // Fetch the TradingView symbol from master_stocks
        const { data, error } = await supabase
          .from('master_stocks')
          .select('tradingview_symbol, exchange')
          .eq('ticker', ticker)
          .single();

        if (error) throw error;

        const symbol = data?.tradingview_symbol || ticker;
        const exchange = data?.exchange || 'NYSE';

        // Clean up previous widget instance
        if (widgetRef.current) {
          widgetRef.current.remove();
          widgetRef.current = null;
        }

        // Create new widget instance
        widgetRef.current = new widget({
          symbol: `${exchange}:${symbol}`,
          interval: 'D',
          container: containerRef.current,
          library_path: '/charting_library/',
          locale: 'en',
          disabled_features: ['use_localstorage_for_settings'],
          enabled_features: ['study_templates'],
          theme: 'dark',
          autosize: true,
        });
      } catch (error) {
        console.error('Error initializing TradingView chart:', error);
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

  return <div ref={containerRef} className="h-[500px]" />;
};