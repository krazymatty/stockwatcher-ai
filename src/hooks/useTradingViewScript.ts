import { useState, useEffect } from 'react';
import { toast } from "sonner";

export const useTradingViewScript = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (typeof window.TradingView !== 'undefined') {
      console.log('TradingView library already loaded');
      setIsScriptLoaded(true);
      return;
    }

    const loadScript = async () => {
      try {
        console.log('Loading TradingView library...');
        const script = document.createElement('script');
        script.src = '/charting_library/charting_library.js';
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => {
          console.log('TradingView library loaded successfully');
          setIsScriptLoaded(true);
        };
        script.onerror = (error) => {
          console.error('Failed to load TradingView library:', error);
          toast.error('Failed to load chart library');
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading TradingView:', error);
        toast.error('Error initializing chart');
      }
    };

    loadScript();

    // Cleanup
    return () => {
      const script = document.querySelector('script[src="/charting_library/charting_library.js"]');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return isScriptLoaded;
};