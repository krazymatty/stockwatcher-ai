import type { Schema } from './schema';
import type { Tables } from './tables';
import type { TableRow, TableInsert, TableUpdate } from './utils';

export type { Schema, Tables, TableRow, TableInsert, TableUpdate };

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = Schema;