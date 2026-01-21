
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

const supabaseUrl = 'https://ryydeombzgsexemijkzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5eWRlb21iemdzZXhlbWlqa3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDk1NTUsImV4cCI6MjA4NDU4NTU1NX0.JbUfcA7XxImiPw8cp67REERAzDmUI4UHzBqhr017pxw';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
