export interface ChartingLibraryWidgetOptions {
  symbol?: string;
  interval?: string;
  libraryPath?: string;
  chartsStorageUrl?: string;
  chartsStorageApiVersion?: '1.1' | '1.0' | '2.0';
  clientId?: string;
  userId?: string;
  fullscreen?: boolean;
  autosize?: boolean;
  studiesOverrides?: Record<string, any>;
  container?: HTMLElement;
  datafeed?: any;
  library_path?: string;
  locale?: string;
  disabled_features?: string[];
  enabled_features?: string[];
  charts_storage_url?: string;
  client_id?: string;
  user_id?: string;
  theme?: string;
  time_zone?: string;
  allow_symbol_change?: boolean;
}

export interface ChartingLibraryWidget {
  new (options: ChartingLibraryWidgetOptions): {
    remove(): void;
  };
}