import { useState, useEffect } from 'react';
import { toast } from "sonner";

export const useTradingViewScript = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (typeof window.TradingView !== 'undefined') {
      setIsScriptLoaded(true);
      return;
    }

    const loadScript = async () => {
      try {
        console.log('Loading TradingView library...');
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => setIsScriptLoaded(true);
        script.onerror = () => {
          console.error('Failed to load TradingView library');
          toast.error('Failed to load chart library');
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading TradingView:', error);
        toast.error('Error initializing chart');
      }
    };

    loadScript();
  }, []);

  return isScriptLoaded;
};