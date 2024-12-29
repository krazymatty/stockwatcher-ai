export interface Watchlist {
  id: string;
  name: string;
  created_at: string;
  is_default?: boolean;
}

export interface WatchlistStock {
  id: string;
  ticker: string;
  created_at: string;
}