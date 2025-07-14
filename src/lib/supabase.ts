import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo_key'

// Check if we're in demo mode
const isDemoMode = supabaseUrl === 'https://demo.supabase.co'

// Client-side Supabase client (mock for demo mode)
export const supabase = isDemoMode
  ? createMockSupabaseClient()
  : createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for API routes)
export const supabaseAdmin = isDemoMode
  ? createMockSupabaseClient()
  : createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Mock Supabase client for demo mode
function createMockSupabaseClient() {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback: any) => {
        // Return a mock subscription
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      signInWithPassword: () => Promise.resolve({ error: { message: 'Demo mode: Please set up Supabase to enable authentication' } }),
      signUp: () => Promise.resolve({ error: { message: 'Demo mode: Please set up Supabase to enable authentication' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Please set up Supabase database' } }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        limit: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Please set up Supabase database' } })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: { message: 'Demo mode: Please set up Supabase database' } })
      })
    })
  } as any
}

// Database types
export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  status: 'online' | 'offline' | 'away'
  last_seen: string
  created_at: string
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'public' | 'private'
  created_by: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  content: string
  user_id: string
  room_id?: string
  private_to?: string
  message_type: 'text' | 'image' | 'file' | 'video'
  file_url?: string
  file_name?: string
  file_size?: number
  created_at: string
  updated_at: string
  reactions?: MessageReaction[]
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface RoomMember {
  id: string
  room_id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
}

export interface MediaFile {
  id: string
  user_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  message_id?: string
  created_at: string
}
