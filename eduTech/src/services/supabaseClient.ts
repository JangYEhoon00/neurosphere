import { createClient } from '@supabase/supabase-js';

// Supabase 환경 변수 확인
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL과 Anon Key가 설정되지 않았습니다. .env 파일을 확인해주세요.'
  );
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// 데이터베이스 타입 정의 (추후 Supabase에서 자동 생성 가능)
export interface Database {
  public: {
    Tables: {
      nodes: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          status: 'known' | 'fuzzy' | 'unknown' | 'new';
          val: number;
          category: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          label: string;
          status: 'known' | 'fuzzy' | 'unknown' | 'new';
          val: number;
          category: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          status?: 'known' | 'fuzzy' | 'unknown' | 'new';
          val?: number;
          category?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      links: {
        Row: {
          id: string;
          user_id: string;
          source: string;
          target: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source: string;
          target: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source?: string;
          target?: string;
          created_at?: string;
        };
      };
      node_contents: {
        Row: {
          id: string;
          node_id: string;
          user_id: string;
          title: string;
          content: string;
          last_saved: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          node_id: string;
          user_id: string;
          title: string;
          content: string;
          last_saved?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          node_id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          last_saved?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          sender: 'user' | 'bot';
          content: string;
          subconcepts: string[] | null;
          timestamp: string;
        };
        Insert: {
          id: string;
          user_id: string;
          sender: 'user' | 'bot';
          content: string;
          subconcepts?: string[] | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sender?: 'user' | 'bot';
          content?: string;
          subconcepts?: string[] | null;
          timestamp?: string;
        };
      };
      meta_results: {
        Row: {
          id: string;
          user_id: string;
          node_id: string;
          score: number;
          status: 'known' | 'fuzzy' | 'unknown';
          feedback: string;
          next_step: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          node_id: string;
          score: number;
          status: 'known' | 'fuzzy' | 'unknown';
          feedback: string;
          next_step: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          node_id?: string;
          score?: number;
          status?: 'known' | 'fuzzy' | 'unknown';
          feedback?: string;
          next_step?: string;
          created_at?: string;
        };
      };
    };
  };
}
