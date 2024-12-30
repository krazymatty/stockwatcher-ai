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
  container_id?: string;
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
  // Add missing properties
  width?: string | number;
  height?: string | number;
  style?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  save_image?: boolean;
}

export interface ChartingLibraryWidget {
  new (options: ChartingLibraryWidgetOptions): {
    remove(): void;
  };
}