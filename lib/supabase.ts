import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createClient(useServiceRole = false) {
  return createRouteHandlerClient(
    { cookies },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: useServiceRole 
        ? process.env.SUPABASE_SERVICE_ROLE_KEY 
        : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      options: {
        db: { schema: 'public' }
      }
    }
  )
}

// Regular client
export function createRegularClient() {
  return createClient(false)
}

// Service role client
export function createServiceClient() {
  return createClient(true)
}

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