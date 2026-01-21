
export interface Profile {
  id: string;
  username: string;
  is_staff: boolean;
}

export interface Post {
  id: string;
  created_at: string;
  title: string;
  banner_image_url: string;
  category: string;
  author_id: string;
  profiles: Profile;
  tags: Tag[];
}

export interface PostWithBlocks extends Post {
    post_blocks: PostBlock[];
}

export enum BlockType {
    TEXT = 'text',
    CODE = 'code',
    IMAGE = 'image',
    CHANGELOG = 'changelog',
    HEADER = 'header',
    QUOTE = 'quote',
}

export interface PostBlock {
  id?: string;
  post_id?: string;
  order: number;
  type: BlockType;
  content: {
    // Shared
    text?: string;
    // Code Block
    code?: string;
    language?: string;
    // Image Block
    url?: string;
    alt?: string;
    // Changelog Block
    version?: string;
    changes?: string[];
    // Header Block
    level?: 2 | 3 | 4;
    // Quote Block
    author?: string;
  };
}

export interface Tag {
    id: string;
    name: string;
    color: string;
}

// Supabase generated types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      post_blocks: {
        Row: {
          content: Json
          id: string
          order: number
          post_id: string
          type: string
        }
        Insert: {
          content: Json
          id?: string
          order: number
          post_id: string
          type: string
        }
        Update: {
          content?: Json
          id?: string
          order?: number
          post_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_blocks_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          author_id: string
          banner_image_url: string
          category: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          author_id: string
          banner_image_url: string
          category: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          author_id?: string
          banner_image_url?: string
          category?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          is_staff: boolean
          username: string | null
        }
        Insert: {
          id: string
          is_staff?: boolean
          username?: string | null
        }
        Update: {
          id?: string
          is_staff?: boolean
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          color: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
