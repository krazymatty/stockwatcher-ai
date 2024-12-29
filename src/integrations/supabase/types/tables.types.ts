export interface MasterStocksRow {
  created_at: string;
  last_updated: string | null;
  ticker: string;
}

export interface MasterStocksInsert {
  created_at?: string;
  last_updated?: string | null;
  ticker: string;
}

export interface MasterStocksUpdate {
  created_at?: string;
  last_updated?: string | null;
  ticker?: string;
}

export interface ProfilesRow {
  created_at: string;
  id: string;
  updated_at: string | null;
  username: string | null;
}

export interface ProfilesInsert {
  created_at?: string;
  id: string;
  updated_at?: string | null;
  username?: string | null;
}

export interface ProfilesUpdate {
  created_at?: string;
  id?: string;
  updated_at?: string | null;
  username?: string | null;
}

export interface WatchlistStocksRow {
  created_at: string;
  id: string;
  ticker: string;
  watchlist_id: string;
}

export interface WatchlistStocksInsert {
  created_at?: string;
  id?: string;
  ticker: string;
  watchlist_id: string;
}

export interface WatchlistStocksUpdate {
  created_at?: string;
  id?: string;
  ticker?: string;
  watchlist_id?: string;
}

export interface WatchlistStocksRelationships {
  foreignKeyName: "watchlist_stocks_watchlist_id_fkey";
  columns: ["watchlist_id"];
  isOneToOne: false;
  referencedRelation: "watchlists";
  referencedColumns: ["id"];
}

export interface WatchlistsRow {
  created_at: string;
  id: string;
  name: string;
  updated_at: string | null;
  user_id: string;
}

export interface WatchlistsInsert {
  created_at?: string;
  id?: string;
  name: string;
  updated_at?: string | null;
  user_id: string;
}

export interface WatchlistsUpdate {
  created_at?: string;
  id?: string;
  name?: string;
  updated_at?: string | null;
  user_id?: string;
}