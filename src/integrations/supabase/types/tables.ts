export type Tables = {
  master_stocks: {
    Row: {
      created_at: string;
      last_updated: string | null;
      ticker: string;
    };
    Insert: {
      created_at?: string;
      last_updated?: string | null;
      ticker: string;
    };
    Update: {
      created_at?: string;
      last_updated?: string | null;
      ticker?: string;
    };
    Relationships: [];
  };
  profiles: {
    Row: {
      created_at: string;
      id: string;
      updated_at: string | null;
      username: string | null;
    };
    Insert: {
      created_at?: string;
      id: string;
      updated_at?: string | null;
      username?: string | null;
    };
    Update: {
      created_at?: string;
      id?: string;
      updated_at?: string | null;
      username?: string | null;
    };
    Relationships: [];
  };
  watchlist_stocks: {
    Row: {
      created_at: string;
      id: string;
      ticker: string;
      watchlist_id: string;
    };
    Insert: {
      created_at?: string;
      id?: string;
      ticker: string;
      watchlist_id: string;
    };
    Update: {
      created_at?: string;
      id?: string;
      ticker?: string;
      watchlist_id?: string;
    };
    Relationships: [
      {
        foreignKeyName: "watchlist_stocks_watchlist_id_fkey";
        columns: ["watchlist_id"];
        isOneToOne: false;
        referencedRelation: "watchlists";
        referencedColumns: ["id"];
      }
    ];
  };
  watchlists: {
    Row: {
      created_at: string;
      id: string;
      name: string;
      updated_at: string | null;
      user_id: string;
    };
    Insert: {
      created_at?: string;
      id?: string;
      name: string;
      updated_at?: string | null;
      user_id: string;
    };
    Update: {
      created_at?: string;
      id?: string;
      name?: string;
      updated_at?: string | null;
      user_id?: string;
    };
    Relationships: [];
  };
};