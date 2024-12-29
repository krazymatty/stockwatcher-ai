export type { Schema } from './schema';
export type { Tables } from './tables';
export type { TableRow, TableInsert, TableUpdate } from './utils';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = Schema;