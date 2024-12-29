import { Tables } from './tables';

export type Schema = {
  public: {
    Tables: Tables;
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};