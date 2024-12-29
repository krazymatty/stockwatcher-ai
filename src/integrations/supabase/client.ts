import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://objcmewmpwefarwnwruq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamNtZXdtcHdlZmFyd253cnVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0OTg2NTQsImV4cCI6MjA1MTA3NDY1NH0.ezQO1i3mPQhUNyZkXZnb1ctinbReEW-4TSdhN388Bug";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);