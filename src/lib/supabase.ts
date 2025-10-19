import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          audio_url: string | null;
          label_url: string | null;
          settings: ProjectSettings;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          audio_url?: string | null;
          label_url?: string | null;
          settings?: ProjectSettings;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          audio_url?: string | null;
          label_url?: string | null;
          settings?: ProjectSettings;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type ProjectSettings = {
  rpm: number;
  spinDirection: 'normal' | 'reverse';
  selectedRatio: '9x16' | '4x5' | '1x1';
  labelSize: number;
  audioStart: number;
  audioEnd: number;
  videoDuration: number;
  exportQuality: 'low' | 'medium' | 'high';
};
