import { useEffect, useRef, useState } from 'react';

interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const useTradingViewData = (widgetRef: React.MutableRefObject<any>) => {
  const [currentData, setCurrentData] = useState<ChartData | null>(null);
  const subscribed = useRef(false);

  useEffect(() => {
    const subscribeToData = async () => {
      if (!widgetRef.current || subscribed.current) return;

      try {
        // Wait for widget to be ready
        await new Promise((resolve) => {
          const checkWidget = setInterval(() => {
            if (widgetRef.current?.activeChart) {
              clearInterval(checkWidget);
              resolve(true);
            }
          }, 100);
        });

        const chart = widgetRef.current.activeChart();

        // Subscribe to real-time data updates
        chart.onDataLoaded().subscribe(null, () => {
          const bars = chart.getBars();
          if (bars && bars.length > 0) {
            const lastBar = bars[bars.length - 1];
            setCurrentData({
              time: lastBar.time,
              open: lastBar.open,
              high: lastBar.high,
              low: lastBar.low,
              close: lastBar.close,
              volume: lastBar.volume
            });
          }
        });

        subscribed.current = true;
        console.log('Successfully subscribed to TradingView data');
      } catch (error) {
        console.error('Error subscribing to TradingView data:', error);
      }
    };

    subscribeToData();

    return () => {
      subscribed.current = false;
    };
  }, [widgetRef]);

  return currentData;
};