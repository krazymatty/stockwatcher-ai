import { ChartingLibraryWidget, ChartingLibraryWidgetOptions } from './types';

// @ts-ignore - TradingView library will be loaded from CDN
declare const TradingView: { widget: ChartingLibraryWidget };

export const widget = TradingView.widget;
export type { ChartingLibraryWidgetOptions };