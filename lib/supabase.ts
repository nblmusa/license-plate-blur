import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
  subscription_tier: string
  api_key: string | null
  api_calls_count: number
}

export type Image = {
  id: string
  user_id: string
  original_url: string
  masked_url: string | null
  status: string
  created_at: string
  downloaded: boolean
  payment_status: string
}