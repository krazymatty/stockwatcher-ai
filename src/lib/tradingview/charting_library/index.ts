import { ChartingLibraryWidget, ChartingLibraryWidgetOptions } from './types';

// Declare the global TradingView object that will be loaded from the script
declare global {
  interface Window {
    TradingView: {
      widget: ChartingLibraryWidget;
    };
  }
}

// Export the widget constructor after ensuring TradingView is loaded
export const widget = window.TradingView?.widget;
export type { ChartingLibraryWidgetOptions };