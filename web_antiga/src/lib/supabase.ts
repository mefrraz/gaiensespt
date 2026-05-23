import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // Console error will allow development to proceed but network calls will fail
    console.error("Missing Supabase Variables")
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
