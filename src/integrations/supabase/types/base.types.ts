export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      master_stocks: MasterStocksTable;
      profiles: ProfilesTable;
      stock_historical_data: StockHistoricalDataTable;
      watchlist_stocks: WatchlistStocksTable;
      watchlists: WatchlistsTable;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

interface BaseTable<TRow, TInsert, TUpdate> {
  Row: TRow;
  Insert: TInsert;
  Update: TUpdate;
}

export interface MasterStocksTable extends BaseTable<MasterStocksRow, MasterStocksInsert, MasterStocksUpdate> {
  Relationships: [];
}

export interface ProfilesTable extends BaseTable<ProfilesRow, ProfilesInsert, ProfilesUpdate> {
  Relationships: [];
}

export interface StockHistoricalDataTable extends BaseTable<StockHistoricalDataRow, StockHistoricalDataInsert, StockHistoricalDataUpdate> {
  Relationships: [
    {
      foreignKeyName: "fk_ticker";
      columns: ["ticker"];
      isOneToOne: false;
      referencedRelation: "master_stocks";
      referencedColumns: ["ticker"];
    }
  ];
}

export interface WatchlistStocksTable extends BaseTable<WatchlistStocksRow, WatchlistStocksInsert, WatchlistStocksUpdate> {
  Relationships: [
    {
      foreignKeyName: "watchlist_stocks_watchlist_id_fkey";
      columns: ["watchlist_id"];
      isOneToOne: false;
      referencedRelation: "watchlists";
      referencedColumns: ["id"];
    }
  ];
}

export interface WatchlistsTable extends BaseTable<WatchlistsRow, WatchlistsInsert, WatchlistsUpdate> {
  Relationships: [];
}

export interface MasterStocksRow {
  created_at: string;
  last_updated: string | null;
  ticker: string;
  user_id: string | null;
  created_by_email: string | null;
  instrument_type: string;
  display_name: string | null;
  metadata: Json | null;
}

export interface MasterStocksInsert {
  created_at?: string;
  last_updated?: string | null;
  ticker: string;
  user_id?: string | null;
  created_by_email?: string | null;
  instrument_type: string;
  display_name?: string | null;
  metadata?: Json | null;
}

export interface MasterStocksUpdate {
  created_at?: string;
  last_updated?: string | null;
  ticker?: string;
  user_id?: string | null;
  created_by_email?: string | null;
  instrument_type?: string;
  display_name?: string | null;
  metadata?: Json | null;
}

export interface ProfilesRow {
  id: string;
  username: string | null;
  updated_at: string | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  default_watchlist_id: string | null;
}

export interface ProfilesInsert {
  id: string;
  username?: string | null;
  updated_at?: string | null;
  created_at?: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  default_watchlist_id?: string | null;
}

export interface ProfilesUpdate {
  id?: string;
  username?: string | null;
  updated_at?: string | null;
  created_at?: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  default_watchlist_id?: string | null;
}

export interface StockHistoricalDataRow {
  id: string;
  ticker: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  created_at: string;
  last_updated: string | null;
}

export interface StockHistoricalDataInsert {
  id?: string;
  ticker: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  created_at?: string;
  last_updated?: string | null;
}

export interface StockHistoricalDataUpdate {
  id?: string;
  ticker?: string;
  date?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  created_at?: string;
  last_updated?: string | null;
}

export interface WatchlistStocksRow {
  id: string;
  watchlist_id: string;
  ticker: string;
  created_at: string;
}

export interface WatchlistStocksInsert {
  id?: string;
  watchlist_id: string;
  ticker: string;
  created_at?: string;
}

export interface WatchlistStocksUpdate {
  id?: string;
  watchlist_id?: string;
  ticker?: string;
  created_at?: string;
}

export interface WatchlistsRow {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface WatchlistsInsert {
  id?: string;
  name: string;
  user_id: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface WatchlistsUpdate {
  id?: string;
  name?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string | null;
}