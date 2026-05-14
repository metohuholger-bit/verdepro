import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_KEY as string

export const supabase = createClient(url, key)

export type Lavoro = {
  id?: number
  cliente: string
  data: string
  ore: number
  guadagno: number
  note?: string
  created_at?: string
}