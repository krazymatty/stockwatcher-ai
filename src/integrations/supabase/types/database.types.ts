import type {
  MasterStocksRow,
  MasterStocksInsert,
  MasterStocksUpdate,
  ProfilesRow,
  ProfilesInsert,
  ProfilesUpdate,
  WatchlistStocksRow,
  WatchlistStocksInsert,
  WatchlistStocksUpdate,
  WatchlistStocksRelationships,
  WatchlistsRow,
  WatchlistsInsert,
  WatchlistsUpdate,
} from './tables.types';
import type { IsAdminFunction } from './functions.types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      master_stocks: {
        Row: MasterStocksRow;
        Insert: MasterStocksInsert;
        Update: MasterStocksUpdate;
        Relationships: [];
      };
      profiles: {
        Row: ProfilesRow;
        Insert: ProfilesInsert;
        Update: ProfilesUpdate;
        Relationships: [];
      };
      watchlist_stocks: {
        Row: WatchlistStocksRow;
        Insert: WatchlistStocksInsert;
        Update: WatchlistStocksUpdate;
        Relationships: WatchlistStocksRelationships[];
      };
      watchlists: {
        Row: WatchlistsRow;
        Insert: WatchlistsInsert;
        Update: WatchlistsUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: IsAdminFunction;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};